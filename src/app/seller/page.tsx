import { getServerSideUserNode } from '@/lib/payload-utils-node'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SellerDashboard from '@/components/SellerDashboard'

const SellerPage = async () => {
    const nextCookies = cookies()
    const { user } = await getServerSideUserNode(nextCookies)

    if (!user) {
        redirect('/sign-in?origin=sell')
    }

    return <SellerDashboard user={user} />
}

export default SellerPage
