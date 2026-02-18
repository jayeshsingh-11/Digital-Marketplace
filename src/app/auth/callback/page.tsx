'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Parse tokens from URL hash fragment.
 * Supabase implicit flow puts tokens in the hash like:
 * #access_token=...&refresh_token=...&type=recovery
 */
function parseHashTokens() {
    if (typeof window === 'undefined') return null
    const hash = window.location.hash.substring(1) // remove '#'
    if (!hash) return null

    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    const type = params.get('type')

    if (access_token && refresh_token) {
        return { access_token, refresh_token, type }
    }
    return null
}

const AuthCallback = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = searchParams.get('next') || '/'
    const code = searchParams.get('code')
    const [status, setStatus] = useState('Verifying login...')

    useEffect(() => {
        const supabase = createClient()

        const handleAuth = async () => {
            console.log('Auth Callback: Starting...', { hasCode: !!code, next, hash: window.location.hash?.substring(0, 50) })

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

            // 2. If there are hash tokens in the URL (implicit flow / password recovery),
            //    manually set the session to bypass clock skew issues
            const hashTokens = parseHashTokens()
            if (hashTokens) {
                console.log('Auth Callback: Found hash tokens, type:', hashTokens.type)
                const { data, error } = await supabase.auth.setSession({
                    access_token: hashTokens.access_token,
                    refresh_token: hashTokens.refresh_token,
                })

                if (error) {
                    console.error('Auth Callback: setSession error:', error)
                    setStatus('Authentication failed. Please try again.')
                    setTimeout(() => router.push('/sign-in'), 2000)
                    return
                }

                if (data.session) {
                    console.log('Auth Callback: Session set from hash tokens, redirecting to', next)
                    // Clear hash from URL for cleanliness
                    window.location.hash = ''
                    router.push(next)
                    return
                }
            }

            // 3. Check if we already have a session
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Auth Callback: getSession Error:', error)
                router.push('/auth/auth-code-error')
                return
            }

            if (session) {
                console.log('Auth Callback: Existing session found, redirecting to', next)
                router.push(next)
                return
            }

            console.log('Auth Callback: No session, setting up listener...')

            // 4. Listen for auth state changes (last resort)
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth Callback: Auth Event:', event, 'hasSession:', !!session)
                if ((event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') && session) {
                    console.log('Auth Callback: Auth event received, redirecting...')
                    subscription.unsubscribe()
                    router.push(next)
                }
            })

            // 5. Failsafe timeout - do a hard navigation which will pick up any session
            //    that was set during the wait (even if our checks missed it)
            const timeoutId = setTimeout(() => {
                console.warn('Auth Callback: Timeout reached, doing hard navigation to', next)
                window.location.href = next
            }, 5000)

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


