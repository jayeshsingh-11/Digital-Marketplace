import { z } from 'zod'
import { privateProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
import { getPayloadClient } from '../get-payload'
import { Product, User } from '../payload-types'

const adminProcedure = privateProcedure.use(async ({ ctx, next }) => {
    const { user } = ctx
    if (user.role !== 'admin') {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Admin access required' })
    }
    return next({ ctx })
})

export const adminRouter = router({
    getStats: adminProcedure.query(async () => {
        const payload = await getPayloadClient()

        const [users, products, orders] = await Promise.all([
            payload.find({ collection: 'users', limit: 0 }),
            payload.find({ collection: 'products', limit: 0 }),
            payload.find({ collection: 'orders', limit: 0, depth: 1 }),
        ])

        // Calculate total revenue from paid orders
        const paidOrders = orders.docs.filter((order: any) => order._isPaid)
        const totalRevenue = paidOrders.reduce((acc: number, order: any) => {
            const orderTotal = (order.products || []).reduce((sum: number, product: any) => {
                if (typeof product === 'object' && product?.price) {
                    return sum + product.price
                }
                return sum
            }, 0)
            return acc + orderTotal
        }, 0)

        return {
            totalUsers: users.totalDocs,
            totalProducts: products.totalDocs,
            totalOrders: orders.totalDocs,
            paidOrders: paidOrders.length,
            totalRevenue,
        }
    }),

    getUsers: adminProcedure
        .input(z.object({
            limit: z.number().min(1).max(50).default(20),
            page: z.number().min(1).default(1),
        }))
        .query(async ({ input }) => {
            const payload = await getPayloadClient()

            const { docs, totalDocs, totalPages, hasNextPage, hasPrevPage } = await payload.find({
                collection: 'users',
                limit: input.limit,
                page: input.page,
                sort: '-createdAt',
                depth: 1,
            })

            const users = docs.map((user: any) => ({
                id: user.id,
                email: user.email,
                role: user.role,
                productCount: Array.isArray(user.products) ? user.products.length : 0,
                verified: user._verified ?? false,
                createdAt: user.createdAt,
            }))

            return { users, totalDocs, totalPages, hasNextPage, hasPrevPage, page: input.page }
        }),

    getProducts: adminProcedure
        .input(z.object({
            limit: z.number().min(1).max(50).default(20),
            page: z.number().min(1).default(1),
        }))
        .query(async ({ input }) => {
            const payload = await getPayloadClient()

            const { docs, totalDocs, totalPages, hasNextPage, hasPrevPage } = await payload.find({
                collection: 'products',
                limit: input.limit,
                page: input.page,
                sort: '-createdAt',
                depth: 1,
            })

            const products = docs.map((product: any) => ({
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                sellerEmail: typeof product.user === 'object' ? product.user?.email : 'Unknown',
                createdAt: product.createdAt,
            }))

            return { products, totalDocs, totalPages, hasNextPage, hasPrevPage, page: input.page }
        }),

    getOrders: adminProcedure
        .input(z.object({
            limit: z.number().min(1).max(50).default(20),
            page: z.number().min(1).default(1),
        }))
        .query(async ({ input }) => {
            const payload = await getPayloadClient()

            const { docs, totalDocs, totalPages, hasNextPage, hasPrevPage } = await payload.find({
                collection: 'orders',
                limit: input.limit,
                page: input.page,
                sort: '-createdAt',
                depth: 2,
            })

            const orders = docs.map((order: any) => ({
                id: order.id,
                isPaid: order._isPaid,
                buyerEmail: typeof order.user === 'object' ? order.user?.email : 'Unknown',
                products: (order.products || []).map((p: any) => ({
                    name: typeof p === 'object' ? p?.name : 'Unknown Product',
                    price: typeof p === 'object' ? p?.price : 0,
                })),
                total: (order.products || []).reduce((sum: number, p: any) => {
                    return sum + (typeof p === 'object' ? (p?.price || 0) : 0)
                }, 0),
                createdAt: order.createdAt,
            }))

            return { orders, totalDocs, totalPages, hasNextPage, hasPrevPage, page: input.page }
        }),

    deleteProduct: adminProcedure
        .input(z.object({ productId: z.string() }))
        .mutation(async ({ input }) => {
            const payload = await getPayloadClient()
            await payload.delete({ collection: 'products', id: input.productId })
            return { success: true }
        }),

    deleteUser: adminProcedure
        .input(z.object({ userId: z.string() }))
        .mutation(async ({ input }) => {
            const payload = await getPayloadClient()
            await payload.delete({ collection: 'users', id: input.userId })
            return { success: true }
        }),
})
