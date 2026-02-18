import { z } from 'zod'
import { privateProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export const profileRouter = router({
    updateProfile: privateProcedure
        .input(z.object({
            name: z.string().optional(),
            imageUrl: z.string().optional(),
            bio: z.string().max(200).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx
            const supabase = createClient(cookies())

            const updates: any = {}
            if (input.name !== undefined) updates.name = input.name
            if (input.imageUrl !== undefined) updates.image_url = input.imageUrl
            if (input.bio !== undefined) updates.bio = input.bio

            if (Object.keys(updates).length === 0) return { success: true }

            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', user.id)

            if (error) {
                console.error('Error updating profile:', error)
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
            }

            return { success: true }
        }),

    getProfile: privateProcedure
        .query(async ({ ctx }) => {
            const { user } = ctx
            const supabase = createClient(cookies())

            const { data, error } = await supabase
                .from('users')
                .select('name, image_url, bio, email')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
                return { name: null, imageUrl: null, bio: null, email: user.email }
            }

            return {
                name: data.name,
                imageUrl: data.image_url,
                bio: data.bio || null,
                email: data.email || user.email,
            }
        }),

    getMyOrders: privateProcedure
        .query(async ({ ctx }) => {
            const { user } = ctx
            const supabase = createClient(cookies())

            const { data: orders, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    is_paid,
                    amount,
                    created_at,
                    order_products (
                        product_id,
                        products (
                            id,
                            name,
                            price,
                            category,
                            product_images (
                                media:image_id (url)
                            )
                        )
                    )
                `)
                .eq('user_id', user.id)
                .eq('is_paid', true)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching orders:', error)
                return []
            }

            return (orders || []).map((order: any) => ({
                id: order.id,
                isPaid: order.is_paid,
                amount: order.amount,
                createdAt: order.created_at,
                products: order.order_products.map((op: any) => {
                    const product = op.products
                    const imageData = product?.product_images?.[0]?.media
                    const imageUrl = Array.isArray(imageData)
                        ? (imageData[0] as any)?.url
                        : (imageData as any)?.url
                    return {
                        id: product?.id,
                        name: product?.name,
                        price: product?.price,
                        category: product?.category,
                        imageUrl: imageUrl || null,
                    }
                }),
            }))
        }),

    deleteAccount: privateProcedure
        .mutation(async ({ ctx }) => {
            const { user } = ctx

            try {
                const adminSupabase = createAdminClient()
                const { error } = await adminSupabase.auth.admin.deleteUser(user.id)

                if (error) {
                    console.error('Error deleting user:', error)
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete account' })
                }

                return { success: true }
            } catch (err) {
                console.error('Delete account error:', err)
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete account' })
            }
        }),
})
