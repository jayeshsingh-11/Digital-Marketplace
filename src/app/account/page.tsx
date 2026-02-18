'use client'

import { trpc } from '@/trpc/client'
import { useAuth } from '@/hooks/use-auth'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import {
    ShoppingBag,
    Settings,
    HeadphonesIcon,
    UserCircle,
    LogOut,
    Loader2,
    User as UserIcon,
    Camera,
    Trash2,
    Package,
    Calendar,
    X,
    Mail,
    ChevronRight,
    Menu,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────
type Section = 'orders' | 'settings' | 'support' | 'profile'

const NAV_ITEMS: { key: Section; label: string; icon: React.ElementType }[] = [
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
    { key: 'settings', label: 'Account Settings', icon: Settings },
    { key: 'support', label: 'Customer Support', icon: HeadphonesIcon },
    { key: 'profile', label: 'Profile', icon: UserCircle },
]

// ─── Main Page ──────────────────────────────────────────────────
export default function AccountPage() {
    const [activeSection, setActiveSection] = useState<Section>('orders')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const { data: profile, isLoading: profileLoading } = trpc.profile.getProfile.useQuery()
    const { signOut } = useAuth()

    if (profileLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Mobile Header */}
            <div className='lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200'>
                <h1 className='text-lg font-semibold text-gray-900'>My Profile</h1>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
                >
                    {mobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
                </button>
            </div>

            <div className='flex flex-col lg:flex-row max-w-7xl mx-auto'>
                {/* ─── Sidebar ─── */}
                <aside className={`
                    ${mobileMenuOpen ? 'block' : 'hidden'} lg:block
                    w-full lg:w-[300px] lg:min-h-screen
                    bg-white lg:border-r border-gray-200
                    p-5 lg:py-8 lg:px-6
                    flex-shrink-0
                `}>
                    {/* Profile Card */}
                    <div className='flex items-center gap-4 mb-8'>
                        <div className='relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0'>
                            {profile?.imageUrl ? (
                                <Image
                                    src={profile.imageUrl}
                                    alt='Profile'
                                    fill
                                    className='object-cover'
                                    referrerPolicy='no-referrer'
                                />
                            ) : (
                                <div className='flex h-full w-full items-center justify-center'>
                                    <UserIcon className='h-8 w-8 text-gray-400' />
                                </div>
                            )}
                        </div>
                        <div className='min-w-0'>
                            <p className='font-semibold text-gray-900 truncate text-base'>
                                {profile?.name || 'User'}
                            </p>
                            <p className='text-sm text-gray-500 truncate'>
                                {profile?.email || ''}
                            </p>
                            {profile?.bio && (
                                <p className='text-xs text-gray-400 mt-0.5 line-clamp-2'>
                                    {profile.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className='space-y-1'>
                        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setActiveSection(key)
                                    setMobileMenuOpen(false)
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
                                    ${activeSection === key
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }
                                `}
                            >
                                <Icon className='h-5 w-5 flex-shrink-0' />
                                <span>{label}</span>
                                <ChevronRight className={`h-4 w-4 ml-auto ${activeSection === key ? 'text-gray-400' : 'text-gray-300'}`} />
                            </button>
                        ))}
                    </nav>

                    {/* Logout Button */}
                    <div className='mt-8 pt-6 border-t border-gray-200'>
                        <button
                            onClick={signOut}
                            className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors shadow-sm'
                        >
                            <LogOut className='h-4 w-4' />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* ─── Main Content ─── */}
                <main className='flex-1 p-4 sm:p-6 lg:p-8'>
                    {activeSection === 'orders' && <OrdersSection />}
                    {activeSection === 'settings' && <SettingsSection />}
                    {activeSection === 'support' && <SupportSection />}
                    {activeSection === 'profile' && <ProfileSection />}
                </main>
            </div>
        </div>
    )
}

// ─── Orders Section ─────────────────────────────────────────────
function OrdersSection() {
    const { data: orders, isLoading } = trpc.profile.getMyOrders.useQuery()

    return (
        <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>My Orders</h2>

            {isLoading ? (
                <div className='flex justify-center py-16'>
                    <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
                </div>
            ) : !orders || orders.length === 0 ? (
                <div className='bg-white rounded-2xl border border-gray-200 p-12 text-center'>
                    <Package className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>No orders yet</h3>
                    <p className='text-gray-500 text-sm'>Your purchased items will appear here.</p>
                </div>
            ) : (
                <div className='space-y-4'>
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className='bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow'
                        >
                            {/* Order Header */}
                            <div className='flex items-center justify-between mb-4'>
                                <div className='flex items-center gap-3'>
                                    <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700'>
                                        <span className='h-1.5 w-1.5 rounded-full bg-green-500' />
                                        Delivered
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-sm text-gray-500'>
                                    <Calendar className='h-4 w-4' />
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </div>
                            </div>

                            {/* Products */}
                            <div className='space-y-3'>
                                {order.products.map((product: any, idx: number) => (
                                    <div key={idx} className='flex items-center gap-4'>
                                        <div className='relative h-16 w-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0'>
                                            {product.imageUrl ? (
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name || ''}
                                                    fill
                                                    className='object-cover'
                                                />
                                            ) : (
                                                <div className='flex h-full w-full items-center justify-center'>
                                                    <Package className='h-6 w-6 text-gray-300' />
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='font-medium text-gray-900 truncate'>
                                                {product.name}
                                            </p>
                                            <p className='text-xs text-gray-500 capitalize'>
                                                {product.category}
                                            </p>
                                        </div>
                                        <p className='font-semibold text-gray-900'>
                                            {formatPrice(product.price || 0)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Order Total */}
                            <div className='mt-4 pt-4 border-t border-gray-100 flex justify-between items-center'>
                                <span className='text-sm text-gray-500'>Total</span>
                                <span className='text-lg font-bold text-gray-900'>
                                    {formatPrice(order.amount || 0)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Profile Section ────────────────────────────────────────────
function ProfileSection() {
    const { data: profile, isLoading } = trpc.profile.getProfile.useQuery()
    const utils = trpc.useContext()
    const [name, setName] = useState('')
    const [bio, setBio] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (profile) {
            setName(profile.name || '')
            setBio(profile.bio || '')
            setAvatarUrl(profile.imageUrl || null)
        }
    }, [profile])

    const { mutate: updateProfile, isLoading: isSaving } = trpc.profile.updateProfile.useMutation({
        onSuccess: () => {
            toast.success('Profile updated successfully!')
            utils.profile.getProfile.invalidate()
        },
        onError: () => toast.error('Failed to update profile.'),
    })

    const { mutate: deleteAccount, isLoading: isDeleting } = trpc.profile.deleteAccount.useMutation({
        onSuccess: () => {
            toast.success('Account deleted.')
            window.location.href = '/sign-in'
        },
        onError: () => toast.error('Failed to delete account.'),
    })

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const supabase = createClient()
            const ext = file.name.split('.').pop()
            const path = `${Math.random()}.${ext}`
            const { error } = await supabase.storage.from('avatars').upload(path, file)
            if (error) throw error
            const { data } = supabase.storage.from('avatars').getPublicUrl(path)
            setAvatarUrl(data.publicUrl)
            toast.success('Image uploaded, click Save to apply.')
        } catch {
            toast.error('Error uploading image.')
        } finally {
            setUploading(false)
        }
    }

    const handleSave = () => {
        updateProfile({
            name: name || undefined,
            bio: bio || undefined,
            imageUrl: avatarUrl || undefined,
        })
    }

    if (isLoading) {
        return <div className='flex justify-center py-16'><Loader2 className='h-8 w-8 animate-spin text-gray-400' /></div>
    }

    return (
        <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>Edit Profile</h2>

            <div className='bg-white rounded-2xl border border-gray-200 p-6 sm:p-8'>
                {/* Avatar */}
                <div className='flex items-center gap-5 mb-8'>
                    <div className='relative group'>
                        <div className='relative h-20 w-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200'>
                            {avatarUrl ? (
                                <Image src={avatarUrl} alt='Avatar' fill className='object-cover' />
                            ) : (
                                <div className='flex h-full w-full items-center justify-center'>
                                    <UserIcon className='h-10 w-10 text-gray-400' />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className='absolute -bottom-1 -right-1 h-8 w-8 bg-gray-900 hover:bg-gray-700 rounded-full flex items-center justify-center shadow-lg transition-colors'
                        >
                            {uploading
                                ? <Loader2 className='h-4 w-4 animate-spin text-white' />
                                : <Camera className='h-4 w-4 text-white' />
                            }
                        </button>
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/*'
                            className='hidden'
                            onChange={handleImageUpload}
                        />
                    </div>
                    <div>
                        <p className='text-sm font-medium text-gray-900'>Profile Photo</p>
                        <p className='text-xs text-gray-500'>JPG, PNG under 5MB</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className='space-y-5'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>Full Name</label>
                        <input
                            type='text'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Your name'
                            className='w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>Email Address</label>
                        <div className='relative'>
                            <Mail className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                            <input
                                type='email'
                                value={profile?.email || ''}
                                disabled
                                className='w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed'
                            />
                        </div>
                        <p className='text-xs text-gray-400 mt-1'>Email cannot be changed.</p>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder='Tell us about yourself...'
                            maxLength={200}
                            rows={3}
                            className='w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm resize-none'
                        />
                        <p className='text-xs text-gray-400 text-right'>{bio.length}/200</p>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || uploading}
                        className='w-full sm:w-auto px-8 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50'
                    >
                        {isSaving ? <Loader2 className='h-4 w-4 animate-spin inline mr-2' /> : null}
                        Save Changes
                    </button>
                </div>

                {/* Danger Zone */}
                <div className='mt-12 pt-8 border-t border-gray-200'>
                    <h3 className='text-sm font-medium text-gray-900 mb-2'>Danger Zone</h3>
                    <p className='text-xs text-gray-500 mb-4'>
                        Once deleted, your account and all data cannot be recovered.
                    </p>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className='flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm transition-colors border border-red-200'
                    >
                        <Trash2 className='h-4 w-4' />
                        Delete Account Forever
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4'>
                    <div className='bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl'>
                        <div className='flex items-center gap-3 mb-4'>
                            <div className='h-12 w-12 rounded-full bg-red-100 flex items-center justify-center'>
                                <Trash2 className='h-6 w-6 text-red-600' />
                            </div>
                            <div>
                                <h3 className='text-lg font-semibold text-gray-900'>Delete Account</h3>
                                <p className='text-sm text-gray-500'>This action is permanent</p>
                            </div>
                        </div>
                        <p className='text-sm text-gray-600 mb-6'>
                            Are you sure you want to delete your account? All your data, including orders
                            and profile information, will be permanently removed and cannot be recovered.
                        </p>
                        <div className='flex gap-3'>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className='flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteAccount()}
                                disabled={isDeleting}
                                className='flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors disabled:opacity-50'
                            >
                                {isDeleting ? <Loader2 className='h-4 w-4 animate-spin inline mr-2' /> : null}
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Settings Section ───────────────────────────────────────────
function SettingsSection() {
    return (
        <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>Account Settings</h2>
            <div className='bg-white rounded-2xl border border-gray-200 p-6 sm:p-8'>
                <div className='space-y-6'>
                    <div className='flex items-center justify-between py-4 border-b border-gray-100'>
                        <div>
                            <p className='font-medium text-gray-900 text-sm'>Password</p>
                            <p className='text-xs text-gray-500'>Change your account password</p>
                        </div>
                        <a
                            href='/forgot-password'
                            className='px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors'
                        >
                            Change
                        </a>
                    </div>
                    <div className='flex items-center justify-between py-4'>
                        <div>
                            <p className='font-medium text-gray-900 text-sm'>Email Notifications</p>
                            <p className='text-xs text-gray-500'>Manage email preferences</p>
                        </div>
                        <span className='text-xs text-gray-400 italic'>Coming soon</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Support Section ────────────────────────────────────────────
function SupportSection() {
    return (
        <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>Customer Support</h2>
            <div className='bg-white rounded-2xl border border-gray-200 p-6 sm:p-8'>
                <div className='text-center py-8'>
                    <HeadphonesIcon className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>Need Help?</h3>
                    <p className='text-sm text-gray-500 max-w-md mx-auto mb-6'>
                        If you have any questions about your orders, account, or our products,
                        feel free to reach out to our support team.
                    </p>
                    <a
                        href='mailto:support@creativecascade.com'
                        className='inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium text-sm transition-colors shadow-sm'
                    >
                        <Mail className='h-4 w-4' />
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    )
}
