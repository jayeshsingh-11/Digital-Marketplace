import { PRODUCT_CATEGORIES } from '@/config'
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react'
import { Icons } from './Icons'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@/payload-types'
import { useAuth } from '@/hooks/use-auth'
import { Separator } from './ui/separator'

interface MobileNavProps {
  user?: User | null
}

const MobileNav = ({ user }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  // whenever we click an item in the menu and navigate away, we want to close the menu
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // when we click the path we are currently on, we still want the mobile menu to close,
  // however we cant rely on the pathname for it because that won't change (we're already there)
  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      setIsOpen(false)
    }
  }

  // remove second scrollbar when mobile menu is open
  useEffect(() => {
    if (isOpen)
      document.body.classList.add('overflow-hidden')
    else document.body.classList.remove('overflow-hidden')
  }, [isOpen])

  if (!isOpen)
    return (
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='lg:hidden relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-black hover:text-gray-600'>
        <Menu className='h-6 w-6' aria-hidden='true' />
      </button>
    )

  return (
    <div>
      <div className='relative z-40 lg:hidden'>
        <div className='fixed inset-0 bg-black bg-opacity-25' />
      </div>

      <div className='fixed overflow-y-scroll overscroll-y-none inset-0 z-40 flex'>
        <div className='w-4/5'>
          <div className='relative flex w-full max-w-sm flex-col overflow-y-auto bg-white pb-12 shadow-xl h-full'>
            <div className='flex px-4 pb-2 pt-5 justify-between items-center'>
              <div className='font-semibold text-lg'>
                Menu
              </div>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-600'>
                <X className='h-6 w-6' aria-hidden='true' />
              </button>
            </div>

            {/* User Greeting */}
            <div className='px-4 py-6 bg-gray-50 border-b border-gray-100'>
              {user ? (
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600'>
                    <UserIcon className='w-5 h-5' />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-sm text-gray-500'>Welcome back</span>
                    <span className='font-medium text-gray-900 truncate max-w-[200px]'>{user.email}</span>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col gap-3'>
                  <h3 className='font-semibold text-lg text-gray-900'>Welcome directly to <br /> <span className='text-blue-600'>Creative Cascade</span></h3>
                  <p className='text-sm text-gray-500'>Sign in to access your digital assets.</p>
                  <div className='flex gap-4 mt-2'>
                    <Link
                      onClick={() => closeOnCurrent('/sign-in')}
                      href='/sign-in'
                      className='flex-1 text-center bg-gray-900 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors'>
                      Sign In
                    </Link>
                    <Link
                      onClick={() => closeOnCurrent('/sign-up')}
                      href='/sign-up'
                      className='flex-1 text-center bg-white border border-gray-200 text-gray-900 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors'>
                      Join Now
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className='mt-6 px-4'>
              <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4'>Explore</h3>
              <ul className='space-y-3'>
                <li>
                  <Link
                    href='/'
                    onClick={() => setIsOpen(false)}
                    className='block font-medium text-gray-900 hover:text-blue-600 transition-colors'
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href='/products'
                    onClick={() => setIsOpen(false)}
                    className='block font-medium text-gray-900 hover:text-blue-600 transition-colors'
                  >
                    All Products
                  </Link>
                </li>
              </ul>
            </div>

            <Separator className='my-6' />

            <div className='px-4'>
              <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4'>Categories</h3>
              <ul className='grid grid-cols-1 gap-2'>
                {PRODUCT_CATEGORIES.map((category) => (
                  <li key={category.label}>
                    <Link
                      href={`/products?category=${category.value}`}
                      onClick={() => setIsOpen(false)}
                      className='group flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <div className='relative w-10 h-10 overflow-hidden rounded-md bg-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform'>
                        <Image
                          fill
                          src={category.featured[0].imageSrc}
                          alt='category image'
                          className='object-cover object-center'
                        />
                      </div>
                      <span className='font-medium text-gray-900 flex-1'>{category.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {user && (
              <>
                <Separator className='my-6' />
                <div className='px-4 pb-6'>
                  <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4'>Account</h3>
                  <ul className='space-y-4'>
                    <li>
                      <Link href='/sell' onClick={() => setIsOpen(false)} className='font-medium text-gray-900 hover:text-blue-600 block'>
                        Seller Dashboard
                      </Link>
                    </li>
                    <li>
                      <button onClick={signOut} className='flex items-center gap-2 font-medium text-red-600 hover:text-red-700'>
                        <LogOut className='w-4 h-4' />
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileNav
