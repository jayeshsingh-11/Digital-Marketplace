
import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({
    path: path.resolve(__dirname, '../.env'),
})

const run = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials')
        return
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Backfilling products with approved=true...')

    const { data, error } = await supabase
        .from('products')
        .update({ approved: true })
        .neq('approved', true) // Only update if not already true (or null)
        .select()

    if (error) {
        console.error('Error updating products:', error)
    } else {
        console.log(`Successfully updated ${data.length} products.`)
    }
}

run()
