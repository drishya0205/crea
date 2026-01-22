import { NextResponse } from 'next/server';
import { processQuery } from '@/lib/crea-core';

// This would be the public URL where Telegram sends updates
// https://crea-os.app/api/telegram-webhook

export async function POST(req: Request) {
    try {
        const update = await req.json();

        // Basic Telegram Update structure
        if (!update.message || !update.message.text) {
            return NextResponse.json({ ok: true }); // Acknowledge non-text updates
        }

        const chatId = update.message.chat.id;
        const text = update.message.text;
        const userId = "user_uuid_placeholder"; // Map telegram_id to user_id in DB

        console.log(`[Telegram] Received from ${chatId}: ${text}`);

        // Call CREA Core
        // In a real bot, we would assume an authorized user.
        const responseText = await processQuery(text, userId);

        // Send response back to Telegram
        // In production: await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id: chatId, text: responseText })

        console.log(`[Telegram] Replying: ${responseText}`);

        return NextResponse.json({
            ok: true,
            simulated_reply: responseText
        });

    } catch (error) {
        console.error('Telegram Webhook Error:', error);
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
