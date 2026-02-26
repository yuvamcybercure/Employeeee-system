"use client";

import React, { useState, useEffect, use } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    ChevronLeft,
    Plus,
    MoreHorizontal,
    MessageCircle,
    Paperclip,
    Clock,
    Layout,
    List,
    Calendar,
    Loader2,
    Users,
    Zap,
    ChevronRight,
    Briefcase
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function KanbanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [addingTaskTo, setAddingTaskTo] = useState<string | null>(null);
    const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });
    const [view, setView] = useState<'board' | 'list'>('board');
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const { data } = await api.get(`/projects/${id}`);
            if (data.success) setProject(data.project);
        } catch (err) {
            console.error('Failed to fetch project');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (status: string) => {
        if (!newTask.title) return;
        try {
            const { data } = await api.post(`/projects/${id}/tasks`, {
                ...newTask,
                status
            });
            if (data.success) {
                setProject(data.project);
                setAddingTaskTo(null);
                setNewTask({ title: '', priority: 'medium' });
            }
        } catch (err) {
            console.error('Failed to add task');
        }
    };

    const handleAddComment = async (taskId: string) => {
        if (!comment.trim()) return;
        try {
            const { data } = await api.post(`/projects/${id}/tasks/${taskId}/comments`, {
                text: comment
            });
            if (data.success) {
                setProject(data.project);
                setComment('');
                // Update selected task to show new comment
                const updatedTask = data.project.tasks.find((t: any) => t._id === taskId);
                setSelectedTask(updatedTask);
            }
        } catch (err) {
            console.error('Failed to add comment');
        }
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (!project) return (
        <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
            <Layout size={60} strokeWidth={1} />
            <p className="font-black uppercase tracking-widest text-xs">Project Not Found</p>
            <Link href="/projects" className="text-primary font-bold hover:underline">Return to Core</Link>
        </div>
    );

    const columns = [
        { id: 'todo', title: 'To Do', color: 'bg-slate-400' },
        { id: 'in-progress', title: 'In Progress', color: 'bg-amber-500' },
        { id: 'review', title: 'Review', color: 'bg-primary' },
        { id: 'done', title: 'Done', color: 'bg-emerald-500' }
    ];

    return (
        <ProtectedRoute allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="flex flex-col space-y-12 relative pb-20">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <Link href="/projects" className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-primary/20 hover:text-primary transition-all group">
                            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl font-[1000] text-slate-900 tracking-tight">{project.name}</h1>
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                    project.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                )}>
                                    {project.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 mt-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    <span>Lead: {project.managerId?.name}</span>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 border-l border-slate-200 pl-6">
                                    <Users size={16} className="text-primary" />
                                    <span>{project.teamMembers?.length || 0} Cluster Members</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm self-start">
                        <button
                            onClick={() => setView('board')}
                            className={cn(
                                "px-6 py-3 rounded-xl text-[11px] font-[1000] uppercase tracking-wider transition-all flex items-center gap-2.5",
                                view === 'board' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-105" : "text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            <Layout size={16} /> Kanban Board
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={cn(
                                "px-6 py-3 rounded-xl text-[11px] font-[1000] uppercase tracking-wider transition-all flex items-center gap-2.5",
                                view === 'list' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-105" : "text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            <List size={16} /> Registry View
                        </button>
                    </div>
                </div>

                {/* View Content */}
                {view === 'board' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 pb-12">
                        {columns.map(column => {
                            const tasks = project.tasks?.filter((t: any) => t.status === column.id) || [];
                            return (
                                <div key={column.id} className="flex flex-col space-y-6">
                                    <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#f8fafc]/80 backdrop-blur-md z-20 rounded-2xl border border-slate-100 shadow-sm mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-3 h-3 rounded-full shadow-sm", column.color)} />
                                            <h4 className="font-black text-slate-900 tracking-wider uppercase text-[11px]">{column.title}</h4>
                                            <span className="px-2.5 py-0.5 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-500 shadow-sm">
                                                {tasks.length}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setAddingTaskTo(column.id)}
                                            className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all shadow-sm active:scale-95"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <AnimatePresence>
                                            {addingTaskTo === column.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-white p-6 rounded-[2.5rem] border-2 border-primary/20 shadow-2xl"
                                                >
                                                    <input
                                                        autoFocus
                                                        placeholder="Task identity..."
                                                        className="w-full bg-transparent border-none outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm mb-4"
                                                        value={newTask.title}
                                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                                        onKeyDown={e => e.key === 'Enter' && handleAddTask(column.id)}
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <select
                                                            className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                                                            value={newTask.priority}
                                                            onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                                        >
                                                            <option value="low">Low</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="high">High</option>
                                                        </select>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setAddingTaskTo(null)}
                                                                className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleAddTask(column.id)}
                                                                className="px-5 py-2 bg-primary text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                                            >
                                                                Deploy
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {tasks.map((task: any) => (
                                            <motion.div
                                                key={task._id}
                                                layout
                                                onClick={() => setSelectedTask(task)}
                                                className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500 cursor-pointer group relative overflow-hidden"
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[8px] font-[1000] uppercase tracking-[0.15em] shadow-sm",
                                                        task.priority === 'high' ? "bg-red-50 text-red-600" : task.priority === 'medium' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                                                    )}>
                                                        {task.priority}
                                                    </span>
                                                    <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-50 rounded-xl transition-all"><MoreHorizontal size={14} /></button>
                                                </div>
                                                <h5 className="font-black text-slate-800 leading-tight mb-3 text-[15px] tracking-tight group-hover:text-primary transition-colors">{task.title}</h5>
                                                <p className="text-[11px] text-slate-400 line-clamp-2 font-bold leading-relaxed mb-6 italic opacity-80">{task.description || "Segmented task parameters nested within the implementation layer."}</p>

                                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                                    <div className="flex -space-x-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-900 border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm" title={`Creator: ${task.createdBy?.email}`}>
                                                            {task.createdBy?.name?.[0]}
                                                        </div>
                                                        {task.assignedTo && (
                                                            <div className="w-9 h-9 rounded-xl bg-primary border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm" title={`Assigned: ${task.assignedTo?.email}`}>
                                                                {task.assignedTo?.name?.[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-slate-300">
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                                                            <MessageCircle size={14} className="text-primary/40" />
                                                            <span className="text-[10px] font-black text-slate-900">{task.comments?.length || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-slate-400">
                                                            <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[80px] lowercase opacity-50">{task.createdBy?.email?.split('@')[0]}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {tasks.length === 0 && !addingTaskTo && (
                                            <div className="py-16 flex flex-col items-center justify-center gap-5 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200 grayscale opacity-40">
                                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <Layout size={24} strokeWidth={1.5} className="text-slate-400" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Registry Idle</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="grid grid-cols-12 p-6 border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div className="col-span-4 px-4">Identify Task</div>
                            <div className="col-span-2 text-center">Creator</div>
                            <div className="col-span-2 text-center">Stakeholder</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-2 text-center">Priority</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {(project.tasks || []).length > 0 ? (
                                project.tasks.map((task: any) => (
                                    <div
                                        key={task._id}
                                        onClick={() => setSelectedTask(task)}
                                        className="grid grid-cols-12 items-center p-6 border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                    >
                                        <div className="col-span-4 px-4">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/10",
                                                    task.status === 'done' ? "bg-emerald-500" : task.status === 'review' ? "bg-primary" : task.status === 'in-progress' ? "bg-amber-500" : "bg-slate-400"
                                                )}>
                                                    <Briefcase size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm tracking-tight">{task.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{task.description || "Deploying resource parameters..."}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex justify-center text-[10px] font-bold text-slate-400">
                                            {task.createdBy?.email?.split('@')[0]}
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                    {task.assignedTo?.name?.[0] || '?'}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 hidden lg:inline">{task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                task.status === 'done' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                            )}>
                                                {task.status?.replace('-', ' ')}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                                task.priority === 'high' ? "bg-red-50 text-red-600" : task.priority === 'medium' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                                            )}>
                                                {task.priority || 'Medium'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-4 py-32 opacity-20">
                                    <List size={60} strokeWidth={1} />
                                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Registry Empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Task Details & Collaboration Modal */}
                <AnimatePresence>
                    {selectedTask && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedTask(null)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
                            >
                                {/* Modal Header */}
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                            <MessageCircle size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Collaboration Hub</h2>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5">Project Tactical Node</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTask(null)}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900"
                                    >
                                        <Plus className="rotate-45" size={28} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                                        {/* Left Column: Task Info */}
                                        <div className="lg:col-span-5 p-8 lg:border-r border-slate-50 bg-slate-50/30">
                                            <div className="space-y-8">
                                                <div>
                                                    <span className={cn(
                                                        "px-4 py-1.5 rounded-full text-[10px] font-[1000] uppercase tracking-widest shadow-sm border mb-6 inline-block",
                                                        selectedTask.priority === 'high' ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                                    )}>
                                                        {selectedTask.priority} Priority
                                                    </span>
                                                    <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter mb-4">{selectedTask.title}</h3>
                                                    <p className="text-slate-500 font-medium leading-relaxed text-sm">{selectedTask.description || "Project node implementation parameters and strategic objectives."}</p>
                                                </div>

                                                <div className="pt-8 border-t border-slate-200/50">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Task Architect</p>
                                                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-slate-900/20">
                                                            {selectedTask.createdBy?.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900">{selectedTask.createdBy?.name}</p>
                                                            <p className="text-[11px] font-bold text-slate-400 lowercase">{selectedTask.createdBy?.email}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Implementation Status</p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-3 py-1 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-600">{selectedTask.status}</span>
                                                        <Clock size={14} className="text-slate-300" />
                                                        <span className="text-[10px] font-bold text-slate-400">Created {new Date(selectedTask.createdAt || project.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Activity Feed */}
                                        <div className="lg:col-span-7 p-8 flex flex-col bg-white">
                                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Activity Stream</h4>
                                                <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500">{selectedTask.comments?.length || 0} Logs</span>
                                            </div>

                                            <div className="flex-1 space-y-8 min-h-[300px]">
                                                {selectedTask.comments?.map((c: any, i: number) => (
                                                    <div key={i} className="group flex gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                            {c.userId?.name?.[0]}
                                                        </div>
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[11px] font-black text-slate-900 leading-none">{c.userId?.name}</span>
                                                                    <span className="text-[9px] font-bold text-slate-400 lowercase mt-0.5">{c.userId?.email}</span>
                                                                </div>
                                                                <span className="text-[9px] font-black text-slate-200 uppercase tracking-tighter tabular-nums">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-4 rounded-2xl rounded-tl-none border border-slate-50 group-hover:border-primary/10 group-hover:bg-white transition-all shadow-sm">
                                                                {c.text}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!selectedTask.comments || selectedTask.comments.length === 0) && (
                                                    <div className="py-20 flex flex-col items-center justify-center gap-6 text-center opacity-30">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-dashed border-slate-300">
                                                            <MessageCircle size={32} />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">No signals detected in this cluster</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer: Input */}
                                <div className="p-8 border-t border-slate-100 bg-white/80 backdrop-blur-md">
                                    <div className="flex items-center gap-4 bg-slate-50 p-2.5 border border-slate-200 rounded-[2rem] shadow-sm focus-within:border-primary/30 focus-within:bg-white transition-all group lg:mx-auto lg:max-w-2xl">
                                        <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-primary shadow-sm border border-slate-100">
                                            {user?.name?.[0]}
                                        </div>
                                        <input
                                            placeholder="Transmit message to cluster..."
                                            className="flex-1 bg-transparent px-4 text-sm font-bold placeholder:text-slate-300 outline-none"
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddComment(selectedTask._id)}
                                        />
                                        <button
                                            onClick={() => handleAddComment(selectedTask._id)}
                                            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all group-hover:rotate-12"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    );
}
