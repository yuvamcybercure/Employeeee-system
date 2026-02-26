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
    CheckCircle2,
    History,
    Loader2,
    AlertTriangle,
    Shield,
    Package,
    ArrowRightCircle,
    FileSearch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ReportIssueModal } from '@/components/assets/ReportIssueModal';

export default function AssetsPage() {
    const { user } = useAuth();
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [activeAsset, setActiveAsset] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/assets');
            if (data.success) {
                // Backend already filters by user if role is employee
                setAssets(data.assets);
            }
        } catch (err) {
            console.error('Failed to fetch personal assets');
        } finally {
            setLoading(false);
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

    return (
        <ProtectedRoute allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="space-y-10">
                {/* Minimalist Hero */}
                <div className="relative p-10 bg-slate-900 rounded-[3rem] overflow-hidden text-white shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Shield size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight leading-none">Security Hardware <br /> Inventory</h1>
                            <p className="text-slate-400 font-bold mt-4 max-w-md italic">The following equipment has been officially assigned to you. You are responsible for its upkeep and secure maintenance.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Total Items</p>
                                <p className="text-2xl font-black mt-1">{assets.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="h-64 bg-white rounded-[3rem] animate-pulse border border-slate-100"></div>)
                    ) : assets.length > 0 ? (
                        assets.map(asset => {
                            const Icon = getIcon(asset.category);
                            return (
                                <div key={asset._id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                                    <div className="absolute top-0 right-0 p-6">
                                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                                            ACTIVE Assignment
                                        </div>
                                    </div>

                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-8 group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500">
                                        <Icon size={32} />
                                    </div>

                                    <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">{asset.name}</h4>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">{asset.brand} {asset.model}</p>

                                    <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Tag</p>
                                                <p className="text-xs font-mono font-black text-slate-700">{asset.assetTag || 'NO TAG'}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Serial Num</p>
                                                <p className="text-xs font-mono font-black text-slate-700 truncate">{asset.serialNumber || 'NO SN'}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => { setActiveAsset(asset); setShowReportModal(true); }}
                                            className="w-full py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                        >
                                            <AlertTriangle size={16} /> Report Technical Fault
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 select-none">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                <Package size={40} className="opacity-20" />
                            </div>
                            <h3 className="text-lg font-black text-slate-300 tracking-tight uppercase">No assets identified</h3>
                            <p className="text-xs font-bold mt-2 italic">Your workspace inventory is currently empty.</p>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="bg-indigo-600 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-[24px] flex items-center justify-center">
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Digital Custodianship</h3>
                            <p className="text-indigo-100 text-sm font-medium mt-1">Please ensure your equipment is handled with care and all software is kept up to date.</p>
                        </div>
                    </div>
                </div>

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
