"use client";

import React from 'react';
import { X, Calendar, MessageSquare, User, Clock, CheckCircle2, XCircle, AlertCircle, FileText, Paperclip } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface LeaveDetailsModalProps {
    leave: any;
    onClose: () => void;
}

export function LeaveDetailsModal({ leave, onClose }: LeaveDetailsModalProps) {
    if (!leave) return null;

    const statusConfigs: any = {
        pending: { icon: Clock, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
        approved: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
        rejected: { icon: XCircle, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
        cancelled: { icon: AlertCircle, color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-100" }
    };

    const config = statusConfigs[leave.status] || statusConfigs.pending;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm", config.bg, config.color)}>
                            <config.icon size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                {leave.type} Leave Request
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", config.bg, config.color, config.border)}>
                                    {leave.status}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    ID: {leave._id.slice(-8).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* User Info & Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Applicant Details</h4>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                                    {leave.userId?.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800 leading-none">{leave.userId?.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{leave.userId?.department || 'Employee'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration & Period</h4>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Total Days</span>
                                    <span className="text-xl font-black text-slate-900">{leave.totalDays}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-700">{formatDate(leave.startDate)}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">to {formatDate(leave.endDate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Purpose of Leave</h4>
                        <div className="p-6 bg-slate-900 text-slate-300 rounded-[2rem] border border-slate-800 shadow-inner relative overflow-hidden italic leading-relaxed text-sm">
                            <MessageSquare className="absolute -top-2 -right-2 text-white/5" size={80} />
                            "{leave.reason}"
                        </div>
                    </div>

                    {/* Admin Review Note (if any) */}
                    {(leave.reviewNote || leave.status !== 'pending') && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Review Information</h4>
                            <div className={cn("p-6 rounded-[2rem] border italic text-sm", config.bg, config.border, config.color)}>
                                <div className="flex items-start gap-3">
                                    <FileText size={18} className="mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-bold mb-1">
                                            Reviewed by {leave.reviewedBy?.name || 'Authorized Admin'}
                                            {leave.reviewedBy?.employeeId && <span className="text-[10px] text-slate-400 font-bold ml-2">({leave.reviewedBy.employeeId})</span>}
                                        </p>
                                        <p className="opacity-80">"{leave.reviewNote || (leave.status === 'approved' ? 'Request fits within annual protocol.' : 'Request could not be accommodated at this time.')}"</p>
                                        <p className="text-[9px] uppercase font-black mt-3 opacity-50 tracking-widest">{leave.reviewedAt ? new Date(leave.reviewedAt).toLocaleDateString() : 'Processed Recently'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {leave.attachments?.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Supporting Documents</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {leave.attachments.map((url: string, i: number) => (
                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group">
                                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Paperclip size={16} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">Document_{i + 1}.pdf</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20"
                    >
                        Close View
                    </button>
                </div>
            </div>
        </div>
    );
}
