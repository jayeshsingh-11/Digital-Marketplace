'use client'

import { Home, LayoutGrid, ShoppingBag, Store, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface MobileBottomNavProps {
    user: SupabaseUser | null
}

const MobileBottomNav = ({ user }: MobileBottomNavProps) => {
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

    // Don't show on auth pages
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
            href: user ? '/account' : '/sign-in',
        },
        {
            label: 'Seller',
            icon: Store,
            href: '/seller',
        },
        {
            label: 'Cart',
            icon: ShoppingBag,
            href: '/cart',
        },
    ]

    return (
        <div
            className={cn(
                'fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out md:hidden rounded-t-[20px]',
                isVisible ? 'translate-y-0' : 'translate-y-full'
            )}
            style={{ height: '70px' }}
        >
            <div className='grid h-full grid-cols-5 mx-auto'>
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className='relative inline-flex flex-col items-center justify-center h-full w-full'
                        >
                            {/* Active Background Pill Animation */}
                            <span
                                className={cn(
                                    'absolute inset-0 m-auto h-12 w-12 rounded-2xl transition-all duration-300 ease-out z-[-1]',
                                    isActive
                                        ? 'bg-gray-100 scale-100 opacity-100'
                                        : 'scale-0 opacity-0'
                                )}
                            />

                            <div className={cn(
                                'flex flex-col items-center justify-center transition-transform duration-300',
                                isActive && 'scale-105 -translate-y-0.5'
                            )}>
                                <item.icon
                                    className={cn(
                                        'w-6 h-6 mb-1 transition-all duration-300',
                                        isActive
                                            ? 'text-black fill-black/5 stroke-[2.5px]'
                                            : 'text-gray-500 stroke-[2px]'
                                    )}
                                />
                                <span
                                    className={cn(
                                        'text-[10px] transition-all duration-300',
                                        isActive
                                            ? 'text-black font-extrabold tracking-wide'
                                            : 'text-gray-500 font-medium'
                                    )}
                                >
                                    {item.label}
                                </span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default MobileBottomNav
