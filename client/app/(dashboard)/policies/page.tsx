"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    ShieldCheck,
    FileText,
    Download,
    ExternalLink,
    Search,
    CheckCircle,
    FileBadge,
    AlertCircle,
    Plus,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PolicyModal } from '@/components/policies/PolicyModal';

export default function PoliciesPage() {
    const { user } = useAuth();
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all documents');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const { data } = await api.get('/policies');
            if (data.success) setPolicies(data.policies);
        } catch (err) {
            console.error('Failed to fetch policies');
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (id: string) => {
        try {
            const { data } = await api.patch(`/policies/${id}/acknowledge`);
            if (data.success) fetchPolicies();
        } catch (err) {
            console.error('Failed to acknowledge policy');
        }
    };

    const filteredPolicies = policies.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeTab === 'all documents' || p.category.toLowerCase() === activeTab.replace(' policies', '').toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const categories = ['All Documents', 'HR Policies', 'Security', 'IT', 'Finance', 'Leave'];

    return (
        <ProtectedRoute allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="space-y-10 p-4 md:p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Policy Center</h1>
                        <p className="text-slate-500 font-medium">Official company guidelines, handbooks, and documents.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search documents..."
                                className="w-full md:w-80 pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                            />
                        </div>
                        {user?.role === 'superadmin' && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Plus size={18} /> New Policy
                            </button>
                        )}
                    </div>
                </div>

                {/* Policy Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={cn(
                                "whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all",
                                activeTab === tab.toLowerCase()
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Compliance Status */}
                {!loading && policies.length > 0 && (
                    <div className="p-8 bg-emerald-50 rounded-[40px] border border-emerald-100 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100/50">
                            <ShieldCheck size={32} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-black text-emerald-900 tracking-tight">Compliance Tracking</h3>
                            <p className="text-emerald-600/70 font-medium mt-1">
                                {policies.filter(p => p.acknowledgedBy?.some((a: any) => a.userId === user?._id)).length === policies.length
                                    ? "You have acknowledged all company policies. Your profile is fully compliant."
                                    : `Please review and acknowledge the remaining company guidelines.`
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* Policy Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10 font-sans">
                    {loading ? (
                        [...Array(6)].map((_, i) => <div key={i} className="h-64 bg-slate-50 rounded-[40px] animate-pulse border border-slate-100"></div>)
                    ) : filteredPolicies.length > 0 ? (
                        filteredPolicies.map(policy => {
                            const isAcknowledged = policy.acknowledgedBy?.some((a: any) => a.userId === user?._id);
                            const categoryColors: any = {
                                hr: 'bg-blue-50 text-blue-500',
                                it: 'bg-purple-50 text-purple-500',
                                security: 'bg-red-50 text-red-500',
                                finance: 'bg-emerald-50 text-emerald-500',
                                leave: 'bg-orange-50 text-orange-500',
                                other: 'bg-slate-50 text-slate-500'
                            };

                            return (
                                <div key={policy._id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between overflow-hidden relative">
                                    {isAcknowledged && (
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="bg-emerald-500 text-white p-1 rounded-full">
                                                <CheckCircle size={14} />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={cn("p-4 rounded-2xl shadow-inner", categoryColors[policy.category] || categoryColors.other)}>
                                                <FileBadge size={28} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest leading-none">V{policy.version}</span>
                                        </div>

                                        <h4 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{policy.title}</h4>
                                        <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed line-clamp-3">{policy.content}</p>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between">
                                        {isAcknowledged ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAcknowledge(policy._id)}
                                                className="px-4 py-2 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all shadow-inner"
                                            >
                                                Acknowledge
                                            </button>
                                        )}
                                        <div className="flex gap-2">
                                            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary/5 hover:text-primary transition-all border border-transparent hover:border-primary/10">
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                            <FileText size={48} className="mb-4 opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-xs">No policies found in this category</p>
                        </div>
                    )}
                </div>

                <PolicyModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchPolicies}
                />
            </div>
        </ProtectedRoute>
    );
}
