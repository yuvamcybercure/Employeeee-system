"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    Building2,
    Plus,
    Search,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Activity,
    Users,
    Globe,
    Loader2,
    Eye,
    Power,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from '@/components/ui/toaster';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrganizationFlux() {
    const [loading, setLoading] = useState(true);
    const [orgs, setOrgs] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newOrg, setNewOrg] = useState({
        name: '',
        slug: '',
        adminName: '',
        adminEmail: '',
        adminPassword: ''
    });

    useEffect(() => {
        fetchOrgs();
    }, []);

    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/master/organizations');
            if (data.success) setOrgs(data.organizations);
        } catch (err) {
            toast.error('Failed to load organization flux');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/master/organizations', newOrg);
            if (data.success) {
                toast.success('New organization synthesized successfully');
                setShowCreateModal(false);
                setNewOrg({ name: '', slug: '', adminName: '', adminEmail: '', adminPassword: '' });
                fetchOrgs();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Synthesis failed');
        }
    };

    const handleToggle = async (id: string) => {
        try {
            const { data } = await api.post(`/master/organizations/${id}/toggle`);
            if (data.success) {
                toast.success(`Organization ${data.organization.isActive ? 'activated' : 'deactivated'}`);
                setOrgs(orgs.map(o => o._id === id ? data.organization : o));
            }
        } catch (err) {
            toast.error('Phase shift failed');
        }
    };

    const filteredOrgs = orgs.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['master-admin']}>
            <div className="space-y-10 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Organization Flux</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2 italic">Multi-Tenant Life Cycle Manager</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search flux stream..."
                                className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all w-64 shadow-sm"
                            />
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-slate-900 text-white px-8 py-3 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2"
                        >
                            <Plus size={16} /> Synthesis Org
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-[3rem] p-8 border border-slate-100 animate-pulse h-64" />
                        ))
                    ) : filteredOrgs.map((org) => (
                        <motion.div
                            key={org._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                                "bg-white rounded-[3rem] p-10 border transition-all duration-500 hover:shadow-2xl group relative overflow-hidden",
                                org.isActive ? "border-slate-100 shadow-sm" : "border-red-100 bg-red-50/10 grayscale opacity-60"
                            )}
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                                    {org.logo ? <img src={org.logo} className="w-full h-full object-cover" /> : <Building2 className="text-slate-400" size={32} />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggle(org._id)}
                                        title={org.isActive ? "Deactivate" : "Activate"}
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                            org.isActive ? "bg-emerald-50 text-emerald-500 hover:bg-red-50 hover:text-red-500" : "bg-red-50 text-red-500 hover:bg-emerald-50 hover:text-emerald-500"
                                        )}
                                    >
                                        <Power size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{org.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SLUG: {org.slug}</p>
                                </div>

                                <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</span>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit",
                                            org.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                        )}>
                                            {org.isActive ? 'Operational' : 'Halted'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Created</span>
                                        <span className="text-xs font-bold text-slate-600">
                                            {new Date(org.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Zap className="absolute -bottom-6 -right-6 text-slate-100 opacity-20 group-hover:text-primary/20 group-hover:scale-125 transition-all" size={120} />
                        </motion.div>
                    ))}
                </div>

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCreateModal(false)}
                                className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-[100]"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-[4rem] shadow-2xl z-[110] overflow-hidden p-16"
                            >
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Synthesis Org</h2>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-10">Generate a new platform tenant and admin</p>

                                <form onSubmit={handleCreate} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Org Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={newOrg.name}
                                                onChange={e => setNewOrg({ ...newOrg, name: e.target.value })}
                                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-inner"
                                                placeholder="e.g. Acme Corp"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slug (Identifier)</label>
                                            <input
                                                required
                                                type="text"
                                                value={newOrg.slug}
                                                onChange={e => setNewOrg({ ...newOrg, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-inner"
                                                placeholder="e.g. acme-corp"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Superadmin Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={newOrg.adminName}
                                            onChange={e => setNewOrg({ ...newOrg, adminName: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-inner"
                                            placeholder="System Overlord"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
                                            <input
                                                required
                                                type="email"
                                                value={newOrg.adminEmail}
                                                onChange={e => setNewOrg({ ...newOrg, adminEmail: e.target.value })}
                                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-inner"
                                                placeholder="admin@acme.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Password</label>
                                            <input
                                                required
                                                type="password"
                                                value={newOrg.adminPassword}
                                                onChange={e => setNewOrg({ ...newOrg, adminPassword: e.target.value })}
                                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-inner"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                                        >
                                            Abort Plan
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 bg-slate-900 text-white px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-2xl active:scale-95"
                                        >
                                            Initiate Synthesis
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    );
}
