
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env from current directory
dotenv.config({ path: path.resolve(__dirname, '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    console.log('Testing exact query structure...')

    const { data, error } = await supabase
        .from('products')
        .select(`
        *,
        product_files (*),
        product_images (
            image_id,
            media (*)
        )
    `)
        .limit(1)

    if (error) {
        console.error('❌ Query Failed:', JSON.stringify(error, null, 2))

        // Test simpler parts
        console.log('\n--- Diagnostics ---')

        // 1. product_files
        console.log('Testing partial query (product_files)...')
        const { error: err1 } = await supabase.from('products').select(`*, product_files(*)`).limit(1)
        if (err1) {
            console.error('❌ product_files join failed:', err1.message)
        } else {
            console.log('✅ product_files works')
        }

        // 2. product_images (shallow)
        console.log('Testing partial query (product_images)...')
        const { error: err2 } = await supabase.from('products').select(`*, product_images(*)`).limit(1)
        if (err2) {
            console.error('❌ product_images join failed:', err2.message)
        } else {
            console.log('✅ product_images (shallow) works')
        }

        // 3. media (deep)
        console.log('Testing partial query (product_images -> media)...')
        // We need to query product_images directly to test media join
        const { error: err3 } = await supabase.from('product_images').select(`*, media(*)`).limit(1)
        if (err3) {
            console.error('❌ product_images -> media join failed:', err3.message)
        } else {
            console.log('✅ product_images -> media works')
        }

    } else {
        console.log('✅ Query Succeeded!')
        if (data && data.length > 0) {
            console.log('Product Found:', data[0].name)
        } else {
            console.log('No products found, but query is valid.')
        }
    }
}

checkSchema()
