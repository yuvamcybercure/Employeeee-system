"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    Laptop,
    Smartphone,
    Monitor,
    Headphones,
    Cpu,
    Search,
    Plus,
    User,
    Loader2,
    Trash2,
    Clock,
    Check,
    Wrench,
    AlertTriangle,
    Package,
    Shield,
    BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { AssetModal, AssignAssetModal } from '@/components/assets/AssetModals';

export default function InventoryPage() {
    const { user } = useAuth();
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [activeAsset, setActiveAsset] = useState<any>(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/assets');
            if (data.success) setAssets(data.assets);
        } catch (err: any) {
            console.error('Failed to fetch assets:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this asset from the current user?')) return;
        try {
            const { data } = await api.patch(`/assets/${id}/revoke`);
            if (data.success) fetchAssets();
        } catch (err) {
            console.error('Failed to revoke asset');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently remove this asset from the organization database?')) return;
        try {
            const { data } = await api.delete(`/assets/${id}`);
            if (data.success) fetchAssets();
        } catch (err) {
            console.error('Failed to delete asset');
        }
    };

    const getIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'laptop': return Laptop;
            case 'mobile': return Smartphone;
            case 'monitor': return Monitor;
            case 'headset': return Headphones;
            default: return Cpu;
        }
    };

    const filteredAssets = assets.filter(a => {
        const matchesQuery = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.assetTag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchesQuery && matchesCategory && matchesStatus;
    });

    const stats = {
        total: assets.length,
        available: assets.filter(a => a.status === 'available').length,
        assigned: assets.filter(a => a.status === 'assigned').length,
        maintenance: assets.filter(a => a.status === 'under-repair').length
    };

    return (
        <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
            <div className="space-y-8 pb-20">
                {/* Inventory Intelligence Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Stock', value: stats.total, icon: Package, color: 'text-slate-600', bg: 'bg-slate-50' },
                        { label: 'Available', value: stats.available, icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        { label: 'In Use', value: stats.assigned, icon: User, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                        { label: 'Repairing', value: stats.maintenance, icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-50' },
                    ].map((s, i) => (
                        <div key={i} className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", s.bg, s.color)}>
                                <s.icon size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
                                <p className="text-xl font-black text-slate-900 mt-1">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by tag, serial or name..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-xs"
                            />
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="all">All Categories</option>
                            <option value="laptop">Laptops</option>
                            <option value="mobile">Mobiles</option>
                            <option value="monitor">Monitors</option>
                            <option value="furniture">Furniture</option>
                            <option value="other">Others</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="all">All States</option>
                            <option value="available">Available</option>
                            <option value="assigned">Assigned</option>
                            <option value="under-repair">Under Repair</option>
                            <option value="retired">Retired</option>
                        </select>
                    </div>

                    <button
                        onClick={() => { setActiveAsset(null); setShowAssetModal(true); }}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-primary transition-all active:scale-95"
                    >
                        <Plus size={16} /> Register New Gear
                    </button>
                </div>

                {/* Table View */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Details</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identification</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Holder</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded-lg w-full"></div></td>
                                        </tr>
                                    ))
                                ) : filteredAssets.length > 0 ? (
                                    filteredAssets.map(asset => {
                                        const Icon = getIcon(asset.category);
                                        return (
                                            <tr key={asset._id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                                            <Icon size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-800 leading-none">{asset.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{asset.brand} {asset.model}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[8px] font-black text-slate-300 uppercase">Tag:</span>
                                                            <span className="text-[11px] font-mono font-bold text-slate-600">{asset.assetTag || '---'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[8px] font-black text-slate-300 uppercase">SN:</span>
                                                            <span className="text-[11px] font-mono text-slate-400">{asset.serialNumber || '---'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1 rounded-full border",
                                                        asset.status === 'available' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                            asset.status === 'assigned' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                                "bg-rose-50 text-rose-600 border-rose-100"
                                                    )}>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full",
                                                            asset.status === 'available' ? "bg-emerald-500" :
                                                                asset.status === 'assigned' ? "bg-indigo-500" : "bg-rose-500"
                                                        )}></div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{asset.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {asset.assignedTo ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center font-black text-[10px]">
                                                                {asset.assignedTo.name?.[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-700 leading-none">{asset.assignedTo.name}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{new Date(asset.assignedDate).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase italic">In Storage</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => { setActiveAsset(asset); setShowAssetModal(true); }}
                                                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                        >
                                                            <Wrench size={16} />
                                                        </button>
                                                        {asset.status === 'available' ? (
                                                            <button
                                                                onClick={() => { setActiveAsset(asset); setShowAssignModal(true); }}
                                                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                                                            >
                                                                Assign
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleRevoke(asset._id)}
                                                                className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all"
                                                            >
                                                                Revoke
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(asset._id)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center opacity-20">
                                                <AlertTriangle size={48} />
                                                <p className="text-xs font-black uppercase tracking-widest mt-4">Zero elements found in search space</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AssetModal
                isOpen={showAssetModal}
                onClose={() => setShowAssetModal(false)}
                onSuccess={fetchAssets}
                asset={activeAsset}
            />

            <AssignAssetModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onSuccess={fetchAssets}
                assetId={activeAsset?._id}
            />
        </ProtectedRoute>
    );
}
