import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { ProfileForm } from '@/components/ProfileForm'
import { getServerSideUserNode } from '@/lib/auth-utils'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const AccountPage = async () => {
    const nextCookies = cookies()
    const { user } = await getServerSideUserNode(nextCookies)

    console.log('AccountPage: User node result:', user ? 'Found user' : 'No user')

    if (!user) {
        console.log('AccountPage: Redirecting to sign-in')
        redirect('/sign-in')
    }

    console.log('AccountPage: Rendering content for user', user.id)

    return (
        <MaxWidthWrapper>
            <div className='py-20 mx-auto text-center flex flex-col items-center max-w-2xl'>
                <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6'>
                    Your Account
                </h1>
                <p className='text-lg text-muted-foreground mb-12'>
                    Update your profile settings and information.
                </p>
                <div className='w-full bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-left'>
                    <ProfileForm />
                </div>
            </div>
        </MaxWidthWrapper>
    )
}

export default AccountPage
