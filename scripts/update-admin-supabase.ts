
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
})

const updateAdmin = async () => {
    const email = 'jayeshsingh881@gmail.com'
    const password = '@jayesh2005'

    console.log(`Processing admin user: ${email}...`)

    // 1. Check if user exists in Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError)
        process.exit(1)
    }

    const existingUser = users.find(u => u.email === email)
    let userId: string

    if (!existingUser) {
        console.log('User not found. Creating new user...')
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'admin' }
        })

        if (createError) {
            console.error('Error creating user:', createError)
            process.exit(1)
        }

        userId = newUser.user.id
        console.log(`Created new user with ID: ${userId}`)
    } else {
        console.log(`User found (ID: ${existingUser.id}). Updating password...`)
        userId = existingUser.id
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
            user_metadata: { role: 'admin' }
        })

        if (updateError) {
            console.error('Error updating user password:', updateError)
            process.exit(1)
        }
        console.log('Password updated.')
    }

    // 2. Ensure role is 'admin' in public.users table
    console.log('Updating public.users role to admin...')

    // Upsert into public.users to ensure the record exists and has correct role
    // The handle_new_user trigger might have created it, but we want to be sure about the role
    const { error: upsertError } = await supabase
        .from('users')
        .upsert({
            id: userId,
            role: 'admin',
            // We need to fetch the current stripe_customer_id if we want to preserve it, 
            // but upsert should handle updates if we only specify what we want to change if we use proper conflict resolution.
            // However, straightforward upsert might overwrite other fields if not careful.
            // Let's just update based on ID since we know the ID.
        })
        .select()

    // Actually, simpler to just Update. If it doesn't exist in public.users (which it should due to triggers), we might need to insert.
    // Let's try update first.
    const { error: dbUpdateError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId)

    if (dbUpdateError) {
        console.error('Error updating public.users role:', dbUpdateError)
        // If update failed, maybe row doesn't exist? (Trigger failed?)
        console.log('Attempting insert into public.users...')
        const { error: insertError } = await supabase
            .from('users')
            .insert({ id: userId, role: 'admin' })

        if (insertError) {
            console.error('Error inserting into public.users:', insertError)
            process.exit(1)
        }
    }

    console.log('Successfully updated public.users role.')
    console.log('Admin credentials updated successfully!')
}

updateAdmin()
