'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Clock, Database } from 'lucide-react';

const SYSTEM_MSG = "CREA v1.0 • System Online • Memory Synced";

export const Simulator = () => {
    const [messages, setMessages] = useState<any[]>([
        { role: 'system', content: SYSTEM_MSG },
        { role: 'assistant', content: "I'm ready. What's the priority for this week?" }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    // Auto-play script for demo
    useEffect(() => {
        const timer = setTimeout(() => {
            runDemoScript();
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const runDemoScript = async () => {
        await addMessage({ role: 'user', content: "Update project Alpha. We're delayed by 2 weeks." });
        setIsTyping(true);
        await wait(1500);
        setIsTyping(false);

        await addMessage({
            role: 'assistant',
            content: "Understood. Updating Project Alpha timeline.",
            type: 'action',
            details: [
                { icon: <Clock size={16} />, text: "Deadline moved to Nov 15" },
                { icon: <Database size={16} />, text: "Risk flagged in Decision Log" }
            ]
        });

        await wait(1000);

        await addMessage({
            role: 'assistant',
            content: "I've also flagged 3 tasks that are now critical. Shall I notify the team?",
            type: 'decision'
        });
    };

    const addMessage = async (msg: any) => {
        setMessages(prev => [...prev, msg]);
        await wait(500);
    };

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    return (
        <div className="w-full max-w-2xl mx-auto font-sans">
            <div className="rounded-none overflow-hidden border border-white/10 bg-black shadow-2xl backdrop-blur-xl hover:border-mint/30 transition-colors">
                {/* Header */}
                <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-none bg-mint animate-pulse"></div>
                        <div className="text-sm font-medium text-white/90 tracking-widest text-xs uppercase">CREA_CORE</div>
                    </div>
                    <div className="text-[10px] text-white/40 font-mono tracking-widest">LIVE_DEMO</div>
                </div>

                {/* Chat Area */}
                <div className="h-[400px] p-6 overflow-y-auto space-y-4 font-mono">
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] p-3 text-sm border-l-2
                  ${msg.role === 'user'
                                        ? 'bg-white/10 text-white border-orange'
                                        : msg.role === 'system'
                                            ? 'bg-transparent text-white/30 text-[10px] w-full border-none text-center'
                                            : 'bg-zinc-900 text-zinc-200 border-mint'
                                    }`}
                                >
                                    {msg.content}

                                    {msg.type === 'action' && (
                                        <div className="mt-3 space-y-2">
                                            {msg.details.map((detail: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-mint bg-mint/5 p-2">
                                                    {detail.icon}
                                                    {detail.text}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isTyping && (
                        <div className="flex items-center gap-1 text-mint text-xs ml-2 animate-pulse">
                            PROCESSING...
                        </div>
                    )}
                </div>

                {/* Input Simulation */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-10 bg-black border border-white/10 flex items-center px-3 text-white/30 text-xs font-mono">
                            _Type a command...
                        </div>
                        <button className="p-2 bg-orange text-black hover:bg-white transition-colors">
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
