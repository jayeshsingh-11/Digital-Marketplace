import { getServerSideUserNode } from '@/lib/payload-utils-node'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'

const AdminPage = async () => {
    const nextCookies = cookies()

    let user = null
    try {
        const res = await getServerSideUserNode(nextCookies)
        user = res.user
    } catch (err) {
        // If fetch fails (server not ready), redirect to home
        redirect('/')
    }

    if (!user || user.role !== 'admin') {
        redirect('/')
    }

    return <AdminDashboard user={user} />
}

export default AdminPage
