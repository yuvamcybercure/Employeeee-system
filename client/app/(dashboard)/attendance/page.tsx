"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layout';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import {
    Download,
    Calendar,
    CheckCircle2,
    AlertCircle,
    User,
    Clock,
    Search,
    Filter,
    MapPin,
    Activity
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import api from '@/lib/api';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function AttendancePage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const endpoint = user?.role === 'employee' ? '/attendance/history' : '/attendance/overview';
            const { data } = await api.get(endpoint);
            if (data.success) {
                if (user?.role === 'employee') setHistory(data.history);
                else setHistory(data.records || []);
            }
        } catch (err) {
            console.error('Failed to fetch attendance data');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: "Optimal Rate", value: "94%", detail: "Avg. On-Time", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: "Active Cycles", value: "22", detail: "Monthly Days", icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-50" },
        { label: "Anomalies", value: "2", detail: "Late Arrivals", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
    ];

    return (
        <DashboardLayout allowedRoles={['employee', 'admin', 'superadmin']}>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-12 pb-20"
            >
                {/* Custom Header */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Attendance Log</h1>
                        <p className="text-slate-500 font-bold mt-3 text-lg">Integrated verification, location auditing, and performance tracking.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-sm hover:bg-slate-50 transition-all text-slate-600">
                            <Download size={18} /> Export Analytics
                        </button>
                    </div>
                </motion.div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            variants={itemVariants}
                            key={i}
                            className="glass-card p-8 rounded-[2.5rem] border-white/50 flex items-center gap-6 hover-scale group"
                        >
                            <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center border shadow-sm transition-transform duration-500 group-hover:scale-110", stat.bg, stat.color, "border-white/20")}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 mt-1 tabular-nums">{stat.value}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{stat.detail}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Unified Table Module */}
                <motion.div variants={itemVariants} className="glass-card rounded-[3.5rem] border-white/40 overflow-hidden shadow-2xl">
                    <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/50">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Access History</h3>
                            <p className="text-sm font-bold text-slate-400 mt-1">Detailed verification logs with timestamp and geofencing.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                                <Filter size={20} />
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search history..."
                                    className="pl-12 pr-6 py-4 bg-white/50 border border-slate-200 rounded-[1.5rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all w-full md:w-64"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user?.role === 'employee' ? 'Cycle Date' : 'Employee Identity'}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Check-In</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Check-Out</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user?.role === 'employee' ? 'Utilization' : 'Origin Protocol'}</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="animate-pulse h-24">
                                            <td colSpan={5} className="px-10"><div className="h-4 bg-slate-100 rounded-full w-full" /></td>
                                        </tr>
                                    ))
                                ) : history.length > 0 ? (
                                    history.map(log => (
                                        <tr key={log._id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-10 py-6">
                                                {user?.role === 'employee' ? (
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="text-slate-300" size={16} />
                                                        <span className="text-sm font-black text-slate-700">{formatDate(log.date)}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 p-1 shadow-sm">
                                                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black uppercase text-xs rounded-xl">
                                                                {log.userId?.name?.charAt(0)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-800 tracking-tight leading-none">{log.userId?.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] mt-1.5">{log.userId?.employeeId || 'EMP-X'}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="text-indigo-300" size={14} />
                                                    <span className="text-xs font-black text-slate-600 tabular-nums">{log.clockIn?.time ? new Date(log.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="text-rose-300" size={14} />
                                                    <span className="text-xs font-black text-slate-600 tabular-nums">{log.clockOut?.time ? new Date(log.clockOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                {user?.role === 'employee' ? (
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="text-primary/50" size={14} />
                                                        <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">{log.totalHours || '0'}h Recorded</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><MapPin size={12} className="text-rose-400" /> {log.clockIn?.ip || 'Internal'}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{log.clockIn?.device?.split(' ')[0] || 'Desktop'} Proxy</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <span className={cn(
                                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                    (log.status === 'Present' || log.status === 'present') ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                                )}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-300">
                                                <Activity size={48} className="opacity-20" />
                                                <p className="font-black uppercase tracking-[0.2em] text-xs">No protocol entries detected</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </DashboardLayout>
    );
}
