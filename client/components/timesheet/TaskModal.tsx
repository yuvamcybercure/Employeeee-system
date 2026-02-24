"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, FileText, Clock, Calendar, CheckCircle2, Loader2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projects: any[];
}

export function TaskModal({ isOpen, onClose, onSuccess, projects }: TaskModalProps) {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        projectId: '',
        task: '',
        description: '',
        estimatedTime: '',
        date: new Date().toISOString().split('T')[0],
        collaborators: [] as string[]
    });

    React.useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/users');
            setEmployees(res.data.users || []);
        } catch (err) {
            console.error('Failed to fetch employees');
        }
    };

    const toggleCollaborator = (userId: string) => {
        setFormData(prev => ({
            ...prev,
            collaborators: prev.collaborators.includes(userId)
                ? prev.collaborators.filter(id => id !== userId)
                : [...prev.collaborators, userId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/timesheets', {
                ...formData,
                estimatedTime: parseFloat(formData.estimatedTime) || 0
            });
            onSuccess();
            onClose();
            setFormData({
                projectId: '',
                task: '',
                description: '',
                estimatedTime: '',
                date: new Date().toISOString().split('T')[0],
                collaborators: []
            });
        } catch (err) {
            console.error('Failed to create task');
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
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <CheckCircle2 size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create New Task</h2>
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest text-[10px]">Log your productivity & collaborate</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-2xl transition-all text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <select
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-600 appearance-none"
                                                value={formData.projectId}
                                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                            >
                                                <option value="">Select a project</option>
                                                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Name</label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                required
                                                type="text"
                                                placeholder="What are you working on?"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-600 placeholder:text-slate-300"
                                                value={formData.task}
                                                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Est. Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    placeholder="0.0"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-600 placeholder:text-slate-300"
                                                    value={formData.estimatedTime}
                                                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    required
                                                    type="date"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-600"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Collaborators</label>
                                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 min-h-[140px] max-h-[140px] overflow-y-auto">
                                            <div className="grid grid-cols-2 gap-2">
                                                {employees.map(user => (
                                                    <button
                                                        key={user._id}
                                                        type="button"
                                                        onClick={() => toggleCollaborator(user._id)}
                                                        className={cn(
                                                            "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-left",
                                                            formData.collaborators.includes(user._id)
                                                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                                : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                                                        )}
                                                    >
                                                        <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                                                            <img src={user.profilePhoto || "/avatars/default.png"} className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-tight truncate">{user.name.split(' ')[0]}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Details</label>
                                        <textarea
                                            placeholder="What's the goal?"
                                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-600 placeholder:text-slate-300 min-h-[100px] resize-none text-xs"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-5 bg-primary text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Log Task & Start Productivity</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
