"use client";

import React, { useState } from 'react';
import DashboardLayout from '../../layout';
import {
    ChevronLeft,
    Plus,
    MoreHorizontal,
    MessageCircle,
    Paperclip,
    Clock,
    Layout,
    List,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function KanbanPage({ params }: { params: { id: string } }) {
    const [columns, setColumns] = useState(initialColumns);

    return (
        <DashboardLayout allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="h-[calc(100vh-140px)] flex flex-col space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/projects" className="p-2 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-200">
                            <ChevronLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Alpha ERP</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                <p className="text-xs font-bold text-slate-400">Project Leads: Sarah W., Mike C.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                        <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2">
                            <Layout size={14} /> Kanban
                        </button>
                        <button className="px-4 py-2 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                            <List size={14} /> List View
                        </button>
                        <div className="h-6 w-[1px] bg-slate-100 mx-1"></div>
                        <button className="p-2 text-slate-400 hover:text-primary transition-all"><Plus size={20} /></button>
                    </div>
                </div>

                {/* Board */}
                <div className="flex-1 flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
                    {columns.map(column => (
                        <div key={column.id} className="flex-1 min-w-[320px] flex flex-col">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="flex items-center gap-3">
                                    <h4 className="font-black text-slate-900 tracking-tight uppercase text-xs">{column.title}</h4>
                                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500">
                                        {column.tasks.length}
                                    </span>
                                </div>
                                <button className="p-1.5 text-slate-400 hover:bg-white rounded-lg transition-all"><MoreHorizontal size={18} /></button>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                                {column.tasks.map(task => (
                                    <div key={task.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={cn(
                                                "px-2 px-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                                                task.priority === 'High' ? "bg-red-50 text-red-600" : task.priority === 'Medium' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                                            )}>
                                                {task.priority}
                                            </span>
                                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-50 rounded-md transition-all"><MoreHorizontal size={14} /></button>
                                        </div>
                                        <h5 className="font-bold text-slate-800 leading-tight mb-2">{task.title}</h5>
                                        <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed">{task.desc}</p>

                                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {task.members.map((m, i) => (
                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold">
                                                        {m}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle size={12} />
                                                    <span className="text-[10px] font-bold">{task.comments}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Paperclip size={12} />
                                                    <span className="text-[10px] font-bold">{task.files}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-widest hover:border-primary hover:text-primary hover:bg-primary/[0.02] transition-all">
                                    Add New Task
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

const initialColumns = [
    {
        id: 'todo',
        title: 'To Do',
        tasks: [
            { id: 1, title: 'Define API Structures', desc: 'Setup core Mongoose schemas for the ERP module.', priority: 'High', members: ['SW'], comments: 4, files: 2 },
            { id: 2, title: 'UI Kit Research', desc: 'Identify primary design patterns for analytics charts.', priority: 'Medium', members: ['MC', 'JL'], comments: 1, files: 5 }
        ]
    },
    {
        id: 'progress',
        title: 'In Progress',
        tasks: [
            { id: 3, title: 'Auth Service Integration', desc: 'Link JWT middleware with role-based dashboard redirection.', priority: 'High', members: ['JD'], comments: 12, files: 1 }
        ]
    },
    {
        id: 'review',
        title: 'Code Review',
        tasks: [
            { id: 4, title: 'Responsive Sidebar', desc: 'Optimizing sidebar for mobile and tablet touch interaction.', priority: 'Low', members: ['SW'], comments: 2, files: 0 },
            { id: 5, title: 'Error Boundary Hook', desc: 'Implement global catch block for API failures.', priority: 'Medium', members: ['MC'], comments: 0, files: 3 }
        ]
    },
    {
        id: 'done',
        title: 'Done',
        tasks: [
            { id: 6, title: 'Project Planning', desc: 'Finalize milestones and resource allocation for Q4.', priority: 'High', members: ['admin'], comments: 8, files: 6 }
        ]
    }
];
