"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    Activity,
    Search,
    Filter,
    Clock,
    Database,
    ShieldAlert,
    RefreshCw,
    Terminal,
    Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/logs');
            if (data.success) setLogs(data.logs);
        } catch (err) {
            console.error('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['superadmin']}>
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Audit Log</h1>
                        <p className="text-slate-500 font-medium">Real-time tracking of all system activities and security events.</p>
                    </div>
                    <button onClick={fetchLogs} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all text-slate-600">
                        <RefreshCw size={20} className={cn(loading && "animate-spin")} /> Refresh Feed
                    </button>
                </div>

                {/* Live Terminal Header */}
                <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden border-4 border-slate-800">
                    <div className="flex items-center gap-4 mb-6">
                        <Terminal size={24} className="text-emerald-500" />
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        </div>
                        <div className="h-4 w-[1px] bg-slate-800 mx-2"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Monitoring</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <LogStat label="Total Events" value="12,482" color="blue" />
                        <LogStat label="Security Alerts" value="0" color="emerald" />
                        <LogStat label="Data Mutations" value="1,204" color="orange" />
                    </div>
                </div>

                {/* Log Viewer Container */}
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">All Events</button>
                            <button className="px-4 py-2 text-slate-400 hover:text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Security</button>
                            <button className="px-4 py-2 text-slate-400 hover:text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">System</button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Filter logs..."
                                className="w-full md:w-80 pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Timestamp</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Executed By</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse h-20 bg-slate-50/10"></tr>)
                                ) : logs.length > 0 ? (
                                    logs.map(log => <LogTableRow key={log._id} log={log} />)
                                ) : (
                                    mockLogs.map(log => <LogTableRow key={log.id} log={log} />)
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-8 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-400">Retention Policy: 90 Days</p>
                        <div className="flex gap-2">
                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Download CSV</button>
                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Export to PDF</button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function LogStat({ label, value, color }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
            <h4 className="text-4xl font-black tracking-tight">{value}</h4>
        </div>
    );
}

function LogTableRow({ log }: any) {
    const types: any = {
        INFO: "text-blue-500",
        WARN: "text-yellow-500",
        SEC: "text-red-500",
        DATA: "text-emerald-500"
    };
    return (
        <tr className="hover:bg-slate-50/50 transition-all font-mono">
            <td className="px-8 py-5 whitespace-nowrap">
                <span className="text-xs text-slate-400 font-medium">{log.timestamp || '2024-03-23 15:42:11'}</span>
            </td>
            <td className="px-8 py-5">
                <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-50 rounded-md ring-1 ring-slate-100", types[log.type || 'INFO'])}>
                    {log.type || 'INFO'}
                </span>
            </td>
            <td className="px-8 py-5">
                <p className="text-sm font-bold text-slate-700 leading-tight truncate max-w-md">{log.action || 'User authentication successful via session cookie'}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">{log.resource || 'AUTH_MODULE'}</p>
            </td>
            <td className="px-8 py-5">
                <div className="flex items-center gap-2">
                    <Circle size={8} fill="currentColor" className="text-slate-300" />
                    <span className="text-xs font-bold text-slate-600">{log.user || 'system_service'}</span>
                </div>
            </td>
            <td className="px-8 py-5 text-right whitespace-nowrap">
                <span className="text-[10px] font-bold text-slate-400">{log.ip || '192.168.1.104'}</span>
            </td>
        </tr>
    );
}

const mockLogs = [
    { id: 1, type: 'SEC', action: 'Login attempt from unrecognized IP address', resource: 'AUTH_GATEWAY', user: 'superadmin', ip: '203.0.113.1', timestamp: '2024-03-23 18:22:04' },
    { id: 2, type: 'DATA', action: 'Bulk update of leave balances for Q1', resource: 'LEAVE_SERVICE', user: 'admin_sarah', ip: '192.168.1.15', timestamp: '2024-03-23 17:05:41' },
    { id: 3, type: 'INFO', action: 'PDF generation for monthly attendance success', resource: 'REPORT_ENGINE', user: 'system', ip: 'localhost', timestamp: '2024-03-23 16:55:00' },
    { id: 4, type: 'WARN', action: 'Multiple failed clock-in attempts detected', resource: 'ATTENDANCE_API', user: 'emp_jake_99', ip: '10.0.0.242', timestamp: '2024-03-23 16:12:12' },
    { id: 5, type: 'INFO', action: 'New project "Commerce Cloud" created', resource: 'PROJECT_MODULE', user: 'pm_mike', ip: '192.168.1.28', timestamp: '2024-03-23 15:33:55' },
];
