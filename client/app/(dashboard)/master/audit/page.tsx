"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    Activity,
    Search,
    Filter,
    Clock,
    User,
    Building2,
    Database,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from '@/components/ui/toaster';

export default function AuditStream() {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/logs/all?page=${page}&limit=20`);
            if (data.success) {
                setLogs(data.logs);
                setTotalPages(data.totalPages);
                setTotalLogs(data.totalLogs);
            }
        } catch (err) {
            toast.error('Failed to tap into platform audit stream');
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(l =>
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.userId?.name.toLowerCase().includes(search.toLowerCase()) ||
        l.organizationId?.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['master-admin']}>
            <div className="space-y-10 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Audit Stream</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2 italic">Global Platform Event Log • {totalLogs} Total Events</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search event stream..."
                                className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all w-64 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Activity size={16} className="text-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Traffic</span>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-20 italic">Encrypted Flux Logs</div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                                className="p-2 hover:bg-slate-100 rounded-xl disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Page {page} of {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                                className="p-2 hover:bg-slate-100 rounded-xl disabled:opacity-30 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {loading ? (
                            [...Array(10)].map((_, i) => (
                                <div key={i} className="px-10 py-6 animate-pulse flex items-center justify-between">
                                    <div className="h-4 bg-slate-100 rounded-lg w-1/3"></div>
                                    <div className="h-4 bg-slate-100 rounded-lg w-1/4"></div>
                                </div>
                            ))
                        ) : filteredLogs.length > 0 ? filteredLogs.map(log => (
                            <div key={log._id} className="px-10 py-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                        log.module === 'auth' ? "bg-red-50 text-red-500" :
                                            log.module === 'organizations' ? "bg-emerald-50 text-emerald-500" :
                                                "bg-slate-900 text-white"
                                    )}>
                                        <Database size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{log.action}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                <User size={10} /> {log.userId?.name || 'System'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                <Building2 size={10} /> {log.organizationId?.name || 'Global'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-right">
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
                                        {new Date(log.createdAt).toLocaleTimeString()}
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                                        <Clock size={10} className="text-slate-400" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center opacity-20 font-black uppercase tracking-widest italic">No events recorded in the stream</div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

import { ChevronLeft, ChevronRight } from 'lucide-react';
