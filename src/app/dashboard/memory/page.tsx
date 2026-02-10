'use client';

import React, { useState, useEffect } from 'react';
import { Database, Search, Plus, Cpu, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Define Memory Fragment Type temporarily here or import
interface MemoryFragment {
    id: string;
    source_type: string;
    content: string;
    metadata: any;
    created_at: string;
}

export default function MemoryPage() {
    const [fragments, setFragments] = useState<MemoryFragment[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // New Memory State
    const [newMemory, setNewMemory] = useState({
        content: '',
        type: 'decision', // default bucket
        importance: 0.5
    });

    // Get authenticated user (or use temp UUID for dev)
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            // If no auth user, use a temporary dev UUID
            const tempUserId = data.user?.id ?? '00000000-0000-0000-0000-000000000000';
            setUserId(tempUserId);
        };
        getUser();
    }, []);

    // Fetch memories when userId is available
    useEffect(() => {
        if (userId) fetchMemories();
    }, [userId]);

    const fetchMemories = async () => {
        if (!userId) return;

        setLoading(true);
        // Fetch last 20 memories
        const { data, error } = await supabase
            .from('memory_fragments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Fetch memories failed:', error);
        }

        if (data) setFragments(data);
        setLoading(false);
    };

    const handleCreateMemory = async () => {
        if (!newMemory.content) return;

        // We need to generate an embedding. 
        // Since we cannot use OpenAI key on client, we should use our existing /api/chat or a new endpoint.
        // Let's assume we create a simpler /api/memory endpoint for this.
        try {
            const response = await fetch('/api/memory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newMemory.content,
                    metadata: { type: newMemory.type, importance: newMemory.importance }
                })
            });

            if (response.ok) {
                setIsAdding(false);
                setNewMemory({ content: '', type: 'decision', importance: 0.5 });
                fetchMemories(); // Refresh
            } else {
                alert('Failed to vectorize memory');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSync = async () => {
        setLoading(true);
        try {
            // Pass the current userId so the backend assigns memories correctly
            const res = await fetch('/api/sync-memory', {
                method: 'POST',
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Synced! Added ${data.added} new memories.`);
                fetchMemories();
            } else {
                alert('Sync failed: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Sync error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-4xl font-serif text-white mb-2">Cortex Fragments</h1>
                    <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
                        {fragments.length} Vectors Indexed
                    </p>
                </div>
                <div className="flex gap-4">
                    {/* Search Bar - Placeholder for now */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-white/30" size={16} />
                        <input
                            type="text"
                            placeholder="QUERY DATABASE..."
                            className="bg-black border border-white/10 pl-10 pr-4 py-2 text-white/70 text-xs font-mono uppercase focus:border-mint outline-none w-64"
                        />
                    </div>

                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="px-4 py-2 bg-mint text-black font-bold uppercase text-xs tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} />
                        {isAdding ? 'Cancel' : 'Log Memory'}
                    </button>
                    <button
                        onClick={handleSync}
                        className="px-4 py-2 bg-white/10 text-white font-bold uppercase text-xs tracking-widest hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                        <Database size={16} />
                        Sync Sheets
                    </button>
                </div>
            </div>

            {/* Add Memory Form */}
            {isAdding && (
                <div className="p-6 border border-mint/20 bg-mint/5 animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-4">
                        <textarea
                            autoFocus
                            rows={3}
                            placeholder="Log strategic context, decision, or fact..."
                            className="w-full bg-black/50 border border-white/10 p-3 text-white font-serif text-xl focus:border-mint outline-none resize-none"
                            value={newMemory.content}
                            onChange={e => setNewMemory({ ...newMemory, content: e.target.value })}
                        />
                        <div className="flex gap-4 items-center">
                            <span className="text-xs text-mint uppercase tracking-widest">Vector Type:</span>
                            <select
                                className="bg-black border border-white/10 p-2 text-sm text-white/70 uppercase tracking-widest outline-none focus:border-mint"
                                value={newMemory.type}
                                onChange={e => setNewMemory({ ...newMemory, type: e.target.value })}
                            >
                                <option value="decision">Decision</option>
                                <option value="context">Strategic Context</option>
                                <option value="meeting">Meeting Note</option>
                            </select>

                            <button
                                onClick={handleCreateMemory}
                                className="ml-auto px-6 py-2 bg-white/10 hover:bg-mint hover:text-black text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                            >
                                <Cpu size={14} />
                                vectorize & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Memory List */}
            <div className="grid grid-cols-1 border-t border-l border-white/10">
                {fragments.map((fragment) => (
                    <div key={fragment.id} className="group p-6 border-b border-r border-white/10 hover:bg-white/5 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 text-xs font-mono text-mint uppercase tracking-widest">
                                <Database size={12} />
                                ID: {fragment.id.substring(0, 8)}
                            </div>
                            <div className="text-white/30 text-xs">
                                {new Date(fragment.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        <p className="text-white/80 font-serif text-lg leading-relaxed">
                            "{fragment.content}"
                        </p>

                        <div className="mt-4 flex gap-2">
                            {/* Metadata Tags */}
                            <span className="px-2 py-0.5 border border-white/10 text-[10px] text-white/50 uppercase">
                                {(fragment.metadata as any)?.type || 'General'}
                            </span>
                            {(fragment.metadata as any)?.importance && (
                                <span className="px-2 py-0.5 border border-white/10 text-[10px] text-mint/50 uppercase">
                                    IMP: {(fragment.metadata as any)?.importance}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
