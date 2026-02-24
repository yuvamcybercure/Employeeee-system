"use client";

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
    Lightbulb,
    MessageCircle,
    ThumbsUp,
    Plus,
    Search,
    Clock,
    ChevronUp,
    ChevronDown,
    X,
    Send,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuggestionsPage() {
    const { user } = useAuth();
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newIdea, setNewIdea] = useState({ title: '', description: '', category: 'process', isAnonymous: false });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const { data } = await api.get('/suggestions');
            if (data.success) setSuggestions(data.suggestions);
        } catch (err) {
            console.error('Failed to fetch suggestions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateIdea = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.post('/suggestions', newIdea);
            if (data.success) {
                setShowModal(false);
                setNewIdea({ title: '', description: '', category: 'process', isAnonymous: false });
                fetchSuggestions();
            }
        } catch (err) {
            console.error('Failed to create idea');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (id: string) => {
        try {
            const { data } = await api.patch(`/suggestions/${id}/upvote`);
            if (data.success) {
                setSuggestions(prev => prev.map(s => s._id === id ? {
                    ...s,
                    upvotes: data.upvotes > s.upvotes.length
                        ? [...s.upvotes, user?._id]
                        : s.upvotes.filter((uid: string) => uid !== user?._id)
                } : s));
            }
        } catch (err) {
            console.error('Failed to vote');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="max-w-6xl mx-auto space-y-10 p-4 md:p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 mt-6 md:mt-0">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-yellow-400/10 rounded-[24px] flex items-center justify-center text-yellow-500 shadow-inner">
                            <Lightbulb size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Idea Hub</h1>
                            <p className="text-slate-500 font-medium">Shape the future of productivity with your suggestions.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus size={20} /> Share New Idea
                    </button>
                </div>

                {/* Categories / Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search ideas..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Suggestion List */}
                <div className="space-y-6 pb-20">
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white rounded-[32px] animate-pulse border border-slate-100"></div>)
                    ) : suggestions.length > 0 ? (
                        suggestions.map(idea => (
                            <SuggestionCard
                                key={idea._id}
                                idea={idea}
                                userId={user?._id}
                                onVote={() => handleVote(idea._id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold">No suggestions yet. Be the first to share an idea!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden"
                        >
                            <form onSubmit={handleCreateIdea}>
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Share an Idea</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-400 transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">What's your idea?</label>
                                        <input
                                            required
                                            value={newIdea.title}
                                            onChange={e => setNewIdea({ ...newIdea, title: e.target.value })}
                                            placeholder="e.g., Improved shift rotation"
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Describe implementation</label>
                                        <textarea
                                            required
                                            value={newIdea.description}
                                            onChange={e => setNewIdea({ ...newIdea, description: e.target.value })}
                                            placeholder="Tell us more about how this will help..."
                                            rows={4}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-600 resize-none"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {['process', 'culture', 'technology', 'workplace', 'other'].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setNewIdea({ ...newIdea, category: cat })}
                                                className={cn(
                                                    "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                                                    newIdea.category === cat
                                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                        : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={newIdea.isAnonymous}
                                                onChange={e => setNewIdea({ ...newIdea, isAnonymous: e.target.checked })}
                                            />
                                            <div className={cn(
                                                "w-12 h-6 rounded-full transition-all duration-300",
                                                newIdea.isAnonymous ? "bg-primary" : "bg-slate-200"
                                            )} />
                                            <div className={cn(
                                                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 transform",
                                                newIdea.isAnonymous ? "translate-x-6" : "translate-x-0"
                                            )} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-600">Post Anonymously</span>
                                    </label>
                                </div>
                                <div className="p-8 bg-slate-50/50 flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="mx-auto animate-spin" /> : "Publish Idea"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ProtectedRoute>
    );
}

function SuggestionCard({ idea, userId, onVote }: any) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const hasVoted = idea.upvotes?.includes(userId);

    const toggleComments = () => {
        if (!isExpanded) fetchComments();
        setIsExpanded(!isExpanded);
    };

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const { data } = await api.get(`/suggestions/${idea._id}/comments`);
            if (data.success) setComments(data.comments);
        } catch (err) {
            console.error('Failed to fetch comments');
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const { data } = await api.post(`/suggestions/${idea._id}/comments`, { content: newComment });
            if (data.success) {
                setComments([...comments, data.comment]);
                setNewComment('');
            }
        } catch (err) {
            console.error('Failed to add comment');
        }
    };

    return (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="p-6 md:p-8 flex gap-4 md:gap-8 group">
                {/* Voting Side */}
                <div className="flex flex-col items-center gap-2 bg-slate-50/50 p-2 rounded-2xl self-start min-w-[50px]">
                    <button
                        onClick={onVote}
                        className={cn(
                            "p-2 rounded-xl transition-all shadow-sm",
                            hasVoted ? "bg-primary text-white" : "text-slate-400 hover:text-emerald-500 hover:bg-white"
                        )}
                    >
                        <ChevronUp size={24} />
                    </button>
                    <span className="font-black text-slate-800 text-lg">{idea.upvotes?.length || 0}</span>
                </div>

                {/* Content Side */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest shrink-0">{idea.category}</span>
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest truncate"><Clock size={12} /> {new Date(idea.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{idea.title}</h4>
                    <p className="text-slate-500 font-medium leading-relaxed">{idea.description}</p>

                    <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 border-t border-slate-50 gap-4">
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold overflow-hidden border border-slate-200">
                                {idea.isAnonymous ? '👤' : (idea.userId?.profilePhoto ? <img src={idea.userId.profilePhoto} /> : idea.userId?.name?.charAt(0))}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{idea.isAnonymous ? 'Anonymous' : idea.userId?.name}</span>
                        </div>
                        <button
                            onClick={toggleComments}
                            className={cn(
                                "flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all px-4 py-2 rounded-full",
                                isExpanded ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            )}>
                            <MessageCircle size={16} /> Discussion {isExpanded ? 'active' : ''}
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-50/50 border-t border-slate-50"
                    >
                        <div className="p-8 space-y-6">
                            {loadingComments ? (
                                <div className="flex items-center justify-center py-4"><Loader2 className="animate-spin text-primary" /></div>
                            ) : (
                                <div className="space-y-6">
                                    {comments.map(c => (
                                        <div key={c._id} className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-bold border border-slate-100 overflow-hidden shrink-0">
                                                {c.userId?.profilePhoto ? <img src={c.userId.profilePhoto} /> : c.userId?.name?.charAt(0)}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-slate-900">{c.userId?.name}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 font-medium bg-white px-4 py-2 rounded-2xl rounded-tl-none shadow-sm border border-slate-100/50">{c.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {comments.length === 0 && <p className="text-center text-xs font-bold text-slate-400 py-4 italic">No comments yet. Start the conversation!</p>}
                                </div>
                            )}

                            <form onSubmit={handleAddComment} className="flex gap-2 pt-4">
                                <input
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-white border border-slate-100 rounded-xl px-6 py-3 text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                                />
                                <button
                                    type="submit"
                                    className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
