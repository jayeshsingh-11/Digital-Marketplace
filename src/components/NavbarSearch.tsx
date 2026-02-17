'use client'

import { Search, ChevronDown, Loader2, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { cn, formatPrice } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { trpc } from '@/trpc/client'
import Link from 'next/link'
import Image from 'next/image'
import { useOnClickOutside } from '@/hooks/use-on-click-outside'

interface NavbarSearchProps {
    className?: string
    mobile?: boolean
}

const NavbarSearch = ({ className, mobile }: NavbarSearchProps) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const commandRef = useRef<HTMLDivElement>(null)

    // Sync with URL query param on mount/change, but allow typing to override temporarily
    useEffect(() => {
        setQuery(searchParams.get('query') || '')
    }, [searchParams])

    const debouncedQuery = useDebounce(query, 500)

    // Use the searchProducts procedure we saw in trpc/index.ts
    const { data: searchResults, isLoading } = trpc.searchProducts.useQuery(
        { query: debouncedQuery },
        {
            enabled: !!debouncedQuery && debouncedQuery.length > 0,
        }
    )

    useOnClickOutside(commandRef, () => setIsOpen(false))

    const handleSearch = () => {
        setIsOpen(false)
        if (!query.trim()) return
        router.push(`/products?query=${encodeURIComponent(query)}`)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    // Open dropdown when typing
    useEffect(() => {
        if (debouncedQuery.length > 0) {
            setIsOpen(true)
        } else {
            setIsOpen(false)
        }
    }, [debouncedQuery])

    return (
        <div ref={commandRef} className={cn('w-full relative', className)}>
            <div className={cn('relative flex items-center border border-gray-200 rounded-full bg-gray-50 hover:bg-white transition-all group focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-100 shadow-sm', mobile ? 'h-9' : 'h-10')}>
                <div className='pl-3 flex items-center pointer-events-none'>
                    <Search className='w-4 h-4 text-gray-400' />
                </div>

                <input
                    type='text'
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        if (e.target.value.length === 0) setIsOpen(false)
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (debouncedQuery.length > 0) setIsOpen(true)
                    }}
                    placeholder='Search...'
                    className='flex-1 w-full bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 px-3 text-sm'
                />

                {/* Clear Button */}
                {query.length > 0 && (
                    <button
                        onClick={() => {
                            setQuery('')
                            setIsOpen(false)
                        }}
                        className='mr-2 text-gray-400 hover:text-gray-600'
                    >
                        <X className='w-3 h-3' />
                    </button>
                )}

                {/* Category stub */}
                <div className='pr-4 pl-3 py-1 border-l border-gray-200 cursor-pointer hover:bg-gray-100 rounded-r-full flex items-center gap-2 transition-colors h-full'>
                    <span className={cn('font-semibold text-gray-700 whitespace-nowrap', mobile ? 'text-[10px] uppercase font-bold' : 'text-xs')}>
                        {mobile ? 'Categories' : 'All Categories'}
                    </span>
                    <ChevronDown className='w-3 h-3 text-gray-500' />
                </div>
            </div>

            {/* Live Search Results Dropdown */}
            {isOpen && query.length > 0 && (
                <div className='absolute top-full left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 mt-2 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95'>
                    {isLoading ? (
                        <div className='p-4 flex items-center justify-center text-sm text-muted-foreground'>
                            <Loader2 className='w-4 h-4 animate-spin mr-2' />
                            Searching...
                        </div>
                    ) : searchResults && searchResults.length > 0 ? (
                        <div className='py-2'>
                            <div className='px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                                Products
                            </div>
                            {searchResults.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors'
                                >
                                    <div className='relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0'>
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className='object-cover'
                                            />
                                        ) : (
                                            <div className='flex items-center justify-center w-full h-full text-gray-400'>
                                                <Search className='w-4 h-4' />
                                            </div>
                                        )}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-medium text-gray-900 truncate'>{product.name}</p>
                                        <p className='text-xs text-gray-500 capitalize'>{product.category}</p>
                                    </div>
                                    <div className='text-sm font-medium text-gray-900'>
                                        {formatPrice(product.price)}
                                    </div>
                                </Link>
                            ))}
                            <button
                                onClick={handleSearch}
                                className='w-full text-center py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 border-t border-gray-100 transition-colors'
                            >
                                View all results for &quot;{query}&quot;
                            </button>
                        </div>
                    ) : (
                        <div className='p-4 text-center text-sm text-gray-500'>
                            No results found for &quot;{query}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default NavbarSearch
