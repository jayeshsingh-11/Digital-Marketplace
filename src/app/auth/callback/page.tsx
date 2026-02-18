'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Capture hash tokens IMMEDIATELY at module load time,
// BEFORE the Supabase client can auto-detect and consume them.
// This is critical because Supabase's createBrowserClient auto-detects
// hash tokens but may reject them due to clock skew, then clears the hash.
let capturedHash: string | null = null
if (typeof window !== 'undefined' && window.location.hash) {
    capturedHash = window.location.hash.substring(1)
    console.log('Auth Callback: Captured hash at module load:', capturedHash.substring(0, 80))
}

function parseHashString(hash: string | null) {
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
    const hasRun = useRef(false)

    useEffect(() => {
        // Prevent double-run in React strict mode
        if (hasRun.current) return
        hasRun.current = true

        const handleAuth = async () => {
            console.log('Auth Callback: Starting...', { hasCode: !!code, next, hasCapturedHash: !!capturedHash })

            // 1. If there's a PKCE code in the URL, exchange it for a session
            if (code) {
                console.log('Auth Callback: Exchanging code for session...')
                const supabase = createClient()
                const { data, error } = await supabase.auth.exchangeCodeForSession(code)

                if (!error && data.session) {
                    console.log('Auth Callback: Code exchange success, redirecting')
                    window.location.href = next
                    return
                }
                console.error('Auth Callback: Code exchange failed:', error)
            }

            // 2. Try to use the captured hash tokens (before Supabase consumed them)
            const hashTokens = parseHashString(capturedHash)
            if (hashTokens) {
                console.log('Auth Callback: Setting session from captured hash tokens, type:', hashTokens.type)
                const supabase = createClient()
                const { data, error } = await supabase.auth.setSession({
                    access_token: hashTokens.access_token,
                    refresh_token: hashTokens.refresh_token,
                })

                if (!error && data.session) {
                    console.log('Auth Callback: Session set successfully, redirecting to', next)
                    // Clear the captured hash
                    capturedHash = null
                    window.location.href = next
                    return
                }
                console.error('Auth Callback: setSession from hash failed:', error)
            }

            // 3. Check if Supabase auto-detection already set a session
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                console.log('Auth Callback: Existing session found, redirecting')
                window.location.href = next
                return
            }

            // 4. Wait for auth state change (last resort)
            console.log('Auth Callback: Waiting for auth state change...')
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth Callback: Auth Event:', event, 'hasSession:', !!session)
                if ((event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') && session) {
                    subscription.unsubscribe()
                    window.location.href = next
                }
            })

            // 5. Failsafe: hard navigation after 5s (will pick up any cookies set in background)
            const timeoutId = setTimeout(() => {
                console.warn('Auth Callback: Timeout, doing hard navigation')
                subscription.unsubscribe()
                window.location.href = next
            }, 5000)

            return () => {
                subscription.unsubscribe()
                clearTimeout(timeoutId)
            }
        }

        handleAuth()
    }, [next, code])

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
