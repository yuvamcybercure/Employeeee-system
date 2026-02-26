"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import {
    Globe,
    ChevronDown,
    UserCircle,
    Building2,
    ShieldCheck,
    Zap,
    Users,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/toaster';

export function MasterContextSwitcher({ isCollapsed }: { isCollapsed: boolean }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen && organizations.length === 0) {
            fetchOrgs();
        }
    }, [isOpen]);

    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/master/organizations');
            if (data.success) setOrganizations(data.organizations);
        } catch (err) {
            toast.error('Failed to load organization flux');
        } finally {
            setLoading(false);
        }
    };

    const handleImpersonate = async (targetOrgId: string) => {
        try {
            // Fetch users for this org to find a superadmin or primary admin
            const { data } = await api.get(`/users?organizationId=${targetOrgId}`);
            if (data.success && data.users.length > 0) {
                // Find first superadmin or admin
                const adminUser = data.users.find((u: any) => u.role === 'superadmin') || data.users.find((u: any) => u.role === 'admin') || data.users[0];
                const impersonateRes = await api.post('/master/impersonate', { userId: adminUser._id });
                if (impersonateRes.data.success) {
                    toast.success(`Entering context: ${adminUser.name}`);
                    window.location.href = '/dashboard';
                }
            } else {
                toast.error('No users found in this organization to impersonate');
            }
        } catch (err) {
            toast.error('Switch protocol failed');
        }
    };

    if ((user?.role as string) !== 'master-admin') return null;

    return (
        <div className="px-3 mb-6 relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center gap-3 p-3 bg-slate-900 text-white rounded-[2rem] hover:bg-primary transition-all shadow-2xl shadow-slate-900/20 group",
                    isCollapsed && "justify-center p-4 px-0"
                )}
            >
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Zap size={18} className="text-primary animate-pulse" />
                </div>
                {!isCollapsed && (
                    <>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1">God Mode</p>
                            <p className="text-xs font-black truncate">Context Jump</p>
                        </div>
                        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
                    </>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[60] bg-slate-950/20 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={cn(
                                "absolute left-0 w-[240px] mt-4 bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 z-[70] overflow-hidden flex flex-col max-h-[400px]",
                                isCollapsed && "left-20 -top-full"
                            )}
                        >
                            <div className="p-6 pb-4 border-b border-slate-50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Target Organization</p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Flux Search..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-[10px] font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
                                {loading ? (
                                    <div className="flex flex-col items-center py-10 opacity-20">
                                        <Activity size={24} className="animate-spin mb-2" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Scanning tenants...</span>
                                    </div>
                                ) : organizations.filter(o => o.name.toLowerCase().includes(search.toLowerCase())).map(org => (
                                    <button
                                        key={org._id}
                                        onClick={() => handleImpersonate(org._id)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all group/item"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover/item:border-primary/20 group-hover/item:text-primary transition-colors overflow-hidden">
                                            {org.logo ? <img src={org.logo} className="w-full h-full object-cover" /> : org.name[0]}
                                        </div>
                                        <div className="flex-1 text-left truncate">
                                            <p className="text-xs font-black text-slate-800 leading-none mb-1">{org.name}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Enter As Admin</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
