'use client'

import { Search, ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface NavbarSearchProps {
    className?: string
    mobile?: boolean
}

const NavbarSearch = ({ className, mobile }: NavbarSearchProps) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('query') || '')

    const handleSearch = () => {
        if (!query.trim()) return
        router.push(`/products?query=${encodeURIComponent(query)}`)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div className={cn('w-full relative flex items-center border border-gray-200 rounded-full bg-gray-50 hover:bg-white transition-all group focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-100 shadow-sm', mobile ? 'h-9' : 'h-10', className)}>
            <div className='pl-3 flex items-center pointer-events-none'>
                <Search className='w-4 h-4 text-gray-400' />
            </div>

            <input
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Search...'
                className='flex-1 w-full bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 px-3 text-sm'
            />

            {/* Category stub - functional but no dropdown logic for now to keep it simple as per plan */}
            <div className='pr-4 pl-3 py-1 border-l border-gray-200 cursor-pointer hover:bg-gray-100 rounded-r-full flex items-center gap-2 transition-colors h-full'>
                <span className={cn('font-semibold text-gray-700 whitespace-nowrap', mobile ? 'text-[10px] uppercase font-bold' : 'text-xs')}>
                    {mobile ? 'Categories' : 'All Categories'}
                </span>
                <ChevronDown className='w-3 h-3 text-gray-500' />
            </div>
        </div>
    )
}

export default NavbarSearch
