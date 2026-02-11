'use client'

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'

const GoogleAuthButton = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')

    console.log('Google Client ID available:', !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

    const { mutate: signInWithGoogle } = trpc.auth.signInWithGoogle.useMutation({
        onSuccess: () => {
            toast.success('Signed in successfully')
            if (origin) {
                window.location.href = `/${origin}`
                return
            }
            window.location.href = '/'
        },
        onError: (err) => {
            toast.error('Something went wrong with Google Login')
        }
    })

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
            <div className="w-full flex justify-center mt-4">
                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        if (credentialResponse.credential) {
                            signInWithGoogle({ idToken: credentialResponse.credential })
                        }
                    }}
                    onError={() => {
                        toast.error('Google Login Failed')
                    }}
                    theme="outline"
                    shape="rectangular"
                />
            </div>
        </GoogleOAuthProvider>
    )
}

export default GoogleAuthButton
