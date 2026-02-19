import { z } from 'zod'
import { privateProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

const adminProcedure = privateProcedure.use(async ({ ctx, next }) => {
    const { user } = ctx
    if (user.role !== 'admin') {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Admin access required' })
    }
    return next({ ctx })
})

export const adminRouter = router({
    getStats: adminProcedure.query(async ({ ctx }) => {
        const { user } = ctx
        console.log('AdminRouter: getStats called by user', user.id, 'role:', user.role)
        const supabase = createClient(cookies())

        const { count: totalUsers, error: usersError } = await supabase.from('users').select('*', { count: 'exact', head: true })
        if (usersError) console.error('AdminRouter: getStats users error', usersError)
        console.log('AdminRouter: totalUsers', totalUsers)
        const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true })
        const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true })

        const { data: paidOrdersModel } = await supabase
            .from('orders')
            .select('amount')
            .eq('is_paid', true)

        const totalRevenue = paidOrdersModel?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0
        const paidOrdersCount = paidOrdersModel?.length || 0

        return {
            totalUsers: totalUsers || 0,
            totalProducts: totalProducts || 0,
            totalOrders: totalOrders || 0,
            paidOrders: paidOrdersCount,
            totalRevenue,
        }
    }),

    getUsers: adminProcedure
        .input(z.object({
            limit: z.number().min(1).max(50).default(20),
            page: z.number().min(1).default(1),
        }))
        .query(async ({ input }) => {
            const adminAuth = createAdminClient()
            const { limit, page } = input
            const from = (page - 1) * limit
            const to = from + limit - 1

            // We need emails, so we must use auth admin API to list users.
            // Supabase Admin API `listUsers` has pagination but it's different.
            const { data: { users: authUsers }, error } = await adminAuth.auth.admin.listUsers({
                page: page,
                perPage: limit
            })

            // Also get public profiles for roles
            // We can just query public.users
            // But aligning them might be tricky if sort order differs.
            // Admin listUsers doesn't support sorting by createdAt desc easily in the same way.
            // A simpler approach for this dashboard: Query public.users (which has ID) and map.
            // But we don't have email in public.users.
            // Solution: Fetch auth users and join manually or just display ID/Role if email unavailable?
            // User wants "working properly". Admin dashboard usually shows Email.

            // Alternative: Add email to public.users? (Redundant but practical).
            // OR iterate authUsers and fetch their profiles.

            if (error || !authUsers) return { users: [], totalDocs: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false, page }

            const userIds = authUsers.map(u => u.id)
            const supabase = createClient(cookies())
            const { data: profiles } = await supabase.from('users').select('id, role').in('id', userIds)

            const users = authUsers.map(u => {
                const profile = profiles?.find(p => p.id === u.id)
                return {
                    id: u.id,
                    email: u.email,
                    role: profile?.role || 'user',
                    createdAt: u.created_at,
                    verified: u.email_confirmed_at != null
                }
            })

            // Total docs is hard to get from listUsers without scanning? 
            // supabase.auth.admin.listUsers returns `total` property? No, it returns `users` array.
            // We'll estimate total from public.users count.
            const { count: totalDocs } = await supabase.from('users').select('*', { count: 'exact', head: true })
            const total = totalDocs || 0
            const totalPages = Math.ceil(total / limit)

            return { users, totalDocs: total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1, page }
        }),

    getProducts: adminProcedure
        .input(z.object({
            limit: z.number().min(1).max(50).default(20),
            page: z.number().min(1).default(1),
        }))
        .query(async ({ input }) => {
            const supabase = createClient(cookies())
            const { limit, page } = input
            const from = (page - 1) * limit
            const to = from + limit - 1

            const { data: products, count } = await supabase
                .from('products')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to)

            const total = count || 0
            const totalPages = Math.ceil(total / limit)

            // Fetch seller details
            const userIds = Array.from(new Set(products?.map(p => p.user_id) || []))
            const { data: sellers } = await supabase
                .from('users')
                .select('id, name')
                .in('id', userIds)

            const mappedProducts = products?.map(p => {
                const seller = sellers?.find(s => s.id === p.user_id)
                return {
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    category: p.category,
                    sellerName: seller?.name || 'Unknown',
                    sellerEmail: 'Unknown', // Keep Unknown or fetch from auth if needed, but name is requested
                    createdAt: p.created_at
                }
            }) || []

            return { products: mappedProducts, totalDocs: total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1, page }
        }),

    getOrders: adminProcedure
        .input(z.object({
            limit: z.number().min(1).max(50).default(20),
            page: z.number().min(1).default(1),
        }))
        .query(async ({ input }) => {
            const supabase = createClient(cookies())
            const { limit, page } = input
            const from = (page - 1) * limit
            const to = from + limit - 1

            const { data: orders, count } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_products (
                        product_id,
                        products (*)
                    )
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to)

            const total = count || 0
            const totalPages = Math.ceil(total / limit)

            // Fetch buyer details
            const userIds = Array.from(new Set(orders?.map(o => o.user_id) || []))
            const { data: buyers } = await supabase
                .from('users')
                .select('id, name')
                .in('id', userIds)

            const mappedOrders = orders?.map((order: any) => {
                const products = order.order_products.map((op: any) => op.products)
                const total = products.reduce((sum: number, p: any) => sum + (p?.price || 0), 0)
                const buyer = buyers?.find(b => b.id === order.user_id)

                return {
                    id: order.id,
                    isPaid: order.is_paid,
                    buyerName: buyer?.name || 'Unknown',
                    buyerEmail: 'Unknown',
                    products: products.map((p: any) => ({
                        name: p?.name || 'Unknown',
                        price: p?.price || 0
                    })),
                    total: order.amount || total, // Prefer order.amount if available
                    createdAt: order.created_at
                }
            }) || []

            return { orders: mappedOrders, totalDocs: total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1, page }
        }),

    deleteProduct: adminProcedure
        .input(z.object({ productId: z.string() }))
        .mutation(async ({ input }) => {
            const supabase = createClient(cookies())
            const { error } = await supabase.from('products').delete().eq('id', input.productId)
            if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
            return { success: true }
        }),

    deleteUser: adminProcedure
        .input(z.object({ userId: z.string() }))
        .mutation(async ({ input }) => {
            const adminAuth = createAdminClient()
            const { error } = await adminAuth.auth.admin.deleteUser(input.userId)
            if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
            return { success: true }
        }),
})
