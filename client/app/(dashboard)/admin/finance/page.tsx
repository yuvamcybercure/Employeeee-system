"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
    Users,
    Briefcase,
    Calendar,
    Download,
    Plus,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    IndianRupee,
    Calculator,
    PieChart as PieChartIcon,
    FileText,
    CreditCard,
    ChevronRight,
    ShieldCheck,
    Lock,
    CheckCircle2,
    Settings,
    Edit3,
    Save,
    Clock
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'payroll', label: 'Payroll', icon: Users },
    { id: 'invoices', label: 'Invoices', icon: Briefcase },
    { id: 'projects_cfg', label: 'Projects Rate', icon: Briefcase },
    { id: 'compensation', label: 'Compensation', icon: Settings },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'tax', label: 'Tax Center', icon: Calculator },
];

export default function FinanceDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [payroll, setPayroll] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [projects, setProjects] = useState([]);
    const [mgmtUsers, setMgmtUsers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [modalData, setModalData] = useState<any>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const { data } = await api.get('/finance/stats');
                setStats(data.stats);
            } else if (activeTab === 'payroll') {
                const { data } = await api.get('/finance/payroll');
                setPayroll(data.payrolls);
            } else if (activeTab === 'invoices') {
                const { data } = await api.get('/finance/invoices');
                setInvoices(data.invoices);
            } else if (activeTab === 'expenses') {
                const { data } = await api.get('/finance/expenses');
                setExpenses(data.expenses);
            } else if (activeTab === 'projects_cfg') {
                const { data } = await api.get('/finance/management/projects');
                setProjects(data.projects);
            } else if (activeTab === 'compensation') {
                const { data } = await api.get('/finance/management/users');
                setMgmtUsers(data.users);
            }
        } catch (err) {
            console.error('Failed to fetch finance data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let endpoint = '';
            if (activeTab === 'expenses') endpoint = '/finance/expenses';
            else if (activeTab === 'invoices') endpoint = '/finance/invoices';

            if (!endpoint) return;

            const { data } = await api.post(endpoint, modalData);
            if (data.success) {
                setShowAddModal(false);
                setModalData({});
                fetchData();
            }
        } catch (err) {
            console.error('Failed to add record');
        }
    };

    const handleMarkAsPaid = async (type: string, id: string) => {
        try {
            const { data } = await api.put(`/finance/${type}/${id}/status`, { status: 'paid' });
            if (data.success) {
                fetchData();
            }
        } catch (err) {
            console.error('Failed to update status');
        }
    };

    const handleGeneratePayroll = async () => {
        try {
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            const { data } = await api.post('/finance/payroll/generate', { month, year });
            if (data.success) {
                fetchData();
            }
        } catch (err) {
            console.error('Failed to generate payroll');
        }
    };

    const handleUpdateProjectBilling = async (id: string, billingType: string, billingRate: number) => {
        try {
            await api.put(`/finance/management/projects/${id}`, { billingType, billingRate });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error('Failed to update project billing');
        }
    };

    const handleUpdateUserCompensation = async (id: string, structure: any) => {
        try {
            await api.put(`/finance/management/users/${id}/compensation`, { salaryStructure: structure });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error('Failed to update user compensation');
        }
    };

    const fetchBillPreview = async (projectId: string) => {
        try {
            const { data } = await api.get(`/finance/projects/${projectId}/bill-preview`);
            if (data.success) {
                setModalData({
                    ...modalData,
                    projectId,
                    client: { name: data.data.projectName },
                    items: data.data.items,
                    grandTotal: data.data.suggestedTotal
                });
            }
        } catch (err) {
            console.error('Failed to fetch bill preview');
        }
    };

    const summaryCards = [
        { title: 'Gross Revenue', value: stats?.summary?.grossRevenue ? `₹${stats.summary.grossRevenue.toLocaleString()}` : '₹0', change: '+12.5%', isUp: true, icon: TrendingUp, color: 'indigo' },
        { title: 'Tax Deductions', value: stats?.summary?.totalTax ? `₹${stats.summary.totalTax.toLocaleString()}` : '₹0', change: '-4.2%', isUp: false, icon: Receipt, color: 'amber' },
        { title: 'Net Disbursement', value: stats?.summary?.netProfit ? `₹${stats.summary.netProfit.toLocaleString()}` : '₹0', change: '+18.1%', isUp: true, icon: DollarSign, color: 'emerald' },
        { title: 'Compliance Rate', value: '98.5%', change: '+2.4%', isUp: true, icon: ShieldCheck, color: 'primary' },
    ];

    const chartData = stats?.revenue?.length || stats?.expenses?.length ?
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
            const rev = stats?.revenue?.find((r: any) => r._id.month === m)?.total || 0;
            const exp = stats?.expenses?.find((e: any) => e._id.month === m)?.total || 0;
            return { month: format(new Date(2026, m - 1), 'MMM'), revenue: rev, expenses: exp };
        }) : [
            { month: 'Jan', revenue: 0, expenses: 0 },
            { month: 'Feb', revenue: 0, expenses: 0 },
            { month: 'Mar', revenue: 0, expenses: 0 },
        ];

    const taxData = stats?.summary?.taxBreakdown ? [
        { name: 'GST', value: stats.summary.taxBreakdown.gst || 0, color: '#6366f1' },
        { name: 'TDS', value: stats.summary.taxBreakdown.tds || 0, color: '#f59e0b' },
        { name: 'Professional Tax', value: stats.summary.taxBreakdown.other || 0, color: '#ec4899' },
        { name: 'Income Tax', value: 0, color: '#10b981' },
    ] : [
        { name: 'GST', value: 0, color: '#6366f1' },
        { name: 'TDS', value: 0, color: '#f59e0b' },
        { name: 'PT', value: 0, color: '#ec4899' },
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Finance Hub</h1>
                    <p className="text-slate-500 font-bold flex items-center gap-2 mt-1 uppercase text-[10px] tracking-[0.2em] leading-none">
                        <Calculator size={14} className="text-primary" />
                        Professional Chartered Accountant Suite
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={16} />
                        Export Audit
                    </button>
                    {(activeTab === 'expenses' || activeTab === 'invoices') && (
                        <button
                            onClick={() => {
                                setModalData({});
                                setShowAddModal(true);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={18} />
                            Add {activeTab === 'expenses' ? 'Expense' : 'Invoice'}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md p-1.5 rounded-[24px] border border-white shadow-xl shadow-slate-200/50 w-fit overflow-x-auto no-scrollbar">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all shrink-0",
                            activeTab === tab.id
                                ? "bg-slate-900 text-white shadow-xl shadow-slate-900/40"
                                : "text-slate-500 hover:text-primary hover:bg-white"
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                >
                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {summaryCards.map((card, i) => (
                                    <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className={cn("p-4 rounded-3xl bg-slate-50 text-slate-400 group-hover:text-primary transition-colors")}>
                                                <card.icon size={24} />
                                            </div>
                                            <div className={cn("flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full", card.isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                                                {card.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                {card.change}
                                            </div>
                                        </div>
                                        <div className="mt-6">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{card.title}</p>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white p-10 rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/50">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 italic uppercase italic">Cashflow Dynamics</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-none">Monthly Analysis 2026</p>
                                        </div>
                                    </div>
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={15} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.1)', fontWeight: 900, fontSize: 12, padding: '20px' }} />
                                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                                                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} strokeDasharray="8 8" fill="transparent" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center">
                                    <h3 className="text-xl font-black text-slate-900 mb-2 italic text-center uppercase">Tax Center</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-10 leading-none">Liability Breakdown</p>
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={taxData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={10} dataKey="value">
                                                    {taxData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.1)', fontWeight: 900, fontSize: 12 }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="w-full space-y-3 mt-8">
                                        {taxData.map((tax, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: tax.color }} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{tax.name}</span>
                                                </div>
                                                <span className="text-xs font-black text-slate-900 tracking-tight">₹{tax.value.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'payroll' && (
                        <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">Paydisbursement Board</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Monthly Cycle Disbursement</p>
                                </div>
                                <button onClick={handleGeneratePayroll} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                    Generate Current Month
                                </button>
                            </div>
                            <div className="overflow-x-auto px-10 pb-10">
                                <table className="w-full border-separate border-spacing-y-4">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Associate</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Model</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Effective Pay</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left text-center">Net Final</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="space-y-4">
                                        {payroll.length === 0 ? (
                                            <tr><td colSpan={5} className="py-20 text-center opacity-20 font-black italic">No active payroll cycle found</td></tr>
                                        ) : payroll.map((pr: any) => (
                                            <tr key={pr._id} className="group">
                                                <td className="px-6 py-4 bg-slate-50 border-y border-l border-slate-100 rounded-l-[30px]">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-primary overflow-hidden">
                                                            {pr.userId?.profilePhoto ? <img src={pr.userId.profilePhoto} className="w-full h-full object-cover" /> : pr.userId?.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900">{pr.userId?.name}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 italic">{pr.userId?.employeeId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100">
                                                    <span className="text-[9px] font-black uppercase text-slate-400 px-2 py-1 bg-white border border-slate-100 rounded-lg">
                                                        {pr.userId?.salaryStructure?.compensationType || 'monthly'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100 font-black text-slate-700">₹{pr.grossSalary?.toLocaleString() || pr.baseSalary.toLocaleString()}</td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100 text-center">
                                                    <span className="text-lg font-black text-emerald-600">₹{pr.netPayable.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-r border-slate-100 rounded-r-[30px] text-right">
                                                    {pr.status === 'draft' ? (
                                                        <button onClick={() => handleMarkAsPaid('payroll', pr._id)} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:rotate-6 transition-all">
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-emerald-500 uppercase">Paid</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'projects_cfg' && (
                        <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-10">
                                <h3 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">Project Billing Portfolio</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Configure Client Billing Models</p>
                            </div>
                            <div className="overflow-x-auto px-10 pb-10">
                                <table className="w-full border-separate border-spacing-y-4">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Project Name</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Billing Type</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Rate / Price</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projects.map((p: any) => (
                                            <tr key={p._id}>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-l border-slate-100 rounded-l-[30px] font-black text-slate-800">{p.name}</td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100">
                                                    {editingId === p._id ? (
                                                        <select value={p.billingType} onChange={e => handleUpdateProjectBilling(p._id, e.target.value, p.billingRate)} className="bg-white border rounded-lg px-2 py-1 text-xs font-black">
                                                            <option value="fixed">FIXED</option>
                                                            <option value="hourly">HOURLY</option>
                                                            <option value="monthly">MONTHLY</option>
                                                        </select>
                                                    ) : (
                                                        <span className="text-[10px] font-black uppercase text-primary">{p.billingType || 'fixed'}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100">
                                                    {editingId === p._id ? (
                                                        <input
                                                            type="number"
                                                            defaultValue={p.billingRate}
                                                            onBlur={e => handleUpdateProjectBilling(p._id, p.billingType, Number(e.target.value))}
                                                            className="w-24 bg-white border rounded-lg px-2 py-1 text-xs font-black"
                                                        />
                                                    ) : (
                                                        <span className="font-black text-slate-700">₹{p.billingRate?.toLocaleString() || 0}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-r border-slate-100 rounded-r-[30px] text-right">
                                                    <button onClick={() => setEditingId(p._id)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                                        <Edit3 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'compensation' && (
                        <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-10">
                                <h3 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">Employee Comp Board</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Payroll Model Selection</p>
                            </div>
                            <div className="overflow-x-auto px-10 pb-10">
                                <table className="w-full border-separate border-spacing-y-4">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Employee</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Mode</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left text-center">Base / Hourly Rate</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mgmtUsers.map((u: any) => (
                                            <tr key={u._id}>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-l border-slate-100 rounded-l-[30px]">
                                                    <p className="font-black text-slate-800">{u.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 italic">{u.designation}</p>
                                                </td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100">
                                                    {editingId === u._id ? (
                                                        <select
                                                            defaultValue={u.salaryStructure?.compensationType || 'monthly'}
                                                            onChange={e => handleUpdateUserCompensation(u._id, { ...u.salaryStructure, compensationType: e.target.value })}
                                                            className="bg-white border rounded-lg px-2 py-1 text-xs font-black"
                                                        >
                                                            <option value="monthly">MONTHLY SALARY</option>
                                                            <option value="hourly">HOURLY RATE</option>
                                                        </select>
                                                    ) : (
                                                        <span className="text-[10px] font-black uppercase text-emerald-600">{u.salaryStructure?.compensationType || 'monthly'}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100 text-center">
                                                    {editingId === u._id ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <input
                                                                type="number"
                                                                placeholder="Base"
                                                                defaultValue={u.salaryStructure?.baseSalary}
                                                                onBlur={e => handleUpdateUserCompensation(u._id, { ...u.salaryStructure, baseSalary: Number(e.target.value) })}
                                                                className="w-20 bg-white border rounded-lg px-2 py-1 text-xs font-black"
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Hourly"
                                                                defaultValue={u.salaryStructure?.hourlyRate}
                                                                onBlur={e => handleUpdateUserCompensation(u._id, { ...u.salaryStructure, hourlyRate: Number(e.target.value) })}
                                                                className="w-20 bg-white border rounded-lg px-2 py-1 text-xs font-black"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-black text-slate-700">Fixed: ₹{u.salaryStructure?.baseSalary?.toLocaleString() || 0}</span>
                                                            <span className="text-[9px] font-bold text-primary italic">Hourly: ₹{u.salaryStructure?.hourlyRate || 0}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-r border-slate-100 rounded-r-[30px] text-right">
                                                    <button onClick={() => setEditingId(u._id)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                                        <Edit3 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'expenses' && (
                        <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-10">
                                <h3 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">Expense Ledger</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Operational Expenditures</p>
                            </div>
                            <div className="overflow-x-auto px-10 pb-10">
                                <table className="w-full border-separate border-spacing-y-4">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Title</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Category</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Total</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.length === 0 ? (
                                            <tr><td colSpan={5} className="py-20 text-center opacity-20 font-black italic">No expenditures found</td></tr>
                                        ) : expenses.map((exp: any) => (
                                            <tr key={exp._id} className="group">
                                                <td className="px-6 py-4 bg-slate-50 border-y border-l border-slate-100 rounded-l-[30px] font-black text-slate-800 italic">{exp.title}</td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">{exp.category}</td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100 font-black text-slate-900 tracking-tight">₹{exp.totalAmount.toLocaleString()}</td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100">
                                                    <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest", exp.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                                                        {exp.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-r border-slate-100 rounded-r-[30px] text-right">
                                                    {exp.status === 'pending' && (
                                                        <button onClick={() => handleMarkAsPaid('expenses', exp._id)} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-110 transition-all">
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'invoices' && (
                        <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-10">
                                <h3 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">Invoice Registry</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Project Billing & Receipts</p>
                            </div>
                            <div className="overflow-x-auto px-10 pb-10">
                                <table className="w-full border-separate border-spacing-y-4">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Invoice #</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Client entity</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Grand Total</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Compliance</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.length === 0 ? (
                                            <tr><td colSpan={5} className="py-20 text-center opacity-20 font-black italic">No invoices issued</td></tr>
                                        ) : invoices.map((inv: any) => (
                                            <tr key={inv._id} className="group">
                                                <td className="px-6 py-4 bg-slate-50 border-y border-l border-slate-100 rounded-l-[30px] font-black text-primary italic">{inv.invoiceNumber}</td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100 font-bold text-slate-800">{inv.client?.name}</td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100 font-black text-slate-900">₹{inv.grandTotal.toLocaleString()}</td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100">
                                                    <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest", inv.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 bg-slate-50 border-y border-r border-slate-100 rounded-r-[30px] text-right">
                                                    {inv.status === 'pending' && (
                                                        <button onClick={() => handleMarkAsPaid('invoices', inv._id)} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-110 transition-all">
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Add Record Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden p-10 border border-white max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 italic uppercase tracking-tighter">Add Financial Entry</h2>
                            <form onSubmit={handleAddRecord} className="space-y-6">
                                {activeTab === 'expenses' ? (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Title</label>
                                            <input required onChange={e => setModalData({ ...modalData, title: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 focus:outline-none focus:ring-2 ring-primary/20 transition-all" placeholder="e.g. AWS INFRASTRUCTURE" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Base Amount</label>
                                                <input required type="number" onChange={e => setModalData({ ...modalData, amount: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 focus:outline-none" placeholder="0.00" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Head of Account</label>
                                                <select onChange={e => setModalData({ ...modalData, category: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 outline-none">
                                                    <option value="other">OTHER</option>
                                                    <option value="rent">RENT</option>
                                                    <option value="software">SOFTWARE</option>
                                                    <option value="travel">TRAVEL</option>
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Source Project</label>
                                            <select
                                                onChange={e => fetchBillPreview(e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800"
                                            >
                                                <option value="">MANUAL ENTRY</option>
                                                {projects.map((p: any) => (
                                                    <option key={p._id} value={p._id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Client Title</label>
                                            <input required value={modalData.client?.name || ''} onChange={e => setModalData({ ...modalData, client: { ...modalData.client, name: e.target.value } })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800" placeholder="GLOBAL CORP LTD" />
                                        </div>

                                        {modalData.items?.length > 0 && (
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                <p className="text-[10px] font-black uppercase text-primary mb-3">Sync Preview (Hours to Bill)</p>
                                                <div className="space-y-2">
                                                    {modalData.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between text-[10px] font-bold text-slate-600">
                                                            <span>{item.description}</span>
                                                            <span className="font-black text-slate-900">{item.quantity} hrs @ ₹{item.rate}</span>
                                                        </div>
                                                    ))}
                                                    <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900">
                                                        <span>CALCULATED TOTAL</span>
                                                        <span className="text-primary text-sm">₹{modalData.grandTotal?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Override Total</label>
                                                <input type="number" value={modalData.grandTotal || ''} onChange={e => setModalData({ ...modalData, grandTotal: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800" placeholder="0.00" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Liquidation Date</label>
                                                <input required type="date" onChange={e => setModalData({ ...modalData, dueDate: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800" />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Authenticate & Save</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
