import { NextResponse } from 'next/server';
import { processQuery } from '@/lib/crea-core';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const { messages, userId } = await req.json();
        const supabase = await createClient();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role !== 'user') {
            return NextResponse.json({ error: 'Last message must be from user' }, { status: 400 });
        }

        const query = lastMessage.content;
        const uid = userId || '00000000-0000-0000-0000-000000000000'; // Default/Mock ID

        // Core Logic
        const responseText = await processQuery(query, uid, supabase);

        return NextResponse.json({
            role: 'assistant',
            content: responseText
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
