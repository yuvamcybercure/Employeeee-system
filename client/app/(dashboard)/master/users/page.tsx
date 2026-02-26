"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    Users,
    Search,
    Filter,
    ArrowUpRight,
    Building2,
    ShieldCheck,
    UserCircle,
    Activity,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from '@/components/ui/toaster';

export default function UserMatrix() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/master/users');
            if (data.success) setUsers(data.users);
        } catch (err) {
            toast.error('Failed to access platform user matrix');
        } finally {
            setLoading(false);
        }
    };

    const handleImpersonate = async (userId: string) => {
        try {
            const { data } = await api.post('/master/impersonate', { userId });
            if (data.success) {
                toast.success('Identity assumed. Redirecting...');
                window.location.href = '/dashboard';
            }
        } catch (err) {
            toast.error('Impersonation protocol failed');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.organizationId?.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['master-admin']}>
            <div className="space-y-10 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">User Matrix</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2 italic">Cross-Tenant Identity Hive</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search platform users..."
                                className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all w-64 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">User Identity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Organization</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Role Context</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-10 py-8"><div className="h-6 bg-slate-100 rounded-lg"></div></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black shrink-0 overflow-hidden">
                                                {user.profilePhoto ? <img src={user.profilePhoto} className="w-full h-full object-cover" /> : <UserCircle size={24} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 leading-tight">{user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-slate-300" />
                                            <span className="text-xs font-bold text-slate-600">{user.organizationId?.name || 'Platform Hub'}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                            user.role === 'superadmin' ? "bg-indigo-50 text-indigo-600" :
                                                user.role === 'admin' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"
                                        )}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button
                                            onClick={() => handleImpersonate(user._id)}
                                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95 opacity-0 group-hover:opacity-100"
                                        >
                                            Impersonate
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-10 py-20 text-center opacity-20 font-black uppercase tracking-widest italic">No matches found in the matrix</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedRoute>
    );
}
