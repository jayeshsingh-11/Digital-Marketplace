'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Search, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

const bannerImages = [
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop', // Tech/Cyberpunk
    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop', // Modern Office
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', // Abstract 3D
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop', // Coding
    'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop', // Abstract Gradient
]

export function HeroBanner() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className='relative h-[600px] w-full overflow-hidden flex items-center justify-center'>
            {/* Background Images */}
            <div className='absolute inset-0 z-0 bg-gray-900'>
                {bannerImages.map((src, index) => (
                    <div
                        key={index}
                        className={cn(
                            'absolute inset-0 transition-opacity duration-1000 ease-in-out',
                            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                        )}
                    >
                        <Image
                            src={src}
                            alt={`Banner ${index + 1}`}
                            fill
                            className='object-cover object-center'
                            priority={index === 0}
                        />
                        {/* Dark Gradient Overlay for text readability */}
                        <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40' />
                    </div>
                ))}
            </div>

            {/* Content Overlay */}
            <div className='relative z-10 w-full max-w-4xl px-4 text-center space-y-8 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10'>
                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-4'>
                    <Sparkles className='h-3.5 w-3.5 text-blue-400' />
                    <span>The Future of Digital Assets</span>
                </div>

                <h1 className='text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl'>
                    Create. <span className='text-blue-400'>Sell.</span> Inspire.
                </h1>

                <p className='text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md'>
                    Discover the world's best digital marketplace.
                    From stunning UI kits to robust code templates, find everything you need to build faster.
                </p>

                {/* Glassmorphism Search Bar */}
                <div className='max-w-xl mx-auto relative group'>
                    <div className='absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
                    <div className='relative flex items-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-full p-2 shadow-2xl'>
                        <Search className='ml-3 h-5 w-5 text-gray-300' />
                        <Input
                            className='border-none bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-base'
                            placeholder='Search for assets (e.g. "Mobile UI Kit")...'
                        />
                        <Button className='rounded-full px-6 bg-blue-600 hover:bg-blue-500 text-white transition-all duration-300'>
                            Search
                        </Button>
                    </div>
                </div>

                <div className='flex flex-wrap justify-center gap-4 pt-4'>
                    <Link href="/products">
                        <Button size='lg' variant='secondary' className='rounded-full px-8 text-base font-semibold transition-transform hover:scale-105'>
                            Browse All Products
                        </Button>
                    </Link>
                    <Link href="/sign-up?as=seller">
                        <Button size='lg' variant='outline' className='rounded-full px-8 backdrop-blur-sm bg-white/5 border-white/30 text-white hover:bg-white/20 text-base font-semibold transition-transform hover:scale-105'>
                            Become a Seller <ArrowRight className='ml-2 h-4 w-4' />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
