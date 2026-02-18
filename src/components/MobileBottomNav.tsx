'use client'

import { Home, LayoutGrid, Store, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const MobileBottomNav = () => {
    const pathname = usePathname()
    const [isVisible, setIsVisible] = useState(true)
    const lastScrollY = useRef(0)

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY

                // Hide on scroll down, show on scroll up
                // Only trigger if scrolled more than 10px to avoid jitter
                if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
                    setIsVisible(false)
                } else {
                    setIsVisible(true)
                }

                lastScrollY.current = currentScrollY
            }
        }

        window.addEventListener('scroll', controlNavbar)
        return () => {
            window.removeEventListener('scroll', controlNavbar)
        }
    }, [])

    // Don't show on auth pages or admin routes if needed
    if (pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')) {
        return null
    }

    const navItems = [
        {
            label: 'Home',
            icon: Home,
            href: '/',
        },
        {
            label: 'Categories',
            icon: LayoutGrid,
            href: '/products',
        },
        {
            label: 'My Profile',
            icon: User,
            href: '/account',
        },
        {
            label: 'Seller',
            icon: Store,
            href: '/seller',
        },
    ]

    return (
        <div
            className={cn(
                'fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out md:hidden rounded-t-[20px]',
                isVisible ? 'translate-y-0' : 'translate-y-full'
            )}
            style={{ height: '65px' }}
        >
            <div className='grid h-full grid-cols-4 mx-auto'>
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'inline-flex flex-col items-center justify-center px-5 group hover:bg-gray-50 transition-colors h-full',
                                isActive && 'bg-blue-50/50'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'w-6 h-6 mb-1 transition-colors duration-200',
                                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                                )}
                            />
                            <span
                                className={cn(
                                    'text-[10px] transition-colors duration-200',
                                    isActive ? 'text-blue-600 font-bold' : 'text-gray-500 font-medium group-hover:text-gray-700'
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default MobileBottomNav
