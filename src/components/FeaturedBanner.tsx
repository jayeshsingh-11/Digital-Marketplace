'use client'

import { trpc } from '@/trpc/client'
import Link from 'next/link'
import Image from 'next/image'

const FeaturedBanner = () => {
    const { data: queryResults, isLoading } =
        trpc.getInfiniteProducts.useInfiniteQuery(
            {
                limit: 1,
                query: {
                    sort: 'desc',
                    limit: 1,
                },
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextPage,
            }
        )

    const product = queryResults?.pages.flatMap((page) => page.items)[0]

    if (isLoading || !product) {
        return (
            <div className="relative w-full aspect-[21/9] md:aspect-[21/6] overflow-hidden rounded-3xl bg-gray-100 animate-pulse">
            </div>
        )
    }

    const validUrls = product.images
        .map(({ image }) =>
            typeof image === 'string' ? image : image.url
        )
        .filter(Boolean) as string[]

    const imageUrl = validUrls[0]

    return (
        <Link href={`/product/${product.id}`} className="block relative w-full aspect-[21/9] md:aspect-[21/6] overflow-hidden rounded-3xl group shadow-md hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                />
            ) : (
                <div className='w-full h-full bg-gray-200' />
            )}
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-20 text-white">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2 inline-block border border-white/30">
                    Staff Pick
                </span>
                <h3 className="text-xl md:text-4xl font-bold drop-shadow-sm mb-1">{product.name}</h3>
                <p className="text-sm md:text-lg font-medium opacity-90 drop-shadow-sm text-gray-100 hidden md:block">
                    Check out this amazing product from our collection.
                </p>
            </div>
        </Link>
    )
}

export default FeaturedBanner
