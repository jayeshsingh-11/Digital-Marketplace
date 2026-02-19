'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ChevronRight, Loader2, ShoppingBag, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'

interface OrderCardProps {
    order: any // Types are inferred usually, but using any for speed. Ideally RouterOutputs['profile']['getMyOrders'][number]
}

export const OrderCard = ({ order }: OrderCardProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const { mutate: downloadInvoice, isLoading: isDownloadingInvoice } = trpc.payment.downloadInvoice.useMutation({
        onSuccess: (data) => {
            const link = document.createElement('a')
            link.href = `data:application/pdf;base64,${data.pdfBase64}`
            link.download = data.filename
            link.click()
            toast.success('Invoice downloaded successfully')
        },
        onError: (err) => {
            toast.error('Failed to download invoice: ' + err.message)
        }
    })

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent toggling accordion
        downloadInvoice({ orderId: order.id })
    }

    return (
        <div className='bg-white border boundary border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden'>
            {/* Collapsed Header (Front) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className='p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-gray-50/50 transition-colors'
            >
                <div className="flex items-center gap-8">
                    <div>
                        <p className='text-xs text-gray-500 uppercase tracking-wide font-medium mb-1'>Date Placed</p>
                        <p className='font-medium text-gray-900'>
                            {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
                        </p>
                    </div>
                    <div>
                        <p className='text-xs text-gray-500 uppercase tracking-wide font-medium mb-1'>Total Amount</p>
                        <p className='font-bold text-gray-900'>{formatPrice(order.amount)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className='inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium'>
                        Paid
                    </div>
                    <ChevronRight className={cn("h-5 w-5 text-gray-400 transition-transform duration-200", isOpen && "rotate-90")} />
                </div>
            </div>

            {/* Expanded Content */}
            {isOpen && (
                <div className='border-t border-gray-100 bg-gray-50/30 p-6 space-y-8 animate-in slide-in-from-top-2 duration-200'>
                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Delivered</h3>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-4">{order.products.length} items in order</h4>
                        <div className="space-y-4">
                            {order.products.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100">
                                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                        {item.imageUrl ? (
                                            <Image src={item.imageUrl} fill className="object-cover" alt={item.name} />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400"><ShoppingBag className="h-6 w-6" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                                        <p className="text-sm text-gray-500">{item.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatPrice(item.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bill Summary */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-3">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            Bill Summary
                        </h4>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Item Total</span>
                            <span className="text-gray-900 font-medium">{formatPrice(Math.max(0, order.amount - 1))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Transaction Fee</span>
                            <span className="text-green-600 font-medium">Free</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Handling Fee</span>
                            <span className="text-gray-900 font-medium">{formatPrice(1)}</span>
                        </div>
                        <div className="h-px bg-gray-100 my-2" />
                        <div className="flex justify-between text-base font-bold">
                            <span className="text-gray-900">Total Bill</span>
                            <span className="text-gray-900">{formatPrice(order.amount)}</span>
                        </div>
                    </div>

                    {/* Download Invoice Button */}
                    <Button
                        onClick={handleDownload}
                        disabled={isDownloadingInvoice}
                        className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100 h-12 text-base font-medium"
                        variant="outline"
                    >
                        {isDownloadingInvoice ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Download Invoice
                    </Button>

                    {/* Order Details Footer (Receiver details are passed via parent context or we use 'order' if it has user info? 
                       Wait, 'order' object from 'getMyOrders' DOES NOT have user info. 
                       But the logged in user is the receiver. So we can use the user profile if valid.
                       However, OrderCard is isolated. I'll just show Order ID for now or pass user info.
                       I'll skip user info for now to keep it simple, or pass it as prop?
                       'profile' is available in page.tsx. I can pass it.
                    */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
                        <h4 className="font-bold text-gray-900">Order Details</h4>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">Order ID</p>
                            <div className="flex items-center gap-2">
                                <p className="font-mono text-sm text-gray-900">#{order.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
