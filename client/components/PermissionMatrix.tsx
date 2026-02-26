"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Shield, Save, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PermissionMatrix() {
    const [matrices, setMatrices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'admin' | 'employee'>('admin');

    useEffect(() => {
        fetchMatrices();
    }, []);

    const fetchMatrices = async () => {
        try {
            const { data } = await api.get('/permissions/roles');
            if (data.success) setMatrices(data.data);
        } catch (err) {
            console.error('Failed to fetch permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (role: string, permission: string) => {
        setMatrices(prev => prev.map(m => {
            if (m.role === role) {
                return {
                    ...m,
                    permissions: {
                        ...m.permissions,
                        [permission]: !m.permissions[permission]
                    }
                };
            }
            return m;
        }));
    };

    const handleSave = async (role: string) => {
        setSaving(true);
        try {
            const matrix = matrices.find(m => m.role === role);
            await api.patch(`/permissions/${role}`, { permissions: matrix.permissions });
            alert('Permissions updated successfully');
        } catch (err) {
            alert('Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    const currentMatrix = matrices.find(m => m.role === activeTab);
    const permissionKeys = currentMatrix ? Object.keys(currentMatrix.permissions) : [];

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-extrabold text-slate-800">Role Permission Matrix</h3>
                    <p className="text-slate-500 text-sm mt-1">Configure feature access for standard roles. Super Admins always have full access.</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={cn("px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'admin' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                    >
                        Admin
                    </button>
                    <button
                        onClick={() => setActiveTab('employee')}
                        className={cn("px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'employee' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                    >
                        Employee
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {permissionKeys.map((key) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", currentMatrix.permissions[key] ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500")}>
                                <Shield size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="text-xs text-slate-500">Toggle whether this role can access this feature.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleToggle(activeTab, key)}
                            className={cn(
                                "w-12 h-6 rounded-full relative transition-all duration-300",
                                currentMatrix.permissions[key] ? "bg-primary" : "bg-slate-300"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                currentMatrix.permissions[key] ? "left-7" : "left-1"
                            )} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t flex justify-end">
                <button
                    onClick={() => handleSave(activeTab)}
                    disabled={saving}
                    className="px-10 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Update {activeTab.toUpperCase()} Permissions</>}
                </button>
            </div>
        </div>
    );
}
