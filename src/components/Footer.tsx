'use client'

import { usePathname } from 'next/navigation'
import MaxWidthWrapper from './MaxWidthWrapper'
import { Icons } from './Icons'
import Link from 'next/link'

const Footer = () => {
  const pathname = usePathname()
  const pathsToHide = [
    '/verify-email',
    '/sign-up',
    '/sign-in',
  ]

  if (pathname.startsWith('/admin') || pathsToHide.includes(pathname)) {
    return null
  }

  return (
    <footer className='bg-white flex-grow-0'>
      <MaxWidthWrapper>
        <div className='border-t border-gray-200'>
          <div className='pb-8 pt-16'>
            <div className='flex justify-center'>
              <Icons.logo className='h-12 w-auto' />
            </div>
          </div>

          <div></div>
        </div>

        <div className='py-10 md:flex md:items-center md:justify-between'>
          <div className='text-center md:text-left'>
            <p className='text-sm text-muted-foreground'>
              &copy; {new Date().getFullYear()} All Rights
              Reserved
            </p>
          </div>

          <div className='mt-4 flex items-center justify-center md:mt-0'>
            <div className='flex space-x-8'>
              <Link
                href='#'
                className='text-sm text-muted-foreground hover:text-gray-600'>
                Terms
              </Link>
              <Link
                href='#'
                className='text-sm text-muted-foreground hover:text-gray-600'>
                Privacy Policy
              </Link>
              <Link
                href='#'
                className='text-sm text-muted-foreground hover:text-gray-600'>
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  )
}

export default Footer
