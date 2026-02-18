'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"

const AuthCodeErrorPage = () => {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4'>
            <h1 className='text-2xl font-bold text-red-600'>Authentication Error</h1>
            <p className='text-zinc-600 max-w-md'>
                There was an problem logging you in. The link may have expired or is invalid.
            </p>
            <div className='flex gap-4'>
                <Button asChild variant='outline'>
                    <Link href='/sign-in'>Sign In</Link>
                </Button>
                <Button asChild>
                    <Link href='/'>Go Home</Link>
                </Button>
            </div>
        </div>
    )
}

export default AuthCodeErrorPage
