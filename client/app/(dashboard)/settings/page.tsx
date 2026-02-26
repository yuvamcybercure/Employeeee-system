"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Building2,
    Clock,
    Wallet,
    Palette,
    Shield,
    Globe,
    Save,
    Upload,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const tabs = [
    { id: 'general', title: 'General', icon: Building2 },
    { id: 'attendance', title: 'Attendance', icon: Clock },
    { id: 'finance', title: 'Finance & Tax', icon: Wallet },
    { id: 'branding', title: 'Branding', icon: Palette },
];

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [org, setOrg] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchOrg();
    }, []);

    const fetchOrg = async () => {
        if (!user?.organizationId?._id) return;
        try {
            const { data } = await api.get(`/org/${user.organizationId._id}`);
            if (data.success) {
                setOrg(data.organization);
            }
        } catch (err) {
            console.error('Failed to fetch organization settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!org || !user?.organizationId?._id) return;

        setSaving(true);
        setMessage(null);
        try {
            const { data } = await api.patch(`/org/${user.organizationId._id}`, org);
            if (data.success) {
                setOrg(data.organization);
                setMessage({ type: 'success', text: 'Settings updated successfully!' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update settings' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setOrg({ ...org, logo: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['superadmin']}>
            <div className="space-y-8 pb-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Organization Settings</h1>
                        <p className="text-slate-500 font-bold mt-1">Configure your company profile, rules, and billing details.</p>
                    </div>
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg",
                                    message.type === 'success' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                )}
                            >
                                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    {/* Left: Tab Navigation */}
                    <div className="lg:col-span-3 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all font-black text-sm",
                                    activeTab === tab.id
                                        ? "bg-primary text-white shadow-xl shadow-primary/25"
                                        : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
                                )}
                            >
                                <tab.icon size={20} />
                                {tab.title}
                            </button>
                        ))}
                    </div>

                    {/* Right: Content Area */}
                    <div className="lg:col-span-9 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                        <form onSubmit={handleUpdate} className="h-full flex flex-col">
                            <div className="p-10 flex-1 space-y-8">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'general' && (
                                        <motion.div
                                            key="general"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-8"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Company Name</label>
                                                    <input
                                                        type="text"
                                                        value={org.name || ''}
                                                        onChange={e => setOrg({ ...org, name: e.target.value })}
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                        placeholder="Enter company name"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Company Slug</label>
                                                    <input
                                                        type="text"
                                                        value={org.slug || ''}
                                                        onChange={e => setOrg({ ...org, slug: e.target.value })}
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                        placeholder="company-slug"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Address</label>
                                                <textarea
                                                    value={org.address || ''}
                                                    onChange={e => setOrg({ ...org, address: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
                                                    placeholder="Complete business address"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email</label>
                                                    <input
                                                        type="email"
                                                        value={org.contact?.email || ''}
                                                        onChange={e => setOrg({ ...org, contact: { ...org.contact, email: e.target.value } })}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Phone</label>
                                                    <input
                                                        type="text"
                                                        value={org.contact?.phone || ''}
                                                        onChange={e => setOrg({ ...org, contact: { ...org.contact, phone: e.target.value } })}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Website</label>
                                                    <input
                                                        type="text"
                                                        value={org.contact?.website || ''}
                                                        onChange={e => setOrg({ ...org, contact: { ...org.contact, website: e.target.value } })}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div className="w-24 h-24 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative group">
                                                    {org.logo ? (
                                                        <img src={org.logo} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 className="text-slate-300" size={32} />
                                                    )}
                                                    <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                        <Upload size={20} />
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                                    </label>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-800">Company Logo</h4>
                                                    <p className="text-xs text-slate-400 font-bold mt-1">Recommended size: 512x512. Max 2MB.</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOrg({ ...org, logo: '' })}
                                                        className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 hover:underline"
                                                    >
                                                        Remove Logo
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'attendance' && (
                                        <motion.div
                                            key="attendance"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-8"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Shift Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={org.settings?.attendanceSettings?.startTime || '09:00'}
                                                        onChange={e => setOrg({ ...org, settings: { ...org.settings, attendanceSettings: { ...org.settings.attendanceSettings, startTime: e.target.value } } })}
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Shift End Time</label>
                                                    <input
                                                        type="time"
                                                        value={org.settings?.attendanceSettings?.endTime || '18:00'}
                                                        onChange={e => setOrg({ ...org, settings: { ...org.settings, attendanceSettings: { ...org.settings.attendanceSettings, endTime: e.target.value } } })}
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-800">Auto-Mark Absent</h4>
                                                    <p className="text-xs text-slate-400 font-bold mt-1">Mark employees absent if no check-in by specified time.</p>
                                                </div>
                                                <input
                                                    type="time"
                                                    value={org.settings?.attendanceSettings?.absentMarkingTime || '23:55'}
                                                    onChange={e => setOrg({ ...org, settings: { ...org.settings, attendanceSettings: { ...org.settings.attendanceSettings, absentMarkingTime: e.target.value } } })}
                                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'finance' && (
                                        <motion.div
                                            key="finance"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-8"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">GSTIN / Registration No.</label>
                                                    <input
                                                        type="text"
                                                        value={org.taxInfo?.gstin || ''}
                                                        onChange={e => setOrg({ ...org, taxInfo: { ...org.taxInfo, gstin: e.target.value } })}
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                                                        placeholder="e.g. 29AAAAA0000A1Z5"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">PAN Number</label>
                                                    <input
                                                        type="text"
                                                        value={org.taxInfo?.pan || ''}
                                                        onChange={e => setOrg({ ...org, taxInfo: { ...org.taxInfo, pan: e.target.value } })}
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold uppercase"
                                                        placeholder="ABCDE1234F"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Default Tax Rate (%)</label>
                                                    <input
                                                        type="number"
                                                        value={org.taxInfo?.taxRate || 0}
                                                        onChange={e => setOrg({ ...org, taxInfo: { ...org.taxInfo, taxRate: parseFloat(e.target.value) } })}
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Currency</label>
                                                    <select
                                                        value={org.currency || 'INR'}
                                                        onChange={e => setOrg({ ...org, currency: e.target.value })}
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                                                    >
                                                        <option value="INR">Indian Rupee (₹)</option>
                                                        <option value="USD">US Dollar ($)</option>
                                                        <option value="GBP">Pound Sterling (£)</option>
                                                        <option value="EUR">Euro (€)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'branding' && (
                                        <motion.div
                                            key="branding"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-10"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-800">Primary Color</h4>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="color"
                                                            value={org.settings?.branding?.primaryColor || '#6366f1'}
                                                            onChange={e => setOrg({ ...org, settings: { ...org.settings, branding: { ...org.settings.branding, primaryColor: e.target.value } } })}
                                                            className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-xl"
                                                        />
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                value={org.settings?.branding?.primaryColor || '#6366f1'}
                                                                onChange={e => setOrg({ ...org, settings: { ...org.settings, branding: { ...org.settings.branding, primaryColor: e.target.value } } })}
                                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs font-bold"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-800">Secondary Color</h4>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="color"
                                                            value={org.settings?.branding?.secondaryColor || '#4f46e5'}
                                                            onChange={e => setOrg({ ...org, settings: { ...org.settings, branding: { ...org.settings.branding, secondaryColor: e.target.value } } })}
                                                            className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-xl"
                                                        />
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                value={org.settings?.branding?.secondaryColor || '#4f46e5'}
                                                                onChange={e => setOrg({ ...org, settings: { ...org.settings, branding: { ...org.settings.branding, secondaryColor: e.target.value } } })}
                                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs font-bold"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white space-y-4">
                                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Live Preview</h4>
                                                <div className="flex gap-4">
                                                    <div className="px-6 py-3 rounded-2xl font-black text-xs" style={{ backgroundColor: org.settings?.branding?.primaryColor }}>Primary Button</div>
                                                    <div className="px-6 py-3 rounded-2xl font-black text-xs border border-white/20" style={{ color: org.settings?.branding?.secondaryColor }}>Ghost Action</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-3 px-10 py-5 bg-primary text-white font-black text-sm rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    Save Transformations
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
