"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout';
import {
    FileText,
    Save,
    Plus,
    Trash2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function TimesheetsPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [timesheetsRes, projectsRes] = await Promise.all([
                api.get('/timesheets'),
                api.get('/projects')
            ]);
            setEntries(timesheetsRes.data.timesheets || []);
            setProjects(projectsRes.data.projects || []);
        } catch (err) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRow = () => {
        setEntries([
            ...entries,
            { _id: Date.now().toString(), project: '', date: new Date().toISOString().split('T')[0], hours: '', description: '', isNew: true }
        ]);
    };

    const handleRemoveRow = (id: string) => {
        setEntries(entries.filter(e => e._id !== id));
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess('');
        try {
            // In a real app, send changed entries to backend
            await api.post('/timesheets/bulk', { entries });
            setSuccess('Timesheet saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            alert('Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Timesheets</h1>
                        <p className="text-slate-500 font-medium">Log your daily activities and billable hours.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Progress</>}
                        </button>
                    </div>
                </div>

                {/* Weekly Summary Banner */}
                <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Clock size={120} />
                    </div>
                    <div className="flex-1 space-y-2 relative z-10">
                        <h4 className="text-xl font-bold">Current Week Summary</h4>
                        <p className="text-slate-400 text-sm">Total hours logged across all active projects.</p>
                    </div>
                    <div className="flex gap-10 items-center relative z-10">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Hours</p>
                            <h4 className="text-4xl font-black">38.5</h4>
                        </div>
                        <div className="h-10 w-[1px] bg-slate-800"></div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                            <h4 className="text-lg font-black text-emerald-500 uppercase">On Track</h4>
                        </div>
                    </div>
                </div>

                {/* Entries Table */}
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="font-black text-slate-800 tracking-tight">Daily Log</h3>
                        <button
                            onClick={handleAddRow}
                            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-black uppercase text-slate-400 tracking-widest hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                        >
                            <Plus size={14} /> Add Row
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Hours</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity Description</th>
                                    <th className="px-8 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {entries.length > 0 ? entries.map((entry) => (
                                    <tr key={entry._id} className="group">
                                        <td className="px-8 py-4">
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <select
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm"
                                                    value={entry.project}
                                                    onChange={(e) => setEntries(entries.map(ent => ent._id === entry._id ? { ...ent, project: e.target.value } : ent))}
                                                >
                                                    <option value="">Select Project</option>
                                                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                                    {!projects.length && <option value="1">Core Enterprise Platform</option>}
                                                    {!projects.length && <option value="2">Mobile CRM App</option>}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <input
                                                type="date"
                                                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm"
                                                value={entry.date}
                                                onChange={(e) => setEntries(entries.map(ent => ent._id === entry._id ? { ...ent, date: e.target.value } : ent))}
                                            />
                                        </td>
                                        <td className="px-8 py-4">
                                            <input
                                                type="number"
                                                placeholder="0.0"
                                                className="w-20 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm text-center"
                                                value={entry.hours}
                                                onChange={(e) => setEntries(entries.map(ent => ent._id === entry._id ? { ...ent, hours: e.target.value } : ent))}
                                            />
                                        </td>
                                        <td className="px-8 py-4">
                                            <input
                                                type="text"
                                                placeholder="What did you work on?"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm"
                                                value={entry.description}
                                                onChange={(e) => setEntries(entries.map(ent => ent._id === entry._id ? { ...ent, description: e.target.value } : ent))}
                                            />
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <button
                                                onClick={() => handleRemoveRow(entry._id)}
                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    [...Array(1)].map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={5} className="px-8 py-12 text-center">
                                                <div className="flex flex-col items-center opacity-30">
                                                    <FileText size={48} className="mb-4" />
                                                    <p className="text-sm font-bold">No entries logged for today.</p>
                                                    <button onClick={handleAddRow} className="mt-4 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Start Logging</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
                        <div className="flex items-center gap-2">
                            {success && <p className="text-emerald-600 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={16} /> {success}</p>}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Ensure all entries match project allocated hours.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
