"use client";

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../layout';
import { useAuth } from '@/lib/auth';
import {
    Search,
    Send,
    Image as ImageIcon,
    Paperclip,
    MoreVertical,
    Phone,
    Video,
    Circle,
    Hash,
    Smile,
    ChevronLeft,
    MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import io from 'socket.io-client';

export default function ChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [selectedRoom, setSelectedRoom] = useState<any>(rooms[0]);
    const [showSidebar, setShowSidebar] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<any>(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('join_room', selectedRoom.id);

        socketRef.current.on('receive_message', (msg: any) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [selectedRoom]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const msg = {
            id: Date.now(),
            text: input,
            sender: user?.name,
            senderRole: user?.role,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };
        setMessages([...messages, msg]);
        socketRef.current.emit('send_message', { ...msg, room: selectedRoom.id });
        setInput('');
    };

    return (
        <DashboardLayout allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className="h-[calc(100vh-180px)] bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex relative">

                {/* Chat Sidebar */}
                <div className={cn(
                    "w-full md:w-80 border-r border-slate-100 flex flex-col transition-all duration-300 absolute md:relative z-20 bg-white h-full",
                    showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}>
                    <div className="p-6 border-b border-slate-50">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h2>
                        <div className="mt-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Channels</p>
                        {rooms.filter(r => r.type === 'channel').map(room => (
                            <button
                                key={room.id}
                                onClick={() => { setSelectedRoom(room); setShowSidebar(false); }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
                                    selectedRoom.id === room.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-slate-50 text-slate-600"
                                )}
                            >
                                <Hash size={18} />
                                <span className="font-bold text-sm">{room.name}</span>
                                {room.unread && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>}
                            </button>
                        ))}

                        <p className="px-4 py-2 mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct Messages</p>
                        {rooms.filter(r => r.type === 'dm').map(room => (
                            <button
                                key={room.id}
                                onClick={() => { setSelectedRoom(room); setShowSidebar(false); }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
                                    selectedRoom.id === room.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-slate-50 text-slate-600"
                                )}
                            >
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-xs uppercase">
                                        {room.name.charAt(0)}
                                    </div>
                                    {room.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>}
                                </div>
                                <div className="flex flex-col items-start overflow-hidden">
                                    <span className="font-bold text-sm truncate">{room.name}</span>
                                    <span className="text-[10px] opacity-70 truncate font-medium">{room.lastMsg}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <div className="p-4 md:p-6 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                                    {selectedRoom.type === 'channel' ? <Hash size={24} /> : <div className="font-black">{selectedRoom.name.charAt(0)}</div>}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 tracking-tight leading-none">{selectedRoom.name}</h4>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                                        <Circle size={8} fill="currentColor" /> Active Now
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 md:gap-3">
                            <button className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Phone size={20} /></button>
                            <button className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Video size={20} /></button>
                            <button className="p-2.5 text-slate-400 hover:shadow-sm rounded-xl transition-all"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <div className="w-20 h-20 bg-slate-100 rounded-[30px] flex items-center justify-center mb-4">
                                    <MessageSquare size={40} className="text-slate-400" />
                                </div>
                                <p className="text-sm font-bold">Start the conversation in #{selectedRoom.name}</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex flex-col max-w-[80%]", msg.isMe ? "ml-auto items-end" : "items-start")}>
                                <div className="flex items-center gap-2 mb-1.5 px-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.sender}</span>
                                    <span className="text-[10px] font-bold text-slate-300">{msg.time}</span>
                                </div>
                                <div className={cn(
                                    "px-5 py-3 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                                    msg.isMe ? "bg-primary text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white">
                        <div className="flex items-center gap-4 bg-slate-50 rounded-[24px] p-2 border border-slate-100 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <div className="flex items-center gap-1 px-2">
                                <button className="p-2 text-slate-400 hover:text-primary transition-all"><Smile size={20} /></button>
                                <button className="p-2 text-slate-400 hover:text-primary transition-all"><Paperclip size={20} /></button>
                                <button className="p-2 text-slate-400 hover:text-primary transition-all"><ImageIcon size={20} /></button>
                            </div>
                            <input
                                type="text"
                                placeholder="Type your message..."
                                className="flex-1 bg-transparent py-3 text-sm font-medium outline-none placeholder:text-slate-400"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const rooms = [
    { id: 1, name: 'General Announcements', type: 'channel', lastMsg: 'HR: Holiday list 2024 is out now!', online: true },
    { id: 2, name: 'Project Alpha', type: 'channel', lastMsg: 'Sarah: We have the meeting soon.', unread: true },
    { id: 3, name: 'Engineering Group', type: 'channel', lastMsg: 'Mike: Bug #42 fixed.' },
    { id: 4, name: 'Sarah Wilson', type: 'dm', lastMsg: 'Ready for the review!', online: true },
    { id: 5, name: 'Michael Chen', type: 'dm', lastMsg: 'Check the files.', online: false },
    { id: 6, name: 'Jessica Lee', type: 'dm', lastMsg: 'See you tomorrow!', online: true },
];
