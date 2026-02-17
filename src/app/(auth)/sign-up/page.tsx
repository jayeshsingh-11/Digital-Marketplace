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
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
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
import { useRouter } from 'next/navigation'

const Page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
  })

  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const { mutate, isLoading } =
    trpc.auth.createUser.useMutation({
      onError: (err) => {
        if (err.data?.code === 'CONFLICT') {
          toast.error(
            'This email is already in use. Sign in instead?'
          )

          return
        }

        if (err instanceof ZodError) {
          toast.error(err.issues[0].message)

          return
        }

        toast.error(
          err.message || 'Something went wrong. Please try again.'
        )
      },
      onSuccess: ({ sentToEmail }) => {
        toast.success('Account created! Redirecting...')
        router.refresh()
        router.push('/')
      },
    })

  const onSubmit = ({
    email,
    password,
  }: TAuthCredentialsValidator) => {
    console.log('Submitting sign-up form:', { email })
    mutate({ email, password })
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side: Creative Image */}
      <AuthIllustration
        title="Join our creative community."
        subtitle="Access thousands of premium digital assets."
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
              Create an account
            </h1>

            {/* Removed top login link */}
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
                  <Label htmlFor='password'>Password</Label>
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
                  Sign up
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
                "Creativity takes courage."
              </p>
              <Link
                href='/sign-in'
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'w-full group text-base hover:bg-transparent hover:text-blue-600 transition-colors'
                })}>
                Already have an account? <span className="font-bold ml-1 underline group-hover:no-underline">Log in</span>
                <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform' />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
