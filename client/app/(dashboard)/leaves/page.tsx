"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
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
import { LeaveDetailsModal } from '@/components/LeaveDetailsModal';
import {
    Search,
    RefreshCcw,
    Eye,
    Settings
} from 'lucide-react';
import { OrgLeaveSettingsModal } from '@/components/dashboard/OrgLeaveSettingsModal';

export default function LeavesPage() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<any[]>([]);
    const [balances, setBalances] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'my' | 'all'>(user?.role === 'employee' ? 'my' : 'all');
    const [showApply, setShowApply] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<any>(null);

    // Filter State
    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        search: '',
        status: 'all',
        department: 'all'
    });
    const [showOrgSettings, setShowOrgSettings] = useState(false);

    useEffect(() => {
        fetchData();
    }, [view, filters.month, filters.year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const queryParams = `?month=${filters.month}&year=${filters.year}`;
            const [leavesRes, balanceRes] = await Promise.all([
                api.get(`/leaves${queryParams}`),
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

    const filteredLeaves = leaves.filter(l => {
        const matchesSearch =
            (l.userId?.name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (l.userId?.email || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (l.userId?.department || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (l.reason || '').toLowerCase().includes(filters.search.toLowerCase());

        const matchesStatus = filters.status === 'all' || l.status === filters.status;
        const matchesDept = filters.department === 'all' || l.userId?.department === filters.department;

        return matchesSearch && matchesStatus && matchesDept;
    });

    const departments = Array.from(new Set(leaves.map(l => l.userId?.department).filter(Boolean)));

    const handleReview = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await api.patch(`/leaves/${id}/review`, { status, adminRemarks: 'Processed via Dashboard' });
            fetchData();
        } catch (err) {
            alert('Action failed');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['employee', 'admin', 'superadmin']}>
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

                {showOrgSettings && (
                    <OrgLeaveSettingsModal
                        onClose={() => setShowOrgSettings(false)}
                        onSuccess={fetchData}
                    />
                )}

                {/* Balance & Analytics Dashboard */}
                {user?.role === 'employee' && balances && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <BalanceCard
                            title="Sick Leave"
                            type="sick"
                            stats={balances.sick}
                            color="red"
                        />
                        <BalanceCard
                            title="Casual Leave"
                            type="casual"
                            stats={balances.casual}
                            color="orange"
                        />
                        <BalanceCard
                            title="WFH Protocol"
                            type="wfh"
                            stats={balances.wfh}
                            color="purple"
                        />
                        <BalanceCard
                            title="Unpaid / Other"
                            type="unpaid"
                            stats={balances.unpaid}
                            color="slate"
                        />
                    </div>
                )}

                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/30">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('my')}
                                className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", view === 'my' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                My Requests
                            </button>
                            {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setView('all')}
                                        className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", view === 'all' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}
                                    >
                                        All Approvals
                                    </button>
                                    {user?.role === 'superadmin' && (
                                        <button
                                            onClick={() => setShowOrgSettings(true)}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all"
                                        >
                                            <Settings className="inline mr-2" size={14} /> Org Quotas
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters(f => ({ ...f, year: parseInt(e.target.value) }))}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>

                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            {departments.length > 0 && (
                                <select
                                    value={filters.department}
                                    onChange={(e) => setFilters(f => ({ ...f, department: e.target.value }))}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="all">All Departments</option>
                                    {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            )}

                            <button
                                onClick={fetchData}
                                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm"
                            >
                                <RefreshCcw size={18} className={cn(loading && "animate-spin")} />
                            </button>

                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                    className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type & Duration</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Employee</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse px-6 py-8 h-20 bg-slate-50/20"></tr>)
                                ) : (
                                    filteredLeaves.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">No requests found</td>
                                        </tr>
                                    ) : (
                                        filteredLeaves.map((leave) => (
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
                                                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                                                            {leave.userId?.profilePhoto ? (
                                                                <img src={leave.userId.profilePhoto} alt="" className="w-full h-full object-cover rounded-xl" />
                                                            ) : leave.userId?.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 leading-none">{leave.userId?.name || '---'}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1.5">{leave.userId?.department || 'Member'}</p>
                                                            <p className="text-[9px] font-medium text-slate-400 lowercase">{leave.userId?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <StatusBadge status={leave.status} />
                                                        {leave.reviewedBy && (
                                                            <span className="text-[8px] font-black text-slate-400 tracking-tighter uppercase whitespace-nowrap">
                                                                By {leave.reviewedBy.name} ({leave.reviewedBy.employeeId})
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        {leave.status === 'pending' && (user?.role === 'admin' || user?.role === 'superadmin') && (
                                                            <>
                                                                <button onClick={() => handleReview(leave._id, 'approved')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"><CheckCircle2 size={18} /></button>
                                                                <button onClick={() => handleReview(leave._id, 'rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"><XCircle size={18} /></button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => setSelectedLeave(leave)}
                                                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {selectedLeave && (
                    <LeaveDetailsModal
                        leave={selectedLeave}
                        onClose={() => setSelectedLeave(null)}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}

const balancedMock = {
    sick: { available: 5 },
    casual: { available: 3 },
    emergency: { available: 4 }
};

function BalanceCard({ title, stats, color }: any) {
    const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        red: "bg-red-50 text-red-600",
        orange: "bg-orange-50 text-orange-600",
        purple: "bg-purple-50 text-purple-600",
        slate: "bg-slate-50 text-slate-600"
    };

    const used = period === 'monthly' ? stats.usedMonth : stats.usedYear;
    const total = period === 'monthly' ? stats.quotaMonth : stats.quotaYear;
    const available = Math.max(0, total - used);

    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10 mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <button
                    onClick={() => setPeriod(p => p === 'monthly' ? 'yearly' : 'monthly')}
                    className="text-[9px] font-black text-primary px-2 py-1 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all uppercase tracking-tighter"
                >
                    {period}
                </button>
            </div>

            <div className="mt-2 flex flex-col gap-1 relative z-10">
                <div className="flex items-baseline gap-2">
                    <h4 className="text-4xl font-black tabular-nums">{available}</h4>
                    <span className="text-xs font-bold text-slate-400">Available</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Used: {used} of {total} days</p>
            </div>

            <div className="mt-6 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden relative z-10">
                <div className={cn("h-full transition-all duration-1000", colors[color].split(' ')[1].replace('text-', 'bg-'))} style={{ width: `${Math.min(100, (available / (total || 1)) * 100)}%` }}></div>
            </div>

            <div className={cn("absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150", colors[color].split(' ')[0])}></div>
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
