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

async function checkMemory() {
    console.log('Checking memory_fragments...');
    const { data, error } = await supabase
        .from('memory_fragments')
        .select('id, content, created_at, metadata')
        .eq('content', 'gensync')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Latest 5 Memories:');
        console.log(JSON.stringify(data, null, 2));
    }
}

checkMemory();
