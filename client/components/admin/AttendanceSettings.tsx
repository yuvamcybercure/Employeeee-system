"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Zap, Save, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function AttendanceSettings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        startTime: '09:00',
        endTime: '18:00',
        autoLogoutOffset: 2,
        absentMarkingTime: '23:55',
        isActive: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user?.organizationId?._id) return;
            setLoading(true);
            try {
                const { data } = await api.get(`/organization/${user.organizationId._id}`);
                if (data.success && data.organization.settings?.attendanceSettings) {
                    setSettings(data.organization.settings.attendanceSettings);
                }
            } catch (err) {
                console.error('Failed to fetch settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [user]);

    const handleSave = async () => {
        if (!user?.organizationId?._id) return;
        setSaving(true);
        try {
            const { data } = await api.patch(`/organization/${user.organizationId._id}`, {
                settings: { attendanceSettings: settings }
            });
            if (data.success) {
                // Potential toast notification here
                alert('Attendance protocols synchronized successfully.');
            }
        } catch (err) {
            console.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-48 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Phase (Clock-In)</label>
                    <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                        <input
                            type="time"
                            value={settings.startTime}
                            onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Terminal Phase (Clock-Out)</label>
                    <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
                        <input
                            type="time"
                            value={settings.endTime}
                            onChange={(e) => setSettings({ ...settings, endTime: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-white/5 transition-transform duration-700 group-hover:scale-110">
                    <Zap size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                            <ShieldCheck size={20} />
                        </div>
                        <h4 className="text-lg font-black tracking-tight italic">Automation Protocols</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Auto-Logout Offset</span>
                                <span className="text-xs font-black text-amber-400 tabular-nums">+{settings.autoLogoutOffset} Hours</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="12"
                                value={settings.autoLogoutOffset}
                                onChange={(e) => setSettings({ ...settings, autoLogoutOffset: parseInt(e.target.value) })}
                                className="w-full accent-amber-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Force session termination after {settings.autoLogoutOffset} hours past Terminal Phase.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Mark Absent At</span>
                                <span className="text-xs font-black text-emerald-400 tabular-nums">{settings.absentMarkingTime}</span>
                            </div>
                            <input
                                type="time"
                                value={settings.absentMarkingTime}
                                onChange={(e) => setSettings({ ...settings, absentMarkingTime: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs font-black text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
                            />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Automatically log "Absent" for missing attendance records at this time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <p className="text-[10px] text-amber-600 font-bold leading-relaxed uppercase tracking-wider">
                    Caution: Updating these protocols will affect all future attendance logs for the entire organization.
                </p>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-primary/30 hover:bg-slate-900 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? 'Synchronizing...' : 'Saves Protocols'}
            </button>
        </div>
    );
}
