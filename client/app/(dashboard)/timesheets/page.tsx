"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Save,
    Plus,
    Trash2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Briefcase,
    Play,
    Pause,
    MoreVertical,
    Calendar as CalendarIcon,
    ChevronDown,
    Search,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { TaskModal } from '@/components/timesheet/TaskModal';
import { TaskDetailsModal } from '@/components/timesheet/TaskDetailsModal';
import { format } from 'date-fns';

export default function TimesheetsPage() {
    const { user, hasPermission } = useAuth();
    const [entries, setEntries] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [filters, setFilters] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        month: '',
        year: '',
        search: ''
    });

    const [timerOffsets, setTimerOffsets] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchInitialData();
        fetchStats();
    }, [filters, selectedEmployee]);

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'superadmin') {
            fetchEmployees();
        }
    }, [user]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimerOffsets(prev => {
                const newOffsets = { ...prev };
                entries.forEach(entry => {
                    if (entry.isRunning && entry.startTime) {
                        const diff = Date.now() - new Date(entry.startTime).getTime();
                        newOffsets[entry._id] = diff;
                    }
                });
                return newOffsets;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [entries]);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/users');
            setEmployees(res.data.users || []);
        } catch (err) {
            console.error('Failed to fetch employees');
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.date) queryParams.append('date', filters.date);
            if (filters.month) queryParams.append('month', filters.month);
            if (filters.year) queryParams.append('year', filters.year);
            if (filters.search) queryParams.append('search', filters.search);
            if (selectedEmployee) queryParams.append('userId', selectedEmployee);

            const [timesheetsRes, projectsRes] = await Promise.all([
                api.get(`/timesheets?${queryParams.toString()}`),
                api.get('/projects')
            ]);
            setEntries(timesheetsRes.data.timesheets || []);
            setProjects(projectsRes.data.projects || []);
        } catch (err) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (selectedEmployee) queryParams.append('userId', selectedEmployee);
            const res = await api.get(`/timesheets/stats?${queryParams.toString()}`);
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats');
        }
    };

    const toggleTimer = async (id: string, currentlyRunning: boolean) => {
        try {
            await api.patch(`/timesheets/${id}/timer`, { action: currentlyRunning ? 'stop' : 'start' });
            fetchInitialData();
            fetchStats();
        } catch (err) {
            console.error('Timer action failed');
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/timesheets/${id}`, { status });
            setEntries(entries.map(e => e._id === id ? { ...e, status } : e));
        } catch (err) {
            console.error('Status update failed');
        }
    };

    const formatDuration = (ms: number) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    return (
        <ProtectedRoute allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="space-y-10 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-[1000] text-slate-900 tracking-tight">Productivity Hub</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Manage your tasks and track real-time progress</p>
                        </div>
                        {isAdmin && (
                            <div className="hidden lg:block h-12 w-px bg-slate-200" />
                        )}
                        {isAdmin && (
                            <div className="hidden lg:flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Active Cluster</span>
                                <select
                                    className="bg-white border border-slate-100 px-4 py-2.5 rounded-xl text-xs font-black uppercase text-slate-600 outline-none focus:ring-4 focus:ring-primary/5 shadow-sm transition-all"
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                >
                                    <option value="">Full Team View</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus size={18} /> Add The Task
                    </button>
                </div>

                {/* Real-time Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500 text-primary">
                            <Clock size={80} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Today's Office Hours</p>
                        <h4 className="text-4xl font-[1000] tracking-tighter">
                            {formatDuration(stats?.todayTotalMs || 0)}
                        </h4>
                        <div className="mt-6 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-400">Live Counter</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-500">
                            <CheckCircle2 size={80} className="text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Work Done</p>
                        <h4 className="text-4xl font-[1000] text-slate-900 tracking-tighter">
                            {entries.filter(e => e.status === 'completed').length} <span className="text-lg font-black text-slate-300">Tasks</span>
                        </h4>
                        <div className="mt-6 w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-emerald-500 h-full transition-all duration-1000"
                                style={{ width: `${(entries.filter(e => e.status === 'completed').length / (entries.length || 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-500 text-primary">
                            <CalendarIcon size={80} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Monthly Hours (Reset)</p>
                        <h4 className="text-4xl font-[1000] text-slate-900 tracking-tighter">
                            {Math.floor((stats?.monthTotalMs || 0) / (1000 * 60 * 60))} <span className="text-lg font-black text-slate-300">Total Hrs</span>
                        </h4>
                        <p className="mt-6 text-[10px] font-bold text-slate-400">Resets in {30 - new Date().getDate()} days</p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-slate-50/50 p-4 rounded-[2rem] border border-slate-100 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            type="text"
                            placeholder="Find tasks or deliverables..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 transition-all text-xs font-bold text-slate-600 shadow-sm"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    {isAdmin && (
                        <select
                            className="px-4 py-3 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold text-slate-600 shadow-sm appearance-none cursor-pointer"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                            ))}
                        </select>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="px-4 py-3 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold text-slate-600 shadow-sm"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        />
                        <select
                            className="px-4 py-3 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold text-slate-600 shadow-sm appearance-none cursor-pointer"
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                        >
                            <option value="">Select Month</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={(i + 1).toString()}>{format(new Date(2000, i, 1), 'MMMM')}</option>
                            ))}
                        </select>
                        <select
                            className="px-4 py-3 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold text-slate-600 shadow-sm appearance-none cursor-pointer"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        >
                            <option value="">Select Year</option>
                            {[2024, 2025, 2026].map(y => <option key={y} value={y.toString()}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="bg-white rounded-[3rem] p-20 border border-slate-100 shadow-sm flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                <FileText size={48} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Focused & Ready?</h3>
                                <p className="text-slate-400 font-bold mt-2">No tasks logged for this period yet.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-primary transition-all shadow-lg"
                            >
                                Create First Task
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {entries.map((entry) => (
                                <motion.div
                                    key={entry._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setSelectedTask(entry)}
                                    className={cn(
                                        "bg-white rounded-[2.5rem] p-8 border hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden cursor-pointer",
                                        entry.isRunning ? "border-primary/20 bg-primary/5" : "border-slate-100"
                                    )}
                                >
                                    {entry.isRunning && (
                                        <div className="absolute top-0 right-0 p-3">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Running</span>
                                            </div>
                                        </div>
                                    )}

                                    {entry.collaborators && entry.collaborators.length > 0 && (
                                        <div className="absolute top-0 left-0 p-3">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                                                <Users size={10} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Shared Task</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                                                entry.isRunning ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                                            )}>
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                    {entry.projectId?.name || 'Assigned Project'}
                                                </p>
                                                <h3 className="text-lg font-black text-slate-900 tracking-tight">{entry.task}</h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTimer(entry._id, entry.isRunning);
                                                }}
                                                className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                                                    entry.isRunning
                                                        ? "bg-amber-500 text-white shadow-amber-500/20 rotate-0"
                                                        : "bg-emerald-500 text-white shadow-emerald-500/20 hover:scale-110 active:scale-95"
                                                )}
                                            >
                                                {entry.isRunning ? <Pause size={20} /> : <Play size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Logged</p>
                                            <p className="text-xl font-[1000] text-slate-900 tracking-tighter">
                                                {formatDuration((entry.totalMilliseconds || 0) + (timerOffsets[entry._id] || 0))}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 relative group cursor-pointer">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <select
                                                className="w-full bg-transparent text-xs font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                                                value={entry.status}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateStatus(entry._id, e.target.value);
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 bottom-4 text-slate-300 pointer-events-none" size={14} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-3">
                                                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden relative z-10 shadow-sm" title={`Creator: ${entry.userId?.name}`}>
                                                    <img src={entry.userId?.profilePhoto || "/avatars/default.png"} className="w-full h-full object-cover" />
                                                </div>
                                                {entry.collaborators?.map((collab: any, idx: number) => (
                                                    <div
                                                        key={collab._id}
                                                        className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden relative shadow-sm"
                                                        style={{ zIndex: 5 - idx }}
                                                        title={collab.name}
                                                    >
                                                        <img src={collab.profilePhoto || "/avatars/default.png"} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                {entry.collaborators?.length > 0 ? `${entry.userId?.name} + ${entry.collaborators.length}` : entry.userId?.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {entry.estimatedTime > 0 && (
                                                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                                                    Est: {entry.estimatedTime}hrs
                                                </span>
                                            )}
                                            <button className="text-slate-300 hover:text-slate-600 transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <TaskModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        fetchInitialData();
                        fetchStats();
                    }}
                    projects={projects}
                />

                <TaskDetailsModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    task={selectedTask}
                />
            </div>
        </ProtectedRoute>
    );
}
