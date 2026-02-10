'use client';

import Link from 'next/link';
import { LayoutDashboard, CheckSquare, Brain, Users, Settings, LogOut, Command, Bot, Menu, ChevronLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<{ email: string, username?: string } | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const sidebarRef = useRef<ImperativePanelHandle>(null);

    const toggleSidebar = () => {
        const panel = sidebarRef.current;
        if (panel) {
            if (isCollapsed) panel.expand();
            else panel.collapse();
        }
    };

    // Client-safe Supabase instance
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch profile for username
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('username')
                    .eq('id', user.id)
                    .single();

                setUserProfile({
                    email: user.email!,
                    username: profile?.username || user.email?.split('@')[0]
                });
            }
        };
        getUser();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    const NAV_ITEMS = [
        { icon: <LayoutDashboard size={20} />, label: 'Command Center', href: '/dashboard' },
        { icon: <CheckSquare size={20} />, label: 'Tasks', href: '/dashboard/tasks' },
        { icon: <Bot size={20} />, label: 'Neural Chat', href: '/dashboard/chat' },
        { icon: <Brain size={20} />, label: 'Memory', href: '/dashboard/memory' },
        { icon: <Users size={20} />, label: 'Team', href: '/dashboard/team' },
    ];

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="h-screen bg-black text-white selection:bg-blue-500/30 font-sans overflow-hidden">
            <PanelGroup direction="horizontal">

                {/* Sidebar Panel */}
                <Panel
                    ref={sidebarRef}
                    defaultSize={20}
                    minSize={15}
                    maxSize={30}
                    collapsible={true}
                    collapsedSize={5}
                    onCollapse={() => setIsCollapsed(true)}
                    onExpand={() => setIsCollapsed(false)}
                    onResize={(size) => {
                        // Robust fallback: if size is small, force collapsed UI
                        const isSmall = size < 10;
                        if (isSmall !== isCollapsed) setIsCollapsed(isSmall);
                    }}
                    className="bg-zinc-950 border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out relative group/sidebar"
                >
                    <div className={`border-b border-white/5 flex items-center transition-all h-16 relative ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
                        {/* Logo - Fades out when collapsed */}
                        <div className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}>
                            <Link href="/" className="flex items-center gap-3 group animate-in fade-in">
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

                        {/* Menu Toggle - Absolutely positioned to ensure it's ALWAYS clickable and completely centered when collapsed */}
                        <button
                            onClick={toggleSidebar}
                            className={`text-zinc-400 hover:text-white transition-all p-2 hover:bg-white/5 rounded-md z-20 ${isCollapsed ? 'absolute inset-0 m-auto w-10 h-10 flex items-center justify-center' : 'relative'}`}
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            <Menu size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap overflow-hidden ${isActive ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'} ${isCollapsed ? 'justify-center' : ''}`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    {item.icon}
                                    <span className={`transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0 translate-x-[-10px]' : 'opacity-100 w-auto translate-x-0'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-2 border-t border-white/5 space-y-1">
                        <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                            <Settings size={20} />
                            <span className={`transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Operating System</span>
                        </button>
                        <button
                            onClick={handleSignOut}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors whitespace-nowrap overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <LogOut size={20} />
                            <span className={`transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Disconnect</span>
                        </button>
                    </div>
                </Panel>

                {/* Resize Handle with Visible Grip & Larger Hitbox */}
                <PanelResizeHandle className="w-4 -ml-2 bg-transparent hover:bg-mint/5 transition-colors flex flex-col justify-center items-center group z-50 cursor-col-resize outline-none">
                    <div className="h-8 w-1 bg-zinc-700/50 group-hover:bg-mint rounded-full flex flex-col justify-center items-center gap-0.5 shadow-sm transition-colors opacity-50 group-hover:opacity-100">
                        <div className="w-0.5 h-0.5 bg-black rounded-full" />
                        <div className="w-0.5 h-0.5 bg-black rounded-full" />
                        <div className="w-0.5 h-0.5 bg-black rounded-full" />
                    </div>
                </PanelResizeHandle>

                {/* Main Content Panel */}
                <Panel defaultSize={80}>
                    <div className="h-full flex flex-col min-w-0 bg-black">
                        {/* Top Bar */}
                        <header className="h-16 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-6">
                            <div className="flex items-center gap-4 text-sm text-zinc-500">
                                <span className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/5">
                                    <Command size={14} /> K
                                    <span className="text-zinc-600">to search memory</span>
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-sm font-medium text-white">{userProfile?.username || 'Guest'}</div>
                                    <div className="text-xs text-zinc-500">
                                        {userProfile?.username ? `@${userProfile.username}` : 'Authenticated User'}
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xs font-mono text-mint">
                                    {userProfile?.username ? userProfile.username.substring(0, 2).toUpperCase() : 'GO'}
                                </div>
                            </div>
                        </header>

                        {/* Scrollable Area */}
                        <main className="flex-1 overflow-auto p-8 relative">
                            {children}
                        </main>
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
}
