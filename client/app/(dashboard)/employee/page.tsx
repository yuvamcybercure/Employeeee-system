"use client";

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    Clock,
    MapPin,
    Calendar,
    CheckCircle2,
    Timer,
    AlertCircle,
    Camera,
    LogOut,
    ArrowRight,
    Sparkles,
    User
} from 'lucide-react';
import api from '@/lib/api';
import { AttendanceModal } from '@/components/AttendanceModal';
import { WorkStatusChart } from '@/components/dashboard/WorkStatusChart';
import { HolidaysBirthdays } from '@/components/dashboard/HolidaysBirthdays';
import { ProjectOverview } from '@/components/dashboard/ProjectOverview';

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

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [time, setTime] = useState(new Date());
    const [attendance, setAttendance] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        fetchData();
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        try {
            const [attRes, histRes, statsRes] = await Promise.allSettled([
                api.get('/attendance/today'),
                api.get('/attendance/history?month=' + (new Date().getMonth() + 1) + '&year=' + new Date().getFullYear()),
                api.get('/dashboard/employee-stats')
            ]);

            if (attRes.status === 'fulfilled' && attRes.value.data.success) {
                setAttendance(attRes.value.data.attendance);
            } else if (attRes.status === 'rejected') {
                console.error('Attendance Fetch Error:', attRes.reason);
            }

            if (histRes.status === 'fulfilled' && histRes.value.data.success) {
                setHistory(histRes.value.data.records);
            } else if (histRes.status === 'rejected') {
                console.error('History Fetch Error:', histRes.reason);
            }

            if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
                setDashboardStats(statsRes.value.data);
            } else if (statsRes.status === 'rejected') {
                console.error('Dashboard Stats Fetch Error:', statsRes.reason);
            }
        } catch (err) {
            console.error('Unexpected error in fetchData:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClockAction = () => {
        setShowModal(true);
    };

    // Prepare chart data from history
    const chartData = history.slice(0, 28).reverse().map(record => ({
        day: record.date.split('-')[2],
        status: record.status === 'present' ? (record.totalHours >= 8 ? 'Well Done' : 'Half Day') :
            record.status === 'late' ? 'Can do better' :
                record.status === 'Sunday' ? 'Weekly Off' : record.status,
        value: record.totalHours || 2
    }));

    return (
        <ProtectedRoute allowedRoles={['employee']}>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-10 pb-10"
            >
                {/* Hero Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-[1000] text-slate-900 tracking-tight leading-none mb-1">
                            Good {time.getHours() < 12 ? 'Morning' : time.getHours() < 17 ? 'Afternoon' : 'Evening'},
                        </h1>
                        <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary leading-tight">
                            {user?.name.split(' ')[0]}!
                        </h2>
                        <p className="text-slate-500 font-bold mt-3 text-lg">
                            {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>

                    <div className="glass-card px-10 py-6 rounded-[3rem] flex items-center gap-8 border-white/40 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-full h-1 premium-gradient opacity-20" />
                        <div className="text-right flex flex-col items-end">
                            <p className="text-4xl font-[1000] text-primary tracking-widest tabular-nums leading-none">
                                {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </p>
                            <div className="flex items-center justify-end gap-2 mt-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(44,146,178,0.5)]" />
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.25em]">Live Attendance Tracking</p>
                            </div>
                        </div>
                        <div className="w-16 h-16 premium-gradient rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 group-hover:scale-105 transition-transform duration-500">
                            <Clock size={32} />
                        </div>
                    </div>
                </motion.div>

                {/* Main Action Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Attendance Track Card */}
                    <motion.div variants={itemVariants} className="lg:col-span-8 glass-card rounded-[3.5rem] p-10 overflow-hidden relative group h-full">
                        <div className="absolute top-0 right-0 p-12 text-primary/5 transition-transform duration-1000 group-hover:scale-110 -translate-y-4 translate-x-4 pointer-events-none">
                            <MapPin size={240} />
                        </div>

                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="max-w-lg">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                                    <Sparkles size={12} /> AI Verification Active
                                </div>
                                <h3 className="text-3xl font-[1000] text-slate-900 tracking-tight leading-tight">Secure Attendance Log</h3>
                                <p className="text-slate-500 font-bold mt-3 leading-relaxed text-lg">Mark your daily presence using high-precision geofencing and facial detection.</p>
                            </div>

                            <div className="mt-16 flex flex-col sm:flex-row items-center gap-8">
                                <button
                                    onClick={handleClockAction}
                                    disabled={attendance?.clockOut}
                                    className={cn(
                                        "px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-4 active:scale-95 shadow-3xl min-w-[240px] justify-center",
                                        attendance?.clockIn
                                            ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/40"
                                            : "premium-gradient text-white shadow-primary/40"
                                    )}
                                >
                                    {attendance?.clockIn ? "End Your Day" : "Start Your Day"}
                                    <Camera size={20} />
                                </button>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 px-8 py-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm backdrop-blur-md">
                                        <div className={cn("w-3.5 h-3.5 rounded-full shadow-lg", attendance?.clockIn ? "bg-emerald-500 shadow-emerald-500/40" : "bg-slate-300 animate-pulse")} />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</span>
                                            <span className="text-sm font-black text-slate-700 uppercase tracking-widest">
                                                {attendance?.clockIn ? `In: ${new Date(attendance.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Waiting for In"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Project Overview Card */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 h-full">
                        <ProjectOverview stats={dashboardStats?.projectStats} />
                    </motion.div>
                </div>

                {/* Analytics & Events Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Work Status Chart */}
                    <motion.div variants={itemVariants} className="lg:col-span-8">
                        <WorkStatusChart data={chartData} />
                    </motion.div>

                    {/* Holidays & Birthdays */}
                    <motion.div variants={itemVariants} className="lg:col-span-4">
                        <HolidaysBirthdays birthdays={dashboardStats?.birthdays} holidays={dashboardStats?.holidays} />
                    </motion.div>
                </div>

                {/* Performance & Activity Table */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <motion.div variants={itemVariants} className="lg:col-span-12 glass-card rounded-[3.5rem] overflow-hidden border-white/50">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h3 className="text-2xl font-[1000] text-slate-800 tracking-tight">Recent Activity Log</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Your Weekly Attendance Summary</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-50 flex items-center justify-center overflow-hidden shadow-sm">
                                            <User size={18} className="text-slate-300" />
                                        </div>
                                    ))}
                                </div>
                                <button className="glass-card px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-slate-50 transition-all shadow-sm">
                                    Export Logs
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-10 py-5 text-[10px] font-[1000] text-slate-400 uppercase tracking-[0.2em]">Day</th>
                                        <th className="px-10 py-5 text-[10px] font-[1000] text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                        <th className="px-10 py-5 text-[10px] font-[1000] text-slate-400 uppercase tracking-[0.2em]">Clock In/Out</th>
                                        <th className="px-10 py-5 text-[10px] font-[1000] text-slate-400 uppercase tracking-[0.2em]">Total Time</th>
                                        <th className="px-10 py-5 text-[10px] font-[1000] text-slate-400 uppercase tracking-[0.2em] text-center">Remark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.slice(0, 7).map((record, i) => {
                                        const remark = record.status === 'present' ? (record.totalHours >= 8 ? 'Well Done' : 'Half Day') :
                                            record.status === 'late' ? 'Late Arrival' : record.status;
                                        const color = record.status === 'present' ? (record.totalHours >= 8 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600') :
                                            record.status === 'Sunday' ? 'bg-violet-100 text-violet-600' : 'bg-rose-100 text-rose-600';

                                        return (
                                            <tr key={i} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                                <td className="px-10 py-6 text-sm font-bold text-slate-500">
                                                    {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                </td>
                                                <td className="px-10 py-6 text-sm font-[1000] text-slate-900 tracking-tight">{record.date}</td>
                                                <td className="px-10 py-6 text-sm font-bold text-slate-600">
                                                    <div className="flex flex-col">
                                                        <span className="text-emerald-500">{record.clockIn?.time ? new Date(record.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
                                                        <span className="text-rose-400">{record.clockOut?.time ? new Date(record.clockOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-sm font-[1000] text-slate-900 tabular-nums">{record.totalHours ? `${record.totalHours}h` : '0h'}</td>
                                                <td className="px-10 py-6 text-center">
                                                    <span className={cn(
                                                        "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                                                        color
                                                    )}>
                                                        {remark}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {showModal && (
                <AttendanceModal
                    type={attendance?.clockIn ? "out" : "in"}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchData}
                />
            )}
        </ProtectedRoute>
    );
}
