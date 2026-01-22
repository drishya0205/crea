'use client';

import React from 'react';
import { MoreHorizontal, Plus, Clock, Circle } from 'lucide-react';
import { Task, TaskStatus } from '@/types/crea';

const MOCK_TASKS: Task[] = [
    { id: '1', title: 'Q1 Financial Review', status: 'doing', priority: 'high', due_date: 'Today' },
    { id: '2', title: 'Hire Engineering Lead', status: 'next', priority: 'medium', due_date: 'Friday' },
    { id: '3', title: 'Update Privacy Policy', status: 'backlog', priority: 'low' },
    { id: '4', title: 'Client Onboarding - Beta', status: 'done', priority: 'urgent' },
    { id: '5', title: 'Refactor Auth Service', status: 'doing', priority: 'medium' },
];

const COLUMNS: { id: TaskStatus; label: string }[] = [
    { id: 'backlog', label: 'Backlog' },
    { id: 'next', label: 'Next' },
    { id: 'doing', label: 'In Progress' },
    { id: 'done', label: 'Done' },
];

export const TaskBoard = () => {
    return (
        <div className="h-full flex gap-6 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
                <div key={col.id} className="min-w-[300px] flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-zinc-300">{col.label}</h3>
                            <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">
                                {MOCK_TASKS.filter(t => t.status === col.id).length}
                            </span>
                        </div>
                        <button className="text-zinc-500 hover:text-white transition-colors">
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="flex-1 bg-zinc-900/30 rounded-xl border border-white/5 p-2 space-y-3">
                        {MOCK_TASKS.filter(t => t.status === col.id).map(task => (
                            <div key={task.id} className="group bg-zinc-900 border border-white/5 p-4 rounded-lg hover:border-blue-500/30 hover:bg-zinc-800 transition-all cursor-move">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs px-2 py-0.5 rounded border ${task.priority === 'urgent' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                            task.priority === 'high' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                                                'border-zinc-700 text-zinc-500'
                                        }`}>
                                        {task.priority}
                                    </span>
                                    <button className="text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>

                                <h4 className="text-sm text-zinc-200 font-medium mb-3">{task.title}</h4>

                                {task.due_date && (
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                        <Clock size={12} />
                                        <span>{task.due_date}</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button className="w-full py-2 text-xs text-zinc-600 border border-dashed border-white/5 rounded-lg hover:bg-white/5 hover:text-zinc-400 transition-colors">
                            + Add Item
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
