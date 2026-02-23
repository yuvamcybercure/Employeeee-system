"use client";

import React, { useState } from 'react';
import DashboardLayout from '../layout';
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
    History
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AssetsPage() {
    const [loading, setLoading] = useState(false);

    return (
        <DashboardLayout allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Assets</h1>
                        <p className="text-slate-500 font-medium">Track your assigned hardware, serials, and equipment status.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all text-slate-600">
                            <History size={20} /> Request Replacement
                        </button>
                    </div>
                </div>

                {/* Assets Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mockAssets.map(asset => (
                        <div key={asset.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6">
                                <div className={cn("p-2 rounded-xl", asset.status === 'Healthy' ? "bg-emerald-50 text-emerald-500" : "bg-orange-50 text-orange-500")}>
                                    {asset.status === 'Healthy' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                </div>
                            </div>

                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500">
                                <asset.icon size={28} />
                            </div>

                            <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none">{asset.name}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{asset.category}</p>

                            <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Serial</span>
                                    <span className="text-[10px] font-bold text-slate-500">{asset.serial}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Issued</span>
                                    <span className="text-[10px] font-bold text-slate-500">{asset.issued}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Support Banner */}
                <div className="p-8 bg-slate-900 rounded-[40px] border border-slate-800 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Cpu size={140} className="text-white" />
                    </div>
                    <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary relative z-10">
                        <Headphones size={32} />
                    </div>
                    <div className="flex-1 space-y-1 relative z-10">
                        <h4 className="text-xl font-bold text-white">Need tech support?</h4>
                        <p className="text-slate-400 text-sm font-medium">Open a ticket for hardware issues, software licenses, or accessory requests.</p>
                    </div>
                    <button className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all relative z-10">
                        Contact IT Support
                    </button>
                </div>

                {/* Inventory Management Table (Admin View Placeholder) */}
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="font-black text-slate-800 tracking-tight">Recent Allocations</h3>
                        <div className="flex gap-2">
                            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {[1, 2, 3].map(i => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-5">
                                            <span className="font-bold text-sm text-slate-700">AST-2024-00{i}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                                                <span className="text-sm font-medium text-slate-600">Employee #{i}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-medium text-slate-500">Jan {i + 5}, 2024</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Revoke</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const mockAssets = [
    { id: 1, name: 'MacBook Pro M3', category: 'Computing', serial: 'NB-2024-X42', issued: 'Jan 10, 2024', status: 'Healthy', icon: Laptop },
    { id: 2, name: 'iPhone 15 Pro', category: 'Mobile', serial: 'PH-X-9981-A', issued: 'Feb 12, 2024', status: 'Repair Needed', icon: Smartphone },
    { id: 3, name: 'Dell UltraSharp 27"', category: 'Peripherals', serial: 'MN-DE-4412', issued: 'Jan 10, 2024', status: 'Healthy', icon: Monitor },
    { id: 4, name: 'Sony WH-1000XM5', category: 'Audio', serial: 'AD-SN-8821', issued: 'Mar 05, 2024', status: 'Healthy', icon: Headphones },
];
