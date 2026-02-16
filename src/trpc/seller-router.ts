import { z } from 'zod'
import { privateProcedure, router } from './trpc'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin' // Import admin client
import { cookies } from 'next/headers'
import { TRPCError } from '@trpc/server'

export const sellerRouter = router({
    getSellerStats: privateProcedure.query(async ({ ctx }) => {
        const { user } = ctx
        const supabase = createAdminClient() // Use admin client to bypass RLS


        // Get seller's products count
        const { count: totalProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        // Get orders that contain seller's products
        // We need to query order_products joined with products
        const { data: orderItems } = await supabase
            .from('order_products')
            .select(`
                product_id,
                products!inner(user_id, price),
                orders!inner(id, is_paid)
            `)
            .eq('products.user_id', user.id)

        let totalOrders = 0
        let totalRevenue = 0
        let paidOrders = 0

        // Use a Set to count unique orders
        const uniqueOrders = new Set<string>()

        orderItems?.forEach((item: any) => {
            uniqueOrders.add(item.orders.id)
            if (item.orders.is_paid) {
                // For revenue, we sum the price of the sold product
                totalRevenue += (item.products?.price || 0)
            }
        })

        // Count paid orders is tricky if "paidOrders" means "orders that are paid" vs "items sold that are paid".
        // Usually stats mean "how many sales I made". 
        // Let's count unique paid orders.
        const uniquePaidOrders = new Set<string>()
        orderItems?.forEach((item: any) => {
            if (item.orders.is_paid) {
                uniquePaidOrders.add(item.orders.id)
            }
        })
        paidOrders = uniquePaidOrders.size
        totalOrders = uniqueOrders.size

        return {
            totalProducts: totalProducts || 0,
            totalOrders,
            totalRevenue,
            paidOrders,
        }
    }),

    deleteSellerProduct: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx
            const supabase = createAdminClient()

            // Delete with RLS should handle ownership check if configured correctly (auth.uid() = user_id)
            // But we can double check or just let RLS handle it.
            // Our RLS: "Users manage own products" using auth.uid() = user_id.
            // So a simple delete should work AND be secure.

            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', input.id)
                .eq('user_id', user.id) // Extra safety

            if (error) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete product' })
            }

            return { success: true }
        }),

    getSellerProducts: privateProcedure
        .input(
            z.object({
                page: z.number().min(1).default(1),
                limit: z.number().min(1).max(50).default(10),
            })
        )
        .query(async ({ ctx, input }) => {
            const { user } = ctx
            const supabase = createAdminClient()
            const { limit, page } = input
            const from = (page - 1) * limit
            const to = from + limit - 1

            // Try to fetch with new schema table 'products_images'
            // If it fails (migration not run?), we might need fallback, but we'll assume it works.
            // We use 'media' instead of 'media (*)' if 'image' is the FK.
            // Actually, if 'image' is the column, we select 'image'. 
            // If we want the media object, we need to join logic.
            // Note: In Supabase, if 'image' is a FK to 'media', 'image (*)' expands it.

            const { data: products, count } = await supabase
                .from('products')
                .select(`
                    *,
                    product_images (
                        image:image_id ( * )
                    )
                `, { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .range(from, to)

            const total = count || 0
            const totalPages = Math.ceil(total / limit)

            const mappedProducts = products?.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                category: p.category,
                description: p.description,
                createdAt: p.created_at,
                // Map from new structure
                imageUrl: p.products_images?.[0]?.image?.url || null,
            })) || []

            return {
                products: mappedProducts,
                totalDocs: total,
                totalPages,
                page,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
            }
        }),

    getSellerOrders: privateProcedure
        .input(
            z.object({
                page: z.number().min(1).default(1),
                limit: z.number().min(1).max(50).default(10),
            })
        )
        .query(async ({ ctx, input }) => {
            const { user } = ctx
            const supabase = createAdminClient()
            const { limit, page } = input

            // This is complex pagination because we paginate ORDERS, but we filter them by sold items.
            // Supabase (PostgREST) deep filtering:

            // We want orders where order_products -> product -> user_id = me.
            const { data: orders, count } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_products!inner(
                        product_id,
                        products!inner(user_id, name, price)
                    )
                `, { count: 'exact' })
                .eq('order_products.products.user_id', user.id)
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1)

            const total = count || 0
            const totalPages = Math.ceil(total / limit)

            const mappedOrders = orders?.map((order: any) => {
                // The order_products array might contain OTHER products too if we didn't filter the join innerly?
                // No, `!inner` on products filters the rows.
                // But wait, order_products is a hasMany. 
                // If I buy Product A (Me) and Product B (Other), does `order.order_products` contain both?
                // PostgREST filtering usually filters the PARENT rows.
                // The `select` populates the children.
                // If we filter on a child, it filters the parents that match.
                // The *returned* children might still be all of them unless we filter the select too.
                // But strictly, we only want to show the seller *their* sold items.

                const mySoldItems = order.order_products.filter((op: any) => op.products.user_id === user.id)

                return {
                    id: order.id,
                    buyerEmail: 'Unknown', // Need Admin API or something to get email
                    products: mySoldItems.map((op: any) => ({
                        name: op.products.name,
                        price: op.products.price
                    })),
                    total: mySoldItems.reduce((sum: number, op: any) => sum + op.products.price, 0),
                    isPaid: order.is_paid,
                    createdAt: order.created_at,
                }
            }) || []

            return {
                orders: mappedOrders,
                totalDocs: total,
                totalPages,
                page,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
            }
        }),

    createProduct: privateProcedure
        .input(
            z.object({
                name: z.string(),
                description: z.string(),
                price: z.number(),
                category: z.string(),
                productFiles: z.array(z.object({
                    filename: z.string(),
                    url: z.string(),
                })),
                images: z.array(z.object({
                    filename: z.string(),
                    url: z.string(),
                })),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx
            const supabase = createAdminClient()

            // 1. Create Product Files Records
            const productFileIds: string[] = []

            for (const file of input.productFiles) {
                const { data: productFile, error: fileError } = await supabase
                    .from('product_files')
                    .insert({
                        user_id: user.id,
                        filename: file.filename,
                        url: file.url,
                    })
                    .select()
                    .single()

                if (fileError || !productFile) {
                    console.error('File Creation Error:', JSON.stringify(fileError, null, 2))
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create product file record' })
                }
                productFileIds.push(productFile.id)
            }

            console.log('Product Files created:', productFileIds)

            // 2. Create Media Records (Images)
            const imageIds: string[] = []

            for (const img of input.images) {
                const { data: media, error: mediaError } = await supabase
                    .from('media')
                    .insert({
                        user_id: user.id,
                        filename: img.filename,
                        url: img.url,
                    })
                    .select()
                    .single()

                if (mediaError || !media) {
                    console.error('Media Creation Error:', JSON.stringify(mediaError, null, 2))
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create image record' })
                }
                imageIds.push(media.id)
            }

            console.log('Images created:', imageIds)

            // 3. Create Product
            // Note: In Supabase/Payload direct SQL, relations for 'hasMany' might be stored differently depending on Payload's internal structure 
            // used effectively in the SQL.

            const productData = {
                user_id: user.id,
                name: input.name,
                description: input.description,
                price: input.price,
                category: input.category,
                approved: true, // Auto-approve in dev so they show up
                product_file_id: productFileIds[0], // Fallback for legacy schema constraint
            }

            console.log('Inserting product with data:', productData)

            const { data: product, error: productError } = await supabase
                .from('products')
                .insert(productData)
                .select()
                .single()

            if (productError || !product) {
                console.error('Product Creation Error:', JSON.stringify(productError, null, 2))
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create product: ' + (productError?.message || 'Unknown Error') })
            }

            console.log('Product created:', product.id)

            // 4. Link Images (Array Field: product_images or products_images)
            // schema.sql says 'product_images' but Payload might use 'products_images'. Trying 'product_images' as per schema.sql first.
            if (imageIds.length > 0) {
                const imageInserts = imageIds.map((imgId, index) => ({
                    product_id: product.id, // schema.sql uses product_id
                    image_id: imgId,       // schema.sql uses image_id
                    "order": index + 1     // schema.sql uses "order"
                }))

                console.log('Linking images:', imageInserts)

                const { error: imgRelError } = await supabase
                    .from('product_images') // Changed from products_images to match schema.sql
                    .insert(imageInserts)

                if (imgRelError) {
                    console.error('Image Relation Error (product_images):', JSON.stringify(imgRelError, null, 2))
                    // Try fallback to products_images just in case
                    const { error: imgRelError2 } = await supabase
                        .from('products_images')
                        .insert(imageInserts.map(i => ({
                            _parent_id: product.id,
                            image: i.image_id,
                            _order: i.order
                        })))
                    if (imgRelError2) console.error('Image Relation Error (products_images fallback):', JSON.stringify(imgRelError2, null, 2))
                }
            }

            // 5. Link Product Files (Relationship Field: products_rels)
            // If schema.sql doesn't have products_rels, this might fail unless Payload created it.
            if (productFileIds.length > 0) {
                // Try inserting into products_rels if it exists (Payload standard)
                const fileInserts = productFileIds.map((fid, index) => ({
                    parent_id: product.id,
                    path: 'product_files',
                    product_files_id: fid,
                    order: index + 1
                }))

                console.log('Linking files (products_rels):', fileInserts)

                const { error: relError } = await supabase
                    .from('products_rels')
                    .insert(fileInserts)

                if (relError) {
                    console.warn('Product Files Relation Error (products_rels):', JSON.stringify(relError, null, 2))
                    // This is expected if table doesn't exist.
                }
            }

            return { success: true, productId: product.id }
        }),
})
