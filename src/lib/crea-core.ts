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
            else if (item.similarity >= 0.60) score += 0.2; // Weak match
            else if (item.similarity >= 0.45) score += 0.15; // Very weak match (needed for partials)
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
// --- Helper: Analyze Tasks for Tone ---
async function getTaskAnalysis(userId: string, supabase: SupabaseClient) {
    const { data: tasks } = await supabase
        .from('tasks')
        .select('status')
        .eq('user_id', userId);

    if (!tasks || tasks.length === 0) return { tone: 'Neutral', completionRate: 0, total: 0, done: 0 };

    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const completionRate = done / total;

    // Tone Logic
    let tone = 'Professional';
    if (completionRate < 0.3) tone = 'Strict & Strategic (User is behind)';
    else if (completionRate > 0.7) tone = 'Encouraging & Visionary (User is winning)';
    else tone = 'Balanced & Tactical';

    return { tone, completionRate, total, done };
}

// --- Helper: Fetch Company Context ---
async function getCompanyContext(userId: string, supabase: SupabaseClient) {
    // Fetch memories that are likely high-level context
    // We try to match known types or just get high importance items
    const { data } = await supabase
        .from('memory_fragments')
        .select('content, metadata')
        .eq('user_id', userId)
        .or('metadata->>type.ilike.aim,metadata->>type.ilike.goal,metadata->>type.ilike.mission,metadata->>type.ilike.company name')
        .limit(5);

    return data?.map(d => d.content).join('\n') || "No specific company context found.";
}

export async function processQuery(
    query: string,
    userId: string,
    supabase: SupabaseClient,
    manualMode?: CreaMode
): Promise<string> {

    // 1. Determine Mode (Manual Override or Classifier)
    const mode = manualMode || await determineMode(query);

    // 2. Gather Context (Parallel)
    const [taskStats, companyContext] = await Promise.all([
        getTaskAnalysis(userId, supabase),
        getCompanyContext(userId, supabase)
    ]);

    let evidence: any[] = [];
    let queryEmbedding = null;

    // Generate embedding
    try {
        const emb = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
        });
        queryEmbedding = emb.data[0].embedding;
    } catch (e) {
        console.error("Embedding failed", e);
    }

    // --- 3. Retrieval Pipeline ---
    if (mode === 'grounded') {
        // Fetch Tasks (Recent/Active)
        const { data: tasks } = await supabase
            .from('tasks')
            .select('id, title, status, due_date')
            .eq('user_id', userId)
            .neq('status', 'done')
            .limit(10);
        if (tasks) evidence.push(...tasks.map(t => ({ ...t, type: 'task' })));

        // Fetch Vector Memory
        if (queryEmbedding) {
            // @ts-ignore
            const { data: fragments } = await supabase.rpc('match_memory_fragments', {
                query_embedding: queryEmbedding,
                match_threshold: 0.45, // Lowered to catch 'gensync' (0.51)
                match_count: 5,
                user_id_filter: userId
            });
            if (fragments) evidence.push(...fragments);
        }

    } else {
        // Strategic Mode
        if (queryEmbedding) {
            // @ts-ignore
            const { data: fragments } = await supabase.rpc('match_memory_fragments', {
                query_embedding: queryEmbedding,
                match_threshold: 0.45,
                match_count: 10,
                user_id_filter: userId
            });
            if (fragments) evidence.push(...fragments);
        }
    }

    const confidence = calculateConfidence(evidence);

    // --- 4. Logic Gate ---
    if (mode === 'grounded' && confidence < 0.25) {
        return "I don't have enough information in memory to answer that accurately. I refuse to guess.";
    }

    // --- 5. Generation ---
    const systemPrompt = `You are CREA, an AI Chief of Staff.
    
CONTEXT:
Company Info:
${companyContext}

Task Status:
${taskStats.done}/${taskStats.total} tasks completed (${(taskStats.completionRate * 100).toFixed(0)}%).
Required Tone: ${taskStats.tone}

OPERATING MODE: ${mode.toUpperCase()}
Confidence: ${confidence.toFixed(2)}

INSTRUCTIONS:
- Adopt the Required Tone immediately.
- If 'Strict': Be concise, highlight delays, focus on execution.
- If 'Encouraging': Be visionary, praise progress, focus on growth.
- Grounded Mode: Only use provided evidence.
- Strategic Mode: Mix evidence with general wisdom.

EVIDENCE:
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
