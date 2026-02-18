import { Skeleton } from '@/components/ui/skeleton'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'

export const AccountPageSkeleton = () => {
    return (
        <div className='bg-gray-50/50 min-h-screen pb-20 pt-8'>
            <MaxWidthWrapper>
                <div className="hidden lg:flex gap-8 items-start">
                    {/* Sidebar Skeleton */}
                    <div className='w-80 flex flex-col gap-6 shrink-0'>
                        <Skeleton className="h-[200px] w-full rounded-2xl" />
                        <Skeleton className="h-[300px] w-full rounded-2xl" />
                    </div>
                    {/* Content Skeleton */}
                    <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm p-8 h-[600px]">
                        <Skeleton className="h-8 w-48 mb-4" />
                        <Skeleton className="h-4 w-64 mb-8" />
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full rounded-xl" />
                            <Skeleton className="h-24 w-full rounded-xl" />
                            <Skeleton className="h-24 w-full rounded-xl" />
                        </div>
                    </div>
                </div>

                <div className="lg:hidden space-y-6">
                    <Skeleton className="h-[200px] w-full rounded-2xl" />
                    <div className="bg-white rounded-2xl p-4 space-y-4">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                </div>
            </MaxWidthWrapper>
        </div>
    )
}
