"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import io from 'socket.io-client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import {
    LayoutDashboard,
    User,
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
    Sparkles,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import api from '@/lib/api';

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
    { title: 'My Profile', href: '/profile', icon: User }, // Added this
    { title: 'Attendance', href: '/attendance', icon: MapPin },
    { title: 'Leaves', href: '/leaves', icon: Calendar },
    { title: 'Chat', href: '/chat', icon: MessageSquare },
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
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isCollapsed, toggleCollapsed } = useSidebar();
    const [pendingLeaves, setPendingLeaves] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    useEffect(() => {
        if (!isAdmin) return;
        const fetchPending = async () => {
            try {
                const { data } = await api.get('/leaves/pending-count');
                if (data.success) setPendingLeaves(data.count);
            } catch (err) {
                console.error('Failed to fetch pending leaves');
            }
        };
        fetchPending();
        // Refresh every 2 minutes
        const interval = setInterval(fetchPending, 120000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    useEffect(() => {
        if (!user) return;

        const fetchUnreadCount = async () => {
            try {
                const { data } = await api.get('/messages/unread-count');
                if (data.success) setUnreadChatCount(data.count);
            } catch (err) {
                console.error('Failed to fetch unread chat count');
            }
        };

        fetchUnreadCount();

        const getSocketUrl = () => {
            if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
            if (typeof window !== 'undefined') {
                const hostname = window.location.hostname;
                if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
                    return `http://${hostname}:5000`;
                }
            }
            return 'http://localhost:5000';
        };

        const socket = io(getSocketUrl());
        socket.emit('user_online', user._id);

        socket.on('receive_message', (msg: any) => {
            // Increment unread count if message is for us and we aren't on the chat page?
            // Actually, just re-fetch to be safe and accurate
            fetchUnreadCount();
        });

        socket.on('messages_marked_read', () => {
            fetchUnreadCount();
        });

        // Also refresh periodically
        const interval = setInterval(fetchUnreadCount, 60000);

        return () => {
            socket.disconnect();
            clearInterval(interval);
        };
    }, [user]);

    const filteredItems = navItems.filter(item => {
        if (item.role && !item.role.includes(user?.role || '')) return false;
        if (item.permission && !hasPermission(item.permission)) return false;
        return true;
    }).map(item => {
        if (item.title === 'Leaves' && isAdmin) {
            return { ...item, badge: pendingLeaves };
        }
        if (item.title === 'Chat') {
            return { ...item, badge: unreadChatCount };
        }
        return item;
    });

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden p-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 backdrop-blur-lg flex items-center justify-center"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar Overlay (Mobile) */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside className={cn(
                "fixed left-0 top-0 h-full bg-white border-r border-slate-100 z-40 transition-all duration-500 md:translate-x-0 flex flex-col shadow-2xl shadow-slate-200/50",
                isCollapsed ? "w-20" : "w-64",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Section */}
                <div className={cn(
                    "p-6 flex items-center justify-between transition-all duration-500",
                    isCollapsed && "p-5 flex-col gap-4"
                )}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 min-w-[40px] rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 overflow-hidden">
                            {user?.organizationId?.logo ? (
                                <img src={user.organizationId.logo} alt={user.organizationId.name} className="w-full h-full object-cover" />
                            ) : (
                                <Sparkles size={20} className="animate-pulse" />
                            )}
                        </div>
                        {!isCollapsed && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-tight">
                                    {user?.organizationId?.name || 'Kinetik'}
                                </span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Enterprise</p>
                            </motion.div>
                        )}
                    </div>

                    {/* Compact Collapse Toggle */}
                    <button
                        onClick={toggleCollapsed}
                        className={cn(
                            "hidden md:flex items-center justify-center p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all",
                            isCollapsed && "mt-2"
                        )}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden pt-2 scrollbar-none">
                    {filteredItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-bold relative overflow-hidden",
                                    isCollapsed && "justify-center px-0",
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
                                <div className={cn(
                                    "relative z-10 flex items-center gap-3 w-full",
                                    isCollapsed && "justify-center gap-0"
                                )}>
                                    <item.icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                                    {!isCollapsed && (
                                        <>
                                            <span className="flex-1 truncate">{item.title}</span>
                                            {!!item.badge && (
                                                <span className={cn(
                                                    "w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0",
                                                    isActive ? "bg-white/20 text-white backdrop-blur-md" : "bg-primary text-white"
                                                )}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Compact User Section */}
                <div className="p-3 border-t border-slate-50 mt-auto">
                    <div className={cn(
                        "flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 transition-all group/profile",
                        isCollapsed && "flex-col p-1.5"
                    )}>
                        <Link href="/profile" className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-8 h-8 min-w-[32px] rounded-xl bg-white p-1 shadow-sm overflow-hidden group-hover/profile:scale-110 transition-transform">
                                {user?.profilePhoto ? (
                                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-[10px] font-black uppercase">
                                        {user?.name?.[0]}
                                    </div>
                                )}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-slate-800 truncate capitalize">{user?.name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5 group-hover/profile:text-primary transition-colors">Profile</p>
                                </div>
                            )}
                        </Link>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }}
                            title="Sign Out"
                            className={cn(
                                "flex items-center justify-center w-8 h-8 min-w-[32px] text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 relative z-20",
                                !isCollapsed && "bg-white shadow-sm"
                            )}
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
