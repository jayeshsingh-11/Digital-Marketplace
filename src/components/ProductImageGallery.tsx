"use client"

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductImageGalleryProps {
    images: string[]
}

const ProductImageGallery = ({ images }: ProductImageGalleryProps) => {
    const [selectedImage, setSelectedImage] = useState<string>(images[0])
    const [selectedIndex, setSelectedIndex] = useState<number>(0)

    if (!images || images.length === 0) return null

    return (
        <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
            {/* Thumbnails - Horizontal on mobile, Vertical on desktop */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible scrollbar-hide md:w-24 flex-shrink-0">
                {images.map((image, i) => (
                    <button
                        key={i}
                        className={cn(
                            "relative aspect-[4/3] md:aspect-square w-20 md:w-full overflow-hidden rounded-lg border-2 bg-gray-100",
                            selectedIndex === i ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2" : "border-transparent hover:border-gray-300"
                        )}
                        onMouseEnter={() => {
                            setSelectedImage(image)
                            setSelectedIndex(i)
                        }}
                        onClick={() => {
                            setSelectedImage(image)
                            setSelectedIndex(i)
                        }}
                    >
                        <Image
                            src={image}
                            alt={`Product image ${i + 1}`}
                            fill
                            className="object-cover object-center"
                        />
                    </button>
                ))}
            </div>

            {/* Main Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                <Image
                    src={selectedImage}
                    alt="Product main image"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>
        </div>
    )
}

export default ProductImageGallery
