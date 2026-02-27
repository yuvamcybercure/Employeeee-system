import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  profilePhoto?: string;
  phone?: string;
  organizationId?: any;
  permissions?: any;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  switchContext: (token: string, newUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => { },
  refreshUser: async () => { },
  hasPermission: () => false,
  switchContext: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setUser({ ...data.user, permissions: data.permissions });
        } else {
          await SecureStore.deleteItemAsync('token');
        }
      }
    } catch (err) {
      await SecureStore.deleteItemAsync('token').catch(() => { });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        if (data.token) {
          await SecureStore.setItemAsync('token', data.token);
        }
        setUser({ ...data.user, permissions: data.permissions });
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Something went wrong' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) { }
    await SecureStore.deleteItemAsync('token').catch(() => { });
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser({ ...data.user, permissions: data.permissions });
      }
    } catch (e) { }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'master-admin' || user.role === 'superadmin') return true;
    return !!user.permissions?.[permission];
  };

  const switchContext = async (token: string, newUser: User) => {
    await SecureStore.setItemAsync('token', token);
    setUser({ ...newUser, permissions: newUser.permissions || {} });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, hasPermission, switchContext }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
