"use client";

import React from 'react';
import { Search, Plus, Hash, Circle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ChatSidebarProps {
    conversations: any[];
    selectedId: string | null;
    onSelect: (conv: any) => void;
    onCreateGroup: () => void;
    onlineUsers: string[];
    isHidden?: boolean;
}

export function ChatSidebar({ conversations, selectedId, onSelect, onCreateGroup, onlineUsers, isHidden }: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredConversations = React.useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        try {
            const regex = new RegExp(searchQuery, 'i');
            return conversations.filter(conv => regex.test(conv.name) || (conv.lastMessage && regex.test(conv.lastMessage)));
        } catch (e) {
            // Fallback to simple includes if regex is invalid
            return conversations.filter(conv =>
                conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
    }, [conversations, searchQuery]);

    return (
        <div className={cn(
            "w-full md:w-[400px] border-r border-slate-100 flex flex-col bg-white h-full relative z-20 transition-all duration-300",
            isHidden ? "hidden md:flex" : "flex"
        )}>
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-[1000] text-slate-900 tracking-tight">Chats</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={onCreateGroup}
                            className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 border border-primary/10 group"
                            title="Create New Group"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all">
                            <Search size={18} />
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                        type="text"
                        placeholder="Search chats"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-600 placeholder:text-slate-300 shadow-sm"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 font-bold opacity-50">
                        <MessageSquare size={48} className="mb-4 text-slate-200" />
                        <p>{searchQuery ? 'No matches found' : 'No active chats'}</p>
                    </div>
                ) : (
                    filteredConversations.map((conv) => {
                        const isSelected = selectedId === conv.id;
                        const isOnline = conv.type === 'dm' && onlineUsers.includes(conv.id);

                        return (
                            <motion.button
                                key={conv.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => onSelect(conv)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-4 rounded-[2rem] transition-all duration-300 text-left relative overflow-hidden group",
                                    isSelected
                                        ? "bg-primary text-white shadow-xl shadow-primary/20"
                                        : "hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-100"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black uppercase shadow-sm transition-transform duration-500 overflow-hidden",
                                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                                    )}>
                                        {conv.profilePhoto ? (
                                            <img src={conv.profilePhoto} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            conv.type === 'group' ? <Hash size={24} /> : conv.name.charAt(0)
                                        )}
                                    </div>
                                    {isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-lg z-10 animate-pulse" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-[1000] text-sm truncate tracking-tight">{conv.name}</span>
                                        {conv.lastTime && (
                                            <span className={cn(
                                                "text-[10px] font-bold shrink-0",
                                                isSelected ? "text-white/60" : "text-slate-300"
                                            )}>
                                                {new Date(conv.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={cn(
                                            "text-xs font-bold truncate pr-4 opacity-70 break-all",
                                            isSelected ? "text-white" : "text-slate-400"
                                        )}>
                                            {conv.lastMessage || 'Click to start chat'}
                                        </p>
                                        {conv.unread > 0 && (
                                            <span className="bg-emerald-500 text-white min-w-[20px] h-5 px-1.5 rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg shadow-emerald-500/20">
                                                {conv.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
