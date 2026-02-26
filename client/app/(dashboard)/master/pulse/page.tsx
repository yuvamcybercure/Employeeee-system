"use client";

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    Sparkles,
    Send,
    Activity,
    Zap,
    Cpu,
    Database,
    Globe,
    ShieldAlert,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from '@/components/ui/toaster';
import { motion, AnimatePresence } from 'framer-motion';

export default function MasterPulse() {
    const [prompt, setPrompt] = useState('');
    const [processing, setProcessing] = useState(false);
    const [history, setHistory] = useState<any[]>([
        { id: 1, text: "Optimize multi-tenant indexing across all clusters", status: "completed", type: "system" },
        { id: 2, text: "Analyze global churn rate for new organizations", status: "completed", type: "analytics" },
    ]);

    const handlePulse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setProcessing(true);
        try {
            // Simulated AI processing for "God Mode" feel
            await new Promise(r => setTimeout(r, 2000));

            // This would ideally call a backend endpoint that uses AI to perform actions
            // or send platform-wide notifications/updates.
            const response = await api.post('/master/pulse', { prompt });

            if (response.data.success) {
                toast.success('Pulse wave propagated across platform');
                setHistory([{ id: Date.now(), text: prompt, status: "completed", type: "magic" }, ...history]);
                setPrompt('');
            }
        } catch (err) {
            toast.error('Pulse wave disrupted by system interference');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['master-admin']}>
            <div className="space-y-10 pb-20 max-w-5xl mx-auto">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 rounded-full text-white text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                        <Activity size={14} className="text-primary" /> Active Connection: Master Admin
                    </div>
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter">Master Pulse</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2 italic">Global AI Logic Engine & Platform Dispatcher</p>
                </div>

                {/* Main Interaction Area */}
                <div className="bg-white rounded-[4rem] p-16 border border-slate-100 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-20 transition-opacity">
                        <Cpu size={200} />
                    </div>

                    <form onSubmit={handlePulse} className="relative z-10 space-y-10">
                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="What magic do you want to perform on the platform today?"
                                className="w-full h-48 bg-slate-50 border-none rounded-[3rem] p-12 text-xl font-bold placeholder:text-slate-300 placeholder:italic outline-none focus:ring-[12px] focus:ring-primary/5 transition-all shadow-inner resize-none"
                            />
                            <div className="absolute bottom-10 right-10 flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden md:block">Neural Link Active</span>
                                <button
                                    disabled={processing}
                                    className={cn(
                                        "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl",
                                        processing ? "bg-slate-100 text-slate-400" : "bg-slate-900 text-white hover:bg-primary hover:scale-110"
                                    )}
                                >
                                    {processing ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: 'Global Dispatch', desc: 'Notify all users instantly', icon: Globe },
                                { title: 'Feature Rollback', desc: 'Securely revert specific orgs', icon: ShieldAlert },
                                { title: 'Data Synthesis', desc: 'Generate reports with AI', icon: Database },
                            ].map((s, i) => (
                                <div key={i} className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-primary/20 transition-colors">
                                    <s.icon size={28} className="text-slate-400 mb-6" />
                                    <h4 className="text-sm font-black text-slate-800 mb-2">{s.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </form>
                </div>

                {/* Event History */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 italic">Pulse History Stream</h3>
                        <div className="h-px bg-slate-100 flex-1 mx-10 opacity-30" />
                    </div>

                    <div className="space-y-4">
                        {history.map(item => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 group-hover:text-primary transition-colors">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-600 line-clamp-1 italic">"{item.text}"</p>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 mt-1 block px-2 py-0.5 bg-slate-50 rounded-full w-fit">
                                            {item.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full">Executed</span>
                                    <span className="text-[10px] font-black text-slate-300 uppercase italic">0ms</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
