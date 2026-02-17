import Link from 'next/link'
import { PRODUCT_CATEGORIES } from '@/config'
import { buttonVariants } from './ui/button'
import Cart from './Cart'
import { getServerSideUserNode } from '@/lib/auth-utils'
import { cookies } from 'next/headers'
import UserAccountNav from './UserAccountNav'
import MobileNav from './MobileNav'
import Logo from './Logo'
import { ChevronDown, Search } from 'lucide-react'

const Navbar = async () => {
  const nextCookies = cookies()
  const { user } = await getServerSideUserNode(nextCookies)

  return (
    <div className='relative z-50 w-full bg-white border-b border-gray-200 shadow-sm'>
      <header className='relative w-full bg-white'>
        <div className='w-full px-5 py-4 flex flex-col gap-6'>

          {/* Row 1: Search (Left), Logo (Center), Account (Right) */}
          <div className='flex items-center w-full h-10 relative'>
            {/* Left: Search Bar & Mobile Nav */}
            <div className='flex-1 flex justify-start items-center gap-4'>
              <div className='lg:hidden'>
                <MobileNav />
              </div>

              {/* Search Bar - Categories on Right */}
              <div className='hidden lg:flex w-full max-w-md relative flex items-center border border-gray-200 rounded-full bg-gray-50 hover:bg-white transition-all group focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-100 shadow-sm h-10'>

                {/* Search Icon (Left) */}
                <div className='pl-3 flex items-center pointer-events-none'>
                  <Search className='w-4 h-4 text-gray-400' />
                </div>

                {/* Input */}
                <input
                  type='text'
                  placeholder='Search...'
                  className='flex-1 w-full bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 px-3 text-sm'
                />

                {/* Category Dropdown (Right Side) */}
                <div className='pr-4 pl-3 py-1 border-l border-gray-200 cursor-pointer hover:bg-gray-100 rounded-r-full flex items-center gap-2 transition-colors h-full'>
                  <span className='text-xs font-semibold text-gray-700 whitespace-nowrap'>All Categories</span>
                  <ChevronDown className='w-3 h-3 text-gray-500' />
                </div>

              </div>
            </div>

            {/* Center: Logo */}
            <div className='absolute left-1/2 transform -translate-x-1/2'>
              <Link href='/'>
                <Logo />
              </Link>
            </div>

            {/* Right: Auth & Cart */}
            <div className='flex-1 flex items-center justify-end gap-8'>
              <div className='flex items-center space-x-6'>
                {user ? (
                  <UserAccountNav user={user} />
                ) : (
                  <div className="flex items-center space-x-6">
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

        </div>
      </header>
    </div>
  )
}

export default Navbar
