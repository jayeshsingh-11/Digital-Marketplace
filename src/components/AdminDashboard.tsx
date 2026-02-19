'use client'

import { User } from '@/payload-types'
import { trpc } from '@/trpc/client'
import { formatPrice, cn } from '@/lib/utils'
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
import { Skeleton } from './ui/skeleton'

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

            {/* Mobile Bottom Nav */}
            <div className='fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex md:hidden z-50 pb-safe'>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            'flex-1 py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                            activeTab === tab.key ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                        )}
                    >
                        <tab.icon className={cn("h-6 w-6", activeTab === tab.key ? "fill-blue-600/10" : "")} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-24 md:pb-8'>
                {/* Stats Cards */}
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-8'>
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
                            <div className='mt-2'>
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : (
                                    <div className='text-2xl font-bold text-gray-900'>{stat.value}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs (Desktop Only) */}
                <div className='hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden mb-6'>
                    <div className='border-b border-gray-200'>
                        <div className='flex overflow-x-auto no-scrollbar'>
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
                            {/* Desktop Table */}
                            <div className='hidden md:block overflow-x-auto'>
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
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i}>
                                                    <td className='px-6 py-4'><Skeleton className="h-4 w-48" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-5 w-16 rounded-full" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-4 w-8" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-5 w-12 rounded-full" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-4 w-24" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-8 w-8 rounded-lg" /></td>
                                                </tr>
                                            ))
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
                                                    <td className='px-6 py-4 text-sm text-gray-600'>{(u as any).productCount}</td>
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

                            {/* Mobile User Cards */}
                            <div className='md:hidden space-y-4'>
                                {usersLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <div key={i} className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3'>
                                            <div className="flex justify-between">
                                                <Skeleton className="h-5 w-40" />
                                                <Skeleton className="h-5 w-16 rounded-full" />
                                            </div>
                                            <div className="flex justify-between">
                                                <Skeleton className="h-4 w-20" />
                                                <Skeleton className="h-4 w-12" />
                                            </div>
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    ))
                                ) : usersData?.users.length === 0 ? (
                                    <div className='p-8 text-center text-gray-500'>No users found</div>
                                ) : (
                                    usersData?.users.map((u) => (
                                        <div key={u.id} className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3'>
                                            <div className="flex justify-between items-start">
                                                <div className='min-w-0 pr-2'>
                                                    <span className='text-sm font-bold text-gray-900 block break-all leading-tight mb-1'>{u.email}</span>
                                                    <span className='text-xs text-gray-500'>Joined {formatDate(u.createdAt)}</span>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${u.role === 'admin'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                    {u.role}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                                <div className="flex gap-6">
                                                    <div className='flex flex-col'>
                                                        <span className='text-[10px] text-gray-400 uppercase tracking-wider font-semibold'>Products</span>
                                                        <span className='text-sm font-medium text-gray-900'>{(u as any).productCount}</span>
                                                    </div>
                                                    <div className='flex flex-col'>
                                                        <span className='text-[10px] text-gray-400 uppercase tracking-wider font-semibold'>Verified</span>
                                                        <span className={cn('text-sm font-medium', u.verified ? 'text-green-600' : 'text-amber-600')}>
                                                            {u.verified ? 'Yes' : 'No'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Delete this user?')) {
                                                                deleteUser({ userId: u.id })
                                                            }
                                                        }}
                                                        className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors -mr-2'>
                                                        <Trash2 className='h-4 w-4' />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
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
                            {/* Desktop Table (unchanged) */}
                            <div className='hidden md:block overflow-x-auto'>
                                <table className='w-full'>
                                    {/* ... existing desktop table code ... */}
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
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i}>
                                                    <td className='px-6 py-4'><Skeleton className="h-4 w-48" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-4 w-32" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-4 w-16" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-5 w-20 rounded-full" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-4 w-24" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-8 w-8 rounded-lg" /></td>
                                                </tr>
                                            ))
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
                                                    <td className='px-6 py-4'>
                                                        <div className="flex flex-col">
                                                            <span className='text-sm font-medium text-gray-900'>{p.sellerName}</span>
                                                            <span className='text-xs text-gray-500'>{p.sellerEmail}</span>
                                                        </div>
                                                    </td>
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

                            {/* Mobile Product Cards */}
                            <div className='md:hidden space-y-4'>
                                {productsLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <div key={i} className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3'>
                                            <div className="flex justify-between">
                                                <Skeleton className="h-5 w-40" />
                                                <Skeleton className="h-5 w-16" />
                                            </div>
                                            <Skeleton className="h-4 w-32" />
                                            <div className="flex justify-between items-center mt-2">
                                                <Skeleton className="h-5 w-20 rounded-full" />
                                                <Skeleton className="h-8 w-8 rounded-lg" />
                                            </div>
                                        </div>
                                    ))
                                ) : productsData?.products.length === 0 ? (
                                    <div className='p-8 text-center text-gray-500'>No products found</div>
                                ) : (
                                    productsData?.products.map((p) => (
                                        <div key={p.id} className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3'>
                                            <div className="flex justify-between items-start">
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <span className='text-base font-bold text-gray-900 block leading-tight mb-1'>{p.name}</span>
                                                    <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600'>
                                                        {p.category}
                                                    </span>
                                                </div>
                                                <span className='text-lg font-bold text-gray-900 whitespace-nowrap'>{formatPrice(p.price)}</span>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <span className='text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-1'>Seller</span>
                                                <div className='flex flex-col'>
                                                    <span className='text-sm font-medium text-gray-900'>{p.sellerName}</span>
                                                    <span className='text-xs text-gray-500 break-all'>{p.sellerEmail}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                                <span className='text-xs text-gray-400'>Added {formatDate(p.createdAt)}</span>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this product?')) {
                                                            deleteProduct({ productId: p.id })
                                                        }
                                                    }}
                                                    className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors -mr-2'>
                                                    <Trash2 className='h-4 w-4' />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
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
                            {/* Desktop Table (unchanged) */}
                            <div className='hidden md:block overflow-x-auto'>
                                <table className='w-full'>
                                    {/* ... existing desktop table code ... */}
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
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i}>
                                                    <td className='px-6 py-4'><Skeleton className="h-4 w-24" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-4 w-32" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-10 w-40" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-4 w-20" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-5 w-16 rounded-full" /></td>
                                                    <td className='px-6 py-4'><Skeleton className="h-4 w-24" /></td>
                                                </tr>
                                            ))
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
                                                    <td className='px-6 py-4'>
                                                        <div className="flex flex-col">
                                                            <span className='text-sm font-medium text-gray-900'>{o.buyerName}</span>
                                                            <span className='text-xs text-gray-500'>{o.buyerEmail}</span>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4'>
                                                        <div className='flex flex-col gap-0.5'>
                                                            {o.products.map((prod: any, i: number) => (
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

                            {/* Mobile Order Cards */}
                            <div className='md:hidden space-y-4'>
                                {ordersLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <div key={i} className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3'>
                                            <div className="flex justify-between">
                                                <Skeleton className="h-5 w-24" />
                                                <Skeleton className="h-5 w-16 rounded-full" />
                                            </div>
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-2/3" />
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <Skeleton className="h-5 w-24" />
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                        </div>
                                    ))
                                ) : ordersData?.orders.length === 0 ? (
                                    <div className='p-8 text-center text-gray-500'>No orders found</div>
                                ) : (
                                    ordersData?.orders.map((o) => (
                                        <div key={o.id} className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3'>
                                            <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                                                <div className="flex flex-col gap-1">
                                                    <span className='font-mono text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded break-all select-all w-fit'>#{o.id}</span>
                                                    <span className='text-xs text-gray-500'>{formatDate(o.createdAt)}</span>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${o.isPaid
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                    {o.isPaid ? 'Paid' : 'Unpaid'}
                                                </span>
                                            </div>

                                            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                                <span className='text-[10px] text-blue-400 uppercase tracking-wider font-semibold block mb-1'>Buyer</span>
                                                <div className='flex flex-col'>
                                                    <span className='text-sm font-bold text-gray-900'>{o.buyerName}</span>
                                                    <span className='text-xs text-gray-600 break-all'>{o.buyerEmail}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>Items ({o.products.length})</p>
                                                {o.products.map((prod: any, i: number) => (
                                                    <div key={i} className='flex items-start justify-between text-sm group py-1 border-b border-gray-50 last:border-0'>
                                                        <span className='text-gray-900 font-medium leading-tight flex-1 mr-4'>{prod.name}</span>
                                                        <span className='text-gray-600 font-medium whitespace-nowrap'>{formatPrice(prod.price)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-1">
                                                <span className='text-[10px] uppercase tracking-wider text-gray-500 font-semibold'>Total</span>
                                                <span className='text-lg font-bold text-gray-900'>{formatPrice(o.total)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
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
        </div >
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
