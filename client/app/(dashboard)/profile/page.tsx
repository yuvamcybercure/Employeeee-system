"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    User,
    FileText,
    Shield,
    Camera,
    Upload,
    Save,
    Loader2,
    ShieldCheck,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    MapPin,
    Users,
    AlertTriangle,
    CheckCircle2,
    IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { DocumentManager } from '@/components/profile/DocumentManager';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { BankDetailsForm } from '@/components/profile/BankDetailsForm';

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'security' | 'bank'>('profile');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!user) return null;
    const refreshUser = async () => {
        try {
            const { data } = await api.get(`/users/${user._id}`);
            if (data.success) {
                // Update local auth state if possible, though context might handle it
            }
        } catch (err) {
            console.error('Failed to refresh user');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['employee', 'admin', 'superadmin', 'master-admin']}>
            <div className="max-w-7xl mx-auto space-y-10 pb-20 p-4 md:p-0">
                {/* Profile Header */}
                <div className="relative bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5"></div>

                    <div className="relative pt-16 px-10 pb-10 flex flex-col md:flex-row items-end gap-8">
                        {/* Photo Container */}
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl overflow-hidden ring-4 ring-white border border-slate-100">
                                {user?.profilePhoto ? (
                                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover rounded-[1.8rem]" />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>
                            <button className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all group-hover:rotate-12">
                                <Camera size={20} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-2 mb-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
                                <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                                    {user?.role}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <span>{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase size={16} />
                                    <span>{user?.designation || 'Staff Member'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    <span>{user?.organizationId?.name || 'Global Platform'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 text-center md:text-right">Account Compliance</p>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '85%' }}
                                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                />
                            </div>
                            <p className="text-[10px] font-bold text-emerald-500 text-center md:text-right">Profile 85% Complete</p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-8 px-10 border-t border-slate-50 bg-slate-50/30 overflow-x-auto scrollbar-none">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={cn(
                                "flex items-center gap-2 py-6 text-xs font-black uppercase tracking-widest transition-all relative shrink-0",
                                activeTab === 'profile' ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <User size={16} /> General Profile
                            {activeTab === 'profile' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('bank')}
                            className={cn(
                                "flex items-center gap-2 py-6 text-xs font-black uppercase tracking-widest transition-all relative shrink-0",
                                activeTab === 'bank' ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <IndianRupee size={16} /> Bank Details
                            {activeTab === 'bank' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={cn(
                                "flex items-center gap-2 py-6 text-xs font-black uppercase tracking-widest transition-all relative shrink-0",
                                activeTab === 'documents' ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <FileText size={16} /> Documents
                            {activeTab === 'documents' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={cn(
                                "flex items-center gap-2 py-6 text-xs font-black uppercase tracking-widest transition-all relative shrink-0",
                                activeTab === 'security' ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Shield size={16} /> Security
                            {activeTab === 'security' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 gap-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'profile' && <ProfileForm user={user} onUpdate={refreshUser} />}
                            {activeTab === 'bank' && <BankDetailsForm user={user} onUpdate={refreshUser} />}
                            {activeTab === 'documents' && <DocumentManager user={user} onUpdate={refreshUser} />}
                            {activeTab === 'security' && <SecuritySettings user={user} onUpdate={refreshUser} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </ProtectedRoute>
    );
}
