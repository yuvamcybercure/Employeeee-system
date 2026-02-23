"use client";

import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardLayout({
    children,
    allowedRoles
}: {
    children: React.ReactNode,
    allowedRoles?: string[]
}) {
    return (
        <ProtectedRoute allowedRoles={allowedRoles}>
            <div className="flex min-h-screen bg-slate-50/50">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 w-full max-w-(--breakpoint-2xl) mx-auto">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
