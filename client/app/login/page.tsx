"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Mail, Lock, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.success) {
                login(data);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl text-primary-foreground mb-4 shadow-lg shadow-primary/20">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kinetik</h1>
                    <p className="text-slate-500 mt-2 font-medium">Employee Management System</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Welcome Back</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 text-xs mt-8">
                        Forgot your password? <button onClick={() => setShowResetModal(true)} className="text-primary font-bold hover:underline">Reset it here</button>
                    </p>
                </div>

                <div className="mt-8 text-center text-slate-400 text-xs font-medium">
                    &copy; 2026 Kinetik HRM. All rights reserved.
                </div>
            </div>

            {/* Reset Password Request Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Request Reset</h3>
                            <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <Lock size={20} />
                            </button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setResetLoading(true);
                            setResetError('');
                            setResetSuccess('');
                            try {
                                const { data } = await api.post('/auth/request-reset', {
                                    email: resetEmail,
                                    newPassword: resetNewPassword
                                });
                                setResetSuccess(data.message);
                                setTimeout(() => setShowResetModal(false), 3000);
                            } catch (err: any) {
                                setResetError(err.response?.data?.message || 'Failed to submit request');
                            } finally {
                                setResetLoading(false);
                            }
                        }} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                    placeholder="your@email.com"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                    placeholder="Enter new password"
                                    value={resetNewPassword}
                                    onChange={(e) => setResetNewPassword(e.target.value)}
                                />
                            </div>

                            {resetError && <p className="text-xs text-red-500 font-bold px-1">{resetError}</p>}
                            {resetSuccess && <p className="text-xs text-emerald-500 font-bold px-1">{resetSuccess}</p>}

                            <button
                                type="submit"
                                disabled={resetLoading}
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                            >
                                {resetLoading ? <Loader2 className="animate-spin" size={18} /> : "Submit Request"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowResetModal(false)}
                                className="w-full py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
