import AddToCartButton from '@/components/AddToCartButton'
import ProductViewTracker from '@/components/ProductViewTracker'
import ProductImageGallery from '@/components/ProductImageGallery'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import ProductReel from '@/components/ProductReel'
import { getServerSideUserNode } from '@/lib/auth-utils'
import { formatPrice } from '@/lib/utils'
import { Check, Shield } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: {
    productId: string
  }
}

const BREADCRUMBS = [
  { id: 1, name: 'Home', href: '/' },
  { id: 2, name: 'Products', href: '/products' },
]

const Page = async ({ params }: PageProps) => {
  const { productId } = params
  const supabase = createClient(cookies())

  let isLoggedIn = false
  try {
    const nextCookies = cookies()
    const { user } = await getServerSideUserNode(nextCookies)
    isLoggedIn = !!user
  } catch { }

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images (
        media (*)
      )
    `)
    .eq('id', productId)
    .single()

  if (error || !product) return notFound()

  const label = product.category

  const validUrls = (product.product_images || [])
    .map((pi: any) => pi.media?.url)
    .filter(Boolean) as string[]

  const productWithImages = {
    ...product,
    images: product.product_images?.map((pi: any) => ({ image: pi.media })) || []
  }

  return (
    <MaxWidthWrapper className='bg-white'>
      <div className='bg-white'>
        <div className='mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:max-w-7xl lg:px-4'>

          {/* Header: Title & Breadcrumbs */}
          <div className='mb-6'>
            <ol className='flex items-center space-x-2 mb-4'>
              {BREADCRUMBS.map((breadcrumb, i) => (
                <li key={breadcrumb.href}>
                  <div className='flex items-center text-sm'>
                    <Link
                      href={breadcrumb.href}
                      className='font-medium text-sm text-muted-foreground hover:text-gray-900'>
                      {breadcrumb.name}
                    </Link>
                    {i !== BREADCRUMBS.length - 1 ? (
                      <svg
                        viewBox='0 0 20 20'
                        fill='currentColor'
                        aria-hidden='true'
                        className='ml-2 h-5 w-5 flex-shrink-0 text-gray-300'>
                        <path d='M5.555 17.776l8-16 .894.448-8 16-.894-.448z' />
                      </svg>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
              {product.name}
            </h1>
            <div className='mt-2 flex items-center text-sm text-muted-foreground'>
              {label}
            </div>
          </div>

          <div className='lg:grid lg:grid-cols-12 lg:gap-x-12'>
            {/* 1. Image Gallery */}
            <div className='lg:col-span-9'>
              <ProductImageGallery images={validUrls} />
            </div>

            {/* 2. Buy Box - Placed here for Mobile Order (2nd) */}
            <div className='mt-8 lg:mt-0 lg:col-span-3 lg:row-span-2'>
              <div className='sticky top-24 p-6 bg-white border border-gray-200 rounded-xl shadow-sm'>
                <div className='mb-6'>
                  <p className='text-3xl font-bold text-gray-900'>{formatPrice(product.price)}</p>
                </div>

                <div className='space-y-4'>
                  <AddToCartButton
                    product={productWithImages as any}
                    isLoggedIn={isLoggedIn}
                    className='w-full bg-black hover:bg-zinc-900 text-white'
                  />
                </div>

                <div className='mt-6 border-t border-gray-100 pt-6'>
                  <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
                    <Shield className='h-4 w-4 text-green-600' />
                    <span>30-Day Money Back Guarantee</span>
                  </div>
                  <div className='mt-2 flex items-center justify-center gap-2 text-sm text-gray-500'>
                    <Check className='h-4 w-4 text-green-600' />
                    <span>Instant Download</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. About Section - Placed last for Mobile */}
            <div className='mt-10 lg:mt-16 lg:col-span-9 border-t border-gray-200 pt-10'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>About</h2>
              <div className='prose prose-blue max-w-none text-gray-600 leading-relaxed space-y-4 whitespace-pre-line'>
                {product.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductReel
        href='/products'
        query={{ category: product.category, limit: 4 }}
        title={`Similar ${label}`}
        subtitle={`Browse similar high-quality ${label} just like '${product.name}'`}
      />

      <ProductViewTracker productId={product.id} />
    </MaxWidthWrapper>
  )
}

export default Page
