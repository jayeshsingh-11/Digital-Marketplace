import { getServerSideUser } from '@/lib/payload-utils'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'

const AdminPage = async () => {
    const nextCookies = cookies()

    let user = null
    try {
        const res = await getServerSideUser(nextCookies)
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
