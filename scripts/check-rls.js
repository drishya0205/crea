const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    console.log('Checking memory table info...');
    // We can't easily check RLS policies via JS client without admin rights or SQL.
    // However, we can check if we can read ANY data with anon key if RLS is off or permissive.

    // 1. Try to read without any user context (Anon)
    const { data: anonData, error: anonError } = await supabase
        .from('memory_fragments')
        .select('count')
        .limit(1);

    console.log('Anon Read Attempt:', {
        success: !anonError,
        dataLength: anonData ? anonData.length : 0,
        error: anonError
    });

}

checkRLS();
