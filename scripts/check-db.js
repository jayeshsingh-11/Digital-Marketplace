require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkDb() {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!sbUrl || !sbKey) {
        console.error('Missing Supabase credentials in .env');
        return;
    }

    const supabase = createClient(sbUrl, sbKey);

    console.log('Checking database connection to:', sbUrl);

    try {
        const { data: users, error: userError } = await supabase.from('users').select('id, role, email:id');
        // Note: email is not in public.users, but checking role is key.
        if (userError) console.error('Users check failed:', userError.message);
        else {
            console.log(`Found ${users.length} users.`);
            const admins = users.filter(u => u.role === 'admin');
            console.log(`Found ${admins.length} admins.`);
            if (admins.length > 0) {
                console.log('Admin IDs:', admins.map(a => a.id));
            } else {
                console.log('No admins found in public.users table!');
            }
        }
    } catch (e) { console.error('Users exception:', e.message); }

    try {
        const { count: orderCount, error: orderError } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        if (orderError) console.error('Orders check failed:', orderError.message);
        else console.log('Orders count:', orderCount);
    } catch (e) { console.error('Orders exception:', e.message); }
}

checkDb();
