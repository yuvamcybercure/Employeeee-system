"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout';
import { useAuth } from '@/lib/auth';
import {
    Calendar,
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Download,
    AlertCircle,
    Database,
    Terminal,
    ShieldAlert,
    Users
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import api from '@/lib/api';

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

    return (
        <DashboardLayout allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance Hub</h1>
                        <p className="text-slate-500 font-medium">Track daily logs, verify locations, and manage reports.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all text-slate-600">
                            <Download size={20} /> Export Report
                        </button>
                    </div>
                </div>

                {/* Attendance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard label="Average On-Time" value="94%" icon={CheckCircle2} color="emerald" />
                    <SummaryCard label="Total Work Days" value="22" icon={Calendar} color="blue" />
                    <SummaryCard label="Late Arrivals" value="2" icon={AlertCircle} color="orange" />
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <h3 className="font-black text-slate-800 tracking-tight">Monthly Logs</h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Filter by date..."
                                className="w-full md:w-80 pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role === 'employee' ? 'Date' : 'Employee'}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clock In</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clock Out</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role === 'employee' ? 'Efficiency' : 'Location'}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse h-20 bg-slate-50/10"></tr>)
                                ) : history.length > 0 ? (
                                    history.map(log => (
                                        <tr key={log._id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-5 font-bold text-slate-700">
                                                {user?.role === 'employee' ? formatDate(log.date) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">{log.userId?.name?.charAt(0)}</div>
                                                        <div>
                                                            <p className="text-sm font-bold">{log.userId?.name}</p>
                                                            <p className="text-[10px] text-slate-400 uppercase">{log.userId?.employeeId}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-sm text-slate-600 font-mono">{log.clockIn?.time ? new Date(log.clockIn.time).toLocaleTimeString() : '-'}</td>
                                            <td className="px-8 py-5 text-sm text-slate-600 font-mono">{log.clockOut?.time ? new Date(log.clockOut.time).toLocaleTimeString() : '-'}</td>
                                            <td className="px-8 py-5">
                                                {user?.role === 'employee' ? (
                                                    <span className="text-xs font-black text-slate-400 tracking-tighter">{log.totalHours || '0'}h worked</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><MapPin size={12} /> {log.clockIn?.ip || 'Verified'}</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    (log.status === 'Present' || log.status === 'present') ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                                )}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-medium">No records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function SummaryCard({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        orange: "bg-orange-50 text-orange-600"
    };
    return (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={cn("p-4 rounded-2xl", colors[color])}>
                <Icon size={24} />
            </div>
            <div>
                <h4 className="text-2xl font-black text-slate-900">{value}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{label}</p>
            </div>
        </div>
    );
}
