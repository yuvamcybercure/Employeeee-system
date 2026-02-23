"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layout';
import api from '@/lib/api';
import {
    Users,
    MapPin,
    AlertCircle,
    TrendingUp,
    ExternalLink,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    MoreVertical
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
        { label: "Present Today", value: data?.present || 0, total: data?.total || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
        { label: "Late Arrivals", value: data?.late || 0, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Pending Approval", value: data?.pending || 0, icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "IP Conflicts", value: data?.ipConflicts?.length || 0, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    ];

    if (loading) return <div>Loading...</div>;

    return (
        <DashboardLayout allowedRoles={['admin', 'superadmin']}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500 font-medium">Real-time team analytics and attendance tracking</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboardStats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}{stat.total ? `/${stat.total}` : ""}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Attendance Chart */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-extrabold text-slate-800">Weekly Attendance %</h3>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <TrendingUp size={14} /> +4% this week
                            </div>
                        </div>

                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    />
                                    <Bar dataKey="percentage" radius={[8, 8, 0, 0]} barSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#2c92b2' : '#cbd5e1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* IP Conflicts List */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-extrabold text-slate-800">Security Alerts</h3>
                            <AlertCircle size={20} className="text-red-500" />
                        </div>

                        <div className="flex-1 space-y-4">
                            {data?.ipConflicts?.length > 0 ? (
                                data.ipConflicts.map((conflict: any, i: number) => (
                                    <div key={i} className="p-4 rounded-2xl bg-red-50 border border-red-100 space-y-2">
                                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">IP Conflict Detected</p>
                                        <p className="text-sm font-bold text-slate-900">{conflict.ip}</p>
                                        <div className="flex -space-x-2">
                                            {conflict.users.map((u: any, j: number) => (
                                                <div key={j} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden" title={u.userId.name}>
                                                    <img src={u.userId.profilePhoto || `https://ui-avatars.com/api/?name=${u.userId.name}`} alt="" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                    <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-4">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">No IP conflicts detected.<br />Workplace is secure.</p>
                                </div>
                            )}
                        </div>

                        <button className="w-full mt-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                            View Full Audit Log
                        </button>
                    </div>
                </div>

                {/* Live Attendance Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-extrabold text-slate-800">Today's Attendance</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search employee..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Employee</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Status</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Time</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Device/IP</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data?.records?.map((record: any) => (
                                    <tr key={record._id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                                    <img src={record.userId.profilePhoto || `https://ui-avatars.com/api/?name=${record.userId.name}`} alt="" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{record.userId.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{record.userId.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                record.status === 'present' ? "bg-green-50 text-green-700" :
                                                    record.status === 'late' ? "bg-orange-50 text-orange-700" :
                                                        record.status === 'pending' ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
                                            )}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 leading-none">{new Date(record.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-1">In Today</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div>
                                                <p className="text-xs text-slate-600 font-medium">{record.clockIn.device}</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{record.clockIn.ip}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
