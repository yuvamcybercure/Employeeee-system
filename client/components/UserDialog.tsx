"use client";

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, User, Mail, Briefcase, Shield, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface UserDialogProps {
    user?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function UserDialog({ user, onClose, onSuccess }: UserDialogProps) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || 'employee',
        department: user?.department || '',
        designation: user?.designation || '',
        phone: user?.phone || '',
        employeeId: user?.employeeId || '',
        isActive: user?.isActive ?? true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (user) {
                await api.patch(`/users/${user._id}`, formData);
            } else {
                await api.post('/auth/register', formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">{user ? 'Edit Employee' : 'Add New Employee'}</h2>
                            <p className="text-slate-500 text-sm font-medium">Enter employee details and system permissions.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2">
                            <X size={18} /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="email"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                    placeholder="john@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                            <input
                                type="text"
                                placeholder="EMP001"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                    placeholder="Engineering"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Role</label>
                            {!user && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                            {user?.plainPassword && (
                                <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                                    <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">Current Password (Visible to Admin)</p>
                                    <p className="text-sm font-mono font-bold text-slate-700">{user.plainPassword}</p>
                                </div>
                            )}
                            <div className="relative">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all appearance-none"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    className={cn(
                                        "flex-1 py-3 rounded-2xl font-bold transition-all border",
                                        formData.isActive
                                            ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                            : "bg-slate-50 border-slate-100 text-slate-400"
                                    )}
                                    onClick={() => setFormData({ ...formData, isActive: true })}
                                >
                                    Active
                                </button>
                                <button
                                    type="button"
                                    className={cn(
                                        "flex-1 py-3 rounded-2xl font-bold transition-all border",
                                        !formData.isActive
                                            ? "bg-red-50 border-red-100 text-red-600"
                                            : "bg-slate-50 border-slate-100 text-slate-400"
                                    )}
                                    onClick={() => setFormData({ ...formData, isActive: false })}
                                >
                                    Inactive
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {user ? 'Update User' : 'Create User'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
