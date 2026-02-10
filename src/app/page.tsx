import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import ProductReel from '@/components/ProductReel'
import {
  Button,
  buttonVariants,
} from '@/components/ui/button'
import {
  ArrowDownToLine,
  ArrowRight,
  CheckCircle,
  Leaf,
  Sparkles,
  Star,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

const perks = [
  {
    name: 'Instant Delivery',
    Icon: Zap,
    description:
      'Get your assets delivered to your email in seconds and download them right away.',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Guaranteed Quality',
    Icon: Shield,
    description:
      'Every asset on our platform is verified by our team to ensure our highest quality standards. Not happy? We offer a 30-day refund guarantee.',
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    name: 'For the Planet',
    Icon: Leaf,
    description:
      "We've pledged 1% of sales to the preservation and restoration of the natural environment.",
    gradient: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
]

const stats = [
  { label: 'Digital Assets', value: '1,200+' },
  { label: 'Happy Creators', value: '500+' },
  { label: 'Downloads', value: '10K+' },
  { label: 'Satisfaction', value: '99%' },
]

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-white'>
        {/* Background decoration */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100/50 blur-3xl' />
          <div className='absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-violet-100/50 blur-3xl' />
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-50/80 blur-3xl' />
        </div>

        <MaxWidthWrapper>
          <div className='relative py-24 lg:py-32 mx-auto text-center flex flex-col items-center max-w-4xl'>
            {/* Badge */}
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8'>
              <Sparkles className='h-4 w-4 text-blue-600' />
              <span className='text-sm font-medium text-blue-700'>
                The #1 Digital Marketplace for Creators
              </span>
            </div>

            <h1 className='text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl leading-[1.1]'>
              Your marketplace for{' '}
              <span className='relative'>
                <span className='relative z-10 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent'>
                  high-quality
                </span>
              </span>{' '}
              digital assets
            </h1>

            <p className='mt-8 text-lg sm:text-xl max-w-2xl text-gray-500 leading-relaxed'>
              Discover premium UI kits, icons, and digital resources.
              Every asset is verified for quality. Start building
              beautiful products today.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 mt-10'>
              <Link
                href='/products'
                className={buttonVariants({
                  size: 'lg',
                  className: 'px-8 py-6 text-base font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300',
                })}>
                Browse Marketplace
                <ArrowRight className='ml-2 h-5 w-5' />
              </Link>
              <Link
                href='/sign-up'
                className={buttonVariants({
                  variant: 'outline',
                  size: 'lg',
                  className: 'px-8 py-6 text-base font-semibold border-2 hover:bg-gray-50 transition-all duration-300',
                })}>
                Start Selling
              </Link>
            </div>

            {/* Stats */}
            <div className='mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 w-full max-w-2xl'>
              {stats.map((stat) => (
                <div key={stat.label} className='text-center'>
                  <div className='text-2xl sm:text-3xl font-bold text-gray-900'>
                    {stat.value}
                  </div>
                  <div className='mt-1 text-sm text-gray-500'>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Products Section */}
      <section className='bg-white border-t border-gray-100'>
        <MaxWidthWrapper>
          <ProductReel
            query={{ sort: 'desc', limit: 4 }}
            href='/products?sort=recent'
            title='Brand new'
            subtitle='Check out the latest digital assets added to our marketplace'
          />
        </MaxWidthWrapper>
      </section>

      {/* Perks Section */}
      <section className='border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white'>
        <MaxWidthWrapper className='py-24'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6'>
              <Star className='h-4 w-4 text-blue-600' />
              <span className='text-sm font-medium text-blue-700'>
                Why choose us
              </span>
            </div>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900'>
              Built for creators, by creators
            </h2>
            <p className='mt-4 text-lg text-gray-500 max-w-2xl mx-auto'>
              We make it easy to sell and buy premium digital assets with
              confidence and speed.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {perks.map((perk) => (
              <div
                key={perk.name}
                className='relative group bg-white rounded-2xl border border-gray-200 p-8 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300'>
                <div className={`inline-flex p-3 rounded-xl ${perk.iconBg} mb-6`}>
                  <perk.Icon className={`h-6 w-6 ${perk.iconColor}`} />
                </div>

                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  {perk.name}
                </h3>
                <p className='text-sm text-gray-500 leading-relaxed'>
                  {perk.description}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* CTA Section */}
      <section className='border-t border-gray-100'>
        <MaxWidthWrapper className='py-24'>
          <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 px-8 py-16 sm:px-16 sm:py-20'>
            {/* Background decoration */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
              <div className='absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10 blur-2xl' />
              <div className='absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-2xl' />
            </div>

            <div className='relative text-center max-w-2xl mx-auto'>
              <h2 className='text-3xl sm:text-4xl font-bold text-white mb-6'>
                Ready to start selling?
              </h2>
              <p className='text-lg text-blue-100 mb-10 leading-relaxed'>
                Join thousands of creators who are already selling their
                digital assets on our marketplace. It&apos;s free to get
                started.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link
                  href='/sign-up'
                  className='inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-white text-blue-700 font-semibold text-base hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20'>
                  Get Started Free
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Link>
                <Link
                  href='/products'
                  className='inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-white/10 text-white font-semibold text-base hover:bg-white/20 transition-colors border border-white/20'>
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  )
}
