"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    MapPin,
    Calendar,
    MessageSquare,
    Briefcase,
    FileText,
    Lightbulb,
    ShieldCheck,
    Laptop,
    LogOut,
    Users,
    Lock,
    Menu,
    X,
    Settings,
    Sparkles
} from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: any;
    role?: string[];
    permission?: string;
    badge?: number;
}

const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Attendance', href: '/attendance', icon: MapPin },
    { title: 'Leaves', href: '/leaves', icon: Calendar, badge: 2 },
    { title: 'Chat', href: '/chat', icon: MessageSquare, badge: 5 },
    { title: 'Projects', href: '/projects', icon: Briefcase, permission: 'canManageProjects' },
    { title: 'Timesheets', href: '/timesheets', icon: FileText },
    { title: 'Suggestions', href: '/suggestions', icon: Lightbulb },
    { title: 'Policies', href: '/policies', icon: ShieldCheck },
    { title: 'My Assets', href: '/assets', icon: Laptop },
    { title: 'Users', href: '/users', icon: Users, role: ['superadmin', 'admin'] },
    { title: 'Permissions', href: '/permissions', icon: Lock, role: ['superadmin'] },
    { title: 'Settings', href: '/settings', icon: Settings, role: ['superadmin'] },
];

export function Sidebar() {
    const { user, logout, hasPermission } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const filteredItems = navItems.filter(item => {
        if (item.role && !item.role.includes(user?.role || '')) return false;
        if (item.permission && !hasPermission(item.permission)) return false;
        return true;
    });

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden p-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 backdrop-blur-lg flex items-center justify-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar Overlay */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside className={cn(
                "fixed left-0 top-0 h-full bg-white border-r border-slate-100 w-64 z-40 transition-all duration-500 md:translate-x-0 flex flex-col shadow-2xl shadow-slate-200/50",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Section */}
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-tight">Kinetik</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Enterprise</p>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden pt-2">
                    {filteredItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-bold relative overflow-hidden",
                                    isActive
                                        ? "text-white shadow-lg shadow-primary/25"
                                        : "text-slate-500 hover:text-primary hover:bg-slate-50"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 z-0"
                                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                    />
                                )}
                                <div className="relative z-10 flex items-center gap-3 w-full">
                                    <item.icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                                    <span className="flex-1">{item.title}</span>
                                    {item.badge && (
                                        <span className={cn(
                                            "w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black",
                                            isActive ? "bg-white/20 text-white backdrop-blur-md" : "bg-primary text-white"
                                        )}>
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Section */}
                <div className="p-4 mt-auto">
                    <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="flex items-center gap-3 mb-4 px-1">
                            <div className="w-10 h-10 rounded-2xl bg-white p-1 shadow-sm overflow-hidden">
                                {user?.profilePhoto ? (
                                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black uppercase">
                                        {user?.name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800 truncate capitalize">{user?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center justify-center gap-2 w-full py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
