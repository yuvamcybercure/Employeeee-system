"use client";

import React, { useState, useEffect } from 'react';
import { X, Loader2, Package, Tag, Hash, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface AssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    asset?: any; // If passing, it's for edit
}

export function AssetModal({ isOpen, onClose, onSuccess, asset }: AssetModalProps) {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        category: 'laptop',
        brand: '',
        model: '',
        serialNumber: '',
        assetTag: '',
        description: '',
        assignedTo: ''
    });

    useEffect(() => {
        if (isOpen) fetchEmployees();
    }, [isOpen]);

    const fetchEmployees = async () => {
        try {
            const { data } = await api.get('/users');
            if (data.success) setEmployees(data.users);
        } catch (err) {
            console.error('Failed to fetch employees');
        }
    };

    useEffect(() => {
        if (asset) {
            setFormData({
                name: asset.name || '',
                category: asset.category || 'laptop',
                brand: asset.brand || '',
                model: asset.model || '',
                serialNumber: asset.serialNumber || '',
                assetTag: asset.assetTag || '',
                description: asset.description || '',
                assignedTo: asset.assignedTo?._id || asset.assignedTo || ''
            });
        }
    }, [asset]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = asset
                ? await api.patch(`/assets/${asset._id}`, formData)
                : await api.post('/assets', formData);

            if (data.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error('Failed to save asset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{asset ? 'Edit Asset' : 'New Inventory Item'}</h3>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Specifications & Control</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-400 transition-all shadow-sm"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Lead Developer Laptop"
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                        >
                                            <option value="laptop">Laptop / PC</option>
                                            <option value="mobile">Mobile Device</option>
                                            <option value="monitor">Monitor</option>
                                            <option value="keyboard">Peripherals (KB/Mouse)</option>
                                            <option value="furniture">Furniture</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Asset Tag</label>
                                        <input
                                            value={formData.assetTag}
                                            onChange={e => setFormData({ ...formData, assetTag: e.target.value })}
                                            placeholder="IT-2024-X4"
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Brand</label>
                                        <input
                                            value={formData.brand}
                                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                            placeholder="Apple, Dell, Sony..."
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Model / Specs</label>
                                        <input
                                            value={formData.model}
                                            onChange={e => setFormData({ ...formData, model: e.target.value })}
                                            placeholder="M3 Pro Max, 32GB RAM"
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Serial Number</label>
                                        <input
                                            value={formData.serialNumber}
                                            onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                            placeholder="S/N: XXXXXXXXXXXX"
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Assign to Employee</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <select
                                                value={formData.assignedTo}
                                                onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                            >
                                                <option value="">Keep in Inventory (Unassigned)</option>
                                                {employees.map(emp => (
                                                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.department || emp.role})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Additional Notes</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Condition, warranty info, or accessories included..."
                                        rows={3}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-3xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-600 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Save to Inventory"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function AssignAssetModal({ isOpen, onClose, onSuccess, assetId }: any) {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [condition, setCondition] = useState('new');

    useEffect(() => {
        if (isOpen) fetchEmployees();
    }, [isOpen]);

    const fetchEmployees = async () => {
        try {
            const { data } = await api.get('/users');
            if (data.success) setEmployees(data.users);
        } catch (err) {
            console.error('Failed to fetch employees');
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setLoading(true);
        try {
            const { data } = await api.patch(`/assets/${assetId}/assign`, { userId: selectedUser, condition });
            if (data.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error('Failed to assign asset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        <form onSubmit={handleAssign}>
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-emerald-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Assign Asset</h3>
                                        <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mt-0.5">Physical Allocation</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-400 transition-all shadow-sm"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Select Employee</label>
                                    <select
                                        required
                                        value={selectedUser}
                                        onChange={e => setSelectedUser(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                    >
                                        <option value="">Choose a team member...</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Handover Condition</label>
                                    <input
                                        value={condition}
                                        onChange={e => setCondition(e.target.value)}
                                        placeholder="e.g., Sealed Box, Good, Minor Scratches"
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-slate-700"
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                                    <ShieldCheck className="text-emerald-500" size={20} />
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-relaxed">
                                        Assignment will be logged in the asset history and visible to the employee immediately.
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading || !selectedUser}
                                    className="flex-1 py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Confirm Allocation"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
