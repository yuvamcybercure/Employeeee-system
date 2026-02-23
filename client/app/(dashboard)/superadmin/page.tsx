"use client";

import React from 'react';
import DashboardLayout from '../layout';
import { PermissionMatrix } from '@/components/PermissionMatrix';
import { GeofenceSettings } from '@/components/GeofenceSettings';
import { motion } from 'framer-motion';
import {
    ShieldAlert,
    Users,
    FileText,
    Settings,
    ShieldCheck,
    Activity,
    Server,
    Globe,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function SuperadminDashboard() {
    const stats = [
        { label: "Active Nodes", value: "156", icon: Users, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-100" },
        { label: "Protocol Compliance", value: "12", sub: "Active", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
        { label: "Grid Status", value: "Online", icon: Globe, color: "text-primary", bg: "bg-blue-50", border: "border-blue-100" },
        { label: "Compute Load", value: "42%", icon: Activity, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
    ];

    return (
        <DashboardLayout allowedRoles={['superadmin']}>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-12 pb-20"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">System Matrix</h1>
                        <p className="text-slate-500 font-bold mt-3 text-lg">Global infrastructure and governance control center.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/30 hover:scale-[1.02] transition-all">
                            <ShieldAlert size={18} /> Protocol Logs
                        </button>
                        <button className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center text-primary shadow-xl hover-scale">
                            <Server size={24} />
                        </button>
                    </div>
                </motion.div>

                {/* System Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            variants={itemVariants}
                            key={i}
                            className="glass-card p-6 rounded-[2.5rem] border-white/50 hover-scale group"
                        >
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                            <div className="mt-4 flex items-center justify-between">
                                <h4 className={cn("text-3xl font-black tracking-tight", stat.color === 'text-primary' ? 'text-primary' : (stat.value === 'Online' ? 'text-emerald-500' : 'text-slate-900'))}>
                                    {stat.value}
                                    {stat.sub && <span className="text-xs font-bold text-slate-300 ml-1.5">{stat.sub}</span>}
                                </h4>
                                <div className={cn("w-14 h-14 rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110", stat.bg, stat.color, stat.border)}>
                                    <stat.icon size={28} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    {/* Role & Access Management */}
                    <motion.div variants={itemVariants} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 premium-gradient rounded-3xl flex items-center justify-center text-white shadow-xl shadow-primary/30">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Security Hardening</h2>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">RBAC & Governance Protocol</p>
                            </div>
                        </div>
                        <div className="glass-card rounded-[3rem] p-4 overflow-hidden border-white/40">
                            <PermissionMatrix />
                        </div>
                    </motion.div>

                    {/* Geofencing & Security Config */}
                    <motion.div variants={itemVariants} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 accent-gradient rounded-3xl flex items-center justify-center text-white shadow-xl shadow-accent/30">
                                <Settings size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Global Parameters</h2>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Geospatial Enforcement</p>
                            </div>
                        </div>

                        <div className="glass-card rounded-[3rem] p-8 border-white/40">
                            <GeofenceSettings />
                        </div>

                        {/* High-Risk Warning Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl shadow-slate-900/20 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-10 text-white/5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
                                <Zap size={160} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-2xl font-black tracking-tight flex items-center gap-3 italic">
                                    <ShieldAlert className="text-amber-400" size={28} />
                                    Critical Lockdown
                                </h4>
                                <p className="text-slate-400 font-medium text-sm mt-6 leading-relaxed max-w-sm">
                                    Override system access, force session terminations, or deploy global MFA requirements for administrative accounts.
                                </p>
                                <div className="mt-10 flex flex-wrap items-center gap-4">
                                    <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-xl">
                                        Deploy MFA
                                    </button>
                                    <button className="px-8 py-4 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all border border-white/5 backdrop-blur-md">
                                        Audit Access
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
