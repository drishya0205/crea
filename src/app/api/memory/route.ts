import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { content, metadata } = await req.json();

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
        // id, source_type, source_id, content_text, embedding, metadata
        const { data, error } = await supabase
            .from('memory_fragments')
            .insert([
                {
                    source_type: 'manual_entry',
                    source_id: 'user_dashboard', // or user uuid
                    content_text: content,
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
