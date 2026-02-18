'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const AuthCallback = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = searchParams.get('next') || '/'
    const code = searchParams.get('code')
    const [status, setStatus] = useState('Verifying login...')

    useEffect(() => {
        const supabase = createClient()

        const handleAuth = async () => {
            console.log('Auth Callback: Starting...', { hasCode: !!code, next })

            // 1. If there's a PKCE code in the URL, exchange it for a session
            if (code) {
                console.log('Auth Callback: Exchanging code for session...')
                const { data, error } = await supabase.auth.exchangeCodeForSession(code)

                if (error) {
                    console.error('Auth Callback: Code exchange error:', error)
                    setStatus('Authentication failed. Please try again.')
                    setTimeout(() => router.push('/sign-in'), 2000)
                    return
                }

                if (data.session) {
                    console.log('Auth Callback: Code exchange successful, redirecting to', next)
                    router.push(next)
                    return
                }
            }

            // 2. Check if we already have a session (e.g. from hash tokens)
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Auth Callback: getSession Error:', error)
                router.push('/auth/auth-code-error')
                return
            }

            if (session) {
                console.log('Auth Callback: Session found, redirecting to', next)
                router.push(next)
                return
            }

            console.log('Auth Callback: No session yet, setting up listener...')

            // 3. Listen for auth state changes (for implicit/hash flow)
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth Callback: Auth Event:', event, 'hasSession:', !!session)
                if (event === 'SIGNED_IN' && session) {
                    console.log('Auth Callback: Signed in, redirecting...')
                    subscription.unsubscribe()
                    router.push(next)
                }
                if (event === 'PASSWORD_RECOVERY' && session) {
                    console.log('Auth Callback: Password recovery, redirecting...')
                    subscription.unsubscribe()
                    router.push(next)
                }
            })

            // 4. Failsafe timeout
            const timeoutId = setTimeout(async () => {
                console.warn('Auth Callback: Timeout reached, checking session one last time...')
                const { data } = await supabase.auth.getSession()
                if (data.session) {
                    router.push(next)
                } else {
                    setStatus('Authentication failed. Redirecting to sign in...')
                    setTimeout(() => router.push('/sign-in'), 2000)
                }
            }, 10000)

            return () => {
                subscription.unsubscribe()
                clearTimeout(timeoutId)
            }
        }

        handleAuth()
    }, [router, next, code])

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

