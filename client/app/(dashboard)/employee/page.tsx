"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layout';
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
    LogOut as LogOutIcon,
    ArrowRight
} from 'lucide-react';
import api from '@/lib/api';
import { AttendanceModal } from '@/components/AttendanceModal';

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
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        fetchTodayAttendance();
        return () => clearInterval(timer);
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            const { data } = await api.get('/attendance/today');
            if (data.success) setAttendance(data.attendance);
        } catch (err) {
            console.error('Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleClockAction = () => {
        setShowModal(true);
    };

    const stats = [
        { label: "Today's Status", value: attendance?.status || "Pending", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
        { label: "Clock In", value: attendance?.clockIn?.time ? new Date(attendance.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--", icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-100" },
        { label: "Clock Out", value: attendance?.clockOut?.time ? new Date(attendance.clockOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--", icon: LogOutIcon, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
        { label: "Total Work", value: attendance?.totalHours ? formatDuration(attendance.totalHours) : "0h 0m", icon: Timer, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
    ];

    return (
        <DashboardLayout allowedRoles={['employee']}>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-10 pb-10"
            >
                {/* Hero Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            Good {time.getHours() < 12 ? 'Morning' : time.getHours() < 17 ? 'Afternoon' : 'Evening'}, <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">{user?.name.split(' ')[0]}</span>!
                        </h1>
                        <p className="text-slate-500 font-bold mt-2 text-lg">
                            {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>

                    <div className="glass-card px-8 py-5 rounded-[2.5rem] flex items-center gap-6 border-white/40 shadow-2xl">
                        <div className="text-right">
                            <p className="text-3xl font-black text-primary tracking-widest tabular-nums leading-none">
                                {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </p>
                            <div className="flex items-center justify-end gap-1.5 mt-2">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Real-time Status</p>
                            </div>
                        </div>
                        <div className="w-14 h-14 premium-gradient rounded-3xl flex items-center justify-center text-white shadow-xl shadow-primary/30">
                            <Clock size={28} />
                        </div>
                    </div>
                </motion.div>

                {/* Main Action Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-[3rem] p-10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-10 text-primary/5 transition-transform duration-700 group-hover:scale-110 -translate-y-4 translate-x-4">
                            <MapPin size={220} />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="max-w-md">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Daily Track</h3>
                                <p className="text-slate-500 font-medium mt-2 leading-relaxed">Securely mark your attendance using AI-powered selfie verification and geofencing.</p>
                            </div>

                            <div className="mt-14 flex flex-col sm:flex-row items-center gap-6">
                                <button
                                    onClick={handleClockAction}
                                    disabled={attendance?.clockOut}
                                    className={cn(
                                        "px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all flex items-center gap-3 active:scale-95 shadow-2xl",
                                        attendance?.clockIn
                                            ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/30"
                                            : "premium-gradient text-white shadow-primary/30"
                                    )}
                                >
                                    {attendance?.clockIn ? "End Your Day" : "Start Your Day"}
                                    <Camera size={20} />
                                </button>

                                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 backdrop-blur-sm">
                                    <div className={cn("w-3 h-3 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)]", attendance?.clockIn ? "bg-emerald-500 shadow-emerald-500/40" : "bg-slate-300 animate-pulse")} />
                                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                                        {attendance?.clockIn ? `In: ${new Date(attendance.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Standby"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="accent-gradient rounded-[3rem] p-10 text-white shadow-3xl shadow-accent/20 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />

                        <div>
                            <h3 className="text-xl font-black opacity-90 tracking-tight uppercase">Productivity</h3>
                            <p className="text-white/60 text-xs font-bold mt-1 uppercase tracking-widest">Weekly Trends</p>
                        </div>

                        <div className="space-y-6 mt-10">
                            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. Hours</p>
                                    <span className="text-[10px] bg-emerald-400 text-black px-2 py-0.5 rounded-full font-black">+4%</span>
                                </div>
                                <p className="text-4xl font-black tabular-nums tracking-tighter">8.4<span className="text-sm font-bold opacity-60 ml-2">h/d</span></p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Ontime Score</p>
                                <p className="text-4xl font-black tabular-nums tracking-tighter">92<span className="text-sm font-bold opacity-60 ml-2">%</span></p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Performance Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            variants={itemVariants}
                            key={i}
                            className="glass-card p-6 rounded-[2.5rem] flex items-center gap-5 hover-scale border-white/50"
                        >
                            <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center border shadow-sm", stat.bg, stat.color, stat.border)}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                <p className="text-xl font-black text-slate-900 mt-1 tabular-nums">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Modules */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-[3rem] p-10 border-white/40">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Activity Log</h3>
                            <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">Full Log <ArrowRight size={14} /></button>
                        </div>

                        <div className="space-y-8">
                            {!attendance?.clockIn && (
                                <div className="flex gap-6 items-center py-6 bg-slate-50/50 rounded-3xl px-8 border border-slate-100 border-dashed">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300">
                                        <Timer size={24} />
                                    </div>
                                    <p className="text-slate-400 font-bold text-sm tracking-wide italic">No activities recorded yet. Ready to start?</p>
                                </div>
                            )}
                            {attendance?.clockIn && (
                                <div className="flex gap-6 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-1.5 h-full bg-indigo-100 rounded-full relative">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white shadow-lg shadow-indigo-500/30" />
                                        </div>
                                    </div>
                                    <div className="pb-4">
                                        <div className="flex items-center gap-3">
                                            <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Entry Recorded</p>
                                            <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-full font-black border border-indigo-100">Verified</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight tabular-nums">
                                            {formatDate(attendance.clockIn.time)} at {new Date(attendance.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <div className="flex items-center gap-5 mt-4 text-xs font-bold text-slate-400">
                                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-rose-400" /> Ground Floor, Office</span>
                                            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Geofenced</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl shadow-slate-900/20 flex flex-col gap-8 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-full h-1 premium-gradient" />
                        <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-primary shadow-inner">
                            <AlertCircle size={32} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black tracking-tight leading-none">News & Policies</h4>
                            <p className="text-slate-400 font-medium text-sm mt-4 leading-relaxed">
                                Our geofencing system has been updated. Please ensure location services are enabled for accurate check-ins.
                            </p>
                        </div>
                        <button className="mt-auto w-full py-5 premium-gradient rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                            View All Policies
                        </button>
                    </motion.div>
                </div>
            </motion.div>

            {showModal && (
                <AttendanceModal
                    type={attendance?.clockIn ? "out" : "in"}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchTodayAttendance}
                />
            )}
        </DashboardLayout>
    );
}
