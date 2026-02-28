"use client";

import React, { useRef, useEffect } from 'react';
import {
    Phone,
    Video,
    MoreVertical,
    MessageSquare,
    Circle,
    Hash,
    Send,
    Smile,
    Paperclip,
    Image as ImageIcon,
    Check,
    CheckCheck,
    Trash2,
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
    conversation: any;
    messages: any[];
    user: any;
    input: string;
    setInput: (val: string) => void;
    onSend: (files?: any[]) => void;
    onDelete: (messageId: string, mode: 'me' | 'everyone') => void;
    onMarkRead: (convId: string, type: 'dm' | 'group') => void;
    onStartCall: (type: 'audio' | 'video') => void;
    onBack?: () => void;
    typingUser: any;
    onlineUsers: string[];
}

export function ChatWindow({
    conversation,
    messages,
    user,
    input,
    setInput,
    onSend,
    onDelete,
    onMarkRead,
    onStartCall,
    onBack,
    typingUser,
    onlineUsers
}: ChatWindowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = React.useState<{ id: string, x: number, y: number } | null>(null);
    const [showEmojis, setShowEmojis] = React.useState(false);
    const [attachments, setAttachments] = React.useState<any[]>([]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUser]);

    useEffect(() => {
        if (conversation) {
            onMarkRead(conversation.id, conversation.type);
        }
    }, [conversation?.id, messages.length]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newAttachments = Array.from(files).map(file => ({
            file,
            name: file.name,
            type: file.type.startsWith('image/') ? 'image' : 'file',
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        }));

        setAttachments(prev => [...prev, ...newAttachments]);
    };

    const emojis = ['😀', '😂', '😍', '👍', '🔥', '🙌', '🎉', '💡', '🚀', '⭐', '❤️', '😊', '🤔', '😎', '👏', '✅'];

    const handleEmojiSelect = (emoji: string) => {
        setInput(input + emoji);
        setShowEmojis(false);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    if (!conversation) {
        return (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50/30 p-8 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 bg-white rounded-[40px] shadow-2xl shadow-slate-200 flex items-center justify-center mb-8 border border-slate-100"
                >
                    <MessageSquare size={56} className="text-primary/20" />
                </motion.div>
                <h3 className="text-2xl font-[1000] text-slate-800 tracking-tight mb-2">Your Workspace Chat</h3>
                <p className="text-slate-400 font-bold max-w-xs leading-relaxed">Select a teammate or channel to start collaborating in real-time.</p>
            </div>
        );
    }

    const isOnline = conversation.type === 'dm' && onlineUsers.includes(conversation.id);

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-white relative z-30 h-full overflow-hidden">
            {/* Window Header */}
            <div className="p-3 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-xl z-10 sticky top-0 min-h-[70px] md:min-h-[88px]">
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                    {/* Back button for mobile */}
                    <button
                        onClick={onBack}
                        className="md:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-xl active:scale-95 transition-all shrink-0"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-secondary/30 flex items-center justify-center text-primary relative shadow-sm overflow-hidden shrink-0">
                        {conversation.profilePhoto ? (
                            <img src={conversation.profilePhoto} className="w-full h-full object-cover" alt="" />
                        ) : (
                            conversation.type === 'group' ? <Hash size={24} /> : <span className="font-black text-lg">{conversation.name.charAt(0)}</span>
                        )}
                        {isOnline && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-[1000] text-slate-900 tracking-tight leading-none text-sm md:text-lg truncate">{conversation.name}</h4>
                        <div className="flex items-center gap-2 mt-1 md:mt-2">
                            {isOnline ? (
                                <p className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                    <Circle size={6} fill="currentColor" className="animate-pulse" /> Online
                                </p>
                            ) : (
                                <p className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                    Offline
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 md:gap-4 shrink-0">
                    <button
                        onClick={() => onStartCall('audio')}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl md:rounded-2xl transition-all border border-transparent"
                    >
                        <Phone size={18} />
                    </button>
                    <button
                        onClick={() => onStartCall('video')}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl md:rounded-2xl transition-all border border-transparent"
                    >
                        <Video size={18} />
                    </button>
                    <button className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 items-center justify-center text-slate-400 hover:bg-slate-50 rounded-xl md:rounded-2xl transition-all"><MoreVertical size={18} /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-slate-50/20 scrollbar-none">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?._id;
                        return (
                            <motion.div
                                key={msg._id || idx}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn("flex flex-col max-w-[85%] sm:max-w-[70%]", isMe ? "ml-auto items-end" : "items-start")}
                            >
                                {!isMe && conversation.type === 'group' && (
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">{msg.senderName}</span>
                                )}
                                <div
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        setContextMenu({ id: msg._id, x: e.pageX, y: e.pageY });
                                    }}
                                    className={cn(
                                        "relative px-4 py-3 md:px-6 md:py-4 rounded-[2rem] text-sm font-bold leading-relaxed shadow-xl transition-all hover:scale-[1.02] cursor-pointer break-all whitespace-pre-wrap overflow-hidden",
                                        isMe
                                            ? "bg-primary text-white rounded-tr-none shadow-primary/20"
                                            : "bg-emerald-50/80 text-slate-700 rounded-tl-none border border-emerald-100/50 shadow-slate-200/50"
                                    )}
                                >
                                    {msg.type === 'image' && msg.attachments?.[0]?.url && (
                                        <img
                                            src={msg.attachments[0].url}
                                            className="rounded-2xl mb-2 max-w-full h-auto"
                                            onClick={() => window.open(msg.attachments[0].url)}
                                            alt="Attachment"
                                        />
                                    )}
                                    {msg.type === 'file' && msg.attachments?.[0]?.url && (
                                        <a
                                            href={msg.attachments[0].url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-black/5 rounded-2xl mb-2 hover:bg-black/10 transition-all text-current no-underline"
                                        >
                                            <Paperclip size={18} />
                                            <span className="truncate">{msg.attachments[0].name || 'Download File'}</span>
                                        </a>
                                    )}
                                    {msg.content}
                                    <div className={cn(
                                        "flex items-center gap-1.5 mt-2 justify-end",
                                        isMe ? "text-white/50" : "text-slate-400"
                                    )}>
                                        <span className="text-[9px] font-black">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {isMe && (
                                            msg.readBy?.length > 0 ? (
                                                <div className="flex -space-x-1">
                                                    <CheckCheck size={12} className="text-sky-300" />
                                                </div>
                                            ) : (
                                                <Check size={12} />
                                            )
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Context Menu */}
                {contextMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
                        <div
                            className="fixed z-50 bg-white border border-slate-100 shadow-2xl rounded-2xl py-2 min-w-[180px] overflow-hidden"
                            style={{ left: contextMenu.x, top: contextMenu.y }}
                        >
                            <button
                                onClick={() => { onDelete(contextMenu.id, 'me'); setContextMenu(null); }}
                                className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-600 font-bold text-xs"
                            >
                                <Trash2 size={14} /> Delete for me
                            </button>
                            {messages.find(m => m._id === contextMenu.id)?.senderId === user?._id && (
                                <button
                                    onClick={() => { onDelete(contextMenu.id, 'everyone'); setContextMenu(null); }}
                                    className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-red-500 font-bold text-xs"
                                >
                                    <Trash2 size={14} /> Delete for everyone
                                </button>
                            )}
                        </div>
                    </>
                )}

                {typingUser && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="flex items-center gap-3 text-slate-400 font-bold text-xs bg-white/80 py-3 px-5 rounded-[2rem] w-fit border border-emerald-100 shadow-md mb-4 ml-2 backdrop-blur-md"
                    >
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    animate={{
                                        y: ["0%", "-50%", "0%"]
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.1
                                    }}
                                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                                />
                            ))}
                        </div>
                        <span className="tracking-tight">{typingUser.userName} is typing</span>
                    </motion.div>
                )}
                <div ref={scrollRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-8 bg-white/80 backdrop-blur-xl border-t border-slate-100 relative max-w-full overflow-hidden">
                {/* Emoji Picker */}
                <AnimatePresence>
                    {showEmojis && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-4 md:left-8 mb-4 bg-white p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-slate-100 flex flex-wrap gap-1 md:gap-2 w-[280px] md:w-64 z-50"
                        >
                            {emojis.map(e => (
                                <button key={e} onClick={() => handleEmojiSelect(e)} className="text-xl md:text-2xl hover:bg-slate-50 p-1.5 md:p-2 rounded-xl transition-all active:scale-90">{e}</button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Attachments Preview */}
                <AnimatePresence>
                    {attachments.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 mb-4 overflow-x-auto pb-2 scrollbar-none"
                        >
                            {attachments.map((at, i) => (
                                <div key={i} className="relative group shrink-0">
                                    {at.type === 'image' ? (
                                        <img src={at.preview} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-primary/20 shadow-md" />
                                    ) : (
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-100 flex flex-col items-center justify-center p-2 border-2 border-slate-200">
                                            <Paperclip size={20} className="text-slate-400 mb-1" />
                                            <span className="text-[7px] md:text-[8px] font-black text-slate-500 truncate w-full text-center">{at.name}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeAttachment(i)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transform translate-x-0 translate-y-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-hover:scale-100 transition-all active:scale-90"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-4xl mx-auto flex items-end gap-1.5 md:gap-2 px-1 md:px-0">
                    <div className="flex-1 flex items-end gap-1 md:gap-2 bg-white rounded-[1.5rem] md:rounded-[2rem] p-1.5 md:p-2 border border-slate-100 shadow-sm focus-within:ring-4 focus-within:ring-primary/5 transition-all min-w-0">
                        <div className="flex items-center h-10 md:h-12 shrink-0">
                            <button
                                onClick={() => setShowEmojis(!showEmojis)}
                                className={cn(
                                    "w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all active:scale-90 rounded-full",
                                    showEmojis ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-primary"
                                )}
                            >
                                <Smile size={20} />
                            </button>
                        </div>

                        <textarea
                            placeholder="Message"
                            className="flex-1 bg-transparent py-2.5 md:py-3 text-[15px] md:text-sm font-medium outline-none placeholder:text-slate-300 text-slate-700 resize-none max-h-32 overflow-y-auto scrollbar-none break-all"
                            rows={1}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onSend(attachments);
                                    setAttachments([]);
                                    (e.target as HTMLTextAreaElement).style.height = 'auto';
                                }
                            }}
                        />

                        <div className="flex items-center gap-0.5 md:gap-1 h-10 md:h-12 shrink-0">
                            <button
                                onClick={() => (document.getElementById('file-upload') as HTMLInputElement)?.click()}
                                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90 rounded-full"
                            >
                                <Paperclip size={18} />
                            </button>
                            <button
                                onClick={() => (document.getElementById('image-upload') as HTMLInputElement)?.click()}
                                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90 rounded-full"
                            >
                                <ImageIcon size={18} />
                            </button>
                        </div>
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} multiple />
                        <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} multiple />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            onSend(attachments);
                            setAttachments([]);
                            const textarea = document.querySelector('textarea');
                            if (textarea) textarea.style.height = 'auto';
                        }}
                        disabled={!input.trim() && attachments.length === 0}
                        className="w-11 h-11 md:w-14 md:h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:grayscale mb-0.5 md:mb-1 shrink-0"
                    >
                        <Send size={20} className="md:size-6 md:ml-1" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
