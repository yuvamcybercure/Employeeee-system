"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout';
import {
    Lightbulb,
    MessageCircle,
    ThumbsUp,
    Plus,
    Search,
    Filter,
    User,
    Clock,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function SuggestionsPage() {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleVote = async (id: string, type: 'up' | 'down') => {
        // Backend logic for voting
        console.log(`Voting ${type} on ${id}`);
    };

    return (
        <DashboardLayout allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="max-w-6xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-yellow-400/10 rounded-[24px] flex items-center justify-center text-yellow-500 shadow-inner">
                            <Lightbulb size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Idea Hub</h1>
                            <p className="text-slate-500 font-medium">Shape the future of TaskEase with your suggestions.</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
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
                    <div className="flex gap-2">
                        <button className="px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                            <Filter size={18} /> Most Voted
                        </button>
                    </div>
                </div>

                {/* Suggestion List */}
                <div className="space-y-6">
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white rounded-[32px] animate-pulse border border-slate-100"></div>)
                    ) : suggestions.length > 0 ? (
                        suggestions.map(idea => <SuggestionCard key={idea._id} idea={idea} onVote={handleVote} />)
                    ) : (
                        mockIdeas.map(idea => <SuggestionCard key={idea.id} idea={idea} onVote={handleVote} />)
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function SuggestionCard({ idea, onVote }: any) {
    return (
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-8 group">
            {/* Voting Side */}
            <div className="flex flex-col items-center gap-2 bg-slate-50/50 p-2 rounded-2xl self-start">
                <button
                    onClick={() => onVote(idea.id, 'up')}
                    className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-white rounded-xl transition-all shadow-sm"
                >
                    <ChevronUp size={24} />
                </button>
                <span className="font-black text-slate-800 text-lg">{idea.votes || 12}</span>
                <button
                    onClick={() => onVote(idea.id, 'down')}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm"
                >
                    <ChevronDown size={24} />
                </button>
            </div>

            {/* Content Side */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{idea.category || 'Feature'}</span>
                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><Clock size={14} /> 2 days ago</span>
                    </div>
                    <button className="p-2 text-slate-300 hover:bg-slate-50 rounded-xl"><Plus size={18} /></button>
                </div>

                <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{idea.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{idea.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                            {idea.author?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{idea.author || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 font-bold text-xs ring-4 ring-slate-50 rounded-full px-4 py-1.5">
                        <span className="flex items-center gap-1.5"><MessageCircle size={16} /> 4 Comments</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mockIdeas = [
    { id: 1, title: 'Dark Mode for Dashboard', description: 'Working late hours is tough on the eyes. A native dark mode toggle would be amazing.', votes: 42, author: 'Alex Reed', category: 'UI/UX' },
    { id: 2, title: 'Slack Notification Integration', description: 'Receive leave approval and chat notifications directly in Slack.', votes: 28, author: 'Sarah W.', category: 'Integration' },
    { id: 3, title: 'Coffee Machine Budget', description: 'Proposal to upgrade the pantry coffee machine to an automatic espresso maker.', votes: 84, author: 'Team Support', category: 'General' },
];
