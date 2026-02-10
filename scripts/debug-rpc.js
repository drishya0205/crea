const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const TARGET_USER_ID = "30fb8ffd-b1ff-4f6a-80ac-439462aaf4e6";
const QUERY = "Tell me about gensync";

async function testRpc() {
    console.log(`Generating embedding for: '${QUERY}'`);
    const embResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: QUERY,
    });
    const embedding = embResponse.data[0].embedding;

    console.log(`Calling match_memory_fragments for user: ${TARGET_USER_ID}`);
    const { data, error } = await supabase.rpc('match_memory_fragments', {
        query_embedding: embedding,
        match_threshold: 0.1, // Very low to see everything
        match_count: 5,
        user_id_filter: TARGET_USER_ID
    });

    if (error) {
        console.error("RPC Error:", error);
    } else {
        console.log("Matches found:", data.length);
        data.forEach(d => {
            console.log(`- [${d.similarity.toFixed(4)}] ${d.content}`);
        });
    }
}

testRpc();
