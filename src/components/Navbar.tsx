import Link from 'next/link'
import { PRODUCT_CATEGORIES } from '@/config'
import { buttonVariants } from './ui/button'
import Cart from './Cart'
import { getServerSideUserNode } from '@/lib/auth-utils'
import { cookies } from 'next/headers'
import UserAccountNav from './UserAccountNav'
import MobileNav from './MobileNav'
import Logo from './Logo'
import { ChevronDown, Search, User } from 'lucide-react'
import NavbarSearch from './NavbarSearch'

const Navbar = async () => {
  const nextCookies = cookies()
  const { user } = await getServerSideUserNode(nextCookies)

  return (
    <div className='relative z-50 w-full bg-white border-b border-gray-200 shadow-sm'>
      <header className='relative w-full bg-white'>
        <div className='w-full px-4 py-3 md:px-5 md:py-4 flex flex-col gap-4 md:gap-6'>

          {/* Row 1: Search (Left), Logo (Center), Account (Right) */}
          <div className='flex items-center w-full h-8 md:h-10 relative'>
            {/* Left: Search Bar & Mobile Nav */}
            <div className='flex-1 flex justify-start items-center gap-4'>
              <div className='lg:hidden'>
                <MobileNav />
              </div>

              {/* Search Bar - Categories on Right */}
              <div className='hidden lg:flex w-full max-w-md'>
                <NavbarSearch />
              </div>
            </div>

            {/* Center: Logo */}
            <div className='absolute left-1/2 transform -translate-x-1/2'>
              <div className='hidden lg:block'> {/* Hide on mobile if it overlaps, or keep if spacing allows. Usually logo in center is fine. */}
                <Link href='/'>
                  <Logo />
                </Link>
              </div>
              {/* Mobile Logo logic often simpler, but let's stick to existing layout */}
              <div className='lg:hidden'>
                <Link href='/'>
                  <Logo />
                </Link>
              </div>
            </div>

            {/* Right: Auth & Cart */}
            <div className='flex-1 flex items-center justify-end gap-8'>
              <div className='flex items-center space-x-6'>
                {user ? (
                  <UserAccountNav user={user} />
                ) : (
                  <>
                    <div className="hidden lg:flex items-center space-x-6">
                      <Link
                        href='/sign-in'
                        className='text-sm font-medium text-gray-700 hover:text-black transition-colors'>
                        Log in
                      </Link>
                      <Link
                        href='/sign-up'
                        className={buttonVariants({
                          size: 'sm',
                          className: '!bg-black hover:!bg-gray-800 text-white border-none transition-colors'
                        })}>
                        Join Now
                      </Link>
                    </div>
                    <div className='lg:hidden'>
                      <Link href='/sign-in' className='p-2 -m-2 text-black hover:text-gray-700'>
                        <User className='h-5 w-5 md:h-6 md:w-6' aria-hidden='true' />
                      </Link>
                    </div>
                  </>
                )}

                <div className='ml-2 flow-root'>
                  <Cart user={user} />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Categories */}
          <div className='hidden lg:flex w-full border-t border-gray-100 mt-0 pt-3 pb-1'>
            <div className='w-full flex items-center justify-between gap-4 overflow-x-auto no-scrollbar'>
              {PRODUCT_CATEGORIES.map((category) => (
                <Link
                  key={category.value}
                  href={`/products?category=${category.value}`}
                  className='text-base font-normal uppercase tracking-wide text-gray-700 hover:text-black transition-colors whitespace-nowrap px-2 py-1'
                >
                  {category.label}
                </Link>
              ))}

              <Link href='/products' className='text-base font-normal uppercase tracking-wide text-gray-700 hover:text-black transition-colors whitespace-nowrap px-2 py-1'>
                More
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar (Visible only on mobile) */}
          <div className='lg:hidden w-full'>
            <NavbarSearch mobile />
          </div>
        </div>
      </header>
    </div>
  )
}

export default Navbar
