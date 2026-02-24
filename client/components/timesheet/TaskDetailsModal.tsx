"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, FileText, CheckCircle2, History, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskDetailsModalProps {
    task: any;
    isOpen: boolean;
    onClose: () => void;
}

export function TaskDetailsModal({ task, isOpen, onClose }: TaskDetailsModalProps) {
    if (!task) return null;

    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <FileText size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{task.task}</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.projectId?.name || 'Internal Project'}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-2xl transition-all text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-12">
                            {/* Stats Overview */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock size={12} /> Time Logged
                                    </p>
                                    <p className="text-xl font-black text-slate-800">{formatDuration(task.totalMilliseconds || 0)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={12} /> Created On
                                    </p>
                                    <p className="text-xl font-black text-slate-800">{format(new Date(task.createdAt), 'MMM dd, yyyy')}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 size={12} /> Status
                                    </p>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block w-fit",
                                        task.status === 'completed' ? "bg-emerald-100 text-emerald-600" :
                                            task.status === 'in_progress' ? "bg-amber-100 text-amber-600" :
                                                "bg-slate-100 text-slate-600"
                                    )}>
                                        {task.status.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    Description <div className="h-px flex-1 bg-slate-100" />
                                </h4>
                                <p className="text-slate-600 font-bold leading-relaxed bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                    {task.description || "No description provided for this task."}
                                </p>
                            </div>

                            {/* Collaborators */}
                            {task.collaborators && task.collaborators.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                        Team Members <div className="h-px flex-1 bg-slate-100" />
                                    </h4>
                                    <div className="flex flex-wrap gap-4">
                                        {task.collaborators.map((user: any) => (
                                            <div key={user._id} className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                                    <img src={user.profilePhoto || "/avatars/default.png"} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{user.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Logs / History */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    Activity Logs <div className="h-px flex-1 bg-slate-100" />
                                </h4>
                                <div className="space-y-4">
                                    {task.logs && task.logs.length > 0 ? task.logs.map((log: any, idx: number) => (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                    <History size={16} />
                                                </div>
                                                {idx !== task.logs.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1" />}
                                            </div>
                                            <div className="pb-8">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{log.action}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">{format(new Date(log.timestamp), 'hh:mm a')}</span>
                                                </div>
                                                <p className="text-sm text-slate-500 font-bold">{log.note}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-slate-400 font-bold text-center py-10">No logs recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20">
                                    <img src={task.userId?.profilePhoto || "/avatars/default.png"} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned To</p>
                                    <p className="text-sm font-black">{task.userId?.name}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
