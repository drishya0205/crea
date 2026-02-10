import { openai } from './openai';
import { CreaMode, DialogContext } from '@/types/crea';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * 1. Input Classification: Determine if intent is FACTUAL or STRATEGIC.
 */
export async function determineMode(query: string): Promise<CreaMode> {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a classifier. Output only one word: 'grounded' or 'strategic'.\n\nGrounded: specific questions about facts, dates, tasks, deadlines, decisions, status, or retrieving info.\nStrategic: brainstorming, writing, planning content, coding, generic advice, creative work." },
                { role: "user", content: query }
            ],
            temperature: 0,
            max_tokens: 10
        });

        const text = response.choices[0].message.content?.trim().toLowerCase();
        return (text === 'strategic') ? 'strategic' : 'grounded';
    } catch (e) {
        console.error("LLM Classification failed, defaulting to grounded", e);
        return 'grounded';
    }
}

/**
 * 2. Confidence Gating
 */
export function calculateConfidence(evidence: any[]): number {
    if (!evidence || evidence.length === 0) return 0.0;

    // Simple heuristic: if we found meaningful matches (either DB rows or high-similarity vectors)
    // Vectors return a similarity score 0-1.
    // DB rows are assumed 1.0 relevance if filtered correctly.

    let score = 0.0;

    for (const item of evidence) {
        if (item.similarity) {
            // Vector result
            if (item.similarity > 0.80) score += 0.5; // Strong match
            else if (item.similarity > 0.70) score += 0.3; // Medium match
            else if (item.similarity >= 0.60) score += 0.15; // Weak match
        } else {
            // Structured DB result (exact match usually)
            score += 0.8;
        }
    }

    return Math.min(score, 1.0);
}

/**
 * 3. Retrieval Pipeline
 */
export async function processQuery(query: string, userId: string, supabase: SupabaseClient): Promise<string> {
    const mode = await determineMode(query);
    let evidence: any[] = [];

    // Generate embedding for query only once if needed
    let queryEmbedding = null;

    if (mode === 'grounded' || mode === 'strategic') {
        try {
            const emb = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: query,
            });
            queryEmbedding = emb.data[0].embedding;
        } catch (e) {
            console.error("Embedding generation failed", e);
        }
    }

    // --- 1. Bucket Selection ---

    if (mode === 'grounded') {
        // Search Structured Data (Tasks, Calendar)
        // We'll search Tasks by keyword or semantic match if we had full db search.
        // simpler: fetch recent active tasks
        const { data: tasks } = await supabase
            .from('tasks')
            .select('id, title, status, due_date')
            .eq('user_id', userId)
            .neq('status', 'done')
            .limit(10);

        if (tasks) evidence.push(...tasks.map(t => ({ ...t, type: 'task' })));

        // Search Vector Memory (Notes, Decisions, Identity)
        if (queryEmbedding) {
            // @ts-ignore
            const { data: fragments } = await supabase.rpc('match_memory_fragments', {
                query_embedding: queryEmbedding,
                match_threshold: 0.60, // Relaxed threshold for grounded (was 0.75)
                match_count: 5,
                user_id_filter: userId
            });
            if (fragments) evidence.push(...fragments);
        }

    } else {
        // Strategic mode - Search broader context
        // We assume mostly vector search here
        if (queryEmbedding) {
            // @ts-ignore
            const { data: fragments } = await supabase.rpc('match_memory_fragments', {
                query_embedding: queryEmbedding,
                match_threshold: 0.60, // Loose threshold for creativity
                match_count: 10,
                user_id_filter: userId
            });
            if (fragments) evidence.push(...fragments);
        }
    }

    const confidence = calculateConfidence(evidence);

    // --- 4. Logic Gate ---
    if (mode === 'grounded' && confidence < 0.3) {
        // The Anti-Hallucination Pledge
        return "I don't have enough information in memory to answer that accurately. I refuse to guess.";
    }

    // --- 5. Generation ---

    const systemPrompt = `You are CREA, an AI Chief of Staff.
Mode: ${mode.toUpperCase()}
Confidence: ${confidence.toFixed(2)}

Style:
- Concise, professional, no fluff.
- If Mode is GROUNDED: You must ONLY use the provided evidence. Do NOT answer from outside data.
- If Mode is STRATEGIC: You can use general knowledge plus evidence.
- Format: Use bullet points for lists.

Evidence:
${JSON.stringify(evidence, null, 2)}
`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query }
            ]
        });

        return completion.choices[0].message.content || "Error generating response.";
    } catch (e) {
        return "I encountered an error processing your request.";
    }
}
