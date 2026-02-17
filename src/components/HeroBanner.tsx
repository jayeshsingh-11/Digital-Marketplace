'use client'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function HeroBanner() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [iscategoryOpen, setIsCategoryOpen] = useState(false)

    const handleSearch = () => {
        let url = '/products?'
        const params = new URLSearchParams()

        if (searchQuery) params.append('query', searchQuery)
        if (selectedCategory) params.append('category', selectedCategory.toLowerCase())

        router.push(url + params.toString())
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const categories = ['Graphics', 'Fonts', 'Templates', 'Add-ons', 'Photos', 'Web Themes', '3D']

    return (
        <div className='relative py-6 md:py-32 w-full flex flex-col items-center justify-center text-center px-4'>

            <h1 className='text-3xl md:text-7xl font-serif font-bold tracking-tight text-gray-900 mb-4 md:mb-6 drop-shadow-sm font-playfair'>
                Bring your creative ideas to life.
            </h1>

            <p className='text-sm md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 md:mb-10 font-light'>
                The world's most loved marketplace for design fonts, graphics, and more.
            </p>

            {/* Clean Search Bar - Hidden on Mobile */}
            <div className='w-full max-w-3xl mx-auto relative hidden md:flex items-center mb-12 z-20'>
                <div className='relative w-full flex items-center bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300'>

                    {/* Category Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsCategoryOpen(!iscategoryOpen)}
                            className='hidden md:flex items-center px-6 py-4 text-sm font-medium text-gray-700 border-r border-gray-100 hover:bg-gray-50 rounded-l-full transition-colors whitespace-nowrap'
                        >
                            {selectedCategory || 'All Categories'}
                            <svg className={`ml-2 h-4 w-4 text-gray-400 transition-transform ${iscategoryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {iscategoryOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-30 animate-in fade-in-0 zoom-in-95">
                                <button
                                    onClick={() => { setSelectedCategory(null); setIsCategoryOpen(false) }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                                >
                                    All Categories
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => { setSelectedCategory(cat); setIsCategoryOpen(false) }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Search className='ml-4 md:ml-0 h-5 w-5 text-gray-400 absolute md:static left-0' />

                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className='flex-1 border-none bg-transparent text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 text-base px-4 md:px-4 pl-10 md:pl-2'
                        placeholder='Search millions of creative assets...'
                    />

                    <div className="pr-2">
                        <Button
                            onClick={handleSearch}
                            className='rounded-full px-8 h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all'
                        >
                            Search
                        </Button>
                    </div>
                </div>
            </div>

            {/* Category Pills */}
            <div className='flex flex-wrap justify-center gap-3'>
                {categories.map((cat) => (
                    <Link key={cat} href={`/products?category=${cat.toLowerCase()}`} className="px-3 py-1.5 md:px-5 md:py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-[10px] md:text-sm font-medium hover:border-gray-900 hover:text-gray-900 transition-colors flex items-center gap-1.5 md:gap-2">
                        <Search className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        {cat}
                    </Link>
                ))}
            </div>
        </div>
    )
}
