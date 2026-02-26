"use client";

import React, { useState } from 'react';
import { Save, Loader2, Landmark, CreditCard, User, MapPin, CheckCircle2, Shield } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function BankDetailsForm({ user, onUpdate }: { user: any, onUpdate: () => void }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        accountNo: user.bankDetails?.accountNo || '',
        ifscCode: user.bankDetails?.ifscCode || '',
        bankName: user.bankDetails?.bankName || '',
        branch: user.bankDetails?.branch || '',
        holderName: user.bankDetails?.holderName || '',
        address: user.bankDetails?.address || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put(`/users/${user._id}`, { bankDetails: formData });
            if (data.success) {
                setSuccess(true);
                onUpdate();
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error('Failed to update bank details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 italic">Financial Credentials</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">For payroll and salary disbursement</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <Landmark size={28} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <User size={12} className="text-primary" />
                            Account Holder Name
                        </label>
                        <input
                            type="text"
                            value={formData.holderName}
                            onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 focus:outline-none ring-2 ring-primary/5 focus:ring-primary/20 transition-all"
                            placeholder="AS PER BANK RECORDS"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <CreditCard size={12} className="text-primary" />
                            Account Number
                        </label>
                        <input
                            type="text"
                            value={formData.accountNo}
                            onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 focus:outline-none ring-2 ring-primary/5 focus:ring-primary/20 transition-all font-mono"
                            placeholder="000000000000"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Landmark size={12} className="text-primary" />
                            Bank Name
                        </label>
                        <input
                            type="text"
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 focus:outline-none ring-2 ring-primary/5 focus:ring-primary/20 transition-all"
                            placeholder="HDFC, SBI, ICICI, ETC."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Shield size={12} className="text-primary" />
                            IFSC Code
                        </label>
                        <input
                            type="text"
                            value={formData.ifscCode}
                            onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 focus:outline-none ring-2 ring-primary/5 focus:ring-primary/20 transition-all font-mono"
                            placeholder="ABCD0123456"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <MapPin size={12} className="text-primary" />
                            Branch Name
                        </label>
                        <input
                            type="text"
                            value={formData.branch}
                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 focus:outline-none ring-2 ring-primary/5 focus:ring-primary/20 transition-all"
                            placeholder="BRANCH LOCATION"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <MapPin size={12} className="text-primary" />
                            Bank Address
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 focus:outline-none ring-2 ring-primary/5 focus:ring-primary/20 transition-all"
                            placeholder="FULL BANK ADDRESS"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end pt-6 border-t border-slate-50">
                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "flex items-center gap-2 px-10 py-4 rounded-[20px] font-black text-sm tracking-widest transition-all shadow-xl shadow-primary/20",
                            success ? "bg-emerald-500 text-white" : "bg-primary text-white"
                        )}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : success ? <CheckCircle2 size={18} /> : <Save size={18} />}
                        {loading ? 'SAVING...' : success ? 'SAVED' : 'SAVE CREDENTIALS'}
                    </button>
                </div>
            </form>
        </div>
    );
}
