import { getServerSideUserNode } from '@/lib/auth-utils'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SellerDashboard from '@/components/SellerDashboard'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

const Page = async () => {
    const nextCookies = cookies()
    const { user } = await getServerSideUserNode(nextCookies)

    if (!user) {
        redirect('/sign-in?origin=sell')
    }

    return <SellerDashboard user={user} />
}

export default Page
