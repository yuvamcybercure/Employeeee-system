"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    BarChart3,
    TrendingUp,
    Users,
    Building2,
    Calendar,
    Briefcase,
    Zap,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from '@/components/ui/toaster';
import { motion } from 'framer-motion';

export default function AnalyticsHub() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/master/analytics');
            if (data.success) setData(data.analytics);
        } catch (err) {
            toast.error('Failed to load global analytics matrix');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-20">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Hydrating Analytics Matrix...</p>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['master-admin']}>
            <div className="space-y-10 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Analytics Hub</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2 italic">Global Platform Intelligence Matrix</p>
                    </div>
                </div>

                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Avg Attendance', value: `${data?.avgAttendance || 0}%`, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        { label: 'Project Flux', value: data?.projectFlux || 0, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { label: 'Active Sessions', value: data?.activeSessions || 0, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
                        { label: 'Growth Rate', value: `+${data?.growthRate || 0}%`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", s.bg, s.color)}>
                                <s.icon size={28} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{s.label}</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
                        <BarChart3 size={120} className="opacity-5 mb-8" />
                        <h3 className="text-2xl font-black mb-4">Functional Trends</h3>
                        <p className="text-slate-400 text-sm italic font-bold">Real-time charting engine initializing...</p>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none text-left">Top Tenants</h3>
                            <ArrowUpRight className="text-slate-300" />
                        </div>
                        <div className="space-y-6">
                            {(data?.topOrganizations || []).map((org: any, i: number) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 border border-slate-100 shrink-0">
                                        {org.logo ? <img src={org.logo} className="w-full h-full object-cover rounded-2xl" /> : org.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-black text-slate-800 truncate">{org.name}</p>
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{org.score}% Health</p>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${org.score}%` }}
                                                className="h-full bg-slate-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
