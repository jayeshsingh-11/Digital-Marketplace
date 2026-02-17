import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/payload-types'
import { ImageIcon, X } from 'lucide-react'
import Image from 'next/image'

const CartItem = ({ product }: { product: Product }) => {
  // @ts-ignore
  const image = product.images?.[0]?.image || product.product_images?.[0]?.media
  console.log('CartItem product:', product.name, 'Images:', product.images, 'Selected Image:', image)

  const { removeItem } = useCart()

  const label = product.category

  return (
    <div className='py-3'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center space-x-4'>
          <div className='relative aspect-square h-20 w-20 min-w-fit overflow-hidden rounded-md bg-gray-100'>
            {image && typeof image !== 'string' && image.url ? (
              <Image
                src={image.url}
                alt={product.name}
                fill
                className='absolute object-cover'
              />
            ) : (
              <div className='flex h-full items-center justify-center bg-secondary'>
                <ImageIcon
                  aria-hidden='true'
                  className='h-6 w-6 text-muted-foreground'
                />
              </div>
            )}
          </div>

          <div className='flex flex-col self-start'>
            <span className='line-clamp-1 text-sm font-medium mb-1 text-gray-900'>
              {product.name}
            </span>

            <span className='line-clamp-1 text-xs text-muted-foreground capitalize'>
              {label}
            </span>

            <div className='mt-2 text-xs'>
              <button
                onClick={() => removeItem(product.id)}
                className='flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors font-medium'>
                <X className='w-3 h-3' />
                Remove
              </button>
            </div>
          </div>
        </div>

        <div className='flex flex-col space-y-1 font-medium'>
          <span className='ml-auto line-clamp-1 text-sm text-gray-900'>
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CartItem
