"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, User, Mail, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminResetRequests() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/auth/reset-requests');
            if (data.success) setRequests(data.requests);
        } catch (err) {
            console.error('Failed to fetch reset requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        setProcessingId(id);
        try {
            const { data } = await api.post(`/auth/process-reset/${id}`, { status });
            if (data.success) {
                setRequests(prev => prev.filter(req => req._id !== id));
            }
        } catch (err) {
            console.error('Failed to process request');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Pending Reset Requests</h3>
                <span className="px-4 py-1.5 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {requests.length} Requests
                </span>
            </div>

            {requests.length === 0 ? (
                <div className="p-10 text-center glass-card rounded-[2rem] border-dashed border-2 border-slate-200">
                    <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No pending password reset requests.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {requests.map((req) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={req._id}
                                className="glass-card p-6 rounded-[2rem] flex items-center justify-between group hover:border-primary/30 transition-all border-white/50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-slate-900">{req.userId?.name}</p>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase tracking-tighter">
                                                {req.userId?.role}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400 text-xs font-bold mt-1">
                                            <span className="flex items-center gap-1"><Mail size={12} /> {req.email}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(req.requestedAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="mt-2 text-[10px] font-bold text-slate-500">
                                            New PW: <span className="text-primary font-black italic">{req.newPassword}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAction(req._id, 'approved')}
                                        disabled={!!processingId}
                                        className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                                    >
                                        {processingId === req._id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleAction(req._id, 'rejected')}
                                        disabled={!!processingId}
                                        className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10 disabled:opacity-50"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
