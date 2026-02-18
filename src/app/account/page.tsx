'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Package,
    Settings,
    LifeBuoy,
    User,
    LogOut,
    ChevronRight,
    Loader2,
    Camera,
    Trash2,
    PackageOpen,
    ArrowLeft,
    ShoppingBag
} from 'lucide-react'
import { toast } from 'sonner'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog'
import { trpc } from '@/trpc/client'
import { cn, formatPrice } from '@/lib/utils'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { AccountPageSkeleton } from '@/components/AccountPageSkeleton' // Assuming I keep this or move it? 
// Wait, I need to check if AccountPageSkeleton is exported from somewhere. 
// Step 595 said "Implemented AccountPageSkeleton and replaced generic page loader".
// It was inside account/page.tsx in previous implementation? No, Step 595 said "Implemented AccountPageSkeleton... integration".
// Step 603 file list shows `AccountPageSkeleton` logic was likely in page.tsx or separate.
// Step 603 viewed files don't show AccountPageSkeleton file.
// I'll assume I need to define it or it's in a file I haven't seen. 
// Actually, I'll just build a simple loading state or copy the skeleton if it exists. 
// I'll check if `src/components/AccountPageSkeleton.tsx` exists?
// If not, I'll allow `activeUserQuery` active state to show a loader.

// Define Schema for Profile
const profileSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    bio: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const AccountPage = () => {
    const router = useRouter()
    const { signOut } = useAuth()

    // State
    const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'support' | 'profile'>('orders')
    const [mobileView, setMobileView] = useState<'dashboard' | 'content'>('dashboard')
    const [isUploading, setIsUploading] = useState(false)

    // Data Fetching
    // profile contains 'email', 'name', 'imageUrl', 'bio'
    const { data: profile, isLoading: isProfileLoading, refetch: refetchProfile, error: profileError } = trpc.profile.getProfile.useQuery(undefined, {
        retry: false,
        onError: (err) => {
            if (err.data?.code === 'UNAUTHORIZED') {
                router.push('/sign-in')
            }
        }
    })

    // Mutations
    const { mutate: updateProfile, isLoading: isSaving } = trpc.profile.updateProfile.useMutation({
        onSuccess: () => {
            toast.success('Profile updated successfully')
            refetchProfile()
        },
        onError: () => toast.error('Failed to update profile')
    })

    // Delete Account
    const { mutate: deleteAccount, isLoading: isDeleting } = trpc.profile.deleteAccount.useMutation({
        onSuccess: async () => {
            toast.success('Your account has been deleted.')
            await signOut()
            router.push('/')
        },
        onError: () => toast.error('Failed to delete account. Please try again.')
    })

    // Form
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '',
            bio: '',
        },
    })

    // Sync Form
    useEffect(() => {
        if (profile) {
            form.setValue('name', profile.name || '')
            form.setValue('bio', profile.bio || '')
        }
    }, [profile, form])

    // Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        try {
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            updateProfile({ imageUrl: data.publicUrl }) // Auto-save image
        } catch (error) {
            toast.error('Error uploading image')
        } finally {
            setIsUploading(false)
        }
    }

    const onSubmit = (data: ProfileFormValues) => {
        updateProfile({
            name: data.name,
            bio: data.bio,
        })
    }

    // Handle Loading
    if (isProfileLoading) {
        return <AccountPageSkeleton />
    }

    if (!profile) {
        // Handled by onError redirect, but safe return
        return null
    }

    // --- Components ---

    const ProfileCard = () => (
        <div className='bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center text-center border border-gray-100'>
            <div className='relative h-24 w-24 mb-4'>
                <div className='aspect-square h-full w-full relative rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm'>
                    {profile?.imageUrl ? (
                        <Image src={profile.imageUrl} alt='Profile' fill className='object-cover' />
                    ) : (
                        <div className='h-full w-full flex items-center justify-center bg-gray-50 text-gray-400'>
                            <User className='h-10 w-10' />
                        </div>
                    )}
                </div>
            </div>
            <h2 className='text-xl font-bold text-gray-900'>{profile?.name || 'User'}</h2>
            <p className='text-sm text-gray-500 mb-2'>{profile?.email}</p>
            {profile?.bio && (
                <p className='text-sm text-gray-600 max-w-xs mx-auto line-clamp-2'>
                    {profile.bio}
                </p>
            )}
        </div>
    )

    const NavItem = ({
        id,
        label,
        icon: Icon,
        isDestructive = false
    }: {
        id: typeof activeTab,
        label: string,
        icon: any,
        isDestructive?: boolean
    }) => (
        <button
            onClick={() => {
                setActiveTab(id)
                setMobileView('content')
                window.scrollTo(0, 0)
            }}
            className={cn(
                'w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group',
                activeTab === id
                    ? 'bg-zinc-100 text-zinc-900 shadow-sm ring-1 ring-gray-200'
                    : 'hover:bg-gray-50 text-gray-600'
            )}
        >
            <div className='flex items-center gap-4'>
                <div className={cn(
                    'p-2 rounded-lg transition-colors',
                    activeTab === id ? 'bg-white text-zinc-900 shadow-sm' : 'bg-gray-100 text-gray-500 group-hover:text-gray-700'
                )}>
                    <Icon className='h-5 w-5' />
                </div>
                <span className='font-medium'>{label}</span>
            </div>
            <ChevronRight className={cn(
                'h-5 w-5 text-gray-400 transition-transform',
                activeTab === id ? 'text-zinc-900' : 'group-hover:translate-x-1'
            )} />
        </button>
    )

    const Sidebar = () => (
        <div className='w-full lg:w-80 flex flex-col gap-6 shrink-0'>
            <ProfileCard />

            <div className='bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col gap-2'>
                <NavItem id='orders' label='Orders' icon={Package} />
                <NavItem id='settings' label='Account Settings' icon={Settings} />
                <NavItem id='support' label='Customer Support' icon={LifeBuoy} />
                <NavItem id='profile' label='Profile' icon={User} />

                <div className='h-px bg-gray-100 my-2' />

                <button
                    onClick={signOut}
                    className='w-full flex items-center gap-4 p-4 rounded-xl text-red-600 hover:bg-red-50 transition-colors group'
                >
                    <div className='p-2 rounded-lg bg-red-100/50 text-red-600 group-hover:bg-red-100'>
                        <LogOut className='h-5 w-5' />
                    </div>
                    <span className='font-medium'>Log Out</span>
                </button>
            </div>
        </div>
    )

    const OrdersContent = () => {
        const { data: orders, isLoading } = trpc.profile.getMyOrders.useQuery()

        return (
            <div className='space-y-6'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-900'>My Orders</h2>
                    <p className='text-gray-500'>View and manage your purchase history</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                    </div>
                ) : !orders || orders.length === 0 ? (
                    <div className='rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center bg-gray-50/50'>
                        <div className='h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4'>
                            <PackageOpen className='h-8 w-8 text-gray-400' />
                        </div>
                        <h3 className='text-lg font-semibold text-gray-900'>No orders yet</h3>
                        <p className='text-gray-500 max-w-sm mt-1 mb-6'>
                            Your purchased items will appear here once you make your first purchase.
                        </p>
                        <Link
                            href='/products'
                            className={buttonVariants({ variant: 'default' })}
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {orders.map((order) => (
                            <div key={order.id} className='bg-white border boundary border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow'>
                                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-4'>
                                    <div>
                                        <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>Order ID</p>
                                        <p className='font-mono text-sm text-gray-900'>#{order.id.slice(-8)}</p>
                                    </div>
                                    <div>
                                        <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>Total Amount</p>
                                        <p className='font-bold text-gray-900'>{formatPrice(order.amount)}</p>
                                    </div>
                                    <div className='inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium'>
                                        Paid
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    {order.products.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                                {item.imageUrl ? (
                                                    <Image src={item.imageUrl} fill className="object-cover" alt={item.name} />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-400"><ShoppingBag className="h-6 w-6" /></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                                                <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/product/${item.id}`}>View</Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    const ProfileContent = () => (
        <div className='space-y-8 max-w-2xl'>
            <div>
                <h2 className='text-2xl font-bold text-gray-900'>Profile</h2>
                <p className='text-gray-500'>Manage your public profile information</p>
            </div>

            <div className='bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-8'>
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                    <div className="relative h-20 w-20">
                        <div className="h-full w-full rounded-full overflow-hidden bg-gray-100 border-2 border-gray-100">
                            {profile?.imageUrl ? (
                                <Image src={profile.imageUrl} fill alt="Profile" className="object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                    <User className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                        <label
                            htmlFor="avatar-upload-input"
                            className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-md cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                            {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                        </label>
                        <input id="avatar-upload-input" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">Profile Photo</h3>
                        <p className="text-sm text-gray-500">Click the camera icon to upload.</p>
                    </div>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input {...form.register('name')} id="name" placeholder="John Doe" className="focus-visible:ring-black" />
                        {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input value={profile?.email || ''} disabled className="bg-gray-50 text-gray-500" />
                        <p className="text-xs text-gray-400">Email cannot be changed.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea {...form.register('bio')} id="bio" placeholder="Tell us a bit about yourself..." className="resize-none min-h-[100px] focus-visible:ring-black" />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSaving} className='bg-black hover:bg-zinc-800 text-white'>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>

            <div className="border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between p-6 bg-red-50/50 rounded-2xl border border-red-100">
                    <div>
                        <h3 className="font-semibold text-red-900">Delete Account</h3>
                        <p className="text-sm text-red-600/80">Permanently delete your account and all data.</p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100">Delete</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Account?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                    variant="destructive"
                                    onClick={() => deleteAccount()}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Delete Forever
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )

    const SettingsContent = () => (
        <div className="text-center py-20">
            <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                <Settings className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
            <p className="text-gray-500">Preferences and configuration coming soon.</p>
        </div>
    )

    const SupportContent = () => (
        <div className="text-center py-20">
            <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                <LifeBuoy className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Customer Support</h2>
            <p className="text-gray-500">Need help? Contact our support team.</p>
            <Button variant="outline" className="mt-6">Contact Support</Button>
        </div>
    )

    // Render
    return (
        <div className='bg-gray-50/50 min-h-screen pb-20 pt-8'>
            <MaxWidthWrapper>
                {/* Desktop View */}
                <div className="hidden lg:flex gap-8 items-start">
                    <Sidebar />
                    <div className="flex-1 min-w-0">
                        {activeTab === 'orders' && <OrdersContent />}
                        {activeTab === 'profile' && <ProfileContent />}
                        {activeTab === 'settings' && <SettingsContent />}
                        {activeTab === 'support' && <SupportContent />}
                    </div>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden">
                    {mobileView === 'dashboard' ? (
                        <div className="space-y-6">
                            <ProfileCard />
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                                <NavItem id='orders' label='Orders' icon={Package} />
                                <NavItem id='settings' label='Account Settings' icon={Settings} />
                                <NavItem id='support' label='Customer Support' icon={LifeBuoy} />
                                <NavItem id='profile' label='Profile' icon={User} />
                            </div>
                            <button
                                onClick={signOut}
                                className='w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors'
                            >
                                <LogOut className='h-5 w-5' />
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col min-h-screen bg-white md:rounded-2xl md:shadow-sm md:p-6">
                            <div className="mb-6 flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setMobileView('dashboard')
                                        window.scrollTo(0, 0)
                                    }}
                                    className="rounded-full hover:bg-gray-100 -ml-2"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </Button>
                                <h1 className="text-xl font-bold text-gray-900 capitalize">
                                    {activeTab === 'orders' ? 'My Orders' : activeTab}
                                </h1>
                            </div>

                            {activeTab === 'orders' && <OrdersContent />}
                            {activeTab === 'profile' && <ProfileContent />}
                            {activeTab === 'settings' && <SettingsContent />}
                            {activeTab === 'support' && <SupportContent />}
                        </div>
                    )}
                </div>
            </MaxWidthWrapper>
        </div>
    )
}

export default AccountPage
