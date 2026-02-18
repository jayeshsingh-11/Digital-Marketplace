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
            // This handles both hash fragment (implicit) and code (PKCE) automatically
            // provided the client is configured correctly.
            const { data, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Auth Callback Error:', error)
                router.push('/auth/auth-code-error')
                return
            }

            if (data.session) {
                console.log('Auth Callback Success: Session found')
                router.push(next)
            } else {
                // If no session yet, it might be processing the hash. 
                // Wait for the onAuthStateChange event if needed, but getSession usually checks URL.
                // Let's verify via listener
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' && session) {
                        router.push(next)
                    }
                })

                // Fallback catch-all if nothing happens quickly?
                // For now, reliance on getSession + onAuthStateChange is standard.
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
