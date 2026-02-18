'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const AuthCallback = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = searchParams.get('next') || '/'
    const supabase = createClient()
    const [status, setStatus] = useState('Verifying login...')

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

            // Listen for auth state changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth Callback: Auth Event:', event)
                if ((event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') && session) {
                    console.log('Auth Callback: Signed In/Recovery event received, redirecting...')
                    router.push(next)
                }
            })

            // Failsafe: If nothing happens in 10 seconds
            const timeoutId = setTimeout(() => {
                console.warn('Auth Callback: Timeout reached.')
                setStatus('Taking longer than expected. You may already be logged in. Try refreshing or check your console.')
                // Force a check again just in case
                supabase.auth.getSession().then(({ data }) => {
                    if (data.session) router.push(next)
                })
            }, 5000)

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
            <p className='text-zinc-500'>{status}</p>
        </div>
    )
}

const AuthCallbackPage = () => {
    return (
        <Suspense fallback={<div className='flex items-center justify-center min-h-screen'><Loader2 className='h-8 w-8 animate-spin' /></div>}>
            <AuthCallback />
        </Suspense>
    )
}

export default AuthCallbackPage
