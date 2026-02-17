import { z } from 'zod'
import { authRouter } from './auth-router'
import { publicProcedure, router } from './trpc'

import { paymentRouter } from './payment-router'
import { adminRouter } from './admin-router'
import { sellerRouter } from './seller-router'
import { profileRouter } from './profile-router'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { TRPCError } from '@trpc/server'

export const appRouter = router({
  auth: authRouter,
  payment: paymentRouter,
  admin: adminRouter,
  seller: sellerRouter,
  profile: profileRouter,

  searchProducts: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const { query } = input
      const supabase = createClient(cookies())

      if (!query) return []

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, category')
        .eq('approved', true) // Ensure we only search approved products
        .ilike('name', `%${query}%`)
        .limit(5)

      if (error) {
        console.error('Search Error:', error)
        return []
      }

      // Fetch first image for each product to show in search result
      const productsWithImages = await Promise.all(data.map(async (product) => {
        const { data: imgData } = await supabase
          .from('product_images')
          .select('image_id, media:image_id(url)')
          .eq('product_id', product.id)
          .order('order', { ascending: true })
          .limit(1)
          .single()

        const media = imgData?.media
        const imageUrl = Array.isArray(media)
          ? (media[0] as any)?.url
          : (media as any)?.url

        return {
          ...product,
          image: imageUrl || null
        }
      }))

      return productsWithImages
    }),

  getInfiniteProducts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(), // page number
        query: z.object({
          category: z.string().optional(),
          sort: z.enum(['asc', 'desc']).optional(),
          limit: z.number().optional(),
          query: z.string().optional(), // Added search query
          ids: z.array(z.string()).optional(),
        }).optional(),
      })
    )
    .query(async ({ input }) => {
      const { query, cursor, limit } = input
      const sort = query?.sort
      const queryOpts = query || {}

      const page = cursor || 1
      const from = (page - 1) * limit
      const to = from + limit - 1

      const supabase = createClient(cookies())

      let dbQuery = supabase
        .from('products')
        .select(`
          *,
          product_files (*),
          product_images (
            image_id,
            media (*)
          )
        `, { count: 'exact' })
        .eq('approved', true) // Always filter approved for public
        .range(from, to)

      // Apply dynamic filters
      Object.entries(queryOpts).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          if (key === 'category') {
            dbQuery = dbQuery.eq('category', value)
          } else if (key === 'query') {
            dbQuery = dbQuery.ilike('name', `%${value}%`)
          }
        } else if (key === 'ids' && Array.isArray(value) && value.length > 0) {
          dbQuery = dbQuery.in('id', value)
        }
      })

      if (sort === 'desc') {
        dbQuery = dbQuery.order('created_at', { ascending: false })
      } else if (sort === 'asc') {
        dbQuery = dbQuery.order('created_at', { ascending: true })
      }

      const { data, count, error } = await dbQuery

      if (error) {
        console.error('Error fetching products:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }

      // Map the data to match expected frontend structure if needed
      const items = data.map((item: any) => ({
        ...item,
        images: item.product_images?.map((pi: any) => ({ image: pi.media })) || [],
        product_files: item.product_files
      }))

      const hasNextPage = count ? (from + limit) < count : false
      const nextPage = hasNextPage ? page + 1 : null

      return {
        items,
        nextPage,
      }
    }),
})

export type AppRouter = typeof appRouter
