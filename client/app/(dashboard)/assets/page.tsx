"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    Laptop,
    Smartphone,
    Monitor,
    Headphones,
    Cpu,
    AlertCircle,
    Search,
    CheckCircle2,
    Trash2,
    MoreVertical,
    History,
    Plus,
    User,
    ArrowUpRight,
    Loader2,
    AlertTriangle,
    Wrench,
    Clock,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { AssetModal, AssignAssetModal } from '@/components/assets/AssetModals';
import { ReportIssueModal } from '@/components/assets/ReportIssueModal';

export default function AssetsPage() {
    const { user } = useAuth();
    const [assets, setAssets] = useState<any[]>([]);
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [activeAsset, setActiveAsset] = useState<any>(null);
    const [view, setView] = useState<'inventory' | 'issues'>('inventory');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assetsRes, issuesRes] = await Promise.all([
                api.get('/assets'),
                api.get('/assets/issues')
            ]);
            if (assetsRes.data.success) setAssets(assetsRes.data.assets);
            if (issuesRes.data.success) setIssues(issuesRes.data.issues);
        } catch (err) {
            console.error('Failed to fetch asset data');
        } finally {
            setLoading(false);
        }
    };

    const handleResolveIssue = async (id: string, status: string) => {
        const adminNote = prompt('Add a resolution note (optional):');
        try {
            const { data } = await api.patch(`/assets/issues/${id}`, { status, adminNote });
            if (data.success) fetchData();
        } catch (err) {
            console.error('Failed to update issue');
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this asset?')) return;
        try {
            const { data } = await api.patch(`/assets/${id}/revoke`);
            if (data.success) fetchData();
        } catch (err) {
            console.error('Failed to revoke asset');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently remove this asset from inventory?')) return;
        try {
            const { data } = await api.delete(`/assets/${id}`);
            if (data.success) fetchData();
        } catch (err) {
            console.error('Failed to delete asset');
        }
    };

    const getIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'laptop': return Laptop;
            case 'mobile': return Smartphone;
            case 'monitor': return Monitor;
            case 'headset': return Headphones;
            default: return Cpu;
        }
    };

    const filteredAssets = assets.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.assetTag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="space-y-10 p-4 md:p-0">
                {/* Header Card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary shadow-inner">
                            <Package size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terminal Hub</h1>
                            <div className="flex items-center gap-4 mt-1">
                                <button
                                    onClick={() => setView('inventory')}
                                    className={cn("text-xs font-black uppercase tracking-widest transition-all", view === 'inventory' ? "text-primary border-b-2 border-primary pb-1" : "text-slate-400 hover:text-slate-600")}
                                >
                                    Global Inventory
                                </button>
                                <button
                                    onClick={() => setView('issues')}
                                    className={cn("text-xs font-black uppercase tracking-widest transition-all relative", view === 'issues' ? "text-primary border-b-2 border-primary pb-1" : "text-slate-400 hover:text-slate-600")}
                                >
                                    Maintenance logs
                                    {issues.filter(i => i.status === 'open').length > 0 && (
                                        <span className="absolute -top-1 -right-4 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] animate-pulse">
                                            {issues.filter(i => i.status === 'open').length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search everything..."
                                className="w-full md:w-64 pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm"
                            />
                        </div>
                        {user?.role === 'superadmin' && view === 'inventory' && (
                            <button
                                onClick={() => { setActiveAsset(null); setShowAssetModal(true); }}
                                className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Plus size={18} /> Add Asset
                            </button>
                        )}
                    </div>
                </div>

                {view === 'inventory' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [...Array(4)].map((_, i) => <div key={i} className="h-64 bg-white rounded-[40px] animate-pulse border border-slate-100"></div>)
                        ) : filteredAssets.length > 0 ? (
                            filteredAssets.map(asset => {
                                const Icon = getIcon(asset.category);
                                return (
                                    <div key={asset._id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                                        <div className="absolute top-0 right-0 p-6">
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                                asset.status === 'available' ? "bg-emerald-50 text-emerald-500" :
                                                    asset.status === 'assigned' ? "bg-indigo-50 text-indigo-500" :
                                                        "bg-orange-50 text-orange-500"
                                            )}>
                                                {asset.status}
                                            </div>
                                        </div>

                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500">
                                            <Icon size={28} />
                                        </div>

                                        <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">{asset.name}</h4>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">{asset.brand} {asset.model}</p>

                                        <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-slate-300">Tag</span>
                                                <span className="text-slate-500 font-bold">{asset.assetTag || 'N/A'}</span>
                                            </div>
                                            {asset.assignedTo && (
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-slate-300">Holder</span>
                                                    <div className="flex items-center gap-1.5 text-indigo-500">
                                                        <User size={12} />
                                                        <span>{asset.assignedTo.name}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-all bg-white/95 backdrop-blur-md flex gap-2">
                                            {user?.role === 'superadmin' ? (
                                                <>
                                                    {asset.status === 'available' ? (
                                                        <button
                                                            onClick={() => { setActiveAsset(asset); setShowAssignModal(true); }}
                                                            className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110"
                                                        >
                                                            Assign User
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRevoke(asset._id)}
                                                            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200"
                                                        >
                                                            Revoke
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(asset._id)}
                                                        className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                asset.status === 'assigned' && (
                                                    <button
                                                        onClick={() => { setActiveAsset(asset); setShowReportModal(true); }}
                                                        className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                                                    >
                                                        <AlertTriangle size={14} /> Report Problem
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                <Package size={48} className="mb-4 opacity-10" />
                                <p className="font-black text-xs uppercase tracking-widest">Digital vacuum. No assets registered.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Issues / Maintenance Log */
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Active Maintenance Logs</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Lifecycle Trouble Tracking</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
                        ) : issues.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported By</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Type</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            {user?.role === 'superadmin' && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Admin Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {issues.map(issue => (
                                            <tr key={issue._id} className="hover:bg-slate-50/50 transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                            <User size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-slate-700">{issue.reportedBy.name}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{new Date(issue.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-sm font-bold text-slate-600">{issue.assetId.name}</div>
                                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{issue.assetId.assetTag}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{issue.issueType}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        issue.priority === 'critical' ? 'text-red-500' :
                                                            issue.priority === 'high' ? 'text-orange-500' :
                                                                issue.priority === 'medium' ? 'text-blue-500' : 'text-slate-400'
                                                    )}>
                                                        {issue.priority}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            issue.status === 'open' ? "bg-red-500 animate-pulse" :
                                                                issue.status === 'in-progress' ? "bg-yellow-500" :
                                                                    "bg-emerald-500"
                                                        )}></div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{issue.status}</span>
                                                    </div>
                                                </td>
                                                {user?.role === 'superadmin' && (
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {issue.status === 'open' && (
                                                                <button
                                                                    onClick={() => handleResolveIssue(issue._id, 'in-progress')}
                                                                    className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-all shadow-sm"
                                                                    title="Mark In-Progress"
                                                                >
                                                                    <Clock size={16} />
                                                                </button>
                                                            )}
                                                            {issue.status !== 'resolved' && (
                                                                <button
                                                                    onClick={() => handleResolveIssue(issue._id, 'resolved')}
                                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all shadow-sm"
                                                                    title="Resolve"
                                                                >
                                                                    <Check size={16} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => { alert(`Issue Description: ${issue.description}\n\nAdmin Notes: ${issue.adminNote || 'None'}`); }}
                                                                className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-all shadow-sm"
                                                            >
                                                                <MoreVertical size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-20 text-center flex flex-col items-center">
                                <Wrench size={48} className="text-slate-100 mb-4" />
                                <p className="font-black text-xs text-slate-300 uppercase tracking-widest">No maintenance requests found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Support Banner (Lower) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                    <div className="lg:col-span-2 p-10 bg-slate-900 rounded-[40px] border border-slate-800 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12">
                            <Cpu size={200} />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-primary/20 rounded-[24px] flex items-center justify-center text-primary">
                                    <History size={32} />
                                </div>
                                <h3 className="text-4xl font-black tracking-tight leading-none">Maintenance <br /> Intelligence</h3>
                                <p className="text-slate-400 font-medium max-w-md">Track hardware health and reporting trends to optimize your company's equipment lifecycle.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-indigo-600 rounded-[40px] shadow-2xl shadow-indigo-600/20 flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                                <AlertCircle size={32} />
                            </div>
                            <h4 className="text-2xl font-black text-white leading-tight">Helpful Tip</h4>
                            <p className="text-white/70 text-sm font-medium leading-relaxed">Regular maintenance reports help IT provide better equipment upgrades for the whole team.</p>
                        </div>
                        <div className="mt-8 font-black text-xs text-white uppercase tracking-[0.2em] opacity-40">Operational excellence</div>
                    </div>
                </div>

                <AssetModal
                    isOpen={showAssetModal}
                    onClose={() => setShowAssetModal(false)}
                    onSuccess={fetchData}
                    asset={activeAsset}
                />

                <AssignAssetModal
                    isOpen={showAssignModal}
                    onClose={() => setShowAssignModal(false)}
                    onSuccess={fetchData}
                    assetId={activeAsset?._id}
                />

                {activeAsset && (
                    <ReportIssueModal
                        isOpen={showReportModal}
                        onClose={() => setShowReportModal(false)}
                        onSuccess={fetchData}
                        assetId={activeAsset._id}
                        assetName={activeAsset.name}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}

const Package = ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
);
