"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';

interface Organization {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
    settings?: {
        branding?: {
            primaryColor?: string;
            secondaryColor?: string;
        };
    };
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'superadmin' | 'admin' | 'employee';
    employeeId: string;
    department: string;
    designation: string;
    phone: string;
    profilePhoto: string;
    joinDate: string;
    fatherName?: string;
    gender?: string;
    dob?: string;
    nationality?: string;
    religion?: string;
    maritalStatus?: string;
    address?: string;
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
        email: string;
    };
    documents?: any[];
    permissions: Record<string, boolean>;
    organizationId: Organization;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: any) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    hasPermission: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        refreshUser();
    }, []);

    const refreshUser = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data.success) {
                setUser({ ...data.user, permissions: data.permissions });
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (userData: any) => {
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
        setUser({ ...userData.user, permissions: userData.permissions });
        router.push('/dashboard');
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout failed');
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            router.push('/login');
        }
    };

    const hasPermission = (perm: string) => {
        if (!user) return false;
        if (user.role === 'superadmin') return true;
        return !!user.permissions[perm];
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
