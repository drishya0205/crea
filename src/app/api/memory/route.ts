import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const { content, metadata } = await req.json();
        const supabase = await createClient();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // 1. Generate Embedding
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small", // or ada-002
            input: content,
            encoding_format: "float",
        });

        const embedding = embeddingResponse.data[0].embedding;

        // 2. Save to Supabase
        // We'll store it in 'memory_fragments'
        // id, source_type, content, embedding, metadata
        const { data, error } = await supabase
            .from('memory_fragments')
            .insert([
                {
                    source_type: 'manual_entry',
                    content: content,
                    embedding: embedding,
                    metadata: metadata || {}
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
