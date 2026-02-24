"use client";

import React, { useState } from 'react';
import { X, Loader2, AlertTriangle, Send, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    assetId: string;
    assetName: string;
}

export function ReportIssueModal({ isOpen, onClose, onSuccess, assetId, assetName }: ReportIssueModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        issueType: 'malfunction',
        priority: 'medium',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/assets/issues', {
                assetId,
                ...formData
            });

            if (data.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error('Failed to report issue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-red-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Report Problem</h3>
                                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-0.5">{assetName}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-400 transition-all shadow-sm"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Problem Type</label>
                                        <select
                                            required
                                            value={formData.issueType}
                                            onChange={e => setFormData({ ...formData, issueType: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-red-500/5 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                        >
                                            <option value="malfunction">Malfunction</option>
                                            <option value="damage">Physical Damage</option>
                                            <option value="software">Software Bug</option>
                                            <option value="lost">Lost / Stolen</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Severity</label>
                                        <select
                                            required
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-red-500/5 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                        >
                                            <option value="low">Low Impact</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High Priority</option>
                                            <option value="critical">Critical (Blindsided)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Explain the Issue</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe what happened or what's not working..."
                                        rows={4}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-3xl outline-none focus:ring-4 focus:ring-red-500/5 transition-all font-medium text-slate-600 resize-none"
                                    />
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <ShieldAlert className="text-orange-500 shrink-0" size={20} />
                                    <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wide leading-relaxed">
                                        Your report will be sent directly to the IT Administration team. They will contact you via your workplace email for further instructions.
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading || !formData.description}
                                    className="flex-1 py-5 bg-red-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <>Send Report <Send size={16} /></>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
