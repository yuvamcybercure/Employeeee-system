"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layout';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
    Plus,
    Briefcase,
    Clock,
    Users,
    ChevronRight,
    Search,
    MoreVertical,
    Activity,
    Zap,
    Layout
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function ProjectsPage() {
    const { user, hasPermission } = useAuth();
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
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-12 pb-20"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Project Core</h1>
                        <p className="text-slate-500 font-bold mt-3 text-lg">Central command for deliverables, tasks, and team clusters.</p>
                    </div>
                    {hasPermission('canManageProjects') && (
                        <button className="flex items-center gap-3 px-8 py-4 premium-gradient text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover-scale">
                            <Plus size={18} /> Initialize Project
                        </button>
                    )}
                </motion.div>

                {/* Search & Insight Strip */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 glass-card rounded-3xl p-4 flex items-center px-8 border-white/50">
                        <Search className="text-slate-300" size={20} />
                        <input
                            type="text"
                            placeholder="Identify project by name, cluster or status..."
                            className="flex-1 bg-transparent border-none outline-none px-6 text-sm font-bold text-slate-600 placeholder:text-slate-300"
                        />
                    </div>
                    <div className="bg-slate-900 rounded-3xl p-4 flex items-center justify-between px-8 text-white shadow-xl shadow-slate-900/20">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Yield Progress</p>
                            <p className="text-2xl font-black mt-1">74<span className="text-xs opacity-40 ml-1">%</span></p>
                        </div>
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary">
                            <Activity size={20} />
                        </div>
                    </div>
                </motion.div>

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-80 glass-card rounded-[3rem] animate-pulse bg-white/30" />
                        ))
                    ) : projects.length > 0 ? (
                        projects.map((project) => (
                            <motion.div
                                key={project._id}
                                variants={itemVariants}
                                whileHover={{ y: -8 }}
                                className="group relative"
                            >
                                <Link href={`/projects/${project._id}`}>
                                    <div className="glass-card rounded-[3rem] p-8 h-full border-white/50 transition-all duration-500 group-hover:shadow-3xl group-hover:shadow-slate-200/50 flex flex-col justify-between overflow-hidden">
                                        {/* Status Chip Overlay */}
                                        <div className="absolute top-0 right-0 p-8">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                                project.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {project.status}
                                            </span>
                                        </div>

                                        <div className="relative z-10">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                                <Briefcase size={32} />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight group-hover:text-primary transition-colors">{project.title}</h3>
                                            <p className="text-slate-400 text-sm font-bold mt-4 leading-relaxed line-clamp-2">
                                                {project.description || "Project parameters and implementation details are nested within the core module."}
                                            </p>
                                        </div>

                                        <div className="mt-10 pt-8 border-t border-slate-50">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex -space-x-3">
                                                    {(project.team || []).slice(0, 4).map((member: any, idx: number) => (
                                                        <div key={idx} className="w-10 h-10 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-sm" title={member.name}>
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400">
                                                                {member.name?.[0]}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(project.team || []).length > 4 && (
                                                        <div className="w-10 h-10 rounded-2xl border-4 border-white bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                                                            +{(project.team || []).length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <Clock size={14} /> 12 Oct
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-black text-slate-900">34% <span className="opacity-40">Complete</span></p>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-black text-primary group-hover:translate-x-1 transition-transform">
                                                    Access Board <ChevronRight size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-32 flex flex-col items-center gap-8 opacity-20 text-slate-900">
                            <Layout size={80} strokeWidth={1} />
                            <p className="font-black uppercase tracking-[0.3em] text-sm">No Active Clusters Found</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
