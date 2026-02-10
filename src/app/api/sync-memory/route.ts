import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai';

export async function POST(req: Request) {
    try {
        const { sheetId, userId } = await req.json(); // Accept userId from client
        const targetSheetId = sheetId || process.env.GOOGLE_SHEET_ID;
        // Use provided userId or fallback to dev ID
        const targetUserId = userId || '00000000-0000-0000-0000-000000000000';

        if (!targetSheetId) {
            return NextResponse.json({ error: 'Missing GOOGLE_SHEET_ID' }, { status: 400 });
        }

        // 1. Auth with Google
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // 2. Read Data
        // Assume headers in Row 1: content, type, importance
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: targetSheetId,
            range: 'A2:C100', // Limit for now
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'No data found in sheet' });
        }

        const supabase = await createClient();
        let addedCount = 0;

        // 3. Process Rows
        for (const row of rows) {
            const [content, type, importance] = row;
            if (!content) continue;

            // Check if exists for THIS user
            const { data: allMatches } = await supabase
                .from('memory_fragments')
                .select('id')
                .eq('content', content)
                .eq('user_id', targetUserId);

            let existing = null;
            if (allMatches && allMatches.length > 0) {
                // Keep the first one, delete the rest
                existing = allMatches[0];
                if (allMatches.length > 1) {
                    const idsToDelete = allMatches.slice(1).map(r => r.id);
                    await supabase.from('memory_fragments').delete().in('id', idsToDelete);
                }
            }

            // Generate Embedding (include metadata for better retrieval context)
            const textToEmbed = `${content} ${type || ''} ${importance || ''}`.trim();
            const embeddingResponse = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: textToEmbed,
            });
            const embedding = embeddingResponse.data[0].embedding;

            const recordData = {
                source_type: 'google_sheet',
                user_id: targetUserId,
                content,
                embedding,
                metadata: {
                    type: type || 'general',
                    importance: importance || '0.5',
                    sheet_id: targetSheetId
                }
            };

            if (existing) {
                // Update existing memory (force update user_id)
                await supabase
                    .from('memory_fragments')
                    .update({ ...recordData, user_id: targetUserId })
                    .eq('id', existing.id);
            } else {
                // Insert new memory
                await supabase
                    .from('memory_fragments')
                    .insert(recordData);
                addedCount++;
            }
        }

        return NextResponse.json({ success: true, added: addedCount, total_scanned: rows.length });

    } catch (error: any) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
