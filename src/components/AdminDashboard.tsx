'use client'

import { User } from '@/payload-types'
import { trpc } from '@/trpc/client'
import { formatPrice } from '@/lib/utils'
import {
    Loader2,
    Users,
    Package,
    ShoppingCart,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Shield,
    LayoutDashboard,
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

type Tab = 'users' | 'products' | 'orders'

const AdminDashboard = ({ user }: { user: User }) => {
    const [activeTab, setActiveTab] = useState<Tab>('users')
    const [usersPage, setUsersPage] = useState(1)
    const [productsPage, setProductsPage] = useState(1)
    const [ordersPage, setOrdersPage] = useState(1)

    const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery()
    const { data: usersData, isLoading: usersLoading } = trpc.admin.getUsers.useQuery({ page: usersPage, limit: 10 })
    const { data: productsData, isLoading: productsLoading } = trpc.admin.getProducts.useQuery({ page: productsPage, limit: 10 })
    const { data: ordersData, isLoading: ordersLoading } = trpc.admin.getOrders.useQuery({ page: ordersPage, limit: 10 })

    const utils = trpc.useContext()

    const { mutate: deleteProduct } = trpc.admin.deleteProduct.useMutation({
        onSuccess: () => {
            toast.success('Product deleted')
            utils.admin.getProducts.invalidate()
            utils.admin.getStats.invalidate()
        },
        onError: () => toast.error('Failed to delete product'),
    })

    const { mutate: deleteUser } = trpc.admin.deleteUser.useMutation({
        onSuccess: () => {
            toast.success('User deleted')
            utils.admin.getUsers.invalidate()
            utils.admin.getStats.invalidate()
        },
        onError: () => toast.error('Failed to delete user'),
    })

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const statCards = [
        {
            label: 'Total Users',
            value: stats?.totalUsers ?? '-',
            icon: Users,
            gradient: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Total Products',
            value: stats?.totalProducts ?? '-',
            icon: Package,
            gradient: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Total Orders',
            value: stats?.totalOrders ?? '-',
            icon: ShoppingCart,
            gradient: 'from-violet-500 to-violet-600',
            bg: 'bg-violet-50',
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-600',
        },
        {
            label: 'Revenue',
            value: stats?.totalRevenue != null ? formatPrice(stats.totalRevenue) : '-',
            icon: DollarSign,
            gradient: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
        },
    ]

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: 'users', label: 'Users', icon: Users },
        { key: 'products', label: 'Products', icon: Package },
        { key: 'orders', label: 'Orders', icon: ShoppingCart },
    ]

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-white border-b border-gray-200'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between h-16'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-blue-600 rounded-lg'>
                                <LayoutDashboard className='h-5 w-5 text-white' />
                            </div>
                            <div>
                                <h1 className='text-xl font-bold text-gray-900'>Admin Dashboard</h1>
                                <p className='text-xs text-gray-500'>Manage your marketplace</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3'>
                            <div className='flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full'>
                                <Shield className='h-4 w-4 text-blue-600' />
                                <span className='text-sm font-medium text-blue-700'>{user.email}</span>
                            </div>
                            <Link
                                href='/'
                                className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
                                ← Back to store
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Stats Cards */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8'>
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className='bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow'>
                            <div className='flex items-center justify-between mb-3'>
                                <span className='text-sm font-medium text-gray-500'>{stat.label}</span>
                                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <div className='text-2xl font-bold text-gray-900'>
                                {statsLoading ? (
                                    <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                                ) : (
                                    stat.value
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                    <div className='border-b border-gray-200'>
                        <div className='flex'>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}>
                                    <tab.icon className='h-4 w-4' />
                                    {tab.label}
                                    {stats && (
                                        <span
                                            className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${activeTab === tab.key
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}>
                                            {tab.key === 'users' && stats.totalUsers}
                                            {tab.key === 'products' && stats.totalProducts}
                                            {tab.key === 'orders' && stats.totalOrders}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Users Table */}
                    {activeTab === 'users' && (
                        <div>
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='bg-gray-50'>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Email</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Role</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Products</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Verified</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Joined</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100'>
                                        {usersLoading ? (
                                            <tr>
                                                <td colSpan={6} className='px-6 py-12 text-center'>
                                                    <Loader2 className='h-6 w-6 animate-spin text-gray-400 mx-auto' />
                                                </td>
                                            </tr>
                                        ) : usersData?.users.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className='px-6 py-12 text-center text-gray-500'>No users found</td>
                                            </tr>
                                        ) : (
                                            usersData?.users.map((u) => (
                                                <tr key={u.id} className='hover:bg-gray-50 transition-colors'>
                                                    <td className='px-6 py-4'>
                                                        <span className='text-sm font-medium text-gray-900'>{u.email}</span>
                                                    </td>
                                                    <td className='px-6 py-4'>
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-gray-100 text-gray-700'
                                                                }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-600'>{u.productCount}</td>
                                                    <td className='px-6 py-4'>
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.verified
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                            {u.verified ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-500'>{formatDate(u.createdAt)}</td>
                                                    <td className='px-6 py-4'>
                                                        {u.role !== 'admin' && (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('Delete this user?')) {
                                                                        deleteUser({ userId: u.id })
                                                                    }
                                                                }}
                                                                className='p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'>
                                                                <Trash2 className='h-4 w-4' />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {usersData && (
                                <Pagination
                                    page={usersData.page}
                                    totalPages={usersData.totalPages}
                                    totalDocs={usersData.totalDocs}
                                    hasPrev={usersData.hasPrevPage}
                                    hasNext={usersData.hasNextPage}
                                    onPrev={() => setUsersPage((p) => p - 1)}
                                    onNext={() => setUsersPage((p) => p + 1)}
                                />
                            )}
                        </div>
                    )}

                    {/* Products Table */}
                    {activeTab === 'products' && (
                        <div>
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='bg-gray-50'>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Name</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Seller</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Price</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Category</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Added</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100'>
                                        {productsLoading ? (
                                            <tr>
                                                <td colSpan={6} className='px-6 py-12 text-center'>
                                                    <Loader2 className='h-6 w-6 animate-spin text-gray-400 mx-auto' />
                                                </td>
                                            </tr>
                                        ) : productsData?.products.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className='px-6 py-12 text-center text-gray-500'>No products found</td>
                                            </tr>
                                        ) : (
                                            productsData?.products.map((p) => (
                                                <tr key={p.id} className='hover:bg-gray-50 transition-colors'>
                                                    <td className='px-6 py-4'>
                                                        <span className='text-sm font-medium text-gray-900'>{p.name}</span>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-600'>{p.sellerEmail}</td>
                                                    <td className='px-6 py-4 text-sm font-medium text-gray-900'>{formatPrice(p.price)}</td>
                                                    <td className='px-6 py-4'>
                                                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800'>
                                                            {p.category}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-500'>{formatDate(p.createdAt)}</td>
                                                    <td className='px-6 py-4'>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Delete this product?')) {
                                                                    deleteProduct({ productId: p.id })
                                                                }
                                                            }}
                                                            className='p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'>
                                                            <Trash2 className='h-4 w-4' />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {productsData && (
                                <Pagination
                                    page={productsData.page}
                                    totalPages={productsData.totalPages}
                                    totalDocs={productsData.totalDocs}
                                    hasPrev={productsData.hasPrevPage}
                                    hasNext={productsData.hasNextPage}
                                    onPrev={() => setProductsPage((p) => p - 1)}
                                    onNext={() => setProductsPage((p) => p + 1)}
                                />
                            )}
                        </div>
                    )}

                    {/* Orders Table */}
                    {activeTab === 'orders' && (
                        <div>
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='bg-gray-50'>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Order ID</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Buyer</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Products</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Total</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Payment</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100'>
                                        {ordersLoading ? (
                                            <tr>
                                                <td colSpan={6} className='px-6 py-12 text-center'>
                                                    <Loader2 className='h-6 w-6 animate-spin text-gray-400 mx-auto' />
                                                </td>
                                            </tr>
                                        ) : ordersData?.orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className='px-6 py-12 text-center text-gray-500'>No orders found</td>
                                            </tr>
                                        ) : (
                                            ordersData?.orders.map((o) => (
                                                <tr key={o.id} className='hover:bg-gray-50 transition-colors'>
                                                    <td className='px-6 py-4'>
                                                        <span className='text-sm font-mono text-gray-600'>
                                                            {o.id.slice(0, 8)}...
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-600'>{o.buyerEmail}</td>
                                                    <td className='px-6 py-4'>
                                                        <div className='flex flex-col gap-0.5'>
                                                            {o.products.map((prod, i) => (
                                                                <span key={i} className='text-sm text-gray-700'>
                                                                    {prod.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm font-medium text-gray-900'>{formatPrice(o.total)}</td>
                                                    <td className='px-6 py-4'>
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${o.isPaid
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}>
                                                            {o.isPaid ? 'Paid' : 'Unpaid'}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-500'>{formatDate(o.createdAt)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {ordersData && (
                                <Pagination
                                    page={ordersData.page}
                                    totalPages={ordersData.totalPages}
                                    totalDocs={ordersData.totalDocs}
                                    hasPrev={ordersData.hasPrevPage}
                                    hasNext={ordersData.hasNextPage}
                                    onPrev={() => setOrdersPage((p) => p - 1)}
                                    onNext={() => setOrdersPage((p) => p + 1)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const Pagination = ({
    page,
    totalPages,
    totalDocs,
    hasPrev,
    hasNext,
    onPrev,
    onNext,
}: {
    page: number
    totalPages: number
    totalDocs: number
    hasPrev: boolean
    hasNext: boolean
    onPrev: () => void
    onNext: () => void
}) => (
    <div className='flex items-center justify-between px-6 py-4 border-t border-gray-100'>
        <p className='text-sm text-gray-500'>
            Page <span className='font-medium text-gray-700'>{page}</span> of{' '}
            <span className='font-medium text-gray-700'>{totalPages}</span>
            {' · '}<span className='font-medium text-gray-700'>{totalDocs}</span> total
        </p>
        <div className='flex items-center gap-2'>
            <button
                onClick={onPrev}
                disabled={!hasPrev}
                className='flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'>
                <ChevronLeft className='h-4 w-4' />
                Prev
            </button>
            <button
                onClick={onNext}
                disabled={!hasNext}
                className='flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'>
                Next
                <ChevronRight className='h-4 w-4' />
            </button>
        </div>
    </div>
)

export default AdminDashboard
