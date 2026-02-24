"use client";

import React from 'react';
import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
    PolarAngleAxis
} from 'recharts';
import { ExternalLink } from 'lucide-react';

const data = [
    { name: 'Active Projects', value: 75, fill: '#6366f1' }
];

export function ProjectOverview({ stats }: { stats?: { active: number, completed: number, pending: number } }) {
    const activeData = [
        { name: 'Active', value: stats ? (stats.active / (stats.active + stats.completed + stats.pending || 1)) * 100 : 75, fill: '#6366f1' }
    ];

    return (
        <div className="glass-card rounded-[3rem] p-8 h-full flex flex-col border-white/50 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Project Overview</h3>
                <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                    View All <ExternalLink size={12} />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[220px]">
                <div className="absolute inset-0 flex items-center justify-center flex-col z-20 pointer-events-none">
                    <p className="text-5xl font-[1000] text-slate-900 leading-none">{stats?.active || '0'}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{stats?.active === 1 ? 'Active' : 'Active'}</p>
                </div>

                <div className="w-full h-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            innerRadius="80%"
                            outerRadius="100%"
                            data={activeData}
                            startAngle={90}
                            endAngle={450}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 100]}
                                angleAxisId={0}
                                tick={false}
                            />
                            <RadialBar
                                background
                                dataKey="value"
                                cornerRadius={30}
                                fill="#6366f1"
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50 relative z-10">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
                    <p className="text-xl font-black text-slate-900 mt-1 uppercase">{stats?.completed || '0'}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
                    <p className="text-xl font-black text-slate-900 mt-1 uppercase">{stats?.pending || '0'}</p>
                </div>
            </div>

            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
        </div>
    );
}
