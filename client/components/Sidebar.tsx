"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
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
    Settings
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

    const baseHref = user?.role === 'superadmin' ? '/superadmin' : user?.role === 'admin' ? '/admin' : '/employee';

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-primary text-primary-foreground rounded-md shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden outline-none"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside className={cn(
                "fixed left-0 top-0 h-full bg-card border-r w-64 z-40 transition-transform duration-300 md:translate-x-0 overflow-y-auto pb-20",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">T</div>
                    <span className="text-xl font-bold text-primary">TaskEase</span>
                </div>

                <nav className="p-4 space-y-1">
                    {filteredItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium relative",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <item.icon size={18} />
                                <span className="flex-1">{item.title}</span>
                                {item.badge && (
                                    <span className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black",
                                        isActive ? "bg-white text-primary" : "bg-primary text-white"
                                    )}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t bg-card">
                    <div className="flex items-center gap-3 mb-4 px-3">
                        <div className="w-9 h-9 rounded-full bg-secondary overflow-hidden">
                            {user?.profilePhoto ? (
                                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                    {user?.name?.[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate capitalize">{user?.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
