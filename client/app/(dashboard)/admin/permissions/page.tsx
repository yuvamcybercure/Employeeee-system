"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Shield,
    Users,
    Save,
    User as UserIcon,
    ChevronRight,
    Check,
    X,
    AlertCircle,
    Search,
    Lock,
    Unlock,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const PERMISSION_GROUPS = [
    {
        name: 'Finance & Billing',
        permissions: [
            { key: 'canViewFinanceDashboard', label: 'View Finance Dashboard' },
            { key: 'canManageExpenses', label: 'Manage Expenses' },
            { key: 'canManageInvoices', label: 'Manage Invoices' },
            { key: 'canConfigureRates', label: 'Configure Project Rates' },
            { key: 'canConfigureCompensation', label: 'Configure Employee Comp' },
        ]
    },
    {
        name: 'Payroll Management',
        permissions: [
            { key: 'canViewPayroll', label: 'View Payroll Board' },
            { key: 'canGeneratePayroll', label: 'Generate Monthly Payroll' },
            { key: 'canDisbursePayroll', label: 'Disburse/Pay Salaries' },
        ]
    },
    {
        name: 'Attendance & HR',
        permissions: [
            { key: 'canViewAttendance', label: 'View Org Attendance' },
            { key: 'canEditAttendance', label: 'Edit Attendance Records' },
            { key: 'canApproveLeave', label: 'Approve/Reject Leaves' },
            { key: 'canConfigureGeofence', label: 'Configure Geofencing' },
        ]
    },
    {
        name: 'Assets & Inventory',
        permissions: [
            { key: 'canViewAssets', label: 'View Asset Inventory' },
            { key: 'canManageAssets', label: 'Full Asset Management' },
        ]
    },
    {
        name: 'Employee Management',
        permissions: [
            { key: 'canViewEmployees', label: 'View Employee List' },
            { key: 'canAddEmployee', label: 'Onboard New Employees' },
            { key: 'canEditEmployee', label: 'Edit Employee Profiles' },
            { key: 'canManagePermissions', label: 'Manage Security Access' },
        ]
    },
    {
        name: 'Projects & Tasks',
        permissions: [
            { key: 'canManageProjects', label: 'Project Management' },
            { key: 'canViewProjectStats', label: 'View Project Analytics' },
        ]
    },
    {
        name: 'Miscellaneous',
        permissions: [
            { key: 'canManagePolicies', label: 'Control Org Policies' },
            { key: 'canSendBroadcast', label: 'Send Org Broadcasts' },
            { key: 'canViewSuggestions', label: 'View Employee Suggestions' },
        ]
    }
];

export default function PermissionManager() {
    const [activeType, setActiveType] = useState<'roles' | 'users'>('roles');
    const [roles, setRoles] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [permissions, setPermissions] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeType === 'roles') {
                const { data } = await api.get('/permissions/roles');
                setRoles(data.roles);
                if (data.roles.length > 0) handleRoleSelect(data.roles[0]);
            } else {
                const { data } = await api.get('/users');
                setUsers(data.users);
            }
        } catch (err) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (role: any) => {
        setSelectedRole(role.role);
        setPermissions(role.permissions);
        setSelectedUser(null);
    };

    const handleUserSelect = async (user: any) => {
        try {
            const { data } = await api.get(`/permissions/users/${user._id}`);
            setSelectedUser(data.user);
            setPermissions(data.user.permissionOverrides || {});
            setSelectedRole(null);
        } catch (err) {
            console.error('Failed to fetch user permissions');
        }
    };

    const togglePermission = (key: string) => {
        if (activeType === 'roles') {
            setPermissions({ ...permissions, [key]: !permissions[key] });
        } else {
            const current = permissions[key];
            let next = true;
            if (current === true) next = false;
            else if (current === false) next = null as any;
            else next = true;
            setPermissions({ ...permissions, [key]: next });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (activeType === 'roles') {
                await api.post('/permissions/roles', { role: selectedRole, permissions });
            } else {
                await api.put(`/permissions/users/${selectedUser._id}`, { permissions });
            }
            // Toast or success notification here
        } catch (err) {
            console.error('Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    const getPermissionIcon = (val: any) => {
        if (val === true) return <Check className="text-emerald-500" size={14} />;
        if (val === false) return <X className="text-red-500" size={14} />;
        return <AlertCircle className="text-slate-300" size={14} />;
    };

    return (
        <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Security Access</h1>
                    <p className="text-slate-500 font-bold flex items-center gap-2 mt-1 uppercase text-[10px] tracking-[0.2em]">
                        <Shield size={14} className="text-primary" />
                        Granular Function Control Matrix
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
                    <button
                        onClick={() => setActiveType('roles')}
                        className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase transition-all", activeType === 'roles' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}
                    >
                        Role Level
                    </button>
                    <button
                        onClick={() => setActiveType('users')}
                        className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase transition-all", activeType === 'users' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}
                    >
                        User Override
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar List */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-widest">{activeType === 'roles' ? 'Selection Matrix' : 'Employee Roster'}</h3>
                        </div>
                        <div className="p-4 space-y-2">
                            {activeType === 'users' && (
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 ring-primary/20"
                                    />
                                </div>
                            )}
                            {activeType === 'roles' ? (
                                roles.map(r => (
                                    <button
                                        key={r._id}
                                        onClick={() => handleRoleSelect(r)}
                                        className={cn("w-full flex items-center justify-between p-4 rounded-3xl transition-all", selectedRole === r.role ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-slate-50 text-slate-600")}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Shield size={16} />
                                            <span className="text-xs font-black uppercase">{r.role}</span>
                                        </div>
                                        <ChevronRight size={14} />
                                    </button>
                                ))
                            ) : (
                                users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                                    <button
                                        key={u._id}
                                        onClick={() => handleUserSelect(u)}
                                        className={cn("w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left", selectedUser?._id === u._id ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-600")}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                            {u.profilePhoto ? <img src={u.profilePhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-[10px]">{u.name[0]}</div>}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black truncate uppercase">{u.name}</p>
                                            <p className="text-[8px] font-bold opacity-60 truncate">{u.role}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Permission Matrix */}
                <div className="lg:col-span-9 space-y-8">
                    {(selectedRole || selectedUser) ? (
                        <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl overflow-hidden flex flex-col h-full">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-slate-900 text-white rounded-[24px]">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 italic uppercase">Access Configuration</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                            Modifying permissions for: <span className="text-primary">{selectedRole || selectedUser?.name}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    {saving ? 'Encrypting...' : 'Seal Permissions'}
                                </button>
                            </div>

                            <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[70vh]">
                                {activeType === 'users' && (
                                    <div className="md:col-span-2 p-4 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-3 mb-4">
                                        <Info className="text-amber-500 mt-0.5" size={16} />
                                        <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
                                            <span className="font-black">User Override Mode:</span> Click to cycle through <span className="text-emerald-600">Grant</span>, <span className="text-red-600">Revoke</span>, and <span className="text-slate-400 underline">Inherit From Role</span>.
                                        </p>
                                    </div>
                                )}

                                {PERMISSION_GROUPS.map((group, gIdx) => (
                                    <div key={gIdx} className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-l-4 border-slate-200 pl-3">{group.name}</h3>
                                        <div className="bg-slate-50/50 rounded-[32px] border border-slate-100 p-4 space-y-1">
                                            {group.permissions.map((perm, pIdx) => {
                                                const val = permissions[perm.key];
                                                return (
                                                    <button
                                                        key={pIdx}
                                                        onClick={() => togglePermission(perm.key)}
                                                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white hover:shadown-sm transition-all group"
                                                    >
                                                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight group-hover:text-slate-900 transition-colors">{perm.label}</span>
                                                        <div className={cn(
                                                            "w-10 h-6 rounded-full flex items-center px-1 transition-all",
                                                            val === true ? "bg-emerald-500 justify-end" : val === false ? "bg-red-500 justify-start" : "bg-slate-200 justify-center"
                                                        )}>
                                                            <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                                {getPermissionIcon(val)}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[50px] border border-slate-100 h-96 flex flex-col items-center justify-center text-slate-300 opacity-60">
                            <Shield size={64} strokeWidth={1} />
                            <p className="mt-4 font-black uppercase italic tracking-tighter text-xl">Select a Target to Configure Access</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
