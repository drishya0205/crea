'use client';

import Link from 'next/link';
import { LayoutDashboard, CheckSquare, Brain, Users, Settings, LogOut, Command, Bot } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const NAV_ITEMS = [
        { icon: <LayoutDashboard size={20} />, label: 'Command Center', href: '/dashboard' },
        { icon: <CheckSquare size={20} />, label: 'Tasks', href: '/dashboard/tasks' },
        { icon: <Bot size={20} />, label: 'Neural Chat', href: '/dashboard/chat' },
        { icon: <Brain size={20} />, label: 'Memory', href: '/dashboard/memory' },
        { icon: <Users size={20} />, label: 'Team', href: '/dashboard/team' },
    ];

    return (
        <div className="flex h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col bg-zinc-950">
                <div className="p-6 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 relative">
                            <img
                                src="/gensync-logo.png"
                                alt="CREA Logo"
                                className="w-full h-full object-contain filter brightness-0 invert"
                            />
                        </div>
                        <span className="font-serif tracking-tight text-xl text-white">CREA</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                                {item.icon}
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Settings size={20} />
                        Operating System
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut size={20} />
                        Disconnect
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 border-b border-white/5 bg-zinc-950 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/5">
                            <Command size={14} /> K
                            <span className="text-zinc-600">to search memory</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm font-medium text-white">Gopal</div>
                            <div className="text-xs text-zinc-500">Chief Executive Officer</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700"></div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
