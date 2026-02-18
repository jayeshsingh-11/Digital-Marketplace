'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const ResetPasswordValidator = z.object({
    password: z.string().min(8, {
        message: 'Password must be at least 8 characters long.',
    }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

type TResetPasswordValidator = z.infer<typeof ResetPasswordValidator>

const Page = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    // Supabase auth helpers handle the hash fragment automatically to set the session
    const supabase = createClient()
    const [isSessionCheckComplete, setIsSessionCheckComplete] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TResetPasswordValidator>({
        resolver: zodResolver(ResetPasswordValidator),
    })

    // Wait for Supabase to handle the session from the URL hash
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // If no session, wait a bit as the hash might be processing or it's invalid
                // But since this page is the redirect target, Supabase should handle the code exchange
            }
            setIsSessionCheckComplete(true)
        }
        checkSession()
    }, [supabase.auth])

    const onSubmit = async ({ password }: TResetPasswordValidator) => {
        const { error } = await supabase.auth.updateUser({
            password,
        })

        if (error) {
            toast.error('Failed to reset password. Please try again.')
            return
        }

        toast.success('Password updated successfully!')
        router.push('/sign-in')
    }

    // Optional: Loading state while checking session
    if (!isSessionCheckComplete) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
            </div>
        )
    }

    return (
        <div className='container relative flex pt-20 flex-col items-center justify-center lg:px-0'>
            <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
                <div className='flex flex-col items-center space-y-2 text-center'>
                    <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
                        Reset your password
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Enter your new password below.
                    </p>
                </div>

                <div className='grid gap-6'>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className='grid gap-4'>
                            <div className='grid gap-2'>
                                <Label htmlFor='password'>New Password</Label>
                                <div className='relative'>
                                    <Input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        className={cn('pr-10', {
                                            'focus-visible:ring-red-500': errors.password,
                                        })}
                                        placeholder='Password'
                                    />
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                        onClick={() => setShowPassword((prev) => !prev)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className='h-4 w-4 text-muted-foreground' />
                                        ) : (
                                            <Eye className='h-4 w-4 text-muted-foreground' />
                                        )}
                                        <span className='sr-only'>
                                            {showPassword ? 'Hide password' : 'Show password'}
                                        </span>
                                    </Button>
                                </div>
                                {errors?.password && (
                                    <p className='text-sm text-red-500'>
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className='grid gap-2'>
                                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                                <div className='relative'>
                                    <Input
                                        {...register('confirmPassword')}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className={cn('pr-10', {
                                            'focus-visible:ring-red-500': errors.confirmPassword,
                                        })}
                                        placeholder='Confirm Password'
                                    />
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className='h-4 w-4 text-muted-foreground' />
                                        ) : (
                                            <Eye className='h-4 w-4 text-muted-foreground' />
                                        )}
                                        <span className='sr-only'>
                                            {showConfirmPassword ? 'Hide password' : 'Show password'}
                                        </span>
                                    </Button>
                                </div>
                                {errors?.confirmPassword && (
                                    <p className='text-sm text-red-500'>
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button className='bg-black hover:bg-gray-800 text-white w-full'>
                                Reset Password
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Page
