"use client"

import { useEffect } from 'react'

interface ProductViewTrackerProps {
    productId: string
}

const ProductViewTracker = ({ productId }: ProductViewTrackerProps) => {
    useEffect(() => {
        const storedIds = localStorage.getItem('digitalhippo-recent-products')
        let parsed: string[] = []
        if (storedIds) {
            try {
                parsed = JSON.parse(storedIds)
            } catch (e) {
                console.error("Failed to parse recently viewed products", e)
            }
        }

        // Remove if exists to push to front
        const filtered = parsed.filter(id => id !== productId)
        // Add to front
        filtered.unshift(productId)

        // Keep last 10 (buffer)
        const trimmed = filtered.slice(0, 10)

        localStorage.setItem('digitalhippo-recent-products', JSON.stringify(trimmed))
    }, [productId])

    return null
}

export default ProductViewTracker
