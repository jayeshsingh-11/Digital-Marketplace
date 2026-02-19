'use client'

import { trpc } from '@/trpc/client'
import { useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'

interface SecureDownloadButtonProps {
    productId: string
    productName: string
}

const SecureDownloadButton = ({ productId, productName }: SecureDownloadButtonProps) => {
    const [isDownloading, setIsDownloading] = useState(false)

    const { mutateAsync: getDownload } = trpc.payment.getSecureDownload.useMutation()

    const handleDownload = async () => {
        setIsDownloading(true)
        try {
            const { downloadUrl, filename } = await getDownload({ productId })

            // Trigger download via hidden anchor
            const a = document.createElement('a')
            a.href = downloadUrl
            a.download = filename || productName
            a.target = '_blank'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)

            toast.success('Download started!')
        } catch (err: any) {
            if (err?.data?.code === 'FORBIDDEN') {
                toast.error('You do not have access to this file')
            } else {
                toast.error('Download failed. Please try again.')
            }
            console.error('Download error:', err)
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className='inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-wait'
        >
            {isDownloading ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
                <Download className='h-3.5 w-3.5' />
            )}
            {isDownloading ? 'Preparing...' : 'Download asset'}
        </button>
    )
}

export default SecureDownloadButton
