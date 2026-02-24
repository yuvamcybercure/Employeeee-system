"use client";

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
    Users,
    MapPin,
    AlertCircle,
    TrendingUp,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    MoreVertical,
    Activity,
    ShieldCheck,
    Zap
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { cn } from '@/lib/utils';

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

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: overview } = await api.get('/attendance/overview');
            const { data: weekly } = await api.get('/attendance/weekly-summary');
            if (overview.success) setData(overview);
            if (weekly.success) setChartData(weekly.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const dashboardStats = [
        { label: "Attendance Rate", value: data ? Math.round((data.present / data.total) * 100) : 0, suffix: "%", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
        { label: "Late Entries", value: data?.late || 0, suffix: " members", icon: Clock, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
        { label: "Active Requests", value: data?.pending || 0, suffix: " pending", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-100" },
        { label: "Security Alerts", value: data?.ipConflicts?.length || 0, suffix: " conflicts", icon: ShieldCheck, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
    ];

    if (loading) return (
        <div className="h-[80vh] w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Optimizing View...</p>
            </div>
        </div>
    );

    return (
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-10 pb-10"
            >
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Team Operations</h1>
                        <p className="text-slate-500 font-bold mt-1">Real-time team performance and monitoring dashboard.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            Export Logs
                        </button>
                        <button className="px-6 py-3 premium-gradient rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover-scale">
                            System Check
                        </button>
                    </div>
                </motion.div>

                {/* Performance Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboardStats.map((stat, i) => (
                        <motion.div
                            variants={itemVariants}
                            key={i}
                            className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-between hover-scale border-white/50"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm", stat.bg, stat.color, stat.border)}>
                                    <stat.icon size={28} />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full font-black text-slate-400 uppercase">Live</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 mt-1">
                                    {stat.value}
                                    <span className="text-xs font-bold text-slate-400 ml-1.5">{stat.suffix}</span>
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Attendance Analysis */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-10 rounded-[3rem] border-white/40">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Weekly Engagement</h3>
                                <p className="text-sm font-bold text-slate-400 mt-1">Attendance percentage over the last 7 days</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                <TrendingUp size={16} /> +5.2% Growth
                            </div>
                        </div>

                        <div className="h-80 w-full px-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                                            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
                                        dy={10}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dx={-10} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                                    />
                                    <Bar dataKey="percentage" radius={[12, 12, 0, 0]} barSize={45}>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index === chartData.length - 1 ? 'url(#barGradient)' : '#e2e8f0'}
                                                className="transition-all duration-500"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Conflict & Security Hub */}
                    <motion.div variants={itemVariants} className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-3xl shadow-slate-900/20 flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-white/5 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
                            <Zap size={160} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-rose-400 shadow-inner">
                                    <AlertCircle size={28} />
                                </div>
                                <h3 className="text-xl font-black tracking-tight">Security Center</h3>
                            </div>

                            <div className="space-y-4">
                                {data?.ipConflicts?.length > 0 ? (
                                    data.ipConflicts.map((conflict: any, i: number) => (
                                        <div key={i} className="p-5 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-xl">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">IP Conflict</p>
                                                <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-black uppercase">Critical</span>
                                            </div>
                                            <p className="text-lg font-black tracking-widest tabular-nums">{conflict.ip}</p>
                                            <div className="flex -space-x-3 mt-4">
                                                {conflict.users.map((u: any, j: number) => (
                                                    <div key={j} className="w-10 h-10 rounded-2xl border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-lg" title={u.userId.name}>
                                                        <img src={u.userId.profilePhoto || `https://ui-avatars.com/api/?name=${u.userId.name}`} alt="" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-emerald-400/50 mb-6">
                                            <ShieldCheck size={40} />
                                        </div>
                                        <p className="text-slate-400 font-bold text-sm leading-relaxed px-4">No security threats detected. System is running at peak integrity.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button className="mt-auto w-full py-5 premium-gradient rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover-scale">
                            System Hardening
                        </button>
                    </motion.div>
                </div>

                {/* Team Tracking Table */}
                <motion.div variants={itemVariants} className="glass-card rounded-[3.5rem] border-white/40 overflow-hidden">
                    <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/50">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Today's Pulse</h3>
                            <p className="text-sm font-bold text-slate-400 mt-1">Live team attendance and check-in statuses</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search identity..."
                                className="w-full pl-12 pr-6 py-4 bg-white/50 border border-slate-200 rounded-[1.5rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clock In</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Origin (IP)</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data?.records?.map((record: any) => (
                                    <tr key={record._id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm p-1">
                                                    <img src={record.userId.profilePhoto || `https://ui-avatars.com/api/?name=${record.userId.name}`} alt="" className="w-full h-full object-cover rounded-xl" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 tracking-tight">{record.userId.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{record.userId.department || 'General'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                record.status === 'present' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    record.status === 'late' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        record.status === 'pending' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-slate-300" />
                                                <p className="text-sm font-black text-slate-900 tabular-nums">{new Date(record.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2">
                                                <Activity size={14} className="text-slate-300" />
                                                <p className="text-xs text-slate-500 font-bold tracking-widest tabular-nums">{record.clockIn.ip}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button className="p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </ProtectedRoute>
    );
}
