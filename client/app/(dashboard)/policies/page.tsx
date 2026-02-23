"use client";

import React, { useState } from 'react';
import DashboardLayout from '../layout';
import {
    ShieldCheck,
    FileText,
    Download,
    ExternalLink,
    Search,
    CheckCircle,
    FileBadge,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PoliciesPage() {
    const [activeTab, setActiveTab] = useState('active');

    return (
        <DashboardLayout allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Policy Center</h1>
                        <p className="text-slate-500 font-medium">Official company guidelines, handbooks, and documents.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="w-full md:w-80 pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Policy Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['All Documents', 'HR Policies', 'Security', 'Onboarding', 'Legal'].map((tab, i) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={cn(
                                "whitespace-nowrap px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                (activeTab === tab.toLowerCase() || (i === 0 && activeTab === 'active'))
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Global Policy Acknowledgement Tracker */}
                <div className="p-8 bg-emerald-50 rounded-[40px] border border-emerald-100 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-emerald-500 shadow-sm">
                        <ShieldCheck size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-black text-emerald-900">Compliant Profile</h3>
                        <p className="text-emerald-600/70 font-medium mt-1">You have acknowledged all 12 mandatory company policies. Your profile is up to date.</p>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm">
                        <CheckCircle size={16} /> Fully Verified
                    </div>
                </div>

                {/* Policy Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockPolicies.map(policy => (
                        <div key={policy.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn("p-4 rounded-2xl shadow-inner", policy.color)}>
                                    <FileBadge size={28} />
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">V{policy.version}</span>
                            </div>

                            <h4 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{policy.title}</h4>
                            <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">{policy.desc}</p>

                            <div className="mt-8 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acknowledged</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" title="View">
                                        <ExternalLink size={18} />
                                    </button>
                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" title="Download">
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Compliance Warning (Mock) */}
                <div className="p-8 bg-slate-900 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 border-4 border-slate-800">
                    <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                        <AlertCircle size={32} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold">Privacy Update (GDPR Compliance)</h4>
                        <p className="text-slate-400 text-sm mt-1 font-medium">A new version of the Privacy Policy has been released. Please review and acknowledge by Friday.</p>
                    </div>
                    <button className="px-8 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                        Review Now
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}

const mockPolicies = [
    { id: 1, title: 'Code of Conduct', desc: 'Our shared values and behavioral expectations for a positive and inclusive workplace.', version: '2.4', color: 'bg-blue-50 text-blue-500' },
    { id: 2, title: 'Information Security', desc: 'Guidelines for data protection, password management, and system usage protocols.', version: '1.8', color: 'bg-purple-50 text-purple-500' },
    { id: 3, title: 'Work From Home', desc: 'Eligibility, communication standards, and hardware support for remote work.', version: '3.1', color: 'bg-orange-50 text-orange-500' },
    { id: 4, title: 'Employee Handbook', desc: 'The comprehensive guide to all things TaskEase, from leave to payroll.', version: '5.0', color: 'bg-emerald-50 text-emerald-500' },
    { id: 5, title: 'Anti-Harassment', desc: 'Our zero-tolerance policy and reporting mechanisms for any form of harassment.', version: '2.0', color: 'bg-red-50 text-red-500' },
    { id: 6, title: 'Travel Policy', desc: 'Approved expense limits and procedures for company-sponsored travel.', version: '1.2', color: 'bg-slate-50 text-slate-500' },
];
