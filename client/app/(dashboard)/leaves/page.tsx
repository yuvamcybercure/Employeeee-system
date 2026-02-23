"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import {
    Calendar,
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Plus,
    Loader2,
    Filter,
    ArrowRight
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { LeaveDialog } from '@/components/LeaveDialog';

export default function LeavesPage() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<any[]>([]);
    const [balances, setBalances] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'my' | 'all'>(user?.role === 'employee' ? 'my' : 'all');
    const [showApply, setShowApply] = useState(false);

    useEffect(() => {
        fetchData();
    }, [view]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leavesRes, balanceRes] = await Promise.all([
                api.get(view === 'my' ? '/leaves' : '/leaves'), // Simplified for now, backend filters by role
                api.get('/leaves/balance')
            ]);
            if (leavesRes.data.success) setLeaves(leavesRes.data.leaves);
            if (balanceRes.data.success) setBalances(balanceRes.data.balance);
        } catch (err) {
            console.error('Failed to fetch leave data');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await api.patch(`/leaves/${id}/review`, { status, adminRemarks: 'Processed via Dashboard' });
            fetchData();
        } catch (err) {
            alert('Action failed');
        }
    };

    return (
        <DashboardLayout allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="space-y-10">
                {showApply && (
                    <LeaveDialog
                        onClose={() => setShowApply(false)}
                        onSuccess={fetchData}
                    />
                )}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Leave Management</h1>
                        <p className="text-slate-500 font-medium">Manage time-off requests, balances, and approvals.</p>
                    </div>
                    {user?.role === 'employee' && (
                        <button
                            onClick={() => setShowApply(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            <Plus size={20} /> Plan a Vacation
                        </button>
                    )}
                </div>

                {/* Balance Cards (Employee Only) */}
                {user?.role === 'employee' && balances && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <BalanceCard title="Annual Leave" available={balances.total - balances.used} total={balances.total} color="blue" />
                        <BalanceCard title="Sick Leave" available={balancedMock.sick.available} total={12} color="red" />
                        <BalanceCard title="Casual Leave" available={balancedMock.casual.available} total={8} color="orange" />
                        <BalanceCard title="Emergency" available={balancedMock.emergency.available} total={5} color="purple" />
                    </div>
                )}

                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('my')}
                                className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", view === 'my' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                My Requests
                            </button>
                            {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                <button
                                    onClick={() => setView('all')}
                                    className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", view === 'all' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}
                                >
                                    All Approvals
                                </button>
                            )}
                        </div>
                        <Filter className="text-slate-400" size={18} />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type & Duration</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse px-6 py-8 h-20 bg-slate-50/20"></tr>)
                                ) : (
                                    leaves.map((leave) => (
                                        <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{leave.type} Leave</span>
                                                    <span className="text-xs text-slate-500 font-medium mt-0.5">
                                                        {formatDate(leave.startDate)} <ArrowRight size={10} className="inline mx-1" /> {formatDate(leave.endDate)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                                                        {leave.user?.name?.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{leave.user?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={leave.status} />
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {leave.status === 'pending' && (user?.role === 'admin' || user?.role === 'superadmin') ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleReview(leave._id, 'approved')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"><CheckCircle2 size={18} /></button>
                                                        <button onClick={() => handleReview(leave._id, 'rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"><XCircle size={18} /></button>
                                                    </div>
                                                ) : (
                                                    <button className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-primary transition-all">Details</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const balancedMock = {
    sick: { available: 5 },
    casual: { available: 3 },
    emergency: { available: 4 }
};

function BalanceCard({ title, available, total, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        red: "bg-red-50 text-red-600",
        orange: "bg-orange-50 text-orange-600",
        purple: "bg-purple-50 text-purple-600"
    };
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-110", colors[color].split(' ')[0])}></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
            <div className="mt-4 flex flex-col gap-1">
                <h4 className="text-3xl font-black">{available}</h4>
                <p className="text-xs font-bold text-slate-400">of {total} days total</p>
            </div>
            <div className="mt-6 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className={cn("h-full", colors[color].split(' ')[1].replace('text-', 'bg-'))} style={{ width: `${(available / total) * 100}%` }}></div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs: any = {
        pending: "bg-orange-50 text-orange-600",
        approved: "bg-emerald-50 text-emerald-600",
        rejected: "bg-red-50 text-red-600"
    };
    return (
        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", configs[status])}>
            {status}
        </span>
    );
}
