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
// ... imports
import { Skeleton } from './ui/skeleton'

function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

const SellerDashboard = ({ user }: { user: User }) => {
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('products')
    const [productsPage, setProductsPage] = useState(1)
    const [ordersPage, setOrdersPage] = useState(1)

    // Data Fetching
    const { data: stats, isLoading: statsLoading } = trpc.seller.getSellerStats.useQuery()

    const {
        data: productsData,
        isLoading: productsLoading,
        refetch: refetchProducts
    } = trpc.seller.getSellerProducts.useQuery({
        limit: 5,
        page: productsPage
    })

    const {
        data: ordersData,
        isLoading: ordersLoading
    } = trpc.seller.getSellerOrders.useQuery({
        limit: 5,
        page: ordersPage
    })

    const { mutate: deleteProduct } = trpc.seller.deleteSellerProduct.useMutation({
        onSuccess: () => {
            toast.success('Product deleted')
            refetchProducts()
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const statCards = [
        {
            label: 'Total Revenue',
            value: formatPrice(stats?.totalRevenue || 0),
            icon: DollarSign,
            color: 'text-emerald-600',
            iconBg: 'bg-emerald-100',
            trend: '+12.5%',
            trendUp: true
        },
        {
            label: 'Total Orders',
            value: stats?.totalOrders || 0,
            icon: ShoppingCart,
            color: 'text-blue-600',
            iconBg: 'bg-blue-100',
            trend: '+3.2%',
            trendUp: true
        },
        {
            label: 'Active Products',
            value: stats?.totalProducts || 0,
            icon: Package,
            color: 'text-violet-600',
            iconBg: 'bg-violet-100',
            trend: '+2',
            trendUp: true
        },
        {
            label: 'Paid Orders',
            value: stats?.paidOrders || 0,
            icon: Shield,
            color: 'text-orange-600',
            iconBg: 'bg-orange-100',
            trend: '-1.5%',
            trendUp: false
        }
    ]

    return (
        <div className='min-h-screen bg-gray-50/50 flex'>
            {/* Sidebar (Desktop) */}
            <aside className='hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-30'>
                <div className='p-6 border-b border-gray-100'>
                    <Link href='/' className='flex items-center gap-2'>
                        <div className='h-8 w-8 bg-black rounded-lg flex items-center justify-center'>
                            <Store className='h-5 w-5 text-white' />
                        </div>
                        <span className='font-bold text-xl tracking-tight'>Seller<span className='text-gray-400'>Hub</span></span>
                    </Link>
                </div>

                <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                            activeTab === 'products'
                                ? 'bg-black text-white shadow-md shadow-black/10'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                    >
                        <Package className='h-5 w-5' />
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all',
                            activeTab === 'orders'
                                ? 'bg-black text-white shadow-lg shadow-black/10'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                    >
                        <ShoppingCart className='h-5 w-5' />
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all',
                            activeTab === 'analytics'
                                ? 'bg-black text-white shadow-lg shadow-black/10'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                    >
                        <TrendingUp className='h-5 w-5' />
                        Analytics
                    </button>
                </nav>

                <div className='p-4 border-t border-gray-100'>
                    <Link href='/seller/products/new'>
                        <div className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'w-full shadow-lg shadow-blue-500/20')}>
                            <Plus className='h-4 w-4 mr-2' />
                            New Product
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className='flex-1 md:ml-64 min-h-screen pb-24 md:pb-0'>
                <header className='bg-white border-b border-gray-200 sticky top-0 z-20 pt-4 pb-12 md:py-8 px-4 md:px-8 flex items-center justify-between'>
                    <div className="flex items-center gap-4 md:hidden">
                        <Link href='/' className='bg-black p-2 rounded-lg'>
                            <Store className='h-5 w-5 text-white' />
                        </Link>
                        <h1 className='text-lg font-bold'>Dashboard</h1>
                    </div>

                    <div className='hidden md:block'>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            {activeTab === 'products' ? 'Products' : activeTab === 'orders' ? 'Orders' : 'Analytics'}
                        </h1>
                        <p className='text-sm text-gray-500'>Manage your {activeTab} and view performance</p>
                    </div>

                    <div className='flex items-center gap-3'>
                        <Link href='/seller/products/new' className="hidden md:block">
                            <div className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'bg-black hover:bg-zinc-800 shadow-sm')}>
                                <Plus className='h-4 w-4 mr-1.5' />
                                New Product
                            </div>
                        </Link>
                        <div className='hidden md:flex items-center gap-2 mr-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100'>
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live Mode
                        </div>
                        <Link href='/account'>
                            <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                                <span className="font-bold text-xs">{user.email?.charAt(0).toUpperCase()}</span>
                            </div>
                        </Link>
                    </div>

                    {/* Mobile Tab Nav - Fixed Bottom */}
                    <div className='fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex md:hidden z-50 pb-safe'>
                        <button
                            onClick={() => setActiveTab('products')}
                            className={cn(
                                'flex-1 py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                                activeTab === 'products' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                            )}
                        >
                            <Package className={cn("h-6 w-6", activeTab === 'products' ? "fill-black/10" : "")} />
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={cn(
                                'flex-1 py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                                activeTab === 'orders' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                            )}
                        >
                            <ShoppingCart className={cn("h-6 w-6", activeTab === 'orders' ? "fill-black/10" : "")} />
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={cn(
                                'flex-1 py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                                activeTab === 'analytics' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                            )}
                        >
                            <TrendingUp className={cn("h-6 w-6", activeTab === 'analytics' ? "fill-black/10" : "")} />
                            Analytics
                        </button>
                    </div>
                </header>

                <div className='p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto'>
                    {/* Stats Grid */}
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6'>
                        {statCards.map((stat) => (
                            <div
                                key={stat.label}
                                className='bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow'
                            >
                                <div className='flex items-center justify-between mb-4'>
                                    <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                                        <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
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
                                    <p className='text-xs md:text-sm font-medium text-gray-500'>{stat.label}</p>
                                    <div className='mt-1'>
                                        {statsLoading ? (
                                            <Skeleton className="h-6 w-20 md:h-8 md:w-24" />
                                        ) : (
                                            <h3 className='text-xl md:text-2xl font-bold text-gray-900 tracking-tight'>{stat.value}</h3>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                        {/* Filters ... */}

                        {/* Tables (Desktop) & Cards (Mobile) */}
                        {activeTab === 'products' && (
                            <>
                                {/* Desktop Table */}
                                <div className='hidden md:block overflow-x-auto'>
                                    <table className='w-full'>
                                        {/* thead ... */}
                                        <thead className='bg-gray-50/50 border-b border-gray-200'>
                                            {/* ... columns ... */}
                                            <tr>
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
                                                [...Array(5)].map((_, i) => (
                                                    <tr key={i}>
                                                        <td className='px-6 py-4'><div className="flex items-center gap-4"><Skeleton className="h-12 w-12 rounded-lg" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div></td>
                                                        <td className='px-6 py-4'><Skeleton className="h-4 w-16" /></td>
                                                        <td className='px-6 py-4'><Skeleton className="h-5 w-16 rounded-full" /></td>
                                                        <td className='px-6 py-4'><Skeleton className="h-4 w-8" /></td>
                                                        <td className='px-6 py-4'><Skeleton className="h-4 w-24" /></td>
                                                        <td className='px-6 py-4'><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></td>
                                                    </tr>
                                                ))
                                            ) : productsData?.products.length === 0 ? (
                                                <tr><td colSpan={6} className='p-12 text-center text-gray-500'>No products found.</td></tr>
                                            ) : (
                                                productsData?.products.map((p) => (
                                                    // ... row content
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

                                {/* Mobile Cards */}
                                <div className='md:hidden space-y-4 p-4 bg-gray-50'>
                                    {productsLoading ? (
                                        [...Array(3)].map((_, i) => (
                                            <div key={i} className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4'>
                                                <Skeleton className="h-20 w-20 rounded-lg" />
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex justify-between">
                                                        <div className="space-y-1 flex-1">
                                                            <Skeleton className="h-5 w-3/4" />
                                                            <Skeleton className="h-3 w-1/2" />
                                                        </div>
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <Skeleton className="h-6 w-20" />
                                                        <Skeleton className="h-5 w-16 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : productsData?.products.length === 0 ? (
                                        <div className='p-8 text-center text-gray-500'>No products found.</div>
                                    ) : (
                                        productsData?.products.map((p) => (
                                            <div key={p.id} className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4'>
                                                <div className="flex gap-4">
                                                    <div className='h-24 w-24 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden relative'>
                                                        {p.imageUrl ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={p.imageUrl} alt={p.name} className='h-full w-full object-cover' />
                                                        ) : (
                                                            <div className='h-full w-full flex items-center justify-center'>
                                                                <Package className='h-6 w-6 text-gray-400' />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                        <div>
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div className='min-w-0'>
                                                                    <h3 className='text-base font-bold text-gray-900 leading-tight mb-1'>{p.name}</h3>
                                                                    <div className='flex flex-wrap gap-2 text-xs text-gray-500'>
                                                                        <span className='bg-gray-100 px-2 py-0.5 rounded'>{p.category}</span>
                                                                        <span>•</span>
                                                                        <span>{formatDate(p.createdAt)}</span>
                                                                    </div>
                                                                </div>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <button className='p-1.5 -mr-2 -mt-2 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-full transition-colors'>
                                                                            <MoreHorizontal className='h-5 w-5' />
                                                                        </button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                                                        <DropdownMenuItem>Details</DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="text-red-600" onClick={() => deleteProduct({ id: p.id })}>
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-end mt-3">
                                                            <span className='text-lg font-bold text-gray-900'>{formatPrice(p.price)}</span>
                                                            <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100'>
                                                                Available
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Pagination */}
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
                                {/* Desktop Table */}
                                <div className='hidden md:block overflow-x-auto'>
                                    <table className='w-full'>
                                        {/* thead ... */}
                                        <thead className='bg-gray-50/50 border-b border-gray-200'>
                                            <tr>
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
                                                [...Array(5)].map((_, i) => (
                                                    <tr key={i}>
                                                        <td className='px-6 py-4'><Skeleton className="h-5 w-24 rounded" /></td>
                                                        <td className='px-6 py-4'><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-24" /></div></td>
                                                        <td className='px-6 py-4'><Skeleton className="h-5 w-16" /></td>
                                                        <td className='px-6 py-4'><Skeleton className="h-4 w-24" /></td>
                                                        <td className='px-6 py-4'><Skeleton className="h-5 w-16 rounded-full" /></td>
                                                        <td className='px-6 py-4'><Skeleton className="h-4 w-12 ml-auto" /></td>
                                                    </tr>
                                                ))
                                            ) : ordersData?.orders.length === 0 ? (
                                                <tr><td colSpan={6} className='p-12 text-center text-gray-500'>No orders found.</td></tr>
                                            ) : (
                                                // ... orders mapping
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

                                {/* Mobile Order Cards */}
                                <div className='md:hidden space-y-4 p-4 bg-gray-50'>
                                    {ordersLoading ? (
                                        [...Array(3)].map((_, i) => (
                                            <div key={i} className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4'>
                                                <div className="flex justify-between">
                                                    <Skeleton className="h-5 w-24" />
                                                    <Skeleton className="h-5 w-16 rounded-full" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-2/3" />
                                                </div>
                                                <div className="flex justify-between items-center pt-2">
                                                    <Skeleton className="h-6 w-20" />
                                                    <Skeleton className="h-4 w-20" />
                                                </div>
                                            </div>
                                        ))
                                    ) : ordersData?.orders.length === 0 ? (
                                        <div className='p-8 text-center text-gray-500'>No orders found.</div>
                                    ) : (
                                        ordersData?.orders.map((o) => (
                                            // ... mobile order card (unchanged)
                                            <div key={o.id} className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3'>
                                                <div className="flex flex-col gap-2 border-b border-gray-50 pb-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className='space-y-1'>
                                                            <span className='font-mono text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded break-all select-all'>#{o.id}</span>
                                                            <p className='text-xs text-gray-500'>{formatDate(o.createdAt)}</p>
                                                        </div>
                                                        <span className={cn(
                                                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shrink-0',
                                                            o.isPaid ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                        )}>
                                                            {o.isPaid ? 'Paid' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 py-1">
                                                    <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>Items ({o.products.length})</p>
                                                    {o.products.map((prod: any, i: number) => (
                                                        <div key={i} className='flex items-start justify-between text-sm group py-1 border-b border-gray-50 last:border-0'>
                                                            <span className='text-gray-900 font-medium leading-tight flex-1 mr-4'>{prod.name}</span>
                                                            <span className='text-gray-600 font-medium whitespace-nowrap'>{formatPrice(prod.price)}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-1">
                                                    <div className='flex flex-col'>
                                                        <span className='text-[10px] uppercase tracking-wider text-gray-500 font-semibold'>Total</span>
                                                        <span className='text-lg font-bold text-gray-900'>{formatPrice(o.total)}</span>
                                                    </div>
                                                    <button className='px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-zinc-800 transition-colors shadow-sm'>
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
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
            </main >

            {/* Mobile FAB - New Product */}
            < Link href='/seller/products/new' className='md:hidden fixed bottom-20 right-4 z-40' >
                <div className='h-12 w-12 bg-black text-white rounded-full shadow-lg shadow-black/25 flex items-center justify-center hover:bg-zinc-800 transition-colors active:scale-95'>
                    <Plus className='h-6 w-6' />
                </div>
            </Link >
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
