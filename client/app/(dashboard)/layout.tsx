"use client";

import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
    children,
    allowedRoles
}: {
    children: React.ReactNode,
    allowedRoles?: string[]
}) {
    return (
        <ProtectedRoute allowedRoles={allowedRoles}>
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 md:ml-64">
                    <main className="flex-1 p-4 md:p-10 pt-20 md:pt-10">
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
            </div>
        </ProtectedRoute>
    );
}
