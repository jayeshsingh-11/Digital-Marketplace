'use client'

import { Icons } from '@/components/Icons'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { useState } from 'react'

const ForgotPasswordValidator = z.object({
    email: z.string().email(),
})

type TForgotPasswordValidator = z.infer<typeof ForgotPasswordValidator>

const Page = () => {
    const [emailSent, setEmailSent] = useState(false)

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<TForgotPasswordValidator>({
        resolver: zodResolver(ForgotPasswordValidator),
    })

    const { mutate: forgotPassword, isLoading } =
        trpc.auth.forgotPassword.useMutation({
            onSuccess: () => {
                setEmailSent(true)
                toast.success('Password reset email sent!')
            },
            onError: (err) => {
                toast.error('Something went wrong. Please try again.')
            },
        })

    const onSubmit = ({ email }: TForgotPasswordValidator) => {
        forgotPassword({ email })
    }

    if (emailSent) {
        return (
            <div className='container relative flex pt-20 flex-col items-center justify-center lg:px-0'>
                <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]'>
                    <div className='flex flex-col items-center space-y-2 text-center'>
                        <div className="relative mb-4 h-60 w-full">
                            <Image
                                src='/hippo-email-sent.png'
                                fill
                                alt='Check your email'
                                className='object-contain mix-blend-multiply'
                            />
                        </div>
                        <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
                            Check your inbox!
                        </h1>
                        <p className='text-muted-foreground text-lg'>
                            We&apos;ve sent a magic link to <span className="font-semibold text-gray-900">{getValues('email')}</span>.
                        </p>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            Didn&apos;t receive it? Check your spam folder or try again in a few minutes. The creative kingdom awaits!
                        </p>
                        <Link
                            className={buttonVariants({
                                variant: 'link',
                                className: 'gap-1.5 mt-4 text-gray-900',
                            })}
                            href='/sign-in'>
                            Back to sign in
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
                        <Icons.logo className='h-20 w-20 mb-2' />
                        <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
                            Forgot password?
                        </h1>
                        <p className='text-sm text-muted-foreground'>
                            Enter your email and we&apos;ll send you a reset link.
                        </p>
                    </div>

                    <div className='grid gap-6'>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className='grid gap-4'>
                                <div className='grid gap-2'>
                                    <Label htmlFor='email' className='sr-only'>Email</Label>
                                    <Input
                                        {...register('email')}
                                        className={cn({
                                            'focus-visible:ring-red-500': errors.email,
                                        })}
                                        placeholder='name@example.com'
                                    />
                                    {errors?.email && (
                                        <p className='text-sm text-red-500'>
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <Button disabled={isLoading} className='bg-black hover:bg-gray-800 text-white w-full'>
                                    {isLoading && (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    )}
                                    Send reset link
                                </Button>
                            </div>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground">
                                    Or
                                </span>
                            </div>
                        </div>

                        <Link
                            className={buttonVariants({
                                variant: 'link',
                                className: 'gap-1.5 w-full text-center',
                            })}
                            href='/sign-in'>
                            Back to sign in
                            <ArrowRight className='h-4 w-4' />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Page
