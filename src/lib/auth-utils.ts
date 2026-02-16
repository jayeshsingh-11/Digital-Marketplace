import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { User } from '../payload-types'

export const getServerSideUserNode = async (
    cookies: NextRequest['cookies'] | ReadonlyRequestCookies
) => {
    const supabase = createClient(cookies as any)
    try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        console.log('getServerSideUserNode check:', {
            hasUser: !!authUser,
            userId: authUser?.id,
            error: authError?.message
        })

        if (authError || !authUser) return { user: null }

        // Fetch Public Profile for role
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', authUser.id)
            .single()

        if (profileError) {
            console.error('Profile fetch error:', profileError)
            // Still return user but fallback to 'user' role if profile missing
        }

        // Map to Payload User type structure to keep frontend compatible
        const user: User = {
            id: authUser.id,
            email: authUser.email!,
            role: (profile?.role as 'user' | 'admin') || 'user',
            updatedAt: authUser.updated_at || '',
            createdAt: authUser.created_at || '',
            _verified: true,
        } as User

        return { user }
    } catch (e) {
        console.error('getServerSideUserNode unexpected error:', e)
        return { user: null }
    }
}
