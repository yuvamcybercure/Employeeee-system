"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout';
import api from '@/lib/api';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Shield,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserDialog } from '@/components/UserDialog';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showDialog, setShowDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

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

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setShowDialog(true);
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setShowDialog(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <DashboardLayout allowedRoles={['admin', 'superadmin']}>
            <div className="space-y-8">
                {showDialog && (
                    <UserDialog
                        user={selectedUser}
                        onClose={() => setShowDialog(false)}
                        onSuccess={fetchUsers}
                    />
                )}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                        <p className="text-slate-500 font-medium">Manage employee profiles, roles, and system access.</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <UserPlus size={20} /> Add New Employee
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="text-slate-400" size={18} />
                        <select
                            className="flex-1 md:w-40 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-slate-600"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="superadmin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-8 h-20 bg-slate-50/20"></td>
                                        </tr>
                                    ))
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-8 py-4">
                                                <span className="text-xs font-mono font-bold text-slate-500">{u.employeeId || 'N/A'}</span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-400">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                                                        <p className="text-[10px] font-medium text-slate-400">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    {u.department || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-2 h-2 rounded-full", u.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-300")} />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{u.isActive ? 'Active' : 'Inactive'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(u)}
                                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                                        title="Edit & View Info"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-medium">
                                            No users found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-8 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
                        <p className="text-xs font-bold text-slate-400">Showing {filteredUsers.length} total members</p>
                        <div className="flex items-center gap-3">
                            <button className="p-2 text-slate-300 hover:text-slate-500 transition-all"><ChevronLeft size={18} /></button>
                            <button className="p-2 text-slate-300 hover:text-slate-500 transition-all"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
