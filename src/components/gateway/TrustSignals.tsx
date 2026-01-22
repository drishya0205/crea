import React from 'react';
import { Database, Layers, CheckSquare, Calendar, Shield, User, HardDrive } from 'lucide-react';

const BUCKETS = [
    {
        id: 1,
        title: 'Identity',
        desc: 'Unstructured user vectors',
        icon: <User size={24} className="text-pink" />
    },
    {
        id: 2,
        title: 'Operating System',
        desc: 'Structured rules & cadence',
        icon: <HardDrive size={24} className="text-blue-400" />
    },
    {
        id: 3,
        title: 'Vision',
        desc: 'Mission statement & pivot',
        icon: <Layers size={24} className="text-mint" />
    },
    {
        id: 4,
        title: 'Projects',
        desc: 'Timelines & assets',
        icon: <Layers size={24} className="text-orange" />
    },
    {
        id: 5,
        title: 'Tasks',
        desc: 'Atomic units (Doing/Done)',
        icon: <CheckSquare size={24} className="text-emerald-400" />
    },
    {
        id: 6,
        title: 'Calendar',
        desc: 'Hard landscape of time',
        icon: <Calendar size={24} className="text-white/60" />
    },
    {
        id: 7,
        title: 'Decisions',
        desc: 'Immutable choice ledger',
        icon: <Shield size={24} className="text-maroon" />
    },
];

export const TrustSignals = () => {
    return (
        <div className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">
                        The <span className="text-mint font-italic">Anti-Hallucination</span> Architecture
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed font-sans font-light">
                        CREA solves the "hallucination problem" through a strict separation of
                        <span className="text-white font-medium border-b border-orange/50 mx-1">Grounded Truth</span>
                        and
                        <span className="text-white font-medium border-b border-mint/50 mx-1">Strategic Context</span>.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-white/10">
                    {BUCKETS.map((bucket) => (
                        <div key={bucket.id} className="group p-8 border-b border-r border-white/10 hover:bg-white/5 transition-colors bg-black relative min-h-[220px] flex flex-col justify-between">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-1.5 h-1.5 bg-orange"></div>
                            </div>
                            <div className="text-white/80 group-hover:text-white transition-colors">
                                {bucket.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-2">{bucket.title}</h3>
                                <p className="text-white/40 text-xs font-sans tracking-wide uppercase">{bucket.desc}</p>
                            </div>
                        </div>
                    ))}

                    {/* Summary Card */}
                    <div className="lg:col-span-1 p-8 border-b border-r border-white/10 bg-mint/5 flex flex-col justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-mint/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <h3 className="text-3xl font-serif text-mint mb-2 relative z-10">No Guessing.</h3>
                        <p className="text-mint/60 text-xs font-sans uppercase tracking-widest relative z-10">
                            "I don't have that in memory."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
