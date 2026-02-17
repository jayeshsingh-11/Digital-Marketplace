import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import ProductReel from '@/components/ProductReel'
import FeaturedBanner from '@/components/FeaturedBanner'
import RecentlyViewed from '@/components/RecentlyViewed'
import { HeroBanner } from '@/components/HeroBanner'
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
      <section className='relative'>
        <HeroBanner />
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

      {/* Headline */}
      <section className='bg-white pt-8 pb-4'>
        <MaxWidthWrapper className='text-center'>
          <h2 className='text-3xl md:text-5xl font-bold font-serif text-gray-900 tracking-tight font-playfair'>
            Bring your creative ideas to life.
          </h2>
        </MaxWidthWrapper>
      </section>

      {/* Featured Shops Banner */}
      <section className='bg-white py-4 md:py-8'>
        <MaxWidthWrapper>
          <FeaturedBanner />
        </MaxWidthWrapper>
      </section>

      {/* Featured Shops Products */}
      <section className='bg-white border-t border-gray-100'>
        <MaxWidthWrapper>
          <ProductReel
            query={{ sort: 'desc', limit: 4 }}
            href='/products?sort=recent'
            title='Products from Featured Shops'
            subtitle='Hand-picked favorites from our top creators'
          />
        </MaxWidthWrapper>
      </section>

      {/* Popular Fonts */}
      <section className='bg-white border-t border-gray-100'>
        <MaxWidthWrapper>
          <ProductReel
            query={{ sort: 'desc', limit: 4, category: 'fonts' }}
            href='/products?category=fonts'
            title='Popular font products'
            subtitle='Typography to make your designs stand out'
          />
        </MaxWidthWrapper>
      </section>

      {/* Recently Viewed */}
      <section className='bg-white border-t border-gray-100'>
        <MaxWidthWrapper>
          <RecentlyViewed />
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

      {/* CTA Section Removed */}
    </>
  )
}
