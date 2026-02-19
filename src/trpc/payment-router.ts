import { z } from 'zod'
import crypto from 'crypto'
import {
  privateProcedure,
  publicProcedure,
  router,
} from './trpc'
import { TRPCError } from '@trpc/server'
import { razorpay } from '../lib/razorpay'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { sendBrevoEmail } from '@/lib/brevo'
import { ReceiptEmailHtml } from '@/components/emails/ReceiptEmail'
import { generateInvoicePDF } from '@/lib/generate-invoice-pdf'

// Helper: generate invoice number like INV-20260219-0001
function generateInvoiceNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `INV-${date}-${rand}`
}

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      let { productIds } = input

      if (productIds.length === 0) {
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

      const fee = 1
      const total = totalAmount + fee

      // Create DB Order
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
        console.error('Payment: DB Order Error', orderError)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }

      // Create Order Products
      const orderProducts = filteredProducts.map(prod => ({
        order_id: order.id,
        product_id: prod.id
      }))

      await supabase.from('order_products').insert(orderProducts)

      // Create Razorpay Order
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: total * 100, // paise
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
        console.error('Payment: Razorpay Error', err)
        return { orderId: null }
      }
    }),

  verifyPayment: privateProcedure
    .input(z.object({
      orderId: z.string(),   // Razorpay Order ID
      paymentId: z.string(),
      signature: z.string(),
      dbOrderId: z.string()  // DB UUID
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { orderId, paymentId, signature, dbOrderId } = input

      console.log('🔐 verifyPayment called:', { orderId, paymentId, dbOrderId })

      // 1. HMAC SHA256 Signature Verification
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(orderId + "|" + paymentId)
        .digest('hex')

      if (generated_signature !== signature) {
        console.error('❌ Signature mismatch')
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Payment verification failed' })
      }

      console.log('✅ Signature verified')

      // Use admin client for all DB operations (bypass RLS)
      const adminSupabase = createAdminClient()

      // 2. Fetch order with products and seller info
      const { data: orderData, error: orderFetchErr } = await adminSupabase
        .from('orders')
        .select(`
          *,
          order_products (
            product_id,
            products (
              *,
              user_id,
              product_files (*),
              product_images (
                media (*)
              )
            )
          )
        `)
        .eq('id', dbOrderId)
        .single()

      if (orderFetchErr || !orderData) {
        console.error('❌ Order fetch error:', orderFetchErr)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
      }

      const products = orderData.order_products.map((op: any) => op.products).filter(Boolean)
      const productTotal = products.reduce((sum: number, p: any) => sum + (p.price || 0), 0)

      // 3. Commission Split: 10% admin, 90% seller
      const adminCommission = Math.round(productTotal * 0.10 * 100) / 100
      const sellerEarnings = Math.round(productTotal * 0.90 * 100) / 100

      console.log('💰 Commission split:', { productTotal, adminCommission, sellerEarnings })

      // 4. Update order: mark as paid (core — must succeed)
      const { error: updateError } = await adminSupabase
        .from('orders')
        .update({ is_paid: true })
        .eq('id', dbOrderId)

      if (updateError) {
        console.error('❌ Order update error:', updateError)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }

      // 4b. Save payment details + commission (new columns — non-fatal if migration not run)
      try {
        await adminSupabase
          .from('orders')
          .update({
            razorpay_payment_id: paymentId,
            admin_commission: adminCommission,
            seller_earnings: sellerEarnings,
          })
          .eq('id', dbOrderId)
      } catch (colErr) {
        console.warn('⚠️ Could not save commission columns (migration may not have run):', colErr)
      }

      // 5. Update seller wallets (non-fatal)
      try {
        const sellerEarningsMap = new Map<string, number>()
        for (const product of products) {
          const sellerId = product.user_id
          if (!sellerId) continue
          const earning = Math.round(product.price * 0.90 * 100) / 100
          sellerEarningsMap.set(sellerId, (sellerEarningsMap.get(sellerId) || 0) + earning)
        }

        for (const [sellerId, earnings] of Array.from(sellerEarningsMap)) {
          const { data: wallet } = await adminSupabase
            .from('seller_wallets')
            .select('balance')
            .eq('user_id', sellerId)
            .single()

          if (wallet) {
            await adminSupabase
              .from('seller_wallets')
              .update({ balance: wallet.balance + earnings, updated_at: new Date().toISOString() })
              .eq('user_id', sellerId)
          } else {
            await adminSupabase
              .from('seller_wallets')
              .insert({ user_id: sellerId, balance: earnings })
          }

          console.log(`💳 Seller ${sellerId} wallet updated: +${earnings}`)
        }
      } catch (walletErr) {
        console.warn('⚠️ Wallet update skipped (table may not exist):', walletErr)
      }

      // 6. Grant purchase access (non-fatal)
      try {
        const purchaseRecords = products.map((p: any) => ({
          user_id: user.id,
          product_id: p.id,
          order_id: dbOrderId,
        }))

        await adminSupabase
          .from('purchased_products')
          .upsert(purchaseRecords, { onConflict: 'user_id,product_id' })
      } catch (purchaseErr) {
        console.warn('⚠️ Purchase access skipped (table may not exist):', purchaseErr)
      }

      // 7. Generate Invoice (non-fatal)
      let invoiceNumber = generateInvoiceNumber()
      try {
        const productNames = products.map((p: any) => p.name).join(', ')

        await adminSupabase
          .from('invoices')
          .insert({
            invoice_number: invoiceNumber,
            order_id: dbOrderId,
            buyer_id: user.id,
            buyer_email: user.email,
            product_name: productNames,
            amount: orderData.amount,
            admin_commission: adminCommission,
            seller_earnings: sellerEarnings,
            razorpay_payment_id: paymentId,
          })
        console.log(`📄 Invoice ${invoiceNumber} created`)
      } catch (invoiceErr) {
        console.warn('⚠️ Invoice creation skipped (table may not exist):', invoiceErr)
      }

      // 8. Send confirmation email with PDF invoice
      if (user.email) {
        try {
          const htmlContent = await ReceiptEmailHtml({
            date: new Date(),
            email: user.email,
            orderId: dbOrderId,
            products,
            invoiceNumber,
            adminCommission,
            sellerEarnings,
            razorpayPaymentId: paymentId,
          })

          // Try to generate PDF (non-fatal — email sends regardless)
          let emailAttachments: { filename: string; content: Buffer; contentType: string }[] = []
          try {
            const pdfBuffer = await generateInvoicePDF({
              invoiceNumber,
              date: new Date(),
              buyerEmail: user.email,
              buyerName: user.email.split('@')[0],
              orderId: dbOrderId,
              razorpayPaymentId: paymentId,
              products: products.map((p: any) => ({
                name: p.name,
                category: p.category || 'Digital Asset',
                price: p.price,
              })),
              subtotal: productTotal,
              fee: 1,
              total: orderData.amount,
              adminCommission,
              sellerEarnings,
            })
            console.log(`📄 PDF invoice generated: ${invoiceNumber} (${pdfBuffer.length} bytes)`)
            emailAttachments = [{
              filename: `Invoice-${invoiceNumber}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            }]
          } catch (pdfErr) {
            console.warn('⚠️ PDF generation failed, sending email without attachment:', pdfErr)
          }

          await sendBrevoEmail({
            subject: `Order Confirmed! Invoice ${invoiceNumber} — Your downloads are ready`,
            to: [{ email: user.email, name: user.email.split('@')[0] }],
            htmlContent,
            attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
          })
          console.log('📧 Confirmation email sent to', user.email)
        } catch (emailErr) {
          console.error('❌ Email send error:', emailErr)
        }
      }

      return { success: true, invoiceNumber }
    }),

  // Secure Download — checks purchase ownership, returns signed URL
  getSecureDownload: privateProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { productId } = input

      const adminSupabase = createAdminClient()

      // 1. Check if user purchased this product
      const { data: purchase } = await adminSupabase
        .from('purchased_products')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single()

      if (!purchase) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You have not purchased this product',
        })
      }

      // 2. Get product file path
      const { data: product } = await adminSupabase
        .from('products')
        .select('*, product_files(*)')
        .eq('id', productId)
        .single()

      if (!product?.product_files?.url) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product file not found',
        })
      }

      const filePath = product.product_files.url

      // 3. Generate signed URL (expires in 60 seconds)
      const { data: signedUrlData, error: signedUrlError } = await adminSupabase
        .storage
        .from('product_files')
        .createSignedUrl(filePath, 60) // 60 second expiry

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('❌ Signed URL error:', signedUrlError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate download link',
        })
      }

      return {
        downloadUrl: signedUrlData.signedUrl,
        filename: product.product_files.filename || product.name,
      }
    }),

  // Get purchases for the logged-in user
  getMyPurchases: privateProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx
      const adminSupabase = createAdminClient()

      const { data: purchases, error } = await adminSupabase
        .from('purchased_products')
        .select(`
          id,
          purchased_at,
          order_id,
          products (
            id,
            name,
            price,
            category,
            product_images (
              media (url)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false })

      if (error) {
        console.error('❌ getMyPurchases error:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }

      return purchases || []
    }),

  // Get invoice for an order
  getInvoice: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx
      const adminSupabase = createAdminClient()

      const { data: invoice, error } = await adminSupabase
        .from('invoices')
        .select('*')
        .eq('order_id', input.orderId)
        .eq('buyer_id', user.id)
        .single()

      if (error || !invoice) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
      }

      return invoice
    }),

  // Download Invoice PDF
  downloadInvoice: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { orderId } = input
      const adminSupabase = createAdminClient() // Bypass RLS for order fetching

      // 1. Fetch Invoice
      const { data: invoice } = await adminSupabase
        .from('invoices')
        .select('*')
        .eq('order_id', orderId)
        .eq('buyer_id', user.id)
        .single()

      if (!invoice) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
      }

      // 2. Fetch Order Details (for product breakdown)
      const { data: order } = await adminSupabase
        .from('orders')
        .select(`
          *,
          order_products (
            products (
              name,
              price,
              category
            )
          )
        `)
        .eq('id', orderId)
        .single()

      if (!order) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
      }

      const products = order.order_products.map((op: any) => op.products).filter(Boolean)
      const productTotal = products.reduce((sum: number, p: any) => sum + (p.price || 0), 0)

      // 3. Generate PDF
      const pdfBuffer = await generateInvoicePDF({
        invoiceNumber: invoice.invoice_number,
        date: new Date(invoice.created_at),
        buyerEmail: user.email,
        buyerName: user.email.split('@')[0],
        orderId: orderId,
        razorpayPaymentId: invoice.razorpay_payment_id || 'N/A',
        products: products.map((p: any) => ({
          name: p.name,
          category: p.category || 'Digital Asset',
          price: p.price,
        })),
        subtotal: productTotal,
        fee: 1,
        total: order.amount,
        adminCommission: invoice.admin_commission || 0,
        sellerEarnings: invoice.seller_earnings || 0,
      })

      return {
        pdfBase64: pdfBuffer.toString('base64'),
        filename: `Invoice-${invoice.invoice_number}.pdf`
      }
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
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return { isPaid: order.is_paid }
    }),
})
