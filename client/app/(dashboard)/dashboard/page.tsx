"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else {
                // Redirect based on role
                if (user.role === 'superadmin') router.push('/superadmin');
                else if (user.role === 'admin') router.push('/admin');
                else router.push('/employee');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Routing your dashboard...</p>
            </div>
        </div>
    );
}
