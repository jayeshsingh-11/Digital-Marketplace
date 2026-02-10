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
    Plus,
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { buttonVariants } from './ui/button'

type Tab = 'products' | 'orders'

const SellerDashboard = ({ user }: { user: User }) => {
    const [activeTab, setActiveTab] = useState<Tab>('products')
    const [productsPage, setProductsPage] = useState(1)
    const [ordersPage, setOrdersPage] = useState(1)

    const { data: stats, isLoading: statsLoading } = trpc.seller.getSellerStats.useQuery()
    const { data: productsData, isLoading: productsLoading } = trpc.seller.getSellerProducts.useQuery({ page: productsPage, limit: 10 })
    const { data: ordersData, isLoading: ordersLoading } = trpc.seller.getSellerOrders.useQuery({ page: ordersPage, limit: 10 })

    const utils = trpc.useContext()

    const { mutate: deleteProduct } = trpc.seller.deleteSellerProduct.useMutation({
        onSuccess: () => {
            toast.success('Product deleted')
            utils.seller.getSellerProducts.invalidate()
            utils.seller.getSellerStats.invalidate()
        },
        onError: (err) => {
            toast.error('Failed to delete product')
            console.error(err)
        },
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
            label: 'Your Products',
            value: stats?.totalProducts ?? '-',
            icon: Package,
            gradient: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
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
            label: 'Total Revenue',
            value: stats?.totalRevenue != null ? formatPrice(stats.totalRevenue) : '-',
            icon: DollarSign,
            gradient: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Paid Orders',
            value: stats?.paidOrders ?? '-',
            icon: Users,
            gradient: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
        },
    ]

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: 'products', label: 'My Products', icon: Package },
        { key: 'orders', label: 'Orders', icon: ShoppingCart },
    ]

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-white border-b border-gray-200'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between h-16'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-indigo-600 rounded-lg'>
                                <LayoutDashboard className='h-5 w-5 text-white' />
                            </div>
                            <div>
                                <h1 className='text-xl font-bold text-gray-900'>Seller Dashboard</h1>
                                <p className='text-xs text-gray-500'>Manage your products</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3'>
                            <div className='flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full'>
                                <Shield className='h-4 w-4 text-indigo-600' />
                                <span className='text-sm font-medium text-indigo-700'>{user.email}</span>
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

                <div className='flex justify-between items-center mb-6'>
                    <h2 className='text-lg font-semibold text-gray-900'>Overview</h2>
                    <Link
                        href='/sell/collections/products/create'
                        target='_blank'
                        className={buttonVariants({
                            size: 'sm',
                            className: 'gap-2',
                        })}>
                        <Plus className='h-4 w-4' />
                        Add New Product
                    </Link>
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
                                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}>
                                    <tab.icon className='h-4 w-4' />
                                    {tab.label}
                                    {stats && (
                                        <span
                                            className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${activeTab === tab.key
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                            {tab.key === 'products' && stats.totalProducts}
                                            {tab.key === 'orders' && stats.totalOrders}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Table */}
                    {activeTab === 'products' && (
                        <div>
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='bg-gray-50'>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Name</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Price</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Category</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Created</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100'>
                                        {productsLoading ? (
                                            <tr>
                                                <td colSpan={5} className='px-6 py-12 text-center'>
                                                    <Loader2 className='h-6 w-6 animate-spin text-gray-400 mx-auto' />
                                                </td>
                                            </tr>
                                        ) : productsData?.products.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className='px-6 py-12 text-center text-gray-500'>
                                                    No products found. Start selling today!
                                                </td>
                                            </tr>
                                        ) : (
                                            productsData?.products.map((p) => (
                                                <tr key={p.id} className='hover:bg-gray-50 transition-colors'>
                                                    <td className='px-6 py-4'>
                                                        <div className='flex items-center gap-3'>
                                                            {p.imageUrl ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={p.imageUrl}
                                                                    alt={p.name}
                                                                    className='h-10 w-10 rounded-lg object-cover bg-gray-100'
                                                                />
                                                            ) : (
                                                                <div className='h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center'>
                                                                    <Package className='h-5 w-5 text-gray-400' />
                                                                </div>
                                                            )}
                                                            <span className='text-sm font-medium text-gray-900'>{p.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm font-medium text-gray-900'>{formatPrice(p.price)}</td>
                                                    <td className='px-6 py-4'>
                                                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                                            {p.category}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-500'>{formatDate(p.createdAt)}</td>
                                                    <td className='px-6 py-4'>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Delete this product?')) {
                                                                    deleteProduct({ id: p.id })
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
                                    page={productsData.page ?? 1}
                                    totalPages={productsData.totalPages ?? 1}
                                    totalDocs={productsData.totalDocs ?? 0}
                                    hasPrev={productsData.hasPrevPage ?? false}
                                    hasNext={productsData.hasNextPage ?? false}
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
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Items</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Total</th>
                                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Status</th>
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
                                                <td colSpan={6} className='px-6 py-12 text-center text-gray-500'>No orders found yet</td>
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
                            {ordersData && (
                                <Pagination
                                    page={ordersData.page ?? 1}
                                    totalPages={ordersData.totalPages ?? 1}
                                    totalDocs={ordersData.totalDocs ?? 0}
                                    hasPrev={ordersData.hasPrevPage ?? false}
                                    hasNext={ordersData.hasNextPage ?? false}
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

export default SellerDashboard
