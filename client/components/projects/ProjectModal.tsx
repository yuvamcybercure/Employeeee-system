"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, FileText, Calendar, CheckCircle2, Loader2, Users, Target, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ProjectModal({ isOpen, onClose, onSuccess }: ProjectModalProps) {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        client: '',
        managerId: '',
        teamMembers: [] as string[],
        status: 'planning',
        priority: 'medium',
        startDate: '',
        endDate: '',
        budget: ''
    });

    useEffect(() => {
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

    const toggleMember = (userId: string) => {
        setFormData(prev => ({
            ...prev,
            teamMembers: prev.teamMembers.includes(userId)
                ? prev.teamMembers.filter(id => id !== userId)
                : [...prev.teamMembers, userId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/projects', {
                ...formData,
                budget: parseFloat(formData.budget) || 0
            });
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                name: '',
                description: '',
                client: '',
                managerId: '',
                teamMembers: [],
                status: 'planning',
                priority: 'medium',
                startDate: '',
                endDate: '',
                budget: ''
            });
        } catch (err) {
            console.error('Failed to create project', err);
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
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                    <Briefcase size={28} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-[1000] text-slate-900 tracking-tight">Initialize Project</h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Deploy fresh capital, teams & intelligence</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:rotate-90 duration-300">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Left Column: Core Info */}
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Name</label>
                                        <div className="relative group">
                                            <Target className="absolute left-5 top-5 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                                            <input
                                                required
                                                type="text"
                                                placeholder="Enter mission title..."
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] outline-none focus:ring-8 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all font-bold text-slate-600 placeholder:text-slate-300"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                                            <select
                                                className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] outline-none focus:bg-white transition-all font-bold text-slate-600 appearance-none cursor-pointer"
                                                value={formData.priority}
                                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                            <select
                                                className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] outline-none focus:bg-white transition-all font-bold text-slate-600 appearance-none cursor-pointer"
                                                value={formData.status}
                                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="planning">Planning</option>
                                                <option value="active">Active</option>
                                                <option value="on-hold">On Hold</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                        <textarea
                                            placeholder="Outline the parameters, goals, and core deliverables..."
                                            className="w-full p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] outline-none focus:bg-white transition-all font-bold text-slate-600 placeholder:text-slate-300 min-h-[150px] resize-none text-sm"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                            <input
                                                type="date"
                                                className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] transition-all font-bold text-slate-600"
                                                value={formData.startDate}
                                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                            <input
                                                type="date"
                                                className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] transition-all font-bold text-slate-600"
                                                value={formData.endDate}
                                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Team & Assignment */}
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Manager</label>
                                        <div className="relative group">
                                            <Zap className="absolute left-5 top-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                                            <select
                                                required
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] outline-none focus:bg-white transition-all font-bold text-slate-600 appearance-none cursor-pointer"
                                                value={formData.managerId}
                                                onChange={e => setFormData({ ...formData, managerId: e.target.value })}
                                            >
                                                <option value="">Select Lead...</option>
                                                {employees.map(emp => (
                                                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Cluster</label>
                                            <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full">{formData.teamMembers.length} Selected</span>
                                        </div>
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-6 max-h-[350px] overflow-y-auto custom-scrollbar">
                                            <div className="grid grid-cols-1 gap-3">
                                                {employees.map(emp => (
                                                    <button
                                                        key={emp._id}
                                                        type="button"
                                                        onClick={() => toggleMember(emp._id)}
                                                        className={cn(
                                                            "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group/item",
                                                            formData.teamMembers.includes(emp._id)
                                                                ? "bg-white border-primary/20 shadow-lg shadow-primary/5 translate-x-1"
                                                                : "bg-white border-transparent hover:border-slate-200"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                                {emp.profilePhoto ? (
                                                                    <img src={emp.profilePhoto} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-400">
                                                                        {emp.name[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-xs font-black text-slate-800 leading-none">{emp.name}</p>
                                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{emp.department || 'General'}</p>
                                                            </div>
                                                        </div>
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                            formData.teamMembers.includes(emp._id)
                                                                ? "bg-primary border-primary text-white scale-110"
                                                                : "border-slate-100 text-transparent group-hover/item:border-slate-200"
                                                        )}>
                                                            <CheckCircle2 size={14} />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Allocation (Budget)</label>
                                        <div className="relative group">
                                            <Target className="absolute left-5 top-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] outline-none focus:bg-white transition-all font-bold text-slate-600 appearance-none"
                                                value={formData.budget}
                                                onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="p-8 border-t border-slate-50 bg-white sticky bottom-0 flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 hover:text-slate-600 transition-all"
                            >
                                Discard
                            </button>
                            <button
                                disabled={loading || !formData.name || !formData.managerId}
                                onClick={handleSubmit}
                                className="flex-[2] py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/20 hover:bg-primary hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                        <Zap size={18} /> Initialize Deploy
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
