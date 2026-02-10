'use client'

import { Icons } from '@/components/Icons'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const ResetPasswordValidator = z.object({
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type TResetPasswordValidator = z.infer<typeof ResetPasswordValidator>

const Page = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TResetPasswordValidator>({
        resolver: zodResolver(ResetPasswordValidator),
    })

    const { mutate: resetPassword, isLoading } =
        trpc.auth.resetPassword.useMutation({
            onSuccess: () => {
                toast.success('Password reset successfully!')
                router.push('/sign-in')
            },
            onError: (err) => {
                toast.error('Invalid or expired reset link.')
            },
        })

    const onSubmit = ({ password }: TResetPasswordValidator) => {
        if (!token) {
            toast.error('Invalid reset link')
            return
        }
        resetPassword({ token, password })
    }

    if (!token) {
        return (
            <div className='container relative flex pt-20 flex-col items-center justify-center lg:px-0'>
                <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
                    <div className='flex flex-col items-center space-y-2 text-center'>
                        <Icons.logo className='h-20 w-20' />
                        <h1 className='text-2xl font-semibold tracking-tight'>
                            Invalid Reset Link
                        </h1>
                        <p className='text-muted-foreground'>
                            This password reset link is invalid or has expired.
                        </p>
                        <Link
                            className={buttonVariants({
                                variant: 'link',
                                className: 'gap-1.5',
                            })}
                            href='/forgot-password'>
                            Request a new link
                            <ArrowRight className='h-4 w-4' />
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className='container relative flex pt-20 flex-col items-center justify-center lg:px-0'>
                <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
                    <div className='flex flex-col items-center space-y-2 text-center'>
                        <Icons.logo className='h-20 w-20' />
                        <h1 className='text-2xl font-semibold tracking-tight'>
                            Reset your password
                        </h1>
                        <p className='text-muted-foreground'>
                            Enter your new password below.
                        </p>
                    </div>

                    <div className='grid gap-6'>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className='grid gap-2'>
                                <div className='grid gap-1 py-2'>
                                    <Label htmlFor='password'>New Password</Label>
                                    <div className='relative'>
                                        <Input
                                            {...register('password')}
                                            type={showPassword ? 'text' : 'password'}
                                            className={cn({
                                                'focus-visible:ring-red-500': errors.password,
                                            }, 'pr-10')}
                                            placeholder='Enter new password'
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

                                <div className='grid gap-1 py-2'>
                                    <Label htmlFor='confirmPassword'>Confirm Password</Label>
                                    <Input
                                        {...register('confirmPassword')}
                                        type={showPassword ? 'text' : 'password'}
                                        className={cn({
                                            'focus-visible:ring-red-500': errors.confirmPassword,
                                        })}
                                        placeholder='Confirm new password'
                                    />
                                    {errors?.confirmPassword && (
                                        <p className='text-sm text-red-500'>
                                            {errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>

                                <Button disabled={isLoading}>
                                    {isLoading && (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    )}
                                    Reset Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Page
