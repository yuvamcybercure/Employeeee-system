"use client";

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const COLORS = {
    'Well Done': '#22c55e',          // emerald-500
    'Can do better': '#a3e635',     // lime-400
    'Half Day': '#facc15',          // amber-400
    'Leave': '#f43f5e',             // rose-500
    'Weekly Off': '#94a3b8',        // slate-400
    'WFH': '#8b5cf6',               // violet-500
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Day {payload[0].payload.day}</p>
                <p className="text-sm font-black text-slate-900">{payload[0].payload.status}</p>
            </div>
        );
    }
    return null;
};

export function WorkStatusChart({ data: initialData }: { data?: any[] }) {
    const data = initialData?.length ? initialData : [
        { day: '01', status: 'Weekly Off', value: 2 },
        { day: '02', status: 'Half Day', value: 5 },
        { day: '03', status: 'Well Done', value: 8 },
        { day: '04', status: 'Half Day', value: 4 },
        { day: '05', status: 'Well Done', value: 8 },
        { day: '06', status: 'Can do better', value: 7 },
        { day: '07', status: 'Weekly Off', value: 2 },
        { day: '08', status: 'Weekly Off', value: 2 },
        { day: '09', status: 'Half Day', value: 5 },
        { day: '10', status: 'Half Day', value: 5 },
        { day: '11', status: 'Leave', value: 3 },
        { day: '12', status: 'Half Day', value: 6 },
        { day: '13', status: 'Half Day', value: 5 },
        { day: '14', status: 'Weekly Off', value: 2 },
        { day: '15', status: 'Weekly Off', value: 2 },
        { day: '16', status: 'Well Done', value: 8 },
        { day: '17', status: 'Leave', value: 4 },
        { day: '18', status: 'Half Day', value: 6 },
        { day: '19', status: 'Half Day', value: 7 },
        { day: '20', status: 'Well Done', value: 8 },
        { day: '21', status: 'Weekly Off', value: 2 },
        { day: '22', status: 'Weekly Off', value: 2 },
        { day: '23', status: 'Half Day', value: 6 },
        { day: '24', status: 'Leave', value: 3 },
        { day: '25', status: 'Leave', value: 3 },
        { day: '26', status: 'Leave', value: 3 },
        { day: '27', status: 'Leave', value: 3 },
        { day: '28', status: 'Weekly Off', value: 2 },
    ];

    return (
        <div className="glass-card rounded-[3rem] p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Work Status</h3>
                <div className="flex gap-2">
                    <select className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                        <option>February</option>
                    </select>
                    <select className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                        <option>2026</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
                {Object.entries(COLORS).map(([label, color]) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                    </div>
                ))}
            </div>

            <div className="flex-1 min-h-[250px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar
                            dataKey="value"
                            radius={[6, 6, 6, 6]}
                            barSize={12}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || '#cbd5e1'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 tracking-widest">2026-02-01</p>
                <p className="text-[10px] font-black text-slate-400 tracking-widest">2026-02-15</p>
                <p className="text-[10px] font-black text-slate-400 tracking-widest">2026-02-28</p>
            </div>
        </div>
    );
}
