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
    '/forgot-password',
    '/reset-password-confirm',
  ]

  if (pathname.startsWith('/admin') || pathsToHide.includes(pathname)) {
    return null
  }

  return (
    <footer className='bg-white flex-grow-0 pt-16 pb-8 border-t border-gray-200'>
      <MaxWidthWrapper>
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12'>
          {/* Brand Column */}
          <div className='col-span-2 lg:col-span-1'>
            <Icons.logo className='h-20 w-auto mb-6' />
            <p className='text-sm text-gray-500 leading-relaxed mb-6'>
              Your launchpad for digital creativity.
            </p>
            <div className='flex space-x-4'>
              <Link href='#' className='text-gray-400 hover:text-gray-500'>
                <span className='sr-only'>Dribbble</span>
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.493-.184-.849 2.012-.916 3.666-2.5 4.197-4.194zM11.516 12.19c.176.082.353.165.517.265.485 2.502 1.343 5.39.231 6.81a8.501 8.501 0 01-6.13-1.89c.304-.633 1.933-3.692 5.382-5.185zm-4.75 3.197c-2.368-1.579-3.267-4.225-3.32-4.524 2.105-1.161 5.388-1.745 6.703-1.635-.09.349-.17.702-.236 1.053-1.206-.057-2.618.176-3.147 5.106zm8.17 3.322c-.628-1.144-1.332-3.483-1.76-5.83 2.65-.262 5.093.303 5.313.364a8.49 8.49 0 01-3.553 5.466zm-5.71-5.776c-1.347-.091-4.735.619-6.905 1.772a8.468 8.468 0 01-1.12-5.823c.31.066 3.707.72 6.864 1.258.498-1.74 1.068-3.09 1.4-3.868 2.059 1.503 3.664 3.738 4.296 6.311.082.34.148.683.203 1.026-.843-.217-2.647-.482-4.738-.676z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href='#' className='text-gray-400 hover:text-gray-500'>
                <span className='sr-only'>Pinterest</span>
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.694-4.869-4.15 0-6.581 3.104-6.581 6.315 0 1.25.481 2.583 1.081 3.312.119.144.137.275.102.425-.112.463-.365 1.49-.415 1.696-.066.276-.219.336-.505.202-1.875-.873-3.047-3.64-3.047-5.855 0-4.766 3.447-9.146 9.944-9.146 5.215 0 9.255 3.731 9.255 8.703 0 5.196-3.267 9.375-7.802 9.375-1.524 0-2.957-.795-3.448-1.734l-.941 3.58c-.347 1.343-1.286 3.018-1.921 4.041 1.446.427 2.978.653 4.56.653 6.621 0 11.987-5.365 11.987-11.987 0-6.621-5.366-11.987-11.987-11.987z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href='#' className='text-gray-400 hover:text-gray-500'>
                <span className='sr-only'>Twitter</span>
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href='#' className='text-gray-400 hover:text-gray-500'>
                <span className='sr-only'>Instagram</span>
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 4.123-.06h.08zm0 2.163c-2.392 0-2.67.01-3.773.06-.856.04-1.32.203-1.631.325a2.69 2.69 0 00-1.002.65 2.69 2.69 0 00-.65 1.002c-.122.312-.284.775-.325 1.631-.05 1.102-.06 1.381-.06 3.773v.231c0 2.392.01 2.67.06 3.773.04.856.203 1.32.325 1.631.22.568.498.985 1.002 1.49.505.505.922.782 1.49 1.002.312.122.775.284 1.631.325 1.102.05 1.381.06 3.773.06h.231c2.392 0 2.67-.01 3.773-.06.856-.04 1.32-.203 1.631-.325a2.69 2.69 0 001.002-.65 2.69 2.69 0 00.65-1.002c.122-.312.284-.775.325-1.631.05-1.102.06-1.381.06-3.773v-.231c0-2.392-.01-2.67-.06-3.773-.04-.856-.203-1.32-.325-1.631a2.69 2.69 0 00-.65-1.002 2.69 2.69 0 00-1.002-.65c-.312-.122-.775-.284-1.631-.325-1.102-.05-1.381-.06-3.773-.06h-.231zm-.231 4.795a5.815 5.815 0 110 11.63 5.815 5.815 0 010-11.63zM12.084 11.2a3.652 3.652 0 100 7.304 3.652 3.652 0 000-7.304zm5.17-3.867a1.44 1.44 0 110 2.88 1.44 1.44 0 010-2.88z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Earn Column */}
          <div>
            <h3 className='text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4'>Earn</h3>
            <ul className='space-y-4'>
              <li><Link href='#' className='text-base text-gray-500 hover:text-gray-900'>Affiliate Partner Benefits</Link></li>
              <li><Link href='#' className='text-base text-gray-500 hover:text-gray-900'>Shop Benefits</Link></li>
              <li><Link href='#' className='text-base text-gray-500 hover:text-gray-900'>Become an Ambassador</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className='text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4'>Resources</h3>
            <ul className='space-y-4'>
              <li><Link href='#' className='text-base text-gray-500 hover:text-gray-900'>Blog</Link></li>
              <li><Link href='#' className='text-base text-gray-500 hover:text-gray-900'>Collections</Link></li>
              <li><Link href='#' className='text-base text-gray-500 hover:text-gray-900'>Help Center</Link></li>
              <li><Link href='#' className='text-base text-gray-500 hover:text-gray-900'>Licenses</Link></li>
            </ul>
          </div>

          {/* The Goods Column */}
          <div>
            <h3 className='text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4'>The Goods</h3>
            <ul className='space-y-4'>
              <li><Link href='#' className='text-base text-gray-500 hover:text-gray-900'>Free Drops</Link></li>
              <li><Link href='#' className='text-base text-gray-500 hover:text-gray-900'>Enterprise Sales</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className='text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4'>Company</h3>
            <ul className='space-y-4'>
              <li><Link href='#' className='text-base text-gray-500 hover:text-gray-900'>About</Link></li>
              <li><Link href='#' className='text-base text-gray-500 hover:text-gray-900'>Brand</Link></li>
              <li><Link href='#' className='text-base text-gray-500 hover:text-gray-900'>Careers</Link></li>
            </ul>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  )
}

export default Footer
