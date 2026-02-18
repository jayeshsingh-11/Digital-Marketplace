import Navbar from '@/components/Navbar'
import NavbarWrapper from '@/components/NavbarWrapper'
import Providers from '@/components/Providers'
import { cn, constructMetadata } from '@/lib/utils'
import type { Metadata } from 'next'
import { Inter, Playfair_Display, Dancing_Script } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import Footer from '@/components/Footer'
import MobileBottomNav from '@/components/MobileBottomNav'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const dancingScript = Dancing_Script({ subsets: ['latin'], variable: '--font-cursive' })

export const metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='h-full'>
      <body
        className={cn(
          'relative h-full font-sans antialiased',
          inter.variable,
          playfair.variable,
          dancingScript.variable
        )}>
        <main className='relative flex flex-col min-h-screen'>
          <Providers>
            <NavbarWrapper>
              <Navbar />
            </NavbarWrapper>
            <div className='flex-grow flex-1'>
              {children}
            </div>
            <Footer />
            <MobileBottomNav />
          </Providers>
        </main>

        <Toaster position='top-center' richColors />
      </body>
    </html>
  )
}
