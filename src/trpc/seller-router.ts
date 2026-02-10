import { z } from 'zod'
import { privateProcedure, router } from './trpc'
import { getPayloadClient } from '../get-payload'

export const sellerRouter = router({
    getSellerStats: privateProcedure.query(async ({ ctx }) => {
        const payload = await getPayloadClient()
        const { user } = ctx

        // Get seller's products
        const { totalDocs: totalProducts } = await payload.find({
            collection: 'products',
            where: {
                user: { equals: user.id },
            },
            limit: 0,
        })

        // Get all orders and filter for ones containing this seller's products
        const { docs: allOrders } = await payload.find({
            collection: 'orders',
            depth: 2,
            limit: 1000,
        })

        // Filter orders that contain this seller's products
        let totalOrders = 0
        let totalRevenue = 0
        let paidOrders = 0

        for (const order of allOrders) {
            if (!order.products) continue
            const products = order.products as any[]

            for (const product of products) {
                const prod = typeof product === 'string' ? null : product
                if (!prod) continue

                const productUser = typeof prod.user === 'string' ? prod.user : prod.user?.id
                if (productUser === user.id) {
                    totalOrders++
                    if ((order as any)._isPaid) {
                        paidOrders++
                        totalRevenue += prod.price || 0
                    }
                    break // Count each order only once
                }
            }
        }

        return {
            totalProducts,
            totalOrders,
            totalRevenue,
            paidOrders,
        }
    }),

    deleteSellerProduct: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx
            const payload = await getPayloadClient()

            // Check if product belongs to user
            const product = await payload.findByID({
                collection: 'products',
                id: input.id,
            })

            if (!product) {
                throw new Error('Product not found')
            }

            const productUserId = typeof product.user === 'string' ? product.user : (product.user as any)?.id

            if (productUserId !== user.id) {
                throw new Error('Unauthorized')
            }

            await payload.delete({
                collection: 'products',
                id: input.id,
            })

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
            const payload = await getPayloadClient()
            const { user } = ctx

            const { docs, totalDocs, totalPages, page, hasPrevPage, hasNextPage } =
                await payload.find({
                    collection: 'products',
                    where: {
                        user: { equals: user.id },
                    },
                    limit: input.limit,
                    page: input.page,
                    sort: '-createdAt',
                    depth: 1,
                })

            return {
                products: docs.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    category: p.category,
                    description: p.description,
                    createdAt: p.createdAt,
                    imageUrl:
                        p.images?.[0]?.image?.url ||
                        p.images?.[0]?.image ||
                        null,
                })),
                totalDocs,
                totalPages,
                page,
                hasPrevPage,
                hasNextPage,
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
            const payload = await getPayloadClient()
            const { user } = ctx

            // Get all orders with depth to resolve products and users
            const { docs: allOrders } = await payload.find({
                collection: 'orders',
                depth: 2,
                limit: 1000,
                sort: '-createdAt',
            })

            // Filter orders containing this seller's products
            const sellerOrders: any[] = []

            for (const order of allOrders) {
                if (!order.products) continue
                const products = order.products as any[]
                const sellerProducts: any[] = []

                for (const product of products) {
                    const prod = typeof product === 'string' ? null : product
                    if (!prod) continue

                    const productUser = typeof prod.user === 'string' ? prod.user : prod.user?.id
                    if (productUser === user.id) {
                        sellerProducts.push({
                            name: prod.name,
                            price: prod.price,
                        })
                    }
                }

                if (sellerProducts.length > 0) {
                    const buyer = typeof order.user === 'string' ? order.user : order.user
                    sellerOrders.push({
                        id: order.id,
                        buyerEmail: typeof buyer === 'string' ? 'Unknown' : (buyer as any)?.email || 'Unknown',
                        products: sellerProducts,
                        total: sellerProducts.reduce((sum: number, p: any) => sum + p.price, 0),
                        isPaid: (order as any)._isPaid || false,
                        createdAt: order.createdAt,
                    })
                }
            }

            // Manual pagination
            const startIndex = (input.page - 1) * input.limit
            const endIndex = startIndex + input.limit
            const paginatedOrders = sellerOrders.slice(startIndex, endIndex)

            return {
                orders: paginatedOrders,
                totalDocs: sellerOrders.length,
                totalPages: Math.ceil(sellerOrders.length / input.limit) || 1,
                page: input.page,
                hasPrevPage: input.page > 1,
                hasNextPage: endIndex < sellerOrders.length,
            }
        }),
})
