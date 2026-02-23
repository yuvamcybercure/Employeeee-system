"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layout';
import { useAuth } from '@/lib/auth';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import {
    Clock,
    MapPin,
    Calendar,
    CheckCircle2,
    Timer,
    AlertCircle,
    CloudUpload,
    Camera
} from 'lucide-react';
import api from '@/lib/api';
import { AttendanceModal } from '@/components/AttendanceModal';

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [time, setTime] = useState(new Date());
    const [attendance, setAttendance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'in' | 'out'>('in');

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
        setModalType(attendance?.clockIn ? 'out' : 'in');
        setShowModal(true);
    };

    const handleAttendanceSuccess = (newAttendance: any) => {
        setAttendance(newAttendance);
    };

    const stats = [
        { label: "Today's Status", value: attendance?.status || "Pending", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
        { label: "Clock In", value: attendance?.clockIn?.time ? new Date(attendance.clockIn.time).toLocaleTimeString() : "--:--", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Clock Out", value: attendance?.clockOut?.time ? new Date(attendance.clockOut.time).toLocaleTimeString() : "--:--", icon: LogOutIcon, color: "text-orange-500", bg: "bg-orange-50" },
        { label: "Working Hours", value: attendance?.totalHours ? formatDuration(attendance.totalHours) : "0h 0m", icon: Timer, color: "text-purple-500", bg: "bg-purple-50" },
    ];

    function LogOutIcon({ className, size }: { className?: string, size?: number }) {
        return <Clock className={cn(className, "rotate-180")} size={size} /> // Placeholder
    }

    return (
        <DashboardLayout allowedRoles={['employee']}>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {user?.name.split(' ')[0]}!</h1>
                        <p className="text-slate-500 font-medium">Here's your overview for {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-2xl font-black text-primary tracking-widest leading-none">
                                {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </p>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Real-time Clock</p>
                        </div>
                        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <Clock size={24} />
                        </div>
                    </div>
                </div>

                {/* Action Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 text-primary/5 -translate-y-4 translate-x-4">
                            <MapPin size={180} />
                        </div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Attendance Marking</h3>
                                <p className="text-slate-500 text-sm mt-1 max-w-sm">Capture your selfie and location to mark your attendance for today.</p>
                            </div>

                            <div className="mt-12 flex flex-wrap gap-4">
                                <button
                                    onClick={handleClockAction}
                                    disabled={marking || attendance?.clockOut}
                                    className={cn(
                                        "px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3",
                                        attendance?.clockIn
                                            ? "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20"
                                            : "bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20"
                                    )}
                                >
                                    {attendance?.clockIn ? "Clock Out Now" : "Clock In Now"}
                                    <Camera size={20} />
                                </button>

                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                                    <div className={cn("w-2 h-2 rounded-full", attendance?.clockIn ? "bg-green-500" : "bg-slate-300 animate-pulse")} />
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">
                                        {attendance?.clockIn ? `Clocked in at ${new Date(attendance.clockIn.time).toLocaleTimeString()}` : "Ready to Clock In"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary rounded-3xl p-8 text-white shadow-xl shadow-primary/30 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold opacity-90">Quick Stats</h3>
                            <p className="text-primary-foreground/70 text-sm mt-1">Weekly performance summary</p>
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="bg-white/10 p-4 rounded-2xl">
                                <p className="text-xs font-black uppercase tracking-widest opacity-60">Avg. Hours</p>
                                <p className="text-3xl font-black mt-1">8.4<span className="text-sm font-normal opacity-70 ml-1">h/day</span></p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-2xl">
                                <p className="text-xs font-black uppercase tracking-widest opacity-60">Ontime Rate</p>
                                <p className="text-3xl font-black mt-1">92<span className="text-sm font-normal opacity-70 ml-1">%</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:-translate-y-1">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-lg font-bold text-slate-900 mt-0.5">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity / Status Messages */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Today's Timeline</h3>
                        <div className="space-y-6">
                            {!attendance?.clockIn && (
                                <div className="flex gap-4">
                                    <div className="w-1 bg-slate-100 rounded-full relative">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-200 outline outline-4 outline-white" />
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Wait</p>
                                        <p className="text-slate-500 text-sm mt-1 italic">Waiting for your first clock-in of the day...</p>
                                    </div>
                                </div>
                            )}
                            {attendance?.clockIn && (
                                <div className="flex gap-4">
                                    <div className="w-1 bg-green-500 rounded-full relative">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-green-500 outline outline-4 outline-white shadow-md shadow-green-500/20" />
                                    </div>
                                    <div className="pb-4">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-green-600 uppercase tracking-widest">Clocked In</p>
                                            <span className="text-[10px] text-slate-400 font-bold underline cursor-help">View Selfie</span>
                                        </div>
                                        <p className="text-slate-900 font-bold mt-1">{new Date(attendance.clockIn.time).toLocaleTimeString()}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-1"><MapPin size={12} /> Verified Location</span>
                                            <span className="flex items-center gap-1 font-bold text-green-600"><CheckCircle2 size={12} /> Geofenced</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {attendance?.clockOut && (
                                <div className="flex gap-4">
                                    <div className="w-1 bg-blue-500 rounded-full relative">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 outline outline-4 outline-white shadow-md shadow-blue-500/20" />
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Clocked Out</p>
                                        <p className="text-slate-900 font-bold mt-1">{new Date(attendance.clockOut.time).toLocaleTimeString()}</p>
                                        <p className="text-xs text-slate-400 mt-1">System auto-calculated: {attendance.totalHours} hrs worked</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col gap-6">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold">Policy Update</h4>
                            <p className="text-slate-400 text-sm mt-1 leading-relaxed">Please ensure your camera is enabled for attendance selfies as per the updated HR policy.</p>
                        </div>
                        <button className="mt-auto w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/5 text-sm uppercase tracking-widest">
                            Read All Policies
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
