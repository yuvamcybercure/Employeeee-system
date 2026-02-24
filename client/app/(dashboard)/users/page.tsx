"use client";

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserDialog } from '@/components/UserDialog';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import {
    Users as UsersIcon,
    Search,
    Plus,
    MoreVertical,
    UserPlus,
    Shield,
    Mail,
    Fingerprint,
    SearchX,
    Filter,
    ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'superadmin' | 'admin' | 'employee';
    employeeId: string;
    plainPassword?: string;
    department: string;
    isActive: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            if (data.success) setUsers(data.users);
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setShowDialog(true);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-10 pb-20"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Identity Grid</h1>
                        <p className="text-slate-500 font-bold mt-3 text-lg">Manage organizational hierarchy and access protocols.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setEditingUser(null); setShowDialog(true); }}
                            className="flex items-center gap-3 px-8 py-4 premium-gradient text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover-scale"
                        >
                            <UserPlus size={18} /> Provision User
                        </button>
                    </div>
                </motion.div>

                {/* Search & Stats Bar */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 glass-card rounded-[2rem] p-4 flex items-center px-8 border-white/50">
                        <Search className="text-slate-300" size={20} />
                        <input
                            type="text"
                            placeholder="Universal search by name, email or ID..."
                            className="flex-1 bg-transparent border-none outline-none px-6 text-sm font-bold text-slate-600 placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                            <Filter size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase text-slate-400">Advanced Filters</span>
                        </div>
                    </div>
                    <div className="glass-card rounded-[2rem] p-4 flex items-center justify-center gap-6 border-white/50">
                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Total Active</p>
                            <p className="text-2xl font-black text-primary mt-0.5">{users.filter(u => u.isActive).length}</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Global Capacity</p>
                            <p className="text-2xl font-black text-slate-900 mt-0.5">{users.length}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Users Grid Table */}
                <motion.div variants={itemVariants} className="glass-card rounded-[3.5rem] border-white/40 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                                        <div className="flex items-center gap-2">Protocol ID <ArrowUpDown size={12} /></div>
                                    </th>
                                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Member Identity</th>
                                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Department</th>
                                    <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Status</th>
                                    <th className="px-10 py-7 text-right border-b border-slate-100"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="animate-pulse h-28 bg-white/30">
                                            <td colSpan={5} className="px-10"><div className="h-4 bg-slate-100 rounded-full w-full opacity-50" /></td>
                                        </tr>
                                    ))
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-2">
                                                    <Fingerprint size={16} className="text-primary/40" />
                                                    <span className="text-sm font-black text-slate-500 tabular-nums tracking-widest uppercase">{u.employeeId || 'UNSET'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 p-1 shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 text-primary font-black text-lg uppercase rounded-xl">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-md font-black text-slate-800 tracking-tight leading-none">{u.name}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Mail size={12} className="text-slate-300" />
                                                            <p className="text-[11px] font-bold text-slate-400 lowrecase">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-2">
                                                    <Shield size={14} className="text-secondary" />
                                                    <span className="px-3 py-1 bg-white border border-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                        {u.department || 'General Operations'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-2.5 h-2.5 rounded-full ring-4 shadow-sm",
                                                        u.isActive
                                                            ? "bg-emerald-500 ring-emerald-50 shadow-emerald-500/30"
                                                            : "bg-slate-300 ring-slate-50"
                                                    )} />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{u.isActive ? 'Active Node' : 'Deactivated'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleEdit(u)}
                                                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 rounded-2xl transition-all shadow-sm"
                                                        title="Provisioning Terminal"
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-6 text-slate-300">
                                                <SearchX size={64} className="opacity-10" />
                                                <div className="max-w-xs mx-auto">
                                                    <p className="font-black uppercase tracking-[0.2em] text-sm text-slate-400">Zero matches detected</p>
                                                    <p className="text-xs font-bold mt-2 leading-relaxed opacity-60">Try adjusting your search parameters or check the global directory filter.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {showDialog && (
                    <UserDialog
                        user={editingUser}
                        onClose={() => setShowDialog(false)}
                        onSuccess={fetchUsers}
                    />
                )}
            </AnimatePresence>
        </ProtectedRoute>
    );
}
