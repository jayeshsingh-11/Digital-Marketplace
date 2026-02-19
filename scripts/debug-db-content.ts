
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const debugDb = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials')
        return
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('--- Debugging Users Data ---')
    // IDs from previous run
    const targetIds = ['143bba43-476a-47be-9598-eef391e12dee', '64a93bbd-c27c-4538-94f8-0257af1c676b']
    const { data: users, error: usersError } = await supabase.from('users').select('id, name, role').in('id', targetIds)
    if (usersError) console.error('Users Error:', usersError)
    else {
        users?.forEach(u => console.log(JSON.stringify(u)))
    }
}

debugDb()
