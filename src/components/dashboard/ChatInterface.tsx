'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const ChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'system', content: 'CREA Online. Ready for grounded operations.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare full conversation history for context (optional, or just send last msg)
            // Our API currently expects { messages, userId }
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg].filter(m => m.role !== 'system'),
                    userId: 'mock-user-id'
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch response');
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'system', content: `Error: ${(err as Error).message}. Check API Keys.` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                ${msg.role === 'user' ? 'bg-zinc-700' : msg.role === 'system' ? 'bg-red-500/10' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                                {msg.role === 'user' ? <User size={14} /> : msg.role === 'system' ? <AlertTriangle size={14} className="text-red-400" /> : <Bot size={14} />}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                                    ? 'bg-zinc-800 text-white'
                                    : msg.role === 'system'
                                        ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                                        : 'bg-black/40 border border-white/5 text-zinc-100'
                                }`}
                            >
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                            <Loader2 size={14} className="animate-spin text-white" />
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse"></span>
                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse delay-150"></span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-950 border-t border-white/5">
                <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything... (e.g., 'What is the deadline for Project Alpha?')"
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl py-4 pl-5 pr-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-zinc-600">
                        Mode: Assuming <span className="text-zinc-400">Context Aware</span> • AI can make mistakes.
                    </p>
                </div>
            </div>
        </div>
    );
};
