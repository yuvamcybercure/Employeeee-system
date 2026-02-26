"use client";

import React, { useState, useEffect } from 'react';
import { X, Shield, Loader2, Save, Info } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface OrgLeaveSettingsModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function OrgLeaveSettingsModal({ onClose, onSuccess }: OrgLeaveSettingsModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/organization/${user?.organizationId?._id}`);
                if (data.success) {
                    setSettings(data.organization?.settings?.defaultLeaveEntitlements || {
                        sick: { yearly: 12, monthly: 1 },
                        casual: { yearly: 12, monthly: 1 },
                        wfh: { yearly: 24, monthly: 2 },
                        unpaid: { yearly: 365, monthly: 31 }
                    });
                }
            } catch (err) {
                console.error('Failed to fetch org settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [user?.organizationId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch(`/organization/${user?.organizationId?._id}`, {
                settings: { defaultLeaveEntitlements: settings }
            });
            onSuccess();
            onClose();
        } catch (err) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateQuotas = (type: string, field: 'yearly' | 'monthly', value: number) => {
        setSettings({
            ...settings,
            [type]: { ...settings[type], [field]: value }
        });
    };

    if (loading) return null; // Or a smaller loader

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                            <Shield size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                Global Leave Protocols
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                Standard quotas for all organization members
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-3">
                        <Info className="text-blue-500 mt-0.5 shrink-0" size={18} />
                        <p className="text-[11px] font-bold text-blue-600 leading-relaxed uppercase">
                            These settings define the default annual and monthly leave allowances for every new employee. Individual overrides can still be set in the User Profile section.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {settings && Object.keys(settings).map((type) => (
                            <div key={type} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">{type} Leave</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Yearly Quota</label>
                                        <input
                                            type="number"
                                            value={settings[type].yearly}
                                            onChange={(e) => updateQuotas(type, 'yearly', parseInt(e.target.value))}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Cap</label>
                                        <input
                                            type="number"
                                            value={settings[type].monthly}
                                            onChange={(e) => updateQuotas(type, 'monthly', parseInt(e.target.value))}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all text-xs uppercase"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 text-xs uppercase"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update Protocols</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

