require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkSchema() {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!sbUrl || !sbKey) {
        console.error('Missing Supabase credentials');
        return;
    }

    const supabase = createClient(sbUrl, sbKey);

    console.log('Checking schema for public.users...');

    // Try to select the new columns. If they don't exist, this will error.
    const { data, error } = await supabase
        .from('users')
        .select('name, image_url')
        .limit(1);

    if (error) {
        console.error('❌ Schema check FAILED:', error.message);
        if (error.message.includes('dt does not exist') || error.code === 'PGRST301') {
            console.log('Use the updated-schema-profiles.sql script to fix this!');
        }
    } else {
        console.log('✅ Schema check PASSED: Columns "name" and "image_url" exist.');
    }
}

checkSchema();
