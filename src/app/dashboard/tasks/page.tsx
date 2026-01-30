'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/crea';
import { Plus, Clock, CheckCircle, Tag, AlertTriangle, Pencil, Trash2, X, Save } from 'lucide-react';

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Edit State
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Task>>({});

    const [newTask, setNewTask] = useState<Partial<Task>>({
        title: '',
        status: 'backlog',
        priority: 'medium'
    });

    // ... (useEffect for getUser remains same)
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                setUserId(data.user.id);
            }
        };
        getUser();
    }, []);

    // ... (useEffect for fetchTasks remains same)
    useEffect(() => {
        if (userId) fetchTasks();
    }, [userId]);

    const fetchTasks = async () => {
        if (!userId) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) console.error('Fetch tasks failed:', error);
        if (data) setTasks(data);
        setLoading(false);
    };

    const createTask = async () => {
        if (!newTask.title || !userId) return;

        // 1. Ensure Profile (Same logic as before)
        const { data: profile } = await supabase.from('user_profiles').select('id').eq('id', userId).single();
        if (!profile) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('user_profiles').insert([{
                    id: user.id,
                    email: user.email,
                    username: user.email?.split('@')[0] || 'guest'
                }]);
            }
        }

        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                title: newTask.title,
                status: newTask.status,
                priority: newTask.priority,
                user_id: userId
            }])
            .select()
            .single();

        if (error) {
            alert(`Error creating task: ${error.message}`);
            return;
        }

        if (data) {
            setTasks([data, ...tasks]);
            setIsAdding(false);
            setNewTask({ title: '', status: 'backlog', priority: 'medium' });
        }
    };

    const startEditing = (task: Task) => {
        setEditingTaskId(task.id);
        setEditForm({ ...task });
    };

    const cancelEditing = () => {
        setEditingTaskId(null);
        setEditForm({});
    };

    const updateTask = async () => {
        if (!editingTaskId || !editForm.title) return;

        const { error } = await supabase
            .from('tasks')
            .update({
                title: editForm.title,
                priority: editForm.priority,
                status: editForm.status
            })
            .eq('id', editingTaskId);

        if (error) {
            alert('Failed to update task');
            return;
        }

        // Optimistic update
        setTasks(tasks.map(t => (t.id === editingTaskId ? { ...t, ...editForm } as Task : t)));
        setEditingTaskId(null);
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this operation?')) return;

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            alert('Failed to delete task');
            return;
        }

        setTasks(tasks.filter(t => t.id !== taskId));
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

                        {/* Edit Mode vs View Mode */}
                        {editingTaskId === task.id ? (
                            <div className="flex-1 flex gap-2 items-center">
                                <input
                                    className="flex-1 bg-black/50 border border-white/20 p-2 text-white font-serif"
                                    value={editForm.title}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                />
                                <select
                                    className="bg-black border border-white/20 p-2 text-sm text-white"
                                    value={editForm.priority}
                                    onChange={e => setEditForm({ ...editForm, priority: e.target.value as any })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                                <select
                                    className="bg-black border border-white/20 p-2 text-sm text-white"
                                    value={editForm.status}
                                    onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                                >
                                    <option value="backlog">Backlog</option>
                                    <option value="next">Next</option>
                                    <option value="doing">Doing</option>
                                    <option value="done">Done</option>
                                </select>
                                <button onClick={updateTask} className="p-2 text-mint hover:bg-mint/10 rounded"><Save size={16} /></button>
                                <button onClick={cancelEditing} className="p-2 text-red-400 hover:bg-red-500/10 rounded"><X size={16} /></button>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1">
                                    <h3 className={`font-serif text-xl ${task.status === 'done' ? 'text-white/30 line-through' : 'text-white'}`}>
                                        {task.title}
                                    </h3>
                                </div>

                                {/* Meta Tags */}
                                <div className={`px-2 py-1 border text-[10px] uppercase tracking-widest font-mono ${priorityColor(task.priority)}`}>
                                    {task.priority}
                                </div>

                                {/* Action Buttons (Pencil/Trash) */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => startEditing(task)}
                                        className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                                        title="Edit Task"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                        title="Delete Task"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </>
                        )}
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
