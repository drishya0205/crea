'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/crea';
import { Plus, Clock, CheckCircle, Tag, AlertTriangle } from 'lucide-react';

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState<Partial<Task>>({
        title: '',
        status: 'backlog',
        priority: 'medium'
    });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setTasks(data);
        setLoading(false);
    };

    const createTask = async () => {
        if (!newTask.title) return;

        // In a real app we'd get the user ID, for now we insert without or with a placeholder if RLS allows or fails gracefully
        // Assuming table setup, we insert minimal data
        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                title: newTask.title,
                status: newTask.status,
                priority: newTask.priority,
            }])
            .select()
            .single();

        if (error) {
            console.error('Task creation failed:', error);
            alert(`Error creating task: ${error.message}`);
            return;
        }

        if (data) {
            setTasks([data, ...tasks]);
            setIsAdding(false);
            setNewTask({ title: '', status: 'backlog', priority: 'medium' });
        }
    };

    const priorityColor = (p: string) => {
        if (p === 'urgent') return 'text-red-500 border-red-500/50';
        if (p === 'high') return 'text-orange border-orange/50';
        if (p === 'medium') return 'text-mint border-mint/50';
        return 'text-white/50 border-white/20';
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-serif text-white mb-2">Operations Queue</h1>
                    <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
                        {tasks.length} Active Vectors
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-4 py-2 bg-mint text-black font-bold uppercase text-xs tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                >
                    <Plus size={16} />
                    {isAdding ? 'Cancel' : 'Initialize Task'}
                </button>
            </div>

            {/* Add Task Form (Inline) */}
            {isAdding && (
                <div className="p-6 border border-mint/20 bg-mint/5 animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-4">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Task Descriptor..."
                            className="w-full bg-black/50 border border-white/10 p-3 text-white font-serif text-xl focus:border-mint outline-none"
                            value={newTask.title}
                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && createTask()}
                        />
                        <div className="flex gap-4">
                            <select
                                className="bg-black border border-white/10 p-2 text-sm text-white/70 uppercase tracking-widest outline-none focus:border-mint"
                                value={newTask.priority}
                                onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                                <option value="urgent">CRITICAL</option>
                            </select>
                            <select
                                className="bg-black border border-white/10 p-2 text-sm text-white/70 uppercase tracking-widest outline-none focus:border-mint"
                                value={newTask.status}
                                onChange={e => setNewTask({ ...newTask, status: e.target.value as any })}
                            >
                                <option value="backlog">Backlog</option>
                                <option value="next">Next Up</option>
                                <option value="doing">In Progress</option>
                                <option value="done">Completed</option>
                            </select>
                            <button
                                onClick={createTask}
                                className="ml-auto px-6 py-2 bg-white/10 hover:bg-mint hover:text-black text-white text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                Commit Vector
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task List (Grid for 'Brutalist' feel) */}
            <div className="grid grid-cols-1 border-t border-l border-white/10">
                {tasks.map((task) => (
                    <div key={task.id} className="group flex items-center gap-4 p-4 border-b border-r border-white/10 hover:bg-white/5 transition-colors">

                        {/* Status Indicator */}
                        <div className={`w-3 h-3 border ${task.status === 'done' ? 'bg-mint border-mint' :
                            task.status === 'doing' ? 'bg-orange border-orange animate-pulse' :
                                'border-white/20'
                            }`} />

                        <div className="flex-1">
                            <h3 className={`font-serif text-xl ${task.status === 'done' ? 'text-white/30 line-through' : 'text-white'}`}>
                                {task.title}
                            </h3>
                        </div>

                        {/* Meta Tags */}
                        <div className={`px-2 py-1 border text-[10px] uppercase tracking-widest font-mono ${priorityColor(task.priority)}`}>
                            {task.priority}
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && !loading && (
                    <div className="p-12 text-center border-b border-r border-white/10 text-white/30 font-serif italic text-xl">
                        No active operations found.
                    </div>
                )}
            </div>
        </div>
    );
}
