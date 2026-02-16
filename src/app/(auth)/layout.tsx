import { getServerSideUserNode } from '@/lib/auth-utils'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

interface AuthLayoutProps {
    children: ReactNode
}

const AuthLayout = async ({ children }: AuthLayoutProps) => {
    const nextCookies = cookies()
    const { user } = await getServerSideUserNode(nextCookies)

    if (user) {
        redirect('/')
    }

    return <>{children}</>
}

export default AuthLayout
