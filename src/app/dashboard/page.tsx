import React from 'react';
import { TaskBoard } from '@/components/dashboard/TaskBoard';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="h-full flex flex-col gap-8">
            {/* Dashboard Stats / Context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-blue-500/20 transition-colors">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                            <Zap size={20} />
                        </div>
                        <span className="text-zinc-400 text-sm font-medium">System Status</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">Type 1: Grounded</div>
                    <div className="text-xs text-blue-400/60">Strict fact-checking active</div>
                </div>

                <div className="p-6 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-emerald-500/20 transition-colors">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-zinc-400 text-sm font-medium">Decisions Logged</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">14 This Week</div>
                    <div className="text-xs text-emerald-400/60">+2 from yesterday</div>
                </div>

                <div className="p-6 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-purple-500/20 transition-colors">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                            <Activity size={20} />
                        </div>
                        <span className="text-zinc-400 text-sm font-medium">Brain Utilization</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">892 Fragments</div>
                    <div className="text-xs text-purple-400/60">Indexing efficiency: 99.9%</div>
                </div>
            </div>

            {/* Task Board Area */}
            <div className="flex-1 min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Active Operations</h2>
                    <div className="flex gap-2 text-sm">
                        <button className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">Sprint View</button>
                        <button className="px-3 py-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors">List View</button>
                    </div>
                </div>
                <TaskBoard />
            </div>
        </div>
    );
}
