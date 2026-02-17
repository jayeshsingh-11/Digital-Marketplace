"use client"

import { useState, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

interface ProductImageGalleryProps {
    images: string[]
}

const ProductImageGallery = ({ images }: ProductImageGalleryProps) => {
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)
    const [activeIndex, setActiveIndex] = useState<number>(0)

    if (!images || images.length === 0) return null

    return (
        <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
            {/* Thumbnails - Horizontal on mobile, Vertical on desktop */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible scrollbar-hide md:w-24 flex-shrink-0 py-2 md:py-0">
                {images.map((image, i) => (
                    <button
                        key={i}
                        className={cn(
                            "relative aspect-[4/3] md:aspect-square w-20 md:w-full overflow-hidden rounded-lg border-2 bg-gray-100 flex-shrink-0 transition-all",
                            activeIndex === i
                                ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2 opacity-100"
                                : "border-transparent hover:border-gray-300 opacity-70 hover:opacity-100"
                        )}
                        onMouseEnter={() => {
                            swiperInstance?.slideTo(i)
                        }}
                        onClick={() => {
                            swiperInstance?.slideTo(i)
                        }}
                    >
                        <Image
                            src={image}
                            alt={`Product thumbnail ${i + 1}`}
                            fill
                            className="object-cover object-center"
                        />
                    </button>
                ))}
            </div>

            {/* Main Image Slider */}
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                <Swiper
                    spaceBetween={10}
                    slidesPerView={1}
                    onSwiper={setSwiperInstance}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    className="h-full w-full"
                >
                    {images.map((image, i) => (
                        <SwiperSlide key={i} className="relative h-full w-full bg-white">
                            <Image
                                src={image}
                                alt={`Product image ${i + 1}`}
                                fill
                                className="object-contain object-center"
                                priority={i === 0}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Mobile Swipe Hint Overlay (fades out) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm md:hidden pointer-events-none opacity-0 animate-fade-out">
                    Swipe to view
                </div>
            </div>
        </div>
    )
}

export default ProductImageGallery
