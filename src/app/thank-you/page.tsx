import { getServerSideUserNode } from '@/lib/auth-utils'
import Image from 'next/image'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { Product, ProductFile, User } from '@/payload-types'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import PaymentStatus from '@/components/PaymentStatus'
import { createClient } from '@/lib/supabase/server'
import ClearCart from '@/components/ClearCart'
import { buttonVariants } from '@/components/ui/button'

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

const ThankYouPage = async ({
  searchParams,
}: PageProps) => {
  const orderId = searchParams.orderId
  const nextCookies = cookies()

  const { user } = await getServerSideUserNode(nextCookies)
  const supabase = createClient(nextCookies)

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_products (
        product_id,
        products (
          *,
          product_files (*),
          product_images (
            media (*)
          )
        )
      )
    `)
    .eq('id', orderId)
    .single()

  if (!order) return notFound()

  // Verify ownership
  if (order.user_id !== user?.id) {
    return redirect(
      `/sign-in?origin=thank-you?orderId=${order.id}`
    )
  }

  const products = order.order_products.map((op: any) => op.products)

  const orderTotal = products.reduce((total: number, product: any) => {
    return total + product.price
  }, 0)

  return (
    <main className='relative lg:min-h-full'>
      <div className='h-80 w-full lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12 overflow-hidden block'>
        <Image
          fill
          src='/checkout-thank-you.jpg'
          className='h-full w-full object-cover object-center'
          alt='thank you for your order'
        />
      </div>

      <div>
        <div className='mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24'>
          <div className='lg:col-start-2'>
            <p className='text-sm font-medium text-blue-600'>
              Order successful
            </p>
            <h1 className='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
              Thanks for ordering
            </h1>
            {order.is_paid ? (
              <p className='mt-2 text-base text-muted-foreground'>
                Your order was processed and your assets are
                available to download below. We&apos;ve sent
                your receipt and order details to{' '}
                {user ? (
                  <span className='font-medium text-gray-900'>
                    {user.email}
                  </span>
                ) : null}
                .
              </p>
            ) : (
              <p className='mt-2 text-base text-muted-foreground'>
                We appreciate your order, and we&apos;re
                currently processing it. So hang tight and
                we&apos;ll send you confirmation very soon!
              </p>
            )}

            <div className='mt-10 lg:mt-16 text-sm font-medium'>
              <div className='text-muted-foreground'>
                Order nr.
              </div>
              <div className='mt-2 text-gray-900'>
                {order.id}
              </div>

              <ul className='mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-muted-foreground'>
                {products.map(
                  (product: any) => {
                    const label = product.category

                    const downloadUrl = product.product_files?.url as string

                    const image = product.product_images?.[0]?.media

                    return (
                      <li
                        key={product.id}
                        className='flex space-x-6 py-6'>
                        <div className='relative h-24 w-24'>
                          {image?.url ? (
                            <Image
                              fill
                              src={image.url}
                              alt={`${product.name} image`}
                              className='flex-none rounded-md bg-gray-100 object-cover object-center'
                            />
                          ) : null}
                        </div>

                        <div className='flex-auto flex flex-col justify-between'>
                          <div className='space-y-1'>
                            <h3 className='text-gray-900'>
                              {product.name}
                            </h3>

                            <p className='my-1'>
                              Category: {label}
                            </p>
                          </div>

                          {order.is_paid ? (
                            <a
                              href={downloadUrl}
                              download={product.name}
                              className='text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors'>
                              Download asset
                            </a>
                          ) : null}
                        </div>

                        <p className='flex-none font-medium text-gray-900'>
                          {formatPrice(product.price)}
                        </p>
                      </li>
                    )
                  }
                )}
              </ul>

              <div className='space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-muted-foreground'>
                <div className='flex justify-between'>
                  <p>Subtotal</p>
                  <p className='text-gray-900'>
                    {formatPrice(orderTotal)}
                  </p>
                </div>

                <div className='flex justify-between'>
                  <p>Transaction Fee</p>
                  <p className='text-gray-900'>
                    {formatPrice(1)}
                  </p>
                </div>

                <div className='flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900'>
                  <p className='text-base'>Total</p>
                  <p className='text-base'>
                    {formatPrice(orderTotal + 1)}
                  </p>
                </div>
              </div>

              <PaymentStatus
                isPaid={order.is_paid}
                orderEmail={user?.email || ''}
                orderId={order.id}
              />

              <div className='mt-16 border-t border-gray-200 py-6 text-right'>
                <Link
                  href='/products'
                  className={buttonVariants({
                    className: 'w-full lg:w-auto bg-black text-white hover:bg-zinc-800 transition-colors'
                  })}>
                  Continue shopping &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main >
  )
}

export default ThankYouPage
