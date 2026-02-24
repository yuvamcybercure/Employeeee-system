"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
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
    Activity,
    Users,
    ChevronRight,
    RefreshCcw,
    Eye
} from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import api from '@/lib/api';
import { AttendanceDetailsModal } from '@/components/AttendanceDetailsModal';

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

const formatAttendanceDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    return { day, month, weekday };
};

export default function AttendancePage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';

    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        present: 0,
        absent: 0,
        late: 0,
        leaves: 0,
        totalDays: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [filter, setFilter] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const [selectedLog, setSelectedLog] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = `?month=${filter.month}&year=${filter.year}`;

            // Fetch history
            const historyRes = await api.get(`/attendance/history${queryParams}`);
            if (historyRes.data.success) {
                setHistory(historyRes.data.records || []);
            }

            // Fetch Overview/Stats
            const overviewRes = await api.get(`/attendance/overview${queryParams}`);
            if (overviewRes.data.success) {
                setStats(overviewRes.data.stats || {});
                if (isAdmin) {
                    // Admin view usually uses overview records which are daily or per-employee entries
                    // For the "Attendance History" table, we use the records from history endpoint 
                    // which we already fetched above.
                }
            }
        } catch (err) {
            console.error('Failed to fetch attendance data', err);
        } finally {
            setLoading(false);
        }
    }, [filter, isAdmin]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const statCards = [
        { label: "PRESENT", value: stats.present || 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", borderColor: "border-emerald-100" },
        { label: "ABSENT", value: stats.absent || 0, icon: User, color: "text-rose-500", bg: "bg-rose-50", borderColor: "border-rose-100" },
        { label: "LATE", value: stats.late || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-50", borderColor: "border-amber-100" },
        { label: "LEAVES", value: stats.leaves || 0, icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-50", borderColor: "border-blue-100" },
        { label: "TOTAL DAYS", value: stats.totalDays || 0, icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-50", borderColor: "border-indigo-100" },
    ];

    const filteredHistory = history.filter(item =>
        (item.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.date || '').includes(searchQuery)
    );

    return (
        <ProtectedRoute allowedRoles={['employee', 'admin', 'superadmin']}>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-10 pb-20"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            {isAdmin ? 'Organization Attendance' : 'My Attendance Logs'}
                        </h1>
                        <p className="text-slate-500 font-bold mt-1">
                            {isAdmin ? 'Monitor global employee activity and attendance trends.' : 'Detailed view of your daily work protocols and hours.'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all text-slate-600">
                            <Download size={16} /> Export Data
                        </button>
                    </div>
                </motion.div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {statCards.map((stat, i) => (
                        <motion.div
                            variants={itemVariants}
                            key={i}
                            className={cn(
                                "p-6 rounded-[2rem] border bg-white flex flex-col gap-4 hover-scale shadow-sm transition-all",
                                stat.borderColor
                            )}
                        >
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm", stat.bg, stat.color)}>
                                <stat.icon size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* History Table Module */}
                <motion.div variants={itemVariants} className="glass-card rounded-[3rem] border-white/40 overflow-hidden shadow-xl bg-white/40 backdrop-blur-md">
                    <div className="p-8 border-b border-slate-100/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Attendance History</h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Year Filter */}
                            <select
                                value={filter.year}
                                onChange={(e) => setFilter(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>

                            {/* Month Filter */}
                            <select
                                value={filter.month}
                                onChange={(e) => setFilter(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>

                            {/* Refresh */}
                            <button
                                onClick={fetchData}
                                className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-colors"
                            >
                                <RefreshCcw size={18} className={cn(loading && "animate-spin")} />
                            </button>

                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search history..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    {isAdmin && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>}
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check In</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check Out</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Timesheet</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white/30">
                                <AnimatePresence mode='wait'>
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={`shimmer-${i}`} className="animate-pulse">
                                                <td colSpan={isAdmin ? 8 : 7} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded-lg w-full" /></td>
                                            </tr>
                                        ))
                                    ) : filteredHistory.length > 0 ? (
                                        filteredHistory.map((log, idx) => {
                                            const { day, month, weekday } = formatAttendanceDate(log.date);
                                            const isLate = log.status === 'late' || log.status === 'Late Coming';
                                            const isSunday = log.status === 'Sunday';
                                            const isCheckedIn = log.clockIn && !log.clockOut?.time;

                                            return (
                                                <motion.tr
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    key={log._id || log.date}
                                                    className="hover:bg-white/50 transition-colors group"
                                                >
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-center">
                                                                <p className="text-lg font-black text-slate-800 leading-none">{day}</p>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{month} {weekday}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                                                                    {log.userId?.profilePhoto ? (
                                                                        <img src={log.userId.profilePhoto} alt="" className="w-full h-full object-cover rounded-xl" />
                                                                    ) : log.userId?.name?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-800 leading-none">{log.userId?.name || '---'}</p>
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1.5">{log.userId?.employeeId || 'EMP-X'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className={cn("text-xs font-black tracking-tight", isLate ? "text-amber-600" : "text-slate-700")}>
                                                                {log.clockIn?.time ? new Date(log.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                            </span>
                                                            {isLate && <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter">Late</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs font-black text-slate-700 tracking-tight">
                                                            {log.clockOut?.time ? new Date(log.clockOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs font-bold text-slate-400">
                                                            {log.totalHours ? formatDuration(log.totalHours) : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <span className="text-xs font-black text-indigo-600">
                                                            {log.timesheetHours ? formatDuration(log.timesheetHours) : '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                            isCheckedIn ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                                isSunday ? "bg-violet-50 text-violet-600 border-violet-100" :
                                                                    isLate ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                                        (log.status === 'present' || log.status === 'Present') ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                            "bg-slate-50 text-slate-400 border-slate-100"
                                                        )}>
                                                            {isCheckedIn ? 'Checked In' : log.status || 'Absent'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        {!isSunday && (
                                                            <button
                                                                onClick={() => setSelectedLog(log)}
                                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={isAdmin ? 8 : 7} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-20">
                                                    <Activity size={48} />
                                                    <p className="text-xs font-black uppercase tracking-widest">No entries found for this period</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>

            {selectedLog && (
                <AttendanceDetailsModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </ProtectedRoute>
    );
}
