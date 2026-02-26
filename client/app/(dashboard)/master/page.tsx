"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    Globe,
    Users,
    Building2,
    Activity,
    Plus,
    Search,
    Power,
    ShieldCheck,
    BarChart3,
    ArrowUpRight,
    Loader2,
    Sparkles,
    Eye,
    Zap,
    LayoutDashboard,
    X,
    UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from '@/components/ui/toaster';

export default function MasterDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, orgsRes] = await Promise.all([
                api.get('/master/stats'),
                api.get('/master/organizations')
            ]);
            if (statsRes.data.success) setStats(statsRes.data.stats);
            if (orgsRes.data.success) setOrganizations(orgsRes.data.organizations);
        } catch (err) {
            toast.error('Failed to load platform data');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrgUsers = async (orgId: string) => {
        setLoadingUsers(true);
        try {
            // We need an endpoint to fetch users for a specific org by master admin
            // For now, let's assume we can use a query param or a master-only endpoint
            const { data } = await api.get(`/users?organizationId=${orgId}`);
            if (data.success) setUsers(data.users);
        } catch (err) {
            toast.error('Failed to load users for this organization');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleImpersonate = async (userId: string) => {
        try {
            const { data } = await api.post('/master/impersonate', { userId });
            if (data.success) {
                toast.success(data.message);
                window.location.href = '/dashboard';
            }
        } catch (err) {
            toast.error('Impersonation protocol failed');
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            const { data } = await api.post(`/master/organizations/${id}/toggle`);
            if (data.success) {
                toast.success('Organization status updated');
                fetchData();
            }
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleAIPulse = () => {
        if (!aiPrompt) return;
        toast.info('AI Pulse is processing your platform update request...', { icon: <Sparkles className="animate-pulse" /> });
        // Simulation of platform-wide update
        setTimeout(() => {
            toast.success('Platform-wide update simulated successfully');
            setAiPrompt('');
        }, 3000);
    };

    const filteredOrgs = organizations.filter(o =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['master-admin']}>
            <div className="space-y-10 pb-20">
                {/* Master Command Header */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Global Tenants', value: stats?.totalOrganizations || 0, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { label: 'Platform Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                        { label: 'Active Flux', value: stats?.activeUsers || 0, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        { label: 'Monthly ARR', value: `$${stats?.subscriptionRevenue || 0}`, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", s.bg, s.color)}>
                                <s.icon size={28} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{s.label}</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tactical Control Area */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    <div className="xl:col-span-2 space-y-8">
                        {/* Organization Management */}
                        <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Platform Clients</h2>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 italic">Multi-tenant Isolation Matrix</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Find organization..."
                                            className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all w-full md:w-64"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-all shadow-xl active:scale-95"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Slug/ID</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-10 py-8"><div className="h-6 bg-slate-100 rounded-lg"></div></td></tr>)
                                        ) : filteredOrgs.map(org => (
                                            <tr key={org._id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black">
                                                            {org.logo ? <img src={org.logo} className="w-full h-full object-cover rounded-2xl" /> : org.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-800">{org.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(org.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <code className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-lg uppercase tracking-widest">{org.slug}</code>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                                        org.isActive ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                                                    )}>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", org.isActive ? "bg-emerald-500" : "bg-rose-500")} />
                                                        {org.isActive ? 'Active' : 'Locked'}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleToggleStatus(org._id)}
                                                            className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
                                                            title={org.isActive ? 'Suspend' : 'Activate'}
                                                        >
                                                            <Power size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedOrg(org); fetchOrgUsers(org._id); }}
                                                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-all shadow-xl"
                                                            title="Enter as Moderator"
                                                        >
                                                            <Eye size={14} /> Switch Context
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* AI Pulse Panel */}
                        <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                                <Sparkles size={160} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full space-y-8">
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-primary/20 rounded-[28px] flex items-center justify-center text-primary shadow-2xl shadow-primary/20 border border-primary/20">
                                        <Sparkles size={32} />
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight leading-none">Master Pulse</h3>
                                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest italic opacity-60">AI Platform Transformation Engine</p>
                                </div>

                                <p className="text-slate-300 text-sm font-medium leading-relaxed">
                                    Enter a natural language command to modify platform architecture, inject global features, or update tenant configurations.
                                </p>

                                <div className="space-y-4">
                                    <textarea
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        placeholder="e.g. 'Add a new 'Telehealth' module to all Healthcare organizations and enable premium dark mode branding...'"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/40 min-h-[120px] scrollbar-none italic"
                                    />
                                    <button
                                        onClick={handleAIPulse}
                                        disabled={!aiPrompt}
                                        className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale"
                                    >
                                        Execute Global Update
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Switchboard Info */}
                        <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-600/20">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <ShieldCheck size={28} />
                                </div>
                                <h4 className="text-xl font-black tracking-tight leading-tight">Secure <br /> Switchboard</h4>
                            </div>
                            <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-8">
                                Role switching generates temporary cryptographically signed sessions. Always ensure you exit a client context before ending your shift.
                            </p>
                            <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Operational Integrity</div>
                                <Activity size={18} className="opacity-40 animate-pulse text-emerald-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Org Modal (Simplified Placeholder) */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-white/20">
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Initialize New Tenant</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">System Deployment Protocol</p>

                        <div className="space-y-4">
                            <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold" placeholder="Organization Legal Name" />
                            <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold" placeholder="Tenant Slug (e.g. google, msft)" />
                            <div className="grid grid-cols-2 gap-4">
                                <input className="w-full px-10 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold" placeholder="Admin Email" />
                                <input className="w-full px-10 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold" placeholder="Temporary Key" />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Abort</button>
                            <button onClick={() => { setShowCreateModal(false); toast.success('Deployment initiated'); }} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary shadow-xl transition-all">Confirm Deploy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Switch Context Modal */}
            {selectedOrg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800">Switching Context: {selectedOrg.name}</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Select an identity to assume</p>
                            </div>
                            <button onClick={() => setSelectedOrg(null)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-10 max-h-[60vh] overflow-y-auto scrollbar-none">
                            {loadingUsers ? (
                                <div className="flex flex-col items-center py-20 opacity-20">
                                    <Loader2 size={48} className="animate-spin" />
                                    <p className="text-xs font-black uppercase tracking-widest mt-4">Scanning tenant users...</p>
                                </div>
                            ) : users.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {users.map(u => (
                                        <button
                                            key={u._id}
                                            onClick={() => handleImpersonate(u._id)}
                                            className="p-6 bg-slate-50 border border-transparent rounded-[2rem] text-left hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary border border-slate-100 transition-colors">
                                                    {u.profilePhoto ? <img src={u.profilePhoto} className="w-full h-full object-cover rounded-2xl" /> : <UserCircle size={24} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 leading-tight">{u.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn(
                                                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                                            u.role === 'superadmin' ? "bg-indigo-100 text-indigo-600" :
                                                                u.role === 'admin' ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-600"
                                                        )}>{u.role}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center opacity-20 italic font-bold">No users found in this organization.</div>
                            )}
                        </div>

                        <div className="p-10 bg-slate-50 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Warning: All actions taken while in an impersonated context are logged and attributed to the Master Admin.</p>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
