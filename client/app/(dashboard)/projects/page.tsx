"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout';
import {
    Briefcase,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    Users,
    MoreVertical,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import api from '@/lib/api';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects');
            if (data.success) setProjects(data.projects);
        } catch (err) {
            console.error('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Hub</h1>
                        <p className="text-slate-500 font-medium">Track development progress, tasks, and team workload.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                        <Plus size={20} /> Create New Project
                    </button>
                </div>

                {/* Global Project Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard label="Active Projects" value="12" icon={Briefcase} trend="+2 from last month" color="blue" />
                    <StatCard label="Completed Tasks" value="84" icon={CheckCircle2} trend="95% completion rate" color="emerald" />
                    <StatCard label="Total Resources" value="28" icon={Users} trend="4 new hires this week" color="orange" />
                </div>

                {/* Filter Section */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                            <Filter size={18} /> Filters
                        </button>
                    </div>
                </div>

                {/* Project Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {loading ? (
                        [...Array(4)].map((_, i) => <div key={i} className="h-64 bg-white rounded-[32px] animate-pulse border border-slate-100"></div>)
                    ) : projects.length > 0 ? (
                        projects.map(project => <ProjectCard key={project._id} project={project} />)
                    ) : (
                        mockProjects.map(project => <ProjectCard key={project.id} project={project} />)
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ label, value, icon: Icon, trend, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        orange: "bg-orange-50 text-orange-600"
    };
    return (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", colors[color])}>
                    <Icon size={24} />
                </div>
                <TrendingUp className="text-emerald-500" size={18} />
            </div>
            <h3 className="text-3xl font-black text-slate-900">{value}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
            <p className="text-xs font-bold text-emerald-500 mt-4">{trend}</p>
        </div>
    );
}

function ProjectCard({ project }: any) {
    return (
        <Link href={`/projects/${project.id || project._id}`} className="block group">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <ChevronRight size={20} />
                    </div>
                </div>

                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-slate-50">
                        {project.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{project.name}</h4>
                        <p className="text-sm text-slate-500 font-medium mt-1 line-clamp-1">{project.description}</p>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold ring-2 ring-slate-50">
                                {['A', 'B', 'C'][i]}
                            </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-black">+2</div>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-100"></div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={16} />
                        <span className="text-xs font-bold">Due 12 Sep</span>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Progress</span>
                        <span className="text-xs font-black text-slate-900">{project.progress || 65}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${project.progress || 65}%` }}></div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

const mockProjects = [
    { id: 1, name: 'Project Alpha ERP', description: 'Enterprise resource planning system for manufacturing.', progress: 78 },
    { id: 2, name: 'Nexus Mobile App', description: 'Consumer facing loyalty and rewards application.', progress: 42 },
    { id: 3, name: 'Vault Security UI', description: 'Internal dashboard for infrastructure monitoring.', progress: 91 },
    { id: 4, name: 'Commerce Cloud', description: 'Next-gen e-commerce platform with AI matching.', progress: 15 },
];
