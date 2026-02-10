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

const TARGET_CONTENT = "gensync";
const TARGET_USER_ID = "30fb8ffd-b1ff-4f6a-80ac-439462aaf4e6"; // Extracted from previous logs

async function debugQuery() {
    console.log(`Searching for content: '${TARGET_CONTENT}' and user_id: '${TARGET_USER_ID}'`);

    // 1. Exact match check (what the API does)
    const { data: exact, error: exactError } = await supabase
        .from('memory_fragments')
        .select('id, content, user_id')
        .eq('content', TARGET_CONTENT)
        .eq('user_id', TARGET_USER_ID);

    if (exactError) console.error("Exact query error:", exactError);
    else console.log("Exact matches found:", exact.length, exact);

    // 2. Loose check (just user_id and partial content)
    const { data: loose } = await supabase
        .from('memory_fragments')
        .select('id, content, user_id')
        .eq('user_id', TARGET_USER_ID)
        .ilike('content', `%${TARGET_CONTENT}%`);

    console.log("Loose matches found:", loose.length, loose);
}

debugQuery();
