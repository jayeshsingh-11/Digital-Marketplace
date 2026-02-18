'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { cn, formatPrice } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { Check, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRazorpay } from 'react-razorpay'
import { toast } from 'sonner'
import Logo from '@/components/Logo'

const Page = () => {
  const { items, removeItem } = useCart()

  const router = useRouter()
  const { Razorpay } = useRazorpay()

  const { mutate: verifyPayment, mutateAsync: verifyPaymentAsync } = trpc.payment.verifyPayment.useMutation({
    onSuccess: () => {
      // handled in handler
    }
  })

  const { mutate: createCheckoutSession, isLoading } =
    trpc.payment.createSession.useMutation({
      onSuccess: ({ orderId, ...rest }) => {
        if (orderId && Razorpay) {
          const { amount, currency, key, dbOrderId } = rest as { amount: number; currency: string; key: string, dbOrderId: string }

          const options = {
            key,
            amount,
            currency,
            name: 'Creative Cascade',
            description: 'Digital Marketplace',
            order_id: orderId,
            handler: async function (response: any) {
              console.log('Razorpay Handler Triggered', response)
              try {
                console.log('Calling verifyPaymentAsync...')
                const verifyRes = await verifyPaymentAsync({
                  orderId: orderId, // Razorpay Order ID
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  dbOrderId: dbOrderId // DB UUID
                })
                console.log('verifyPaymentAsync Success:', verifyRes)

                console.log('Redirecting to Thank You page...')
                router.push(`/thank-you?orderId=${dbOrderId}`)
              } catch (err) {
                console.error('Razorpay Handler Error:', err)
                toast.error('Payment verification failed. Please contact support.')
              }
            },
            prefill: {
              name: "User",
              email: "user@example.com",
            },
            theme: {
              color: "#3399cc"
            }
          }

          // @ts-ignore
          const rzp1 = new Razorpay(options)
          rzp1.open()
        }
      },
      onError: (err) => {
        if (err.data?.code === 'UNAUTHORIZED') {
          toast.error('Please sign in to complete your purchase')
          router.push('/sign-in?origin=cart')
          return
        }
        toast.error('Something went wrong. Please try again.')
        console.error('Checkout Error:', err)
      },
    })

  const productIds = items.map(({ product }) => product.id)

  const [isMounted, setIsMounted] = useState<boolean>(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const cartTotal = items.reduce(
    (total, { product }) => total + product.price,
    0
  )

  const fee = 1

  return (
    <div className='bg-white min-h-screen'>
      <div className='mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8'>
        <h1 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif'>
          Shopping Bag
        </h1>

        <div className='mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16'>
          <div
            className={cn('lg:col-span-7', {
              'rounded-lg border-2 border-dashed border-zinc-200 p-12':
                isMounted && items.length === 0,
            })}>
            <h2 className='sr-only'>
              Items in your shopping bag
            </h2>

            {isMounted && items.length === 0 ? (
              <div className='flex h-full flex-col items-center justify-center space-y-1'>
                <div
                  aria-hidden='true'
                  className='relative mb-4 h-40 w-40 text-muted-foreground'>
                  <Image
                    src='/empty-cart-fixed.png'
                    fill
                    loading='eager'
                    alt='empty shopping cart'
                    className='mix-blend-multiply opacity-50 grayscale'
                  />
                </div>
                <h3 className='font-semibold text-2xl text-gray-900'>
                  Your bag is empty
                </h3>
                <p className='text-muted-foreground text-center max-w-sm mx-auto mt-2'>
                  Looks like you haven&apos;t added anything to your cart yet.
                </p>
                <Link
                  href='/products'
                  className={buttonVariants({
                    variant: 'link',
                    size: 'sm',
                    className: 'text-sm text-blue-600 hover:text-blue-500 mt-4',
                  })}>
                  Start Shopping &rarr;
                </Link>
              </div>
            ) : null}

            <ul
              className={cn({
                'divide-y divide-gray-200 border-b border-t border-gray-200':
                  isMounted && items.length > 0,
              })}>
              {isMounted &&
                items.map(({ product }) => {
                  const label = product.category

                  // @ts-ignore
                  const image = product.images?.[0]?.image || product.product_images?.[0]?.media

                  return (
                    <li key={product.id} className='flex py-6 sm:py-10 group'>
                      <div className='flex-shrink-0'>
                        <div className='relative h-24 w-24 sm:h-32 sm:w-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-100'>
                          {image && typeof image !== 'string' && image.url ? (
                            <Image
                              fill
                              src={image.url}
                              alt='product image'
                              className='h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300'
                            />
                          ) : null}
                        </div>
                      </div>

                      <div className='ml-4 flex flex-1 flex-col justify-between sm:ml-6'>
                        <div className='relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0'>
                          <div>
                            <div className='flex justify-between'>
                              <h3 className='text-sm'>
                                <Link
                                  href={`/product/${product.id}`}
                                  className='font-medium text-gray-900 hover:text-blue-600 transition-colors text-lg'>
                                  {product.name}
                                </Link>
                              </h3>
                            </div>

                            <div className='mt-1 flex text-sm'>
                              <p className='text-muted-foreground capitalize'>
                                {label}
                              </p>
                            </div>

                            <p className='mt-2 text-sm font-medium text-gray-900'>
                              {formatPrice(product.price)}
                            </p>
                          </div>

                          <div className='mt-4 sm:mt-0 sm:pr-9 w-20'>
                            <div className='absolute right-0 top-0'>
                              <Button
                                aria-label='remove product'
                                onClick={() => removeItem(product.id)}
                                variant='ghost'
                                className='h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full'
                              >
                                <X className='h-4 w-4' aria-hidden='true' />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <p className='mt-4 flex items-center space-x-2 text-sm text-gray-500'>
                          <Check className='h-4 w-4 flex-shrink-0 text-emerald-500' />
                          <span>Instant Delivery</span>
                        </p>
                      </div>
                    </li>
                  )
                })}
            </ul>
          </div>

          <section className='mt-16 rounded-2xl bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 border border-gray-100 shadow-sm sticky top-24'>
            <h2 className='text-lg font-medium text-gray-900 mb-6'>
              Order summary
            </h2>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-600'>Subtotal</p>
                <p className='text-sm font-medium text-gray-900'>
                  {isMounted ? (
                    formatPrice(cartTotal)
                  ) : (
                    <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                  )}
                </p>
              </div>

              <div className='flex items-center justify-between border-t border-gray-200 pt-4'>
                <div className='flex items-center text-sm text-muted-foreground'>
                  <span>Transaction Fee</span>
                </div>
                <div className='text-sm font-medium text-gray-900'>
                  {isMounted ? (
                    formatPrice(fee)
                  ) : (
                    <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                  )}
                </div>
              </div>

              <div className='flex items-center justify-between border-t border-gray-200 pt-4'>
                <div className='text-base font-medium text-gray-900'>Order Total</div>
                <div className='text-base font-bold text-gray-900'>
                  {isMounted ? (
                    formatPrice(cartTotal + fee)
                  ) : (
                    <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                  )}
                </div>
              </div>
            </div>

            <div className='mt-8'>
              <Button
                disabled={items.length === 0 || isLoading}
                onClick={() => createCheckoutSession({ productIds })}
                className='w-full bg-black hover:bg-gray-900 text-white transition-all shadow-md hover:shadow-lg h-12 rounded-xl text-base'
                size='lg'>
                {isLoading ? (
                  <Loader2 className='w-4 h-4 animate-spin mr-2' />
                ) : null}
                Checkout
              </Button>
            </div>

            <div className='mt-6 flex justify-center text-center text-sm text-gray-500'>
              <p>
                or{' '}
                <Link
                  href='/products'
                  className='font-medium text-blue-600 hover:text-blue-500 transition-colors'>
                  Continue Shopping
                  <span aria-hidden='true'> &rarr;</span>
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Page
