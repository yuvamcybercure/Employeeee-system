"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import api from '@/lib/api';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { CallOverlay } from '@/components/chat/CallOverlay';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

export default function ChatPage() {
    const { user } = useAuth();
    const { isCollapsed } = useSidebar();
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedConv, setSelectedConv] = useState<any>(null);
    const [input, setInput] = useState('');
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUser, setTypingUser] = useState<any>(null);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupData, setNewGroupData] = useState({ name: '', members: [] as string[] });
    const [colleagues, setColleagues] = useState<any[]>([]);

    const [call, setCall] = useState<any>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenStreamRef = useRef<MediaStream | null>(null);

    const socketRef = useRef<any>(null);
    const typingTimeoutRef = useRef<any>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null); // Kept for 1-on-1 backward compat or fallback
    const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

    const selectedConvRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Sync state with local tracks
    useEffect(() => {
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getAudioTracks().forEach(track => { track.enabled = !isMuted; });
            stream.getVideoTracks().forEach(track => { track.enabled = !isVideoOff; });
        }
    }, [isMuted, isVideoOff]);

    const playSound = (path: string, loop: boolean = true) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        try {
            const audio = new Audio(path);
            audio.loop = loop;
            audio.play().catch(e => console.warn('Audio play failed', e));
            audioRef.current = audio;
        } catch (e) {
            console.warn('Audio init failed', e);
        }
    };

    const stopSound = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };

    // Sync ref with state
    useEffect(() => {
        selectedConvRef.current = selectedConv;
    }, [selectedConv]);

    // Initial load: Conversations & Socket Setup
    useEffect(() => {
        fetchConversations();
        fetchColleagues();

        const getSocketUrl = () => {
            if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
            if (typeof window !== 'undefined') {
                const hostname = window.location.hostname;
                if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
                    return `http://${hostname}:5000`;
                }
            }
            return 'http://localhost:5000';
        };

        socketRef.current = io(getSocketUrl());
        const socket = socketRef.current; // Define socket here for consistent use
        let presenceInterval: any;
        if (user) {
            // Emit user_online immediately on initial connection
            socket.emit('user_online', user._id);

            // Refresh conversation list to get up-to-date statuses occasionally
            presenceInterval = setInterval(() => {
                socket.emit('user_online', user._id);
            }, 30000);
        }

        socket.on('connect', () => {
            if (user) socket.emit('user_online', user._id);
        });

        // Initial Load

        socket.on('receive_message', (msg: any) => {
            console.log('Instant message received:', msg);

            // 1. Refresh conversation list to update the sidebar (last message, unread status)
            fetchConversations();

            const currentConv = selectedConvRef.current;

            // 2. If we are currently looking at THIS specific conversation, add message to view
            if (currentConv) {
                const isMatch = (msg.groupId && msg.groupId === currentConv.id) ||
                    (!msg.groupId && (msg.senderId === currentConv.id || msg.receiverId === currentConv.id));

                if (isMatch) {
                    setMessages(prev => {
                        if (prev.find(m => m._id === msg._id)) return prev;
                        return [...prev, msg];
                    });
                    // Also mark as read immediately if we are viewing it
                    handleMarkRead(currentConv.id, currentConv.type);
                }
            }
        });

        socket.on('update_online_status', (users: string[]) => {
            console.log('Online users updated:', users);
            setOnlineUsers(users);
        });

        socket.on('user_typing', (data: any) => {
            setTypingUser(data);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
        });

        socket.on('user_stop_typing', () => {
            setTypingUser(null);
        });

        socket.on('incoming_call', ({ signal, from, name, type, isGroup, roomId }: any) => {
            console.log('📥 Incoming Call Received:', { from, name, type });
            setCall({ isReceivingCall: true, from, name, signal, type, isGroup, roomId });
            playSound('/sounds/ringtone.mp3');
        });

        socket.on('call_accepted', async ({ signal, from }: any) => {
            console.log('✅ Call Accepted by:', from);
            setCallAccepted(true);
            stopSound();

            const stream = localVideoRef.current?.srcObject as MediaStream;
            if (!stream) return;

            // We need to be careful with 'call' state inside listeners.
            // Better to use functional updates or Refs if 'call' changes.
            // For now, let's keep it simple as the priority is messaging.
            const pc = createPeerConnection(from, stream, 'video', false);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('webrtc_signal', {
                to: from,
                signal: offer,
                from: user?._id
            });
        });

        socket.on('webrtc_signal', async ({ signal, from }: any) => {
            let pc = pcsRef.current.get(from);
            if (signal.type === 'offer') {
                const stream = localVideoRef.current?.srcObject as MediaStream;
                if (!stream) return;
                pc = createPeerConnection(from, stream, 'video', false);
                await pc.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_signal', { to: from, signal: answer, from: user?._id });
            } else if (signal.type === 'answer') {
                if (pc) await pc.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.candidate) {
                if (pc) await pc.addIceCandidate(new RTCIceCandidate(signal));
            }
        });

        socket.on('call_ended', () => {
            console.log('❌ Call Ended');
            stopSound();
            leaveCall();
        });

        return () => {
            if (presenceInterval) clearInterval(presenceInterval);
            stopSound();
            socket.disconnect();
        };
    }, [user]);

    // Handle Room Switching
    useEffect(() => {
        if (!socketRef.current || !selectedConv) return;

        const roomId = selectedConv.type === 'group'
            ? selectedConv.id
            : [user?._id, selectedConv.id].sort().join('-');

        socketRef.current.emit('join_room', roomId);
    }, [selectedConv?.id, user?._id]);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/messages/conversations');
            if (data.success) setConversations(data.conversations);
        } catch (err) {
            console.error('Failed to fetch conversations');
        }
    };

    const fetchMessages = async (conv: any) => {
        try {
            const endpoint = conv.type === 'group'
                ? `/messages/groups/${conv.id}`
                : `/messages/${conv.id}`;
            const { data } = await api.get(endpoint);
            if (data.success) setMessages(data.messages);
        } catch (err) {
            console.error('Failed to fetch messages');
        }
    };


    const handleSend = async (files?: any[]) => {
        if (!input.trim() && (!files || files.length === 0)) return;

        try {
            let messageData;

            if (files && files.length > 0) {
                const formData = new FormData();
                formData.append('content', input);
                formData.append('receiverId', selectedConv.type === 'dm' ? selectedConv.id : '');
                formData.append('groupId', selectedConv.type === 'group' ? selectedConv.id : '');
                formData.append('type', files[0].type === 'image' ? 'image' : 'file');

                files.forEach(f => {
                    formData.append('attachments', f.file);
                });

                const { data } = await api.post('/messages', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                messageData = data.message;
            } else {
                const payload = {
                    content: input,
                    receiverId: selectedConv.type === 'dm' ? selectedConv.id : null,
                    groupId: selectedConv.type === 'group' ? selectedConv.id : null,
                    type: 'text'
                };
                const { data } = await api.post('/messages', payload);
                messageData = data.message;
            }

            if (messageData) {
                const roomId = selectedConv.type === 'group'
                    ? selectedConv.id
                    : [user?._id, selectedConv.id].sort().join('-');

                // Add to local state immediately for instant feedback
                setMessages(prev => [...prev, messageData]);

                socketRef.current.emit('send_message', {
                    ...messageData,
                    senderName: user?.name,
                    room: roomId
                });
                setInput('');
                socketRef.current.emit('stop_typing', { roomId, userId: user?._id });
            }
        } catch (err) {
            console.error('Failed to send message');
        }
    };

    const handleInputChange = (val: string) => {
        setInput(val);
        if (!selectedConv || !socketRef.current) return;

        const roomId = selectedConv.type === 'group'
            ? selectedConv.id
            : [user?._id, selectedConv.id].sort().join('-');

        if (val.length > 0) {
            // Throttled typing emit
            if (!typingTimeoutRef.current) {
                socketRef.current.emit('typing', { roomId, userId: user?._id, userName: user?.name });
            }
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current.emit('stop_typing', { roomId, userId: user?._id });
                typingTimeoutRef.current = null;
            }, 3000);
        } else {
            socketRef.current.emit('stop_typing', { roomId, userId: user?._id });
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        }
    };

    const fetchColleagues = async () => {
        try {
            const { data } = await api.get('/messages/conversations'); // Re-using to get users
            if (data.success) {
                const users = data.conversations.filter((c: any) => c.type === 'dm');
                setColleagues(users);
            }
        } catch (err) { }
    };

    const handleMarkRead = async (id: string, type: 'dm' | 'group') => {
        try {
            const payload = type === 'group' ? { groupId: id } : { senderId: id };
            await api.patch('/messages/mark-read', payload);

            const roomId = type === 'group' ? id : [user?._id, id].sort().join('-');
            socketRef.current.emit('message_read', { roomId, userId: user?._id });

            setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
        } catch (err) { }
    };

    const handleDelete = async (messageId: string, mode: 'me' | 'everyone') => {
        try {
            await api.delete(`/messages/${messageId}?mode=${mode}`);
            const roomId = selectedConv.type === 'group'
                ? selectedConv.id
                : [user?._id, selectedConv.id].sort().join('-');

            socketRef.current.emit('delete_message', { roomId, messageId, mode });

            if (mode === 'everyone') {
                setMessages(prev => prev.map(m => m._id === messageId ? { ...m, content: 'This message was deleted', isDeletedForEveryone: true } : m));
            } else {
                setMessages(prev => prev.filter(m => m._id !== messageId));
            }
        } catch (err) { }
    };

    const handleCreateGroup = async () => {
        if (!newGroupData.name || newGroupData.members.length === 0) return;
        try {
            const { data } = await api.post('/messages/groups', newGroupData);
            if (data.success) {
                setShowCreateGroup(false);
                fetchConversations();
                setNewGroupData({ name: '', members: [] });
            }
        } catch (err) { }
    };

    useEffect(() => {
        if (!socketRef.current) return;
        const socket = socketRef.current;

        socket.on('message_deleted', ({ messageId, mode }: any) => {
            setMessages(prev => {
                if (mode === 'everyone') {
                    return prev.map(m => m._id === messageId ? { ...m, content: 'This message was deleted', isDeletedForEveryone: true } : m);
                } else {
                    return prev.filter(m => m._id !== messageId);
                }
            });
        });

        socket.on('messages_marked_read', ({ userId }: any) => {
            setMessages(prev => prev.map(m => m.senderId === userId ? { ...m, readBy: [...(m.readBy || []), { userId }] } : m));
        });

        return () => {
            socket.off('message_deleted');
            socket.off('messages_marked_read');
        };
    }, []);

    const handleSelectConversation = (conv: any) => {
        setSelectedConv(conv);
        setMessages([]);
        fetchMessages(conv);
        handleMarkRead(conv.id, conv.type);
    };

    const createPeerConnection = (peerId: string, stream: MediaStream, type: 'audio' | 'video', isGroup: boolean, roomId?: string) => {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        pcsRef.current.set(peerId, pc);

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('webrtc_signal', {
                    to: peerId,
                    signal: event.candidate,
                    isGroup,
                    roomId,
                    from: user?._id
                });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStreams(prev => {
                const next = new Map(prev);
                next.set(peerId, event.streams[0]);
                return next;
            });
        };

        return pc;
    };

    const checkMediaSupport = () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert(
                "❌ Media Access Blocked\n\n" +
                "Browsers require HTTPS or 'localhost' for Camera/Mic access.\n\n" +
                "Workaround for Chrome:\n" +
                "1. Go to chrome://flags/#unsafely-treat-insecure-origin-as-secure\n" +
                "2. Add your IP address\n" +
                "3. Relaunch Chrome"
            );
            return false;
        }
        return true;
    };

    const startCall = async (type: 'audio' | 'video') => {
        if (!checkMediaSupport()) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const isGroup = selectedConv.type === 'group';
            const roomId = isGroup ? selectedConv.id : [user?._id, selectedConv.id].sort().join('-');

            socketRef.current.emit('call_user', {
                userToCall: selectedConv.id,
                signalData: null, // Peer discovery first
                from: user?._id,
                name: user?.name,
                type,
                isGroup,
                roomId
            });

            // Start ringback tone
            playSound('/sounds/ringback.mp3', true);

            setCall({ isReceivingCall: false, from: selectedConv.id, name: selectedConv.name, type, isGroup, roomId });
        } catch (err) {
            console.error('Failed to start call', err);
            stopSound(); // Stop sound if call fails to start
        }
    };

    const answerCall = async () => {
        if (!checkMediaSupport()) return;

        try {
            setCallAccepted(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: call.type === 'video', audio: true });
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            // In mesh, when answering, we signal everyone that we are ready
            socketRef.current.emit('accept_call', {
                to: call.from,
                isGroup: call.isGroup,
                roomId: call.roomId,
                from: user?._id
            });
        } catch (err) {
            console.error('Failed to answer call', err);
        }
    };

    const stopScreenShare = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }
        setIsScreenSharing(false);

        // Switch back to camera track
        if (localVideoRef.current?.srcObject) {
            const cameraTrack = (localVideoRef.current.srcObject as MediaStream).getVideoTracks()[0];
            if (cameraTrack) {
                pcsRef.current.forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(cameraTrack);
                });
            }
        }
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = stream;
                setIsScreenSharing(true);

                const screenTrack = stream.getVideoTracks()[0];

                // Replace video track in all active peer connections
                pcsRef.current.forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);
                });

                // Revert when user stops sharing via browser UI
                screenTrack.onended = () => {
                    stopScreenShare();
                };

            } catch (err) {
                console.error('Failed to start screen share', err);
            }
        } else {
            stopScreenShare();
        }
    };

    const leaveCall = () => {
        socketRef.current.emit('end_call', {
            to: call?.from || selectedConv?.id,
            isGroup: call?.isGroup,
            roomId: call?.roomId
        });

        if (isScreenSharing) stopScreenShare();

        setCallAccepted(false);
        setCall(null);
        stopSound();
        setRemoteStreams(new Map());

        pcsRef.current.forEach(pc => pc.close());
        pcsRef.current.clear();

        if (localVideoRef.current?.srcObject) {
            (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }
    };

    return (
        <ProtectedRoute allowedRoles={['employee', 'admin', 'superadmin']}>
            <div className={cn(
                "fixed inset-0 top-[60px] md:top-[70px] bg-white flex overflow-hidden transition-all duration-500 z-30",
                isCollapsed ? "md:left-20" : "md:left-64"
            )}>
                <ChatSidebar
                    conversations={conversations}
                    selectedId={selectedConv?.id}
                    onSelect={handleSelectConversation}
                    onCreateGroup={() => setShowCreateGroup(true)}
                    onlineUsers={onlineUsers}
                    isHidden={!!selectedConv}
                />

                <ChatWindow
                    conversation={selectedConv}
                    messages={messages}
                    user={user}
                    input={input}
                    setInput={handleInputChange}
                    onSend={handleSend}
                    onDelete={handleDelete}
                    onMarkRead={handleMarkRead}
                    onStartCall={startCall}
                    onBack={() => setSelectedConv(null)}
                    typingUser={typingUser}
                    onlineUsers={onlineUsers}
                />
            </div>

            <CallOverlay
                call={call}
                callAccepted={callAccepted}
                onAnswer={answerCall}
                onEnd={leaveCall}
                localVideoRef={localVideoRef}
                remoteStreams={remoteStreams}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isVideoOff={isVideoOff}
                setIsVideoOff={setIsVideoOff}
                isScreenSharing={isScreenSharing}
                onToggleScreenShare={toggleScreenShare}
            />

            {/* Create Group Modal */}
            <AnimatePresence>
                {showCreateGroup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-2xl font-[1000] text-slate-800 tracking-tight">New Group</h3>
                                <button onClick={() => setShowCreateGroup(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Group Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                                        placeholder="Enter group name..."
                                        value={newGroupData.name}
                                        onChange={e => setNewGroupData({ ...newGroupData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select Members</label>
                                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-none">
                                        {colleagues.map(col => (
                                            <label key={col.id} className={cn(
                                                "flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all border-2",
                                                newGroupData.members.includes(col.id)
                                                    ? "bg-primary/5 border-primary/20"
                                                    : "bg-white border-slate-50 hover:bg-slate-50 hover:border-slate-100"
                                            )}>
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-400 overflow-hidden">
                                                    {col.profilePhoto ? <img src={col.profilePhoto} className="w-full h-full object-cover" /> : col.name[0]}
                                                </div>
                                                <span className="flex-1 font-bold text-slate-700 text-sm">{col.name}</span>
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                                    checked={newGroupData.members.indexOf(col.id) !== -1}
                                                    onChange={e => {
                                                        const members = [...newGroupData.members];
                                                        if (e.target.checked) members.push(col.id);
                                                        else members.splice(members.indexOf(col.id), 1);
                                                        setNewGroupData({ ...newGroupData, members });
                                                    }}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleCreateGroup}
                                    disabled={!newGroupData.name || newGroupData.members.length === 0}
                                    className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    Create Group
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ProtectedRoute>
    );
}
