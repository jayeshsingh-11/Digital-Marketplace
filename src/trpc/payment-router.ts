import { z } from 'zod'
import crypto from 'crypto'
import {
  privateProcedure,
  publicProcedure,
  router,
} from './trpc'
import { TRPCError } from '@trpc/server'
import { getPayloadClient } from '../get-payload'
import { razorpay } from '../lib/razorpay'
import { Product } from '../payload-types'

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      let { productIds } = input

      if (productIds.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const payload = await getPayloadClient()

      const { docs: products } = await payload.find({
        collection: 'products',
        where: {
          id: {
            in: productIds,
          },
        },
      })

      const filteredProducts = products.filter((prod) =>
        Boolean(prod.price)
      ) as unknown as Product[]

      const order = await payload.create({
        collection: 'orders',
        data: {
          _isPaid: false,
          products: filteredProducts.map((prod) => prod.id as string),
          user: user.id,
        },
      })

      const totalAmount = filteredProducts.reduce((acc, product) => {
        return acc + (product as Product).price
      }, 0)

      // fee
      const fee = 1
      const total = totalAmount + fee

      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: total * 100, // amount in paise
          currency: 'INR',
          receipt: String(order.id),
          notes: {
            userId: user.id,
            orderId: String(order.id),
          },
        })

        return {
          orderId: (razorpayOrder as any).id,
          amount: (razorpayOrder as any).amount,
          currency: (razorpayOrder as any).currency,
          key: process.env.RAZORPAY_KEY_ID
        }
      } catch (err) {
        console.error(err)
        return { orderId: null }
      }
    }),

  verifyPayment: privateProcedure
    .input(z.object({
      orderId: z.string(),
      paymentId: z.string(),
      signature: z.string()
    }))
    .mutation(async ({ input }) => {
      const { orderId, paymentId, signature } = input

      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(orderId + "|" + paymentId)
        .digest('hex')

      if (generated_signature !== signature) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      const payload = await getPayloadClient()

      await payload.update({
        collection: 'orders',
        id: orderId,
        data: {
          _isPaid: true,
        },
      })

      return { success: true }
    }),

  pollOrderStatus: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input

      const payload = await getPayloadClient()

      const { docs: orders } = await payload.find({
        collection: 'orders',
        where: {
          id: {
            equals: orderId,
          },
        },
      })

      if (!orders.length) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const [order] = orders

      return { isPaid: order._isPaid }
    }),
})
