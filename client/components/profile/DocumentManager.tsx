"use client";

import React, { useState } from 'react';
import {
    Upload,
    FileText,
    Trash2,
    Eye,
    Download,
    History as HistoryIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    Plus,
    Loader2,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface Document {
    _id: string;
    type: string;
    name: string;
    url: string;
    version: number;
    uploadedAt: string;
    uploadedBy: { name: string };
    note?: string;
}

const DOCUMENT_CATEGORIES = [
    { id: 'pan_front', title: 'PAN Card (Front)', group: 'Identity Proofs' },
    { id: 'aadhaar_front', title: 'Aadhaar Card (Front)', group: 'Identity Proofs' },
    { id: 'aadhaar_back', title: 'Aadhaar Card (Back)', group: 'Identity Proofs' },
    { id: '10th_cert', title: '10th Certificate', group: 'Educational Certificates' },
    { id: '12th_cert', title: '12th Certificate', group: 'Educational Certificates' },
    { id: 'degree', title: 'Higher Education (Degrees/Diplomas)', group: 'Educational Certificates' },
    { id: 'experience', title: 'Work Experience Letters', group: 'Professional History' },
    { id: 'other', title: 'Other Certifications', group: 'Other' },
];

export function DocumentManager({ user, onUpdate }: { user: any, onUpdate: () => void }) {
    const [loading, setLoading] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState<string | null>(null);
    const [uploadingTo, setUploadingTo] = useState<any | null>(null);
    const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
    const [previewFile, setPreviewFile] = useState<{ file: File, url: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (file: File) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreviewFile({ file, url });
    };

    const handleUpload = async () => {
        if (!previewFile || !uploadingTo) return;

        setLoading(uploadingTo.id);
        try {
            // Mocking file upload
            const { data } = await api.post(`/users/${user._id}/documents`, {
                type: uploadingTo.id,
                name: previewFile.file.name,
                url: previewFile.url,
                note: uploadingTo.title
            });

            if (data.success) {
                onUpdate();
                handleCloseUpload();
            }
        } catch (err) {
            console.error('Upload failed');
        } finally {
            setLoading(null);
        }
    };

    const handleCloseUpload = () => {
        setUploadingTo(null);
        setPreviewFile(null);
    };

    const handleDelete = async (docId: string) => {
        if (!confirm('Permanent deletion will remove this version. Continue?')) return;
        try {
            const { data } = await api.delete(`/users/${user._id}/documents/${docId}`);
            if (data.success) onUpdate();
        } catch (err) {
            console.error('Delete failed');
        }
    };

    const userDocuments = user?.documents || [];
    const groupedCategories = DOCUMENT_CATEGORIES.reduce((acc: any, cat) => {
        acc[cat.group] = acc[cat.group] || [];
        acc[cat.group].push(cat);
        return acc;
    }, {});

    return (
        <div className="space-y-12 pb-20">
            {/* Header / Intro */}
            <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                    <HistoryIcon size={160} />
                </div>
                <div className="relative z-10 max-w-2xl space-y-4">
                    <h2 className="text-3xl font-black tracking-tight">Document Management</h2>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        Upload and manage your identity documents and certificates. Files are securely stored with version control.
                        Supported formats: PDF, JPG, PNG. Max size: 5MB.
                    </p>
                </div>
            </div>

            {Object.entries(groupedCategories).map(([group, categories]: [string, any]) => (
                <div key={group} className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] px-4">{group}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category: any) => {
                            const docs = userDocuments.filter((d: any) => d.type === category.id).sort((a: any, b: any) => b.version - a.version);
                            const latest = docs[0];

                            return (
                                <div key={category.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
                                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                                                <FileText size={20} />
                                            </div>
                                            <span className="text-sm font-black text-slate-700">{category.title}</span>
                                        </div>
                                        {docs.length > 1 && (
                                            <button
                                                onClick={() => setShowHistory(category.id)}
                                                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1"
                                            >
                                                <Clock size={12} /> History
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col items-center justify-center min-h-[220px]">
                                        {latest ? (
                                            <div className="w-full space-y-4">
                                                <div className="relative aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden group/thumb">
                                                    {latest.url.match(/\.(jpg|jpeg|png)$/i) || latest.url.startsWith('blob:') ? (
                                                        <img src={latest.url} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                                                            <FileText size={48} />
                                                            <span className="text-[10px] font-black uppercase">PDF Document</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => setViewingDoc(latest)}
                                                            className="p-3 bg-white text-slate-900 rounded-2xl hover:scale-110 active:scale-95 transition-all"
                                                        >
                                                            <Eye size={20} />
                                                        </button>
                                                        <a href={latest.url} download className="p-3 bg-white text-slate-900 rounded-2xl hover:scale-110 active:scale-95 transition-all">
                                                            <Download size={20} />
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">v{latest.version} (Latest)</p>
                                                        <p className="text-sm font-bold text-slate-700 truncate">{latest.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">Uploaded by {latest.uploadedAt ? new Date(latest.uploadedAt).toLocaleDateString() : 'N/A'}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setUploadingTo(category)}
                                                        className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all"
                                                    >
                                                        <Plus size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-center space-y-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                    <Upload size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Document</p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1">Upload required document</p>
                                                </div>
                                                <button
                                                    onClick={() => setUploadingTo(category)}
                                                    className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    Browse File
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Upload Modal with Drag & Drop */}
            <AnimatePresence>
                {uploadingTo && (
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                        <Upload size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Upload Document</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{uploadingTo.title}</p>
                                    </div>
                                </div>
                                <button onClick={handleCloseUpload} className="p-2 text-slate-400 hover:text-slate-800"><X size={24} /></button>
                            </div>

                            <div className="p-8 space-y-6">
                                {!previewFile ? (
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            const file = e.dataTransfer.files[0];
                                            if (file) handleFileSelect(file);
                                        }}
                                        className={cn(
                                            "border-2 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center space-y-4 transition-all relative overflow-hidden",
                                            isDragging ? "border-primary bg-primary/5 scale-95" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/50"
                                        )}
                                    >
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                            accept=".pdf,image/*"
                                        />
                                        <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm flex items-center justify-center text-primary">
                                            <Upload size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Drag & Drop File</p>
                                            <p className="text-xs text-slate-400 font-medium">Support for PDF, JPG, PNG (Max 5MB)</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="relative aspect-video rounded-[2.5rem] bg-slate-50 overflow-hidden border border-slate-100 flex items-center justify-center group">
                                            {previewFile.file.type.startsWith('image/') ? (
                                                <img src={previewFile.url} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-4">
                                                    <FileText size={64} className="text-primary/40" />
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">PDF Document</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setPreviewFile(null)}
                                                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md text-red-500 rounded-xl hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                                                    <FileText size={16} />
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 truncate">{previewFile.file.name}</p>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400">{(previewFile.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleCloseUpload}
                                        className="flex-1 px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={!previewFile || loading === uploadingTo.id}
                                        className="flex-[2] px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading === uploadingTo.id ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                        Upload Final Version
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Document Viewer Modal */}
            <AnimatePresence>
                {viewingDoc && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-5xl aspect-[3/4] md:aspect-video bg-white rounded-[3rem] overflow-hidden flex flex-col"
                        >
                            <div className="p-6 bg-white flex items-center justify-between border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                        <Eye size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 tracking-tight">{viewingDoc.name}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Version {viewingDoc.version}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={viewingDoc.url} download className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all">
                                        <Download size={20} />
                                    </a>
                                    <button onClick={() => setViewingDoc(null)} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 bg-slate-50 relative">
                                {viewingDoc.url.match(/\.(jpg|jpeg|png)$/i) || viewingDoc.url.startsWith('blob:') ? (
                                    <img src={viewingDoc.url} className="w-full h-full object-contain" />
                                ) : (
                                    <iframe src={viewingDoc.url} className="w-full h-full border-none" />
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                        <HistoryIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Version History</h3>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                            {DOCUMENT_CATEGORIES.find(c => c.id === showHistory)?.title}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowHistory(null)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {userDocuments.filter((d: any) => d.type === showHistory).sort((a: any, b: any) => b.version - a.version).map((doc: any, i: number) => (
                                    <div key={doc._id} className="flex items-center gap-6 p-6 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-all group">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
                                            {i === 0 ? <CheckCircle2 className="text-emerald-500" /> : <Clock size={24} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-black text-slate-700">Version {doc.version}</p>
                                                <span className="text-[10px] text-slate-400 font-bold">{new Date(doc.uploadedAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">{doc.name}</p>
                                            <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setViewingDoc(doc)}
                                                    className="px-4 py-2 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-50 shadow-sm"
                                                >
                                                    View
                                                </button>
                                                <button onClick={() => handleDelete(doc._id)} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
