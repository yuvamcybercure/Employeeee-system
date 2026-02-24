"use client";

import React, { useState } from 'react';
import { X, Calendar, MessageSquare, Loader2, Send, FilePlus } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface LeaveDialogProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function LeaveDialog({ onClose, onSuccess }: LeaveDialogProps) {
    const [formData, setFormData] = useState({
        type: 'sick',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate || !formData.reason) {
            return setError('Please fill in all fields');
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/leaves', formData);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Apply for Leave</h2>
                            <p className="text-slate-500 text-sm font-medium">Plan your time off and get approvals.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2">
                            <X size={18} /> {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Leave Type</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {['sick', 'casual', 'wfh', 'unpaid'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={cn(
                                        "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                        formData.type === type
                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                            : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Start Date</label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">End Date</label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Reason / Remarks</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-4 top-4 text-slate-400" size={18} />
                            <textarea
                                required
                                rows={3}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none"
                                placeholder="Briefly explain the reason for your leave..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <FilePlus size={18} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-700">Medical Certificate / Proof</p>
                                <p className="text-[10px] text-slate-400 font-medium">Optional attachment (Max 5MB)</p>
                            </div>
                        </div>
                        <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Upload</button>
                    </div>
                </form>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Submit Request</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
