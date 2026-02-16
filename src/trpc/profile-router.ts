import { z } from 'zod'
import { privateProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const profileRouter = router({
    updateProfile: privateProcedure
        .input(z.object({
            name: z.string().optional(),
            imageUrl: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { user } = ctx
            const supabase = createClient(cookies())

            const updates: any = {}
            if (input.name !== undefined) updates.name = input.name
            if (input.imageUrl !== undefined) updates.image_url = input.imageUrl

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
                .select('name, image_url')
                .eq('id', user.id)
                .single()

            if (error) {
                // If no profile found, return minimal info or null
                // But privateProcedure ensures user exists in auth. 
                // public.users row should exist due to trigger.
                console.error('Error fetching profile:', error)
                return { name: null, imageUrl: null }
            }

            return {
                name: data.name,
                imageUrl: data.image_url
            }
        }),
})
