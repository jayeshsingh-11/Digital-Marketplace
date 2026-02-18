'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

const AuthCallbackPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = searchParams.get('next') || '/'
    const supabase = createClient()

    useEffect(() => {
        const handleAuth = async () => {
            console.log('Auth Callback: Checking session...')

            // Check if we already have a session
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Auth Callback: getSession Error:', error)
                router.push('/auth/auth-code-error')
                return
            }

            if (session) {
                console.log('Auth Callback: Session found immediately, redirecting to', next)
                router.push(next)
                return
            }

            console.log('Auth Callback: No session yet, setting up listener...')

            // Listen for auth state changes (implicit flow should trigger SIGNED_IN)
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth Callback: Auth Event:', event, session?.user?.email)
                if (event === 'SIGNED_IN' && session) {
                    console.log('Auth Callback: Signed In event received, redirecting...')
                    router.push(next)
                }
            })

            // Failsafe: If nothing happens in 10 seconds, redirect to sign-in or error
            const timeoutId = setTimeout(() => {
                console.warn('Auth Callback: Timeout reached without session.')
                // Optional: redirect to sign-in or just show a message
                // router.push('/sign-in') 
            }, 10000)

            return () => {
                subscription.unsubscribe()
                clearTimeout(timeoutId)
            }
        }

        handleAuth()
    }, [router, supabase, next])

    return (
        <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
            <Loader2 className='h-8 w-8 animate-spin text-zinc-500' />
            <p className='text-zinc-500'>Verifying login...</p>
        </div>
    )
}

export default AuthCallbackPage
