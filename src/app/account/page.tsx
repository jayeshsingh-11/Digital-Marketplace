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
// ─── Main Page ──────────────────────────────────────────────────
export default function AccountPage() {
    const [activeSection, setActiveSection] = useState<Section>('orders')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Lifted state for real-time sidebar updates
    const [name, setName] = useState('')
    const [bio, setBio] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    const { data: profile, isLoading: profileLoading } = trpc.profile.getProfile.useQuery()
    const { signOut } = useAuth()

    // Sync state with fetched profile data
    useEffect(() => {
        if (profile) {
            setName(profile.name || '')
            setBio(profile.bio || '')
            setAvatarUrl(profile.imageUrl || null)
        }
    }, [profile])


    if (profileLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-50/50'>
            {/* Mobile Header */}
            <div className='lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10'>
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
                    w-full lg:w-[280px] lg:min-h-[calc(100vh-4rem)]
                    bg-white lg:border-r border-gray-200
                    p-6
                    flex-shrink-0
                `}>
                    {/* Profile Card */}
                    <div className='flex items-center gap-4 mb-8 p-4 bg-gray-50/80 rounded-2xl border border-gray-100'>
                        <div className='relative h-14 w-14 rounded-full overflow-hidden bg-white border-2 border-white shadow-sm flex-shrink-0'>
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt='Profile'
                                    fill
                                    className='object-cover'
                                    referrerPolicy='no-referrer'
                                />
                            ) : (
                                <div className='flex h-full w-full items-center justify-center bg-gray-100'>
                                    <UserIcon className='h-6 w-6 text-gray-400' />
                                </div>
                            )}
                        </div>
                        <div className='min-w-0 flex-1'>
                            <p className='font-semibold text-gray-900 truncate text-sm'>
                                {name || profile?.name || 'User'}
                            </p>
                            <p className='text-xs text-gray-500 truncate'>
                                {profile?.email || ''}
                            </p>
                            {bio && (
                                <p className='text-[10px] text-gray-400 mt-1 line-clamp-2 leading-tight'>
                                    {bio}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className='space-y-1.5'>
                        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setActiveSection(key)
                                    setMobileMenuOpen(false)
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                    ${activeSection === key
                                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${activeSection === key ? 'text-blue-600' : 'text-gray-400'}`} />
                                <span>{label}</span>
                                {activeSection === key && (
                                    <ChevronRight className='h-4 w-4 ml-auto text-blue-400' />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Logout Button */}
                    <div className='mt-auto pt-8'>
                        <button
                            onClick={signOut}
                            className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm transition-all duration-200 border border-transparent hover:border-red-200'
                        >
                            <LogOut className='h-4 w-4' />
                            Log Out
                        </button>
                    </div>
                </aside>

                {/* ─── Main Content ─── */}
                <main className='flex-1 p-6 lg:p-10'>
                    <div className='max-w-4xl mx-auto'>
                        {activeSection === 'orders' && <OrdersSection />}
                        {activeSection === 'settings' && <SettingsSection />}
                        {activeSection === 'support' && <SupportSection />}
                        {activeSection === 'profile' &&
                            <ProfileSection
                                name={name}
                                setName={setName}
                                bio={bio}
                                setBio={setBio}
                                avatarUrl={avatarUrl}
                                setAvatarUrl={setAvatarUrl}
                                email={profile?.email || ''}
                            />
                        }
                    </div>
                </main>
            </div>
        </div>
    )
}

// ─── Orders Section ─────────────────────────────────────────────
function OrdersSection() {
    const { data: orders, isLoading } = trpc.profile.getMyOrders.useQuery()

    return (
        <div className='space-y-6'>
            <div>
                <h2 className='text-2xl font-bold text-gray-900'>My Orders</h2>
                <p className='text-sm text-gray-500 mt-1'>View and manage your purchase history</p>
            </div>

            {isLoading ? (
                <div className='flex justify-center py-16'>
                    <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                </div>
            ) : !orders || orders.length === 0 ? (
                <div className='bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm'>
                    <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <Package className='h-8 w-8 text-gray-300' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>No orders yet</h3>
                    <p className='text-gray-500 text-sm'>Your purchased items will appear here.</p>
                </div>
            ) : (
                <div className='grid gap-6'>
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className='bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group'
                        >
                            {/* Order Header */}
                            <div className='bg-gray-50/50 px-6 py-4 flex items-center justify-between border-b border-gray-100'>
                                <div className='flex items-center gap-4'>
                                    <div className='flex flex-col'>
                                        <span className='text-xs text-gray-500 uppercase tracking-wider font-medium'>Date Placed</span>
                                        <span className='text-sm font-medium text-gray-900'>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className='h-8 w-px bg-gray-200 mx-2 hidden sm:block' />
                                    <div className='flex flex-col'>
                                        <span className='text-xs text-gray-500 uppercase tracking-wider font-medium'>Order ID</span>
                                        <span className='text-sm font-medium text-gray-900 font-mono'>#{order.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                                <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100'>
                                    <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                                    Delivered
                                </span>
                            </div>

                            {/* Products Scroller */}
                            <div className='max-h-[320px] overflow-y-auto custom-scrollbar'>
                                <div className='p-6 space-y-4'>
                                    {order.products.map((product: any, idx: number) => (
                                        <div key={idx} className='flex gap-4 group/item'>
                                            <div className='relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0'>
                                                {product.imageUrl ? (
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt={product.name || ''}
                                                        fill
                                                        className='object-cover group-hover/item:scale-110 transition-transform duration-500'
                                                    />
                                                ) : (
                                                    <div className='flex h-full w-full items-center justify-center'>
                                                        <Package className='h-8 w-8 text-gray-300' />
                                                    </div>
                                                )}
                                            </div>
                                            <div className='flex-1 min-w-0 py-1'>
                                                <div className='flex justify-between items-start'>
                                                    <div>
                                                        <h4 className='font-medium text-gray-900 truncate pr-4 text-base'>
                                                            {product.name}
                                                        </h4>
                                                        <p className='text-sm text-gray-500 capitalize mt-1'>
                                                            {product.category}
                                                        </p>
                                                    </div>
                                                    <p className='font-semibold text-gray-900'>
                                                        {formatPrice(product.price || 0)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Footer */}
                            <div className='bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex justify-between items-center'>
                                <button className='text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors'>
                                    View Receipt
                                </button>
                                <div className='flex items-center gap-3'>
                                    <span className='text-sm text-gray-500'>Total Amount</span>
                                    <span className='text-lg font-bold text-gray-900'>
                                        {formatPrice(order.amount || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Profile Section ────────────────────────────────────────────
interface ProfileSectionProps {
    name: string
    setName: (name: string) => void
    bio: string
    setBio: (bio: string) => void
    avatarUrl: string | null
    setAvatarUrl: (url: string | null) => void
    email: string
}

function ProfileSection({
    name, setName,
    bio, setBio,
    avatarUrl, setAvatarUrl,
    email
}: ProfileSectionProps) {
    const utils = trpc.useContext()
    const [uploading, setUploading] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

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
            name: name,
            bio: bio || undefined,
            imageUrl: avatarUrl || undefined,
        })
    }

    return (
        <div className='space-y-6'>
            <div>
                <h2 className='text-2xl font-bold text-gray-900'>Edit Profile</h2>
                <p className='text-sm text-gray-500 mt-1'>Update your personal information</p>
            </div>

            <div className='bg-white rounded-2xl border border-gray-200 p-8 shadow-sm'>
                {/* Avatar */}
                <div className='flex items-center gap-6 mb-10'>
                    <div className='relative group'>
                        <div className='relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md transition-transform group-hover:scale-105'>
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
                            className='absolute bottom-0 right-0 h-9 w-9 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 border-2 border-white'
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
                        <h3 className='font-medium text-gray-900'>Profile Photo</h3>
                        <p className='text-sm text-gray-500 mt-1'>Recommended: Square JPG, PNG under 5MB</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className='space-y-6 max-w-2xl'>
                    <div className='grid gap-6 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium text-gray-700'>Full Name</label>
                            <input
                                type='text'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder='Your name'
                                className='w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm'
                            />
                        </div>

                        <div className='space-y-2'>
                            <label className='text-sm font-medium text-gray-700'>Email Address</label>
                            <div className='relative'>
                                <Mail className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                                <input
                                    type='email'
                                    value={email}
                                    disabled
                                    className='w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed'
                                />
                            </div>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <div className='flex justify-between'>
                            <label className='text-sm font-medium text-gray-700'>Bio</label>
                            <span className='text-xs text-gray-400'>{bio.length}/200</span>
                        </div>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder='Tell us a bit about yourself...'
                            maxLength={200}
                            rows={4}
                            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm resize-none'
                        />
                    </div>

                    {/* Save Button */}
                    <div className='pt-4'>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || uploading}
                            className='px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none min-w-[140px]'
                        >
                            {isSaving ? <Loader2 className='h-4 w-4 animate-spin inline mr-2' /> : null}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className='bg-red-50/50 rounded-2xl border border-red-100 p-8'>
                <div className='flex items-start justify-between'>
                    <div>
                        <h3 className='font-medium text-red-900'>Delete Account</h3>
                        <p className='text-sm text-red-600/80 mt-1 max-w-xl'>
                            Permanently remove your account and all of its contents from our platform.
                            This action is not reversible, so please continue with caution.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className='px-6 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium text-sm transition-colors shadow-sm'
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4'>
                    <div className='bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl scale-100 animate-in fade-in zoom-in-95 duration-200'>
                        <div className='flex items-center gap-4 mb-6'>
                            <div className='h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0'>
                                <Trash2 className='h-6 w-6 text-red-600' />
                            </div>
                            <div>
                                <h3 className='text-lg font-bold text-gray-900'>Delete Account?</h3>
                                <p className='text-sm text-gray-500'>This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className='text-sm text-gray-600 mb-8 leading-relaxed'>
                            Are you sure you want to delete your account? All your data, including orders,
                            purchases, and profile information will be permanently removed.
                        </p>
                        <div className='flex gap-3'>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className='flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteAccount()}
                                disabled={isDeleting}
                                className='flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50'
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
        <div className='space-y-6'>
            <div>
                <h2 className='text-2xl font-bold text-gray-900'>Account Settings</h2>
                <p className='text-sm text-gray-500 mt-1'>Manage your account preferences</p>
            </div>

            <div className='bg-white rounded-2xl border border-gray-200 shadow-sm'>
                <div className='p-8 space-y-8'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='font-medium text-gray-900'>Password</p>
                            <p className='text-sm text-gray-500 mt-1'>Secure your account with a strong password</p>
                        </div>
                        <a
                            href='/forgot-password'
                            className='px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors'
                        >
                            Change Password
                        </a>
                    </div>

                    <div className='h-px bg-gray-100' />

                    <div className='flex items-center justify-between'>
                        <div className='opacity-60'>
                            <p className='font-medium text-gray-900'>Two-Factor Authentication</p>
                            <p className='text-sm text-gray-500 mt-1'>Add an extra layer of security</p>
                        </div>
                        <span className='px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full'>Coming soon</span>
                    </div>

                    <div className='h-px bg-gray-100' />

                    <div className='flex items-center justify-between'>
                        <div className='opacity-60'>
                            <p className='font-medium text-gray-900'>Email Notifications</p>
                            <p className='text-sm text-gray-500 mt-1'>Manage your email preferences</p>
                        </div>
                        <span className='px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full'>Coming soon</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Support Section ────────────────────────────────────────────
function SupportSection() {
    return (
        <div className='max-w-2xl mx-auto text-center py-12'>
            <div className='w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3'>
                <HeadphonesIcon className='h-10 w-10 text-blue-600' />
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>How can we help?</h2>
            <p className='text-gray-500 text-lg mb-10 leading-relaxed'>
                Have questions about your orders, account, or our products?
                Our team is here to help you get back to creating.
            </p>

            <div className='grid sm:grid-cols-2 gap-4'>
                <a
                    href='mailto:support@creativecascade.com'
                    className='flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5'
                >
                    <Mail className='h-5 w-5' />
                    Email Support
                </a>
                <button className='flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 rounded-xl font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5'>
                    <span className='text-xl'>💬</span>
                    Live Chat
                </button>
            </div>
            <p className='text-sm text-gray-400 mt-8'>
                Average response time: &lt; 24 hours
            </p>
        </div>
    )
}
