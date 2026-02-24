"use client";

import React, { useState, useEffect } from 'react';

import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { CelebrationModal } from "@/components/dashboard/CelebrationModal";

function LayoutContent({
    children,
    allowedRoles
}: {
    children: React.ReactNode,
    allowedRoles?: string[]
}) {
    const { isCollapsed } = useSidebar();
    const [birthdays, setBirthdays] = useState<any[]>([]);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        const checkBirthdays = async () => {
            try {
                const shownToday = sessionStorage.getItem('birthday_shown_today');
                if (shownToday) return;

                const { data } = await api.get('/users/birthdays/today');
                if (data.success && data.birthdays.length > 0) {
                    setBirthdays(data.birthdays);
                    setShowCelebration(true);
                    sessionStorage.setItem('birthday_shown_today', 'true');
                }
            } catch (err) {
                console.error('Failed to fetch birthdays');
            }
        };

        checkBirthdays();
    }, []);

    return (
        <ProtectedRoute allowedRoles={allowedRoles}>
            <div className="flex min-h-screen bg-[#f8fafc] overflow-x-hidden">
                <Sidebar />
                <div className={cn(
                    "flex-1 flex flex-col min-w-0 transition-all duration-500",
                    isCollapsed ? "md:ml-20" : "md:ml-64"
                )}>
                    <main className="flex-1 p-4 lg:p-8 pt-20 md:pt-12 w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="w-full max-w-[1600px] mx-auto"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                {showCelebration && (
                    <CelebrationModal
                        birthdayUsers={birthdays}
                        onClose={() => setShowCelebration(false)}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}

export default function DashboardLayout({
    children,
    allowedRoles
}: {
    children: React.ReactNode,
    allowedRoles?: string[]
}) {
    return (
        <SidebarProvider>
            <LayoutContent allowedRoles={allowedRoles}>
                {children}
            </LayoutContent>
        </SidebarProvider>
    );
}
