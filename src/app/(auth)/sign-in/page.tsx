'use client'

import { Icons } from '@/components/Icons'
import Logo from '@/components/Logo'
import {
  Button,
  buttonVariants,
} from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import GoogleAuthButton from '@/components/GoogleAuthButton'

import {
  AuthCredentialsValidator,
  TAuthCredentialsValidator,
} from '@/lib/validators/account-credentials-validator'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { ZodError } from 'zod'
import AuthIllustration from '@/components/AuthIllustration'
import { useRouter, useSearchParams } from 'next/navigation'

const Page = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isSeller = searchParams.get('as') === 'seller'
  const origin = searchParams.get('origin')
  const [showPassword, setShowPassword] = useState(false)

  const continueAsSeller = () => {
    router.push('?as=seller')
  }

  const continueAsBuyer = () => {
    router.replace('/sign-in', undefined)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
  })

  const { mutate: signIn, isLoading } =
    trpc.auth.signIn.useMutation({
      onSuccess: async () => {
        toast.success('Signed in successfully')

        if (origin) {
          window.location.href = `/${origin}`
          return
        }

        if (isSeller) {
          window.location.href = '/seller'
          return
        }

        window.location.href = '/'
      },
      onError: (err) => {
        if (err.data?.code === 'UNAUTHORIZED') {
          toast.error('Invalid email or password.')
        }
      },
    })

  const onSubmit = ({
    email,
    password,
  }: TAuthCredentialsValidator) => {
    signIn({ email, password })
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side: Creative Image */}
      <AuthIllustration
        title="Welcome back to Creative Cascade."
        subtitle="Your marketplace for high-quality design."
        imageSrc="/auth.png"
      />

      {/* Right Side: Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-4 sm:px-12 relative">
        <div className="absolute top-8 right-8 md:top-12 md:right-12">
          <Link href='/' className="text-sm font-medium text-gray-500 hover:text-black">
            Back to home
          </Link>
        </div>

        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
          <div className='flex flex-col space-y-2 text-center items-center'>
            <Logo className='mb-4' />
            <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>
              Log in to Creative Cascade
            </h1>

            {/* Removed top sign-up link */}
          </div>

          <div className='grid gap-6'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='grid gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    {...register('email')}
                    className={cn({
                      'focus-visible:ring-red-500':
                        errors.email,
                    })}
                    placeholder='you@example.com'
                  />
                  {errors?.email && (
                    <p className='text-sm text-red-500'>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className='grid gap-2'>
                  <div className="flex items-center justify-between">
                    <Label htmlFor='password'>Password</Label>
                    <Link
                      href='/forgot-password'
                      className='text-sm text-blue-600 hover:underline'
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className='relative'>
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className={cn({
                        'focus-visible:ring-red-500':
                          errors.password,
                      }, 'pr-10')}
                      placeholder='Password'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                    >
                      {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </button>
                  </div>
                  {errors?.password && (
                    <p className='text-sm text-red-500'>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button disabled={isLoading} className="w-full bg-gray-900 hover:bg-gray-800 h-11">
                  {isLoading && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Sign in
                </Button>
              </div>
            </form>

            <div className="relative">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  or continue with
                </span>
              </div>
            </div>

            <GoogleAuthButton />

            <div className="mt-6 text-center space-y-4 pt-6 border-t border-gray-100">
              <p className="text-sm text-muted-foreground font-medium italic">
                &quot;Everything you can imagine is real.&quot;
              </p>
              <Link
                href='/sign-up'
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'w-full group text-base hover:bg-transparent hover:text-blue-600 transition-colors'
                })}>
                New user? <span className="font-bold ml-1 underline group-hover:no-underline">Create an account</span>
                <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform' />
              </Link>
            </div>

            {isSeller ? (
              <Button
                onClick={continueAsBuyer}
                variant='outline'
                disabled={isLoading}
                className="w-full"
              >
                Continue as customer
              </Button>
            ) : (
              <Button
                onClick={continueAsSeller}
                variant='outline'
                disabled={isLoading}
                className="w-full"
              >
                Continue as seller
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
