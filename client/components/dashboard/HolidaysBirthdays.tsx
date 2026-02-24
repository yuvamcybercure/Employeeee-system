"use client";

import React, { useState } from 'react';
import { Gift, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function HolidaysBirthdays({
    holidays: initialHolidays,
    birthdays: initialBirthdays
}: {
    holidays?: any[],
    birthdays?: any[]
}) {
    const holidays = initialHolidays?.length ? initialHolidays : [
        { name: "New Year", date: "Thu, 1 Jan 2026", icon: "🥳" },
        { name: "Republic Day", date: "Mon, 26 Jan 2026", icon: "🇮🇳" },
        { name: "Holi", date: "Wed, 4 Mar 2026", icon: "🎨" },
        { name: "Eid-ul-Fitr", date: "Mon, 30 Mar 2026", icon: "🌙" },
    ];

    const birthdays = initialBirthdays?.length ? initialBirthdays : [
        { name: "Sandeep Kumar", date: "Tomorrow", icon: "🎂" },
        { name: "Priya Sharma", date: "15 Feb 2026", icon: "🧁" },
        { name: "Rahul Verma", date: "22 Feb 2026", icon: "🎁" },
    ];

    const [activeTab, setActiveTab] = useState<'holidays' | 'birthdays'>('holidays');

    return (
        <div className="glass-card rounded-[3rem] overflow-hidden flex flex-col h-full border-white/50">
            <div className="flex border-b border-slate-100">
                <button
                    onClick={() => setActiveTab('holidays')}
                    className={cn(
                        "flex-1 py-5 text-sm font-black uppercase tracking-widest transition-all relative",
                        activeTab === 'holidays' ? "text-primary bg-primary/5" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                >
                    Holidays
                    {activeTab === 'holidays' && (
                        <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 w-full h-1 bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('birthdays')}
                    className={cn(
                        "flex-1 py-5 text-sm font-black uppercase tracking-widest transition-all relative",
                        activeTab === 'birthdays' ? "text-rose-500 bg-rose-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                >
                    Birthdays
                    {activeTab === 'birthdays' && (
                        <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 w-full h-1 bg-rose-500" />
                    )}
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-4"
                    >
                        {(activeTab === 'holidays' ? holidays : birthdays).map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-3xl transition-all group cursor-pointer border border-transparent hover:border-slate-100 shadow-sm">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner",
                                    activeTab === 'holidays' ? "bg-amber-100" : "bg-rose-100"
                                )}>
                                    {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-slate-800 truncate">{item.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.date}</p>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors border border-slate-50">
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                <button className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors">
                    View Full Calendar
                </button>
            </div>
        </div>
    );
}
