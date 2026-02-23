"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (allowedRoles && !allowedRoles.includes(user.role)) {
                router.push(user.role === 'superadmin' ? '/superadmin' : user.role === 'admin' ? '/admin' : '/employee');
            }
        }
    }, [user, loading, router, allowedRoles]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) return null;
    if (allowedRoles && !allowedRoles.includes(user.role)) return null;

    return <>{children}</>;
}
