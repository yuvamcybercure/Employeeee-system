"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallOverlayProps {
    call: {
        isReceivingCall: boolean;
        from: string;
        name: string;
        signal: any;
        type: 'audio' | 'video';
    } | null;
    callAccepted: boolean;
    onAnswer: () => void;
    onEnd: () => void;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    remoteStreams: Map<string, MediaStream>;
    isMuted: boolean;
    setIsMuted: (val: boolean) => void;
    isVideoOff: boolean;
    setIsVideoOff: (val: boolean) => void;
}

const RemoteVideo = ({ stream, name }: { stream: MediaStream, name: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
    }, [stream]);

    return (
        <div className="relative w-full h-full bg-slate-800 rounded-3xl overflow-hidden border-2 border-white/10 group">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">{name || 'Participant'}</span>
            </div>
        </div>
    );
};

export function CallOverlay({
    call,
    callAccepted,
    onAnswer,
    onEnd,
    localVideoRef,
    remoteStreams,
    isMuted,
    setIsMuted,
    isVideoOff,
    setIsVideoOff
}: CallOverlayProps) {
    const [isMaximized, setIsMaximized] = useState(false);

    if (!call && !callAccepted) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={cn(
                    "fixed z-[200] transition-all duration-500 ease-in-out",
                    isMaximized
                        ? "inset-0 flex flex-col bg-slate-950"
                        : "bottom-4 right-4 md:bottom-8 md:right-8 w-[calc(100%-32px)] md:w-96 h-[400px] md:h-[500px] bg-slate-900 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden"
                )}
            >
                {/* Background / Video Area */}
                <div className="flex-1 relative flex items-center justify-center p-6">
                    {call?.type === 'video' ? (
                        <div className={cn(
                            "w-full h-full grid gap-4",
                            remoteStreams.size <= 1 ? "grid-cols-1" :
                                remoteStreams.size <= 2 ? "grid-cols-2" :
                                    "grid-cols-2 grid-rows-2"
                        )}>
                            {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
                                <RemoteVideo key={peerId} stream={stream} name="" />
                            ))}
                            {remoteStreams.size === 0 && !callAccepted && (
                                <div className="col-span-full flex flex-col items-center gap-4 text-white">
                                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 animate-pulse">
                                        <Video size={40} className="text-primary" />
                                    </div>
                                    <p className="font-bold tracking-tight">Inititating signal mesh...</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30 animate-pulse">
                                <span className="text-4xl font-black text-white uppercase">{call?.name.charAt(0)}</span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-white tracking-tight">{call?.name}</h3>
                                <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">
                                    {callAccepted ? "Call in progress" : "Connecting mesh..."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Local Video Thumbnail */}
                    {call?.type === 'video' && (
                        <motion.div
                            drag
                            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                            className={cn(
                                "absolute w-32 h-44 bg-slate-800 rounded-3xl border-2 border-white/20 overflow-hidden shadow-2xl z-50",
                                isMaximized ? "bottom-32 right-12" : "top-8 right-8"
                            )}
                        >
                            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded-lg">
                                <span className="text-[8px] font-black text-white uppercase">You</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Controls Overlay */}
                <div className={cn(
                    "p-8",
                    isMaximized ? "bg-slate-900/80 backdrop-blur-xl" : "bg-gradient-to-t from-black/80 to-transparent"
                )}>
                    <div className="flex items-center justify-center gap-4">
                        {!callAccepted && call?.isReceivingCall ? (
                            <>
                                <button
                                    onClick={onAnswer}
                                    className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-all active:scale-95"
                                >
                                    <Phone size={28} />
                                </button>
                                <button
                                    onClick={onEnd}
                                    className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all active:scale-95"
                                >
                                    <PhoneOff size={28} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
                                        isMuted ? "bg-red-500/20 border-red-500/30 text-red-500" : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    )}
                                >
                                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                                {call?.type === 'video' && (
                                    <button
                                        onClick={() => setIsVideoOff(!isVideoOff)}
                                        className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
                                            isVideoOff ? "bg-red-500/20 border-red-500/30 text-red-500" : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                                        )}
                                    >
                                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                                    </button>
                                )}
                                <button
                                    onClick={onEnd}
                                    className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-600 transition-all hover:rotate-[135deg]"
                                >
                                    <PhoneOff size={28} />
                                </button>
                                <button
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    className="w-12 h-12 bg-white/10 border border-white/20 text-white rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all"
                                >
                                    {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
