"use client"

import { useEffect, useState } from 'react'
import { Product } from '@/payload-types'
import { trpc } from '@/trpc/client'
import ProductListing from './ProductListing'

const RecentlyViewed = () => {
    const [viewedIds, setViewedIds] = useState<string[]>([])

    useEffect(() => {
        const storedIds = localStorage.getItem('digitalhippo-recent-products')
        if (storedIds) {
            try {
                const parsed = JSON.parse(storedIds)
                if (Array.isArray(parsed)) {
                    // Limit to last 4 unique IDs, reversed to show most recent first
                    const uniqueIds = Array.from(new Set(parsed as string[]))
                    setViewedIds(uniqueIds.slice(0, 4))
                }
            } catch (e) {
                console.error("Failed to parse recently viewed products", e)
            }
        }
    }, [])


    const { data: queryResults, isLoading } = trpc.getInfiniteProducts.useInfiniteQuery(
        {
            limit: 4,
            query: {
                ids: viewedIds.length > 0 ? viewedIds : undefined,
            }
        },
        {
            enabled: viewedIds.length > 0
        }
    )

    const products = queryResults?.pages.flatMap((page) => page.items) || []

    // Sort products based on viewedIds order to maintain "most recent" order
    const sortedProducts = products.sort((a, b) => {
        return viewedIds.indexOf(a.id) - viewedIds.indexOf(b.id)
    })

    if (viewedIds.length === 0 || products.length === 0) {
        return null
    }


    return (
        <section className='py-12'>
            <div className='md:flex md:items-center md:justify-between mb-4'>
                <div className='max-w-2xl px-4 lg:max-w-4xl lg:px-0'>
                    <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
                        Pick Up Where You Left Off
                    </h1>
                </div>
            </div>

            <div className='relative'>
                <div className='mt-6 flex items-center w-full'>
                    <div className='w-full flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:gap-y-10 lg:gap-x-8 md:overflow-visible md:pb-0'>
                        {sortedProducts.map((product, i) => (
                            <div key={`recent-product-${i}`} className='min-w-[160px] w-[160px] md:w-auto snap-center flex-shrink-0'>
                                <ProductListing
                                    product={product}
                                    index={i}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default RecentlyViewed
