'use client'

import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { useCart } from '@/hooks/use-cart'
import { Product } from '@/payload-types'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const AddToCartButton = ({
  product,
  isLoggedIn = false,
  className,
}: {
  product: Product
  isLoggedIn?: boolean
  className?: string
}) => {
  const { addItem } = useCart()
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsSuccess(false)
    }, 2000)

    return () => clearTimeout(timeout)
  }, [isSuccess])

  return (
    <Button
      onClick={() => {
        if (!isLoggedIn) {
          toast.error('Please sign in to add items to your cart')
          router.push('/sign-in')
          return
        }
        addItem(product)
        setIsSuccess(true)
      }}
      size='lg'
      className={cn('w-full', className)}>
      {isSuccess ? 'Added!' : 'Add to cart'}
    </Button>
  )
}

export default AddToCartButton
