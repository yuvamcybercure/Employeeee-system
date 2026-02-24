"use client";

import React, { useState } from 'react';
import { X, Loader2, FileText, Calendar, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function PolicyModal({ isOpen, onClose, onSuccess }: PolicyModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'hr',
        status: 'active',
        version: '1.0'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/policies', formData);
            if (data.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error('Failed to create policy');
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
                        className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">New Policy</h3>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Corporate Governance</p>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Policy Title</label>
                                        <input
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g., Remote Work Protocol"
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                        >
                                            <option value="hr">Human Resources</option>
                                            <option value="it">Information Technology</option>
                                            <option value="security">Security</option>
                                            <option value="finance">Finance</option>
                                            <option value="leave">Leave Policy</option>
                                            <option value="code-of-conduct">Code of Conduct</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Policy Content (Markdown Supported)</label>
                                    <textarea
                                        required
                                        rows={8}
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Outline the policy details here..."
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-3xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-600 resize-none leading-relaxed"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                                        <Calendar size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Effective Immediately</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                                        <FileText size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Version 1.0 (Initial)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Publish Guidelines"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
