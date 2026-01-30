'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link.');
            } else {
                console.log("Attempting sign in with:", email);
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                console.log("Sign in result:", { data, error });

                if (error) throw error;

                console.log("Redirecting to dashboard...");
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error: any) {
            console.error("Auth error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mint via-white to-mint opacity-20"></div>

            <div className="w-full max-w-md relative z-10">

                {/* Logo / Header */}
                <div className="mb-12 text-center">
                    <Link href="/" className="inline-block mb-6">
                        <div className="w-16 h-16 border border-white/20 flex items-center justify-center mx-auto hover:border-mint transition-colors group">
                            <div className="w-8 h-8 bg-white/10 group-hover:bg-mint/80 transition-colors"></div>
                        </div>
                    </Link>
                    <h1 className="text-4xl font-serif mb-2">
                        {mode === 'signin' ? 'System Access' : 'Initialize Identity'}
                    </h1>
                    <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
                        {mode === 'signin' ? 'Enter Credentials' : 'Create New Profile'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleAuth} className="space-y-6">

                    <div className="space-y-4">
                        <div className="group relative">
                            <Mail className="absolute left-4 top-3.5 text-white/30 group-focus-within:text-mint transition-colors" size={18} />
                            <input
                                type="email"
                                placeholder="EMAIL ADRESS"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-white/20 p-3 pl-12 text-white font-mono text-sm placeholder:text-white/20 focus:border-mint outline-none transition-colors"
                                required
                            />
                        </div>

                        <div className="group relative">
                            <Lock className="absolute left-4 top-3.5 text-white/30 group-focus-within:text-mint transition-colors" size={18} />
                            <input
                                type="password"
                                placeholder="PASSWORD"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-white/20 p-3 pl-12 text-white font-mono text-sm placeholder:text-white/20 focus:border-mint outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-mono uppercase tracking-wide">
                            Error: {error}
                        </div>
                    )}

                    {message && (
                        <div className="p-3 border border-mint/20 bg-mint/10 text-mint text-xs font-mono uppercase tracking-wide">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold uppercase text-xs tracking-[0.2em] py-4 hover:bg-mint transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (mode === 'signin' ? 'Authenticate' : 'Register Identity')}
                        {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </button>

                </form>

                {/* Footer / Toggle */}
                <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <button
                        onClick={() => {
                            setMode(mode === 'signin' ? 'signup' : 'signin');
                            setError(null);
                            setMessage(null);
                        }}
                        className="text-white/40 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors"
                    >
                        {mode === 'signin' ? 'Wait, I need an account' : 'I already have credentials'}
                    </button>
                </div>

                <div className="mt-12 flex justify-center gap-6 text-white/20">
                    <ShieldCheck size={20} />
                    <div className="text-[10px] font-mono uppercase tracking-widest pt-1">Secured by Supabase Auth</div>
                </div>

            </div>
        </div>
    );
}
