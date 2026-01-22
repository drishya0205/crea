import React from 'react';
import { ChatInterface } from '@/components/dashboard/ChatInterface';

export default function ChatPage() {
    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Neural Network</h1>
                <p className="text-zinc-500 text-sm">Direct interface with CREA Core. Grounded & Strategic modes active.</p>
            </div>

            <ChatInterface />
        </div>
    );
}
