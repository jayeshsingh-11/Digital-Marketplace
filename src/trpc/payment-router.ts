import { z } from 'zod'
import crypto from 'crypto'
import {
  privateProcedure,
  publicProcedure,
  router,
} from './trpc'
import { TRPCError } from '@trpc/server'
import { razorpay } from '../lib/razorpay'
import { Product } from '../payload-types'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { resend } from '@/lib/resend'
import { ReceiptEmailHtml } from '@/components/emails/ReceiptEmail'

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      let { productIds } = input

      console.log('Payment Router: createSession started')
      console.log('User ID:', user?.id)
      console.log('Product IDs:', productIds)

      if (productIds.length === 0) {
        console.error('Payment Router: No items in cart')
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const supabase = createClient(cookies())

      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)

      if (!products || products.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const filteredProducts = products.filter((prod) =>
        Boolean(prod.price)
      )

      const totalAmount = filteredProducts.reduce((acc, product) => {
        return acc + product.price
      }, 0)

      // fee
      const fee = 1
      const total = totalAmount + fee

      // Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          amount: total,
          is_paid: false,
        })
        .select()
        .single()

      if (orderError || !order) {
        console.error('Payment Router: DB Order Error', orderError)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }

      console.log('Payment Router: Order created', order.id)

      // Create Order Products entries
      const orderProducts = filteredProducts.map(prod => ({
        order_id: order.id,
        product_id: prod.id
      }))

      const { error: opError } = await supabase
        .from('order_products')
        .insert(orderProducts)

      if (opError) {
        console.error('Error creating order products:', opError)
        // Should probably rollback order but for now just log
      }

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
          key: process.env.RAZORPAY_KEY_ID,
          dbOrderId: order.id,
        }
      } catch (err) {
        console.error('Payment Router: Razorpay Error', err)
        return { orderId: null }
      }
    }),

  verifyPayment: privateProcedure
    .input(z.object({
      orderId: z.string(), // This is the Razorpay Order ID used for signature
      paymentId: z.string(),
      signature: z.string(),
      dbOrderId: z.string() // This is the DB UUID
    }))
    .mutation(async ({ input }) => {
      const { orderId, paymentId, signature, dbOrderId } = input

      console.log('Payment Router: verifyPayment called')
      console.log('Inputs:', { orderId, paymentId, signature, dbOrderId })

      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(orderId + "|" + paymentId)
        .digest('hex')

      if (generated_signature !== signature) {
        console.error('Payment Router: Signature Mismatch', { generated_signature, signature })
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      const supabase = createClient(cookies())

      const { error: updateError, data: updateData } = await supabase
        .from('orders')
        .update({
          is_paid: true,
        })
        .eq('id', dbOrderId)
        .select(`
          *,
          user:users(email),
          order_products(
            products(
              *,
              product_images(
                media(*)
              )
            )
          )
        `)
        .single()

      console.log('Payment Router: Order update result', { updateError, updateData })

      // Removed duplicate query
      // const { data: updatedOrder } = await supabase...

      if (updateData) {
        const products = updateData.order_products.map((op: any) => op.products)
        // @ts-ignore
        const email = updateData.user?.email

        console.log('Payment Router: Preparing to send email to:', email)
        console.log('Payment Router: Products found:', products.length)

        if (email) {
          try {
            const data = await resend.emails.send({
              from: 'DigitalHippo <onboarding@resend.dev>',
              to: [email],
              subject: 'Thanks for your order! This includes your download links',
              html: ReceiptEmailHtml({
                date: new Date(),
                email,
                orderId: dbOrderId,
                products,
              }),
            })
            console.log('Order confirmation email sent successfully. ID:', (data as any)?.id || 'No ID returned')
          } catch (error) {
            console.error('Failed to send order email. Error details:', error)
          }
        } else {
          console.warn('Payment Router: No email found for user in order', updateData)
        }
      } else {
        console.error('Payment Router: Failed to retrieve updated order with user details')
      }

      return { success: true }
    }),

  pollOrderStatus: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input
      const supabase = createClient(cookies())

      const { data: order } = await supabase
        .from('orders')
        .select('is_paid')
        .eq('id', orderId)
        .single()

      if (!order) {
        console.log('PollOrderStatus: Order not found', orderId)
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      console.log(`PollOrderStatus: ${orderId} is_paid: ${order.is_paid}`)

      return { isPaid: order.is_paid }
    }),
})
