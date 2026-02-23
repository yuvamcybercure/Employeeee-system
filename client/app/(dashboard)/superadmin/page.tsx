"use client";

import React from 'react';
import DashboardLayout from '../layout';
import { PermissionMatrix } from '@/components/PermissionMatrix';
import { GeofenceSettings } from '@/components/GeofenceSettings';
import { ShieldAlert, Users, FileText, Settings, ShieldCheck } from 'lucide-react';

export default function SuperadminDashboard() {
    return (
        <DashboardLayout allowedRoles={['superadmin']}>
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Administration</h1>
                        <p className="text-slate-500 font-medium">Manage global configurations, permissions, and system health.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all">
                            <ShieldAlert size={18} /> View System Logs
                        </button>
                    </div>
                </div>

                {/* System Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Users</p>
                        <div className="mt-2 flex items-center justify-between">
                            <h4 className="text-2xl font-black">156</h4>
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                <Users size={20} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Policies</p>
                        <div className="mt-2 flex items-center justify-between">
                            <h4 className="text-2xl font-black">12</h4>
                            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                                <FileText size={20} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
                        <div className="mt-2 flex items-center justify-between">
                            <h4 className="text-2xl font-black text-green-600">Healthy</h4>
                            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Used</p>
                        <div className="mt-2 flex items-center justify-between">
                            <h4 className="text-2xl font-black">42%</h4>
                            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                                <Settings size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {/* Left Column: Permission Matrix */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <ShieldCheck size={24} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-800">RBAC Management</h2>
                        </div>
                        <PermissionMatrix />
                    </div>

                    {/* Right Column: Geofencing & Security */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <Settings size={24} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-800">Global Settings</h2>
                        </div>
                        <GeofenceSettings />

                        {/* Additional Configuration Card */}
                        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <ShieldAlert size={140} />
                            </div>
                            <h4 className="text-lg font-bold relative z-10">Security Hardening</h4>
                            <p className="text-slate-400 text-sm mt-2 relative z-10 max-w-sm">Enable IP restriction and Force MFA for administrative accounts to enhance system security.</p>
                            <div className="mt-8 flex items-center gap-4 relative z-10">
                                <button className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                                    Configure MFA
                                </button>
                                <button className="px-6 py-2.5 bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5">
                                    IP Logs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
