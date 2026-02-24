"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Building2, Globe, Palette, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrgSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OrgSettingsModal({ isOpen, onClose }: OrgSettingsModalProps) {
    const { user, refreshUser } = useAuth();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.organizationId) {
            setName(user.organizationId.name);
            setSlug(user.organizationId.slug);
        }
    }, [user, isOpen]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.organizationId?._id) return;

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const { data } = await api.patch(`/organization/${user.organizationId._id}`, {
                name,
                slug: slug.toLowerCase().replace(/\s+/g, '-')
            });

            if (data.success) {
                setSuccess(true);
                await refreshUser();
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl border border-white/20"
                    >
                        {/* Header */}
                        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Building2 size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Org Config</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Global Identity</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-12 h-12 rounded-2xl hover:bg-slate-200/50 flex items-center justify-center text-slate-400 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSave} className="p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Building2 size={14} /> Organization Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 font-bold"
                                        placeholder="Enter Organization Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Globe size={14} /> System Slug
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 font-bold"
                                            placeholder="org-slug"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Auto-Generated</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 ml-4 italic">Used for internal routing and unique identification.</p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2">
                                    <ShieldAlert size={16} /> {error}
                                </div>
                            )}

                            {/* Footer / Actions */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className={cn(
                                        "w-full py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl",
                                        success
                                            ? "bg-emerald-500 text-white shadow-emerald-500/30"
                                            : "bg-slate-900 text-white shadow-slate-900/30 hover:scale-[1.02] active:scale-[0.98]"
                                    )}
                                >
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : success ? (
                                        <><CheckCircle2 size={20} /> Identity Secured</>
                                    ) : (
                                        <><Save size={20} /> Pulse Identity</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Re-using styles but keep it clean
const ShieldAlert = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
