"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    icon?: React.ReactNode;
}

const ToastContext = createContext<{
    toast: (message: string, options?: { type?: ToastType, icon?: React.ReactNode }) => void;
} | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
};

interface ToastFunction {
    (message: string, options?: { type?: ToastType, icon?: React.ReactNode }): void;
    success: (message: string, options?: any) => void;
    error: (message: string, options?: any) => void;
    info: (message: string, options?: any) => void;
}

// Compatibility export for when 'toast' is imported directly
export const toast: ToastFunction = Object.assign(
    (message: string, options?: { type?: ToastType, icon?: React.ReactNode }) => {
        if (typeof window !== 'undefined') {
            const event = new CustomEvent('custom-toast', { detail: { message, options } });
            window.dispatchEvent(event);
        }
    },
    {
        success: (message: string, options?: any) => toast(message, { ...options, type: 'success' }),
        error: (message: string, options?: any) => toast(message, { ...options, type: 'error' }),
        info: (message: string, options?: any) => toast(message, { ...options, type: 'info' }),
    }
);

export const Toaster = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const handleToast = (e: any) => {
            const { message, options } = e.detail;
            const id = Math.random().toString(36).substring(2, 9);
            setToasts(prev => [...prev, { id, message, type: options?.type || 'info', icon: options?.icon }]);

            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 5000);
        };

        window.addEventListener('custom-toast', handleToast);
        return () => window.removeEventListener('custom-toast', handleToast);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4 w-full max-w-[400px]">
            <AnimatePresence mode="popLayout">
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className={cn(
                            "p-5 rounded-[2rem] shadow-2xl backdrop-blur-3xl border border-white/20 flex items-center justify-between gap-4 group",
                            t.type === 'success' ? "bg-emerald-950/80 text-emerald-100" :
                                t.type === 'error' ? "bg-rose-950/80 text-rose-100" :
                                    "bg-slate-900/90 text-white"
                        )}
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                                t.type === 'success' ? "bg-emerald-500/20 text-emerald-400" :
                                    t.type === 'error' ? "bg-rose-500/20 text-rose-400" :
                                        "bg-primary/20 text-primary"
                            )}>
                                {t.icon || (
                                    t.type === 'success' ? <CheckCircle2 size={20} /> :
                                        t.type === 'error' ? <AlertCircle size={20} /> :
                                            <Info size={20} />
                                )}
                            </div>
                            <p className="text-xs font-black tracking-tight leading-relaxed">{t.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
