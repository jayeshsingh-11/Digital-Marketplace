'use client'

import { useCart } from '@/hooks/use-cart'
import { useEffect } from 'react'

const ClearCart = () => {
    const clearCart = useCart((state) => state.clearCart)

    useEffect(() => {
        clearCart()
    }, [clearCart])

    return null
}

export default ClearCart
