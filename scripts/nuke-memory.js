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

async function nuke() {
    console.log("Nuking all memories...");
    const { error } = await supabase
        .from('memory_fragments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything (hacky neq UUID check)

    if (error) console.error(error);
    else console.log("All memories deleted.");
}

nuke();
