"use client";

import React, { useState } from 'react';
import { ShieldCheck, Lock, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';

export function SecuritySettings({ user }: { user: any, onUpdate: () => void }) {
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return alert('Passwords do not match');
        }
        if (passwords.newPassword.length < 6) {
            return alert('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            const { data } = await api.patch(`/users/${user._id}`, { password: passwords.newPassword });
            if (data.success) {
                alert('Password updated successfully!');
                setPasswords({ newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            console.error('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Lock className="text-primary" size={24} /> Authentication Security
                    </h3>
                </div>
                <div className="p-10 space-y-8">
                    <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">New Password</label>
                            <input
                                required
                                type="password"
                                value={passwords.newPassword}
                                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                placeholder="Min. 6 characters"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Confirm Password</label>
                            <input
                                required
                                type="password"
                                value={passwords.confirmPassword}
                                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                placeholder="Repeat new password"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !passwords.newPassword}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={18} /> Update Password</>}
                            </button>
                        </div>
                    </form>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-800">Two-Factor Authentication</p>
                            <p className="text-xs text-slate-500 font-medium mt-1">Enhance your account security by adding an extra layer of protection. This feature will be available soon.</p>
                        </div>
                        <button disabled className="px-4 py-2 bg-slate-200 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest ml-auto cursor-not-allowed">
                            Enable
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
