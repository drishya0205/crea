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

async function dedupe() {
    console.log("Starting deduplication...");

    // Fetch all memories
    // Note: In production this would be paginated or done via SQL function for performance
    const { data: allMemories, error } = await supabase
        .from('memory_fragments')
        .select('id, user_id, content, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching:", error);
        return;
    }

    const seen = new Set();
    const toDelete = [];

    for (const mem of allMemories) {
        // Unique key: content + user_id
        // We keep the first one seen (which is the latest due to sort order)
        // and mark subsequent ones for deletion.
        const key = `${mem.user_id}::${mem.content}`;

        if (seen.has(key)) {
            toDelete.push(mem.id);
        } else {
            seen.add(key);
        }
    }

    console.log(`Found ${toDelete.length} duplicates to remove.`);

    if (toDelete.length > 0) {
        const { error: delError } = await supabase
            .from('memory_fragments')
            .delete()
            .in('id', toDelete);

        if (delError) console.error("Error deleting:", delError);
        else console.log("Successfully removed duplicates.");
    }
}

dedupe();
