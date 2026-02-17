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
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpRight,
    TrendingUp,
    Store
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { buttonVariants } from './ui/button'
import { Input } from './ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from './ui/dropdown-menu'
import { cn } from '@/lib/utils'

type Tab = 'products' | 'orders' | 'analytics'

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
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const statCards = [
        {
            label: 'Total Revenue',
            value: stats?.totalRevenue != null ? formatPrice(stats.totalRevenue) : '-',
            icon: DollarSign,
            trend: '+12.5%',
            trendUp: true,
            description: 'from last month',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            iconBg: 'bg-emerald-100',
        },
        {
            label: 'Total Orders',
            value: stats?.totalOrders ?? '-',
            icon: ShoppingCart,
            trend: '+5.2%',
            trendUp: true,
            description: 'from last month',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            iconBg: 'bg-blue-100',
        },
        {
            label: 'Active Products',
            value: stats?.totalProducts ?? '-',
            icon: Package,
            trend: '+2',
            trendUp: true,
            description: 'new this month',
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            iconBg: 'bg-violet-100',
        },
        {
            label: 'Customers',
            value: stats?.paidOrders ? stats.paidOrders * 1.2 : '-', // Mocking a bit for visual
            icon: Users,
            trend: '+2.4%',
            trendUp: true,
            description: 'from last month',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            iconBg: 'bg-amber-100',
        },
    ]

    return (
        <div className='min-h-screen bg-gray-50/50 flex'>
            {/* Sidebar (Desktop) */}
            <aside className='hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10'>
                <div className='p-6 flex items-center gap-3'>
                    <div className='h-8 w-8 bg-black rounded-lg flex items-center justify-center'>
                        <Store className='h-5 w-5 text-white' />
                    </div>
                    <span className='font-bold text-lg tracking-tight'>SellerCentral</span>
                </div>

                <div className='flex-1 px-4 space-y-1 overflow-y-auto'>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                            activeTab === 'products'
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                    >
                        <Package className='h-5 w-5' />
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                            activeTab === 'orders'
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                    >
                        <ShoppingCart className='h-5 w-5' />
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                            activeTab === 'analytics'
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                    >
                        <TrendingUp className='h-5 w-5' />
                        Analytics
                    </button>
                </div>

                <div className='p-4 border-t border-gray-200'>
                    <div className='flex items-center gap-3 p-2 rounded-lg bg-gray-50'>
                        <div className='h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center'>
                            <span className='text-xs font-medium text-indigo-700'>
                                {user.email.substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-900 truncate'>{user.email}</p>
                            <p className='text-xs text-gray-500 truncate'>Seller Account</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className='flex-1 md:ml-64 min-h-screen'>
                <header className='bg-white border-b border-gray-200 sticky top-0 z-20'>
                    <div className='px-4 md:px-8 py-4 flex items-center justify-between'>
                        <div>
                            <h1 className='text-xl md:text-2xl font-bold text-gray-900 tracking-tight'>
                                {activeTab === 'products' && 'Products'}
                                {activeTab === 'orders' && 'Orders'}
                                {activeTab === 'analytics' && 'Analytics'}
                            </h1>
                        </div>
                        <div className='flex items-center gap-2 md:gap-4'>
                            <Link
                                href='/'
                                className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'hidden md:flex' })}
                            >
                                <ArrowUpRight className='mr-2 h-4 w-4' />
                                View Store
                            </Link>
                            <Link
                                href='/seller/products/new'
                                className={buttonVariants({ variant: 'default', size: 'sm', className: 'bg-black hover:bg-gray-800' })}
                            >
                                <Plus className='mr-2 h-4 w-4' />
                                <span className="hidden md:inline">Create Product</span>
                                <span className="md:hidden">Create</span>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Tab Navigation */}
                    <div className="md:hidden border-t border-gray-100 px-4 overflow-x-auto no-scrollbar flex items-center gap-2 py-2">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors border',
                                activeTab === 'products'
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200'
                            )}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors border',
                                activeTab === 'orders'
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200'
                            )}
                        >
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors border',
                                activeTab === 'analytics'
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200'
                            )}
                        >
                            Analytics
                        </button>
                        <Link
                            href='/'
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors border bg-white text-gray-600 border-gray-200'
                            )}
                        >
                            Store
                        </Link>
                    </div>
                </header>

                <div className='p-4 md:p-8 space-y-6 md:space-y-8'>
                    {/* Stats Grid */}
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
                        {statCards.map((stat) => (
                            <div
                                key={stat.label}
                                className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow'
                            >
                                <div className='flex items-center justify-between mb-4'>
                                    <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                    {stat.trend && (
                                        <span className={cn(
                                            'text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1',
                                            stat.trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        )}>
                                            {stat.trendUp ? <TrendingUp className='h-3 w-3' /> : null}
                                            {stat.trend}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>{stat.label}</p>
                                    <h3 className='text-2xl font-bold text-gray-900 mt-1'>
                                        {statsLoading ? <Loader2 className='h-6 w-6 animate-spin' /> : stat.value}
                                    </h3>
                                    {/* <p className='text-xs text-gray-500 mt-1'>{stat.description}</p> */}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                        {/* Filters & Actions Bar */}
                        <div className='p-5 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center'>
                            <div className='relative w-full sm:w-80'>
                                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                                <Input
                                    placeholder='Search...'
                                    className='pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors'
                                />
                            </div>
                            <div className='flex items-center gap-2 w-full sm:w-auto'>
                                <button className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'>
                                    <Filter className='h-4 w-4' />
                                    Filter
                                </button>
                                <button className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'>
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Tables */}
                        {activeTab === 'products' && (
                            <>
                                <div className='overflow-x-auto'>
                                    <table className='w-full'>
                                        <thead>
                                            <tr className='bg-gray-50/50 border-b border-gray-200'>
                                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Product</th>
                                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Price</th>
                                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Status</th>
                                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Sales</th>
                                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Created</th>
                                                <th className='px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider'>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-100'>
                                            {productsLoading ? (
                                                <tr><td colSpan={6} className='p-12 text-center'><Loader2 className='h-8 w-8 animate-spin mx-auto text-gray-400' /></td></tr>
                                            ) : productsData?.products.length === 0 ? (
                                                <tr><td colSpan={6} className='p-12 text-center text-gray-500'>No products found.</td></tr>
                                            ) : (
                                                productsData?.products.map((p) => (
                                                    <tr key={p.id} className='hover:bg-gray-50/50 transition-colors group'>
                                                        <td className='px-6 py-4'>
                                                            <div className='flex items-center gap-4'>
                                                                <div className='h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden'>
                                                                    {p.imageUrl ? (
                                                                        // eslint-disable-next-line @next/next/no-img-element
                                                                        <img src={p.imageUrl} alt={p.name} className='h-full w-full object-cover' />
                                                                    ) : (
                                                                        <div className='h-full w-full flex items-center justify-center'>
                                                                            <Package className='h-5 w-5 text-gray-400' />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className='text-sm font-semibold text-gray-900'>{p.name}</p>
                                                                    <p className='text-xs text-gray-500'>{p.category}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className='px-6 py-4 text-sm font-medium text-gray-900'>{formatPrice(p.price)}</td>
                                                        <td className='px-6 py-4'>
                                                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200'>
                                                                Active
                                                            </span>
                                                        </td>
                                                        <td className='px-6 py-4 text-sm text-gray-600'>-</td>
                                                        <td className='px-6 py-4 text-sm text-gray-500'>{formatDate(p.createdAt)}</td>
                                                        <td className='px-6 py-4 text-right'>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'>
                                                                        <MoreHorizontal className='h-4 w-4' />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem>Edit Product</DropdownMenuItem>
                                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-red-600"
                                                                        onClick={() => {
                                                                            if (confirm('Delete this product?')) {
                                                                                deleteProduct({ id: p.id })
                                                                            }
                                                                        }}
                                                                    >
                                                                        Delete Product
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {productsData && productsData.totalDocs > 0 && (
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
                            </>
                        )}

                        {activeTab === 'orders' && (
                            <>
                                <div className='overflow-x-auto'>
                                    <table className='w-full'>
                                        <thead>
                                            <tr className='bg-gray-50/50 border-b border-gray-200'>
                                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Order ID</th>
                                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Products</th>
                                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Amount</th>
                                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Date</th>
                                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Status</th>
                                                <th className='px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider'>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-100'>
                                            {ordersLoading ? (
                                                <tr><td colSpan={6} className='p-12 text-center'><Loader2 className='h-8 w-8 animate-spin mx-auto text-gray-400' /></td></tr>
                                            ) : ordersData?.orders.length === 0 ? (
                                                <tr><td colSpan={6} className='p-12 text-center text-gray-500'>No orders found.</td></tr>
                                            ) : (
                                                ordersData?.orders.map((o) => (
                                                    <tr key={o.id} className='hover:bg-gray-50/50 transition-colors'>
                                                        <td className='px-6 py-4'>
                                                            <span className='font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>{o.id.slice(0, 8)}</span>
                                                        </td>
                                                        <td className='px-6 py-4'>
                                                            <div className='flex flex-col gap-1'>
                                                                {o.products.map((prod: any, i: number) => (
                                                                    <span key={i} className='text-sm text-gray-900 font-medium'>
                                                                        {prod.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className='px-6 py-4 text-sm font-semibold text-gray-900'>{formatPrice(o.total)}</td>
                                                        <td className='px-6 py-4 text-sm text-gray-500'>{formatDate(o.createdAt)}</td>
                                                        <td className='px-6 py-4'>
                                                            <span className={cn(
                                                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                                                                o.isPaid ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                            )}>
                                                                {o.isPaid ? 'Paid' : 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className='px-6 py-4 text-right'>
                                                            <button className='text-sm font-medium text-indigo-600 hover:text-indigo-900'>
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {ordersData && ordersData.totalDocs > 0 && (
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
                            </>
                        )}

                        {activeTab === 'analytics' && (
                            <div className='p-12 text-center text-gray-500'>
                                <TrendingUp className='h-12 w-12 mx-auto text-gray-300 mb-4' />
                                <h3 className='text-lg font-medium text-gray-900'>Analytics Coming Soon</h3>
                                <p>Detailed sales reports and traffic analysis will be available here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
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
    <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200'>
        <p className='text-xs text-gray-500'>
            Showing <span className='font-medium text-gray-900'>{(page - 1) * 10 + 1}</span> to <span className='font-medium text-gray-900'>{Math.min(page * 10, totalDocs)}</span> of <span className='font-medium text-gray-900'>{totalDocs}</span> results
        </p>
        <div className='flex items-center gap-2'>
            <button
                onClick={onPrev}
                disabled={!hasPrev}
                className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'>
                <ChevronLeft className='h-3 w-3' />
                Previous
            </button>
            <button
                onClick={onNext}
                disabled={!hasNext}
                className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'>
                Next
                <ChevronRight className='h-3 w-3' />
            </button>
        </div>
    </div>
)

export default SellerDashboard
