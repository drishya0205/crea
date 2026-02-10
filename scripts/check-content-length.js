const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data } = await supabase
        .from('memory_fragments')
        .select('id, content')
        .ilike('content', '%gensync%')
        .limit(10);

    console.log("Checking lengths:");
    data.forEach(d => {
        console.log(`ID: ${d.id} | Content: '${d.content}' | Length: ${d.content.length}`);
    });
}

check();
