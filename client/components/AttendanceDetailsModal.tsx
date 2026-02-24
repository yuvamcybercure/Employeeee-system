"use client";

import React from 'react';
import { X, MapPin, Clock, Smartphone, Globe, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceDetailsModalProps {
    log: any;
    onClose: () => void;
}

export function AttendanceDetailsModal({ log, onClose }: AttendanceDetailsModalProps) {
    if (!log) return null;

    const renderCapture = (title: string, capture: any, icon: any) => {
        if (!capture || !capture.time) return (
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3 opacity-50 grayscale">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300">
                    {React.createElement(icon, { size: 24 })}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title} Not Recorded</p>
            </div>
        );

        return (
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm group">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        {React.createElement(icon, { size: 14, className: "text-primary" })}
                        {title}
                    </h4>
                    <span className="text-[10px] font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-full">
                        {new Date(capture.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                </div>

                <div className="aspect-square relative bg-slate-900">
                    {capture.photo ? (
                        <img src={capture.photo} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                            <User size={48} />
                        </div>
                    )}

                    {!capture.withinGeofence && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                            <AlertTriangle size={10} /> Outside Geofence
                        </div>
                    )}

                    {capture.withinGeofence && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5">
                            <CheckCircle2 size={10} /> Geofence Verified
                        </div>
                    )}
                </div>

                <div className="p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-400 flex items-center gap-1.5"><MapPin size={12} /> Geolocation</span>
                        <span className="text-slate-700">{capture.lat?.toFixed(4)}, {capture.lng?.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-400 flex items-center gap-1.5"><Globe size={12} /> IP Address</span>
                        <span className="text-slate-700">{capture.ip || '---'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-400 flex items-center gap-1.5"><Smartphone size={12} /> Device</span>
                        <span className="text-slate-700 line-clamp-1 max-w-[120px]">{capture.device || '---'}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                                {log.userId?.name?.charAt(0) || 'A'}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                                    {log.userId?.name || 'Attendance Details'}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                                    {new Date(log.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {renderCapture("Clock In", log.clockIn, Clock)}
                        {renderCapture("Clock Out", log.clockOut, LogOutIcon)}
                    </div>

                    <div className="mt-8 p-6 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative">
                        <div className="absolute bottom-0 left-0 w-full h-1 premium-gradient" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Summary & Status</h4>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated Time</p>
                                <p className="text-3xl font-black mt-2 tabular-nums">
                                    {log.totalHours || 0} <span className="text-xs opacity-40">hours</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shift Status</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={cn(
                                        "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        log.status === 'present' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            log.status === 'late' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                    )}>
                                        {log.status || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const LogOutIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
