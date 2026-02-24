"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Camera, MapPin, Loader2, CheckCircle2, AlertTriangle, X, Zap, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface AttendanceModalProps {
    onClose: () => void;
    onSuccess: (attendance: any) => void;
    type: 'in' | 'out';
}

export function AttendanceModal({ onClose, onSuccess, type }: AttendanceModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
    const [metadata, setMetadata] = useState({ ip: '...', device: '...', time: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [geoLoading, setGeoLoading] = useState(true);
    const [isCapturing, setIsCapturing] = useState(false);

    useEffect(() => {
        startCamera();
        getLocation();
        fetchPublicIp();
        const interval = setInterval(() => {
            setMetadata(prev => ({ ...prev, time: new Date().toLocaleTimeString() }));
        }, 1000);

        setMetadata(prev => ({
            ...prev,
            device: navigator.platform + ' - ' + (navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'),
            time: new Date().toLocaleTimeString()
        }));

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            clearInterval(interval);
        };
    }, []);

    const fetchPublicIp = async () => {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            setMetadata(prev => ({ ...prev, ip: data.ip }));
        } catch (err) {
            setMetadata(prev => ({ ...prev, ip: 'Unavailable' }));
        }
    };

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            return data.display_name || 'Address Not Found';
        } catch (err) {
            return 'Address Error';
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' }
            });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) {
            setError('Could not access camera. Please check permissions.');
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setGeoLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const addr = await reverseGeocode(latitude, longitude);
                setLocation({ lat: latitude, lng: longitude, address: addr });
                setGeoLoading(false);
            },
            (err) => {
                setError('Could not fetch location. Please enable GPS.');
                setGeoLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            setIsCapturing(true);
            setTimeout(() => {
                const video = videoRef.current!;
                const canvas = canvasRef.current!;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setPhoto(dataUrl);
                setIsCapturing(false);
            }, 100);
        }
    };

    const handleSubmit = async () => {
        if (!photo || !location) return;
        setLoading(true);
        try {
            const endpoint = type === 'in' ? '/attendance/clock-in' : '/attendance/clock-out';
            const { data } = await api.post(endpoint, {
                photo,
                lat: location.lat,
                lng: location.lng,
                address: location.address,
                device: metadata.device,
                faceDetected: true
            });
            if (data.success) {
                onSuccess(data.attendance);
                onClose();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/80">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 italic">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Camera className="text-primary" size={20} />
                            </div>
                            {type === 'in' ? 'Check-In Protocol' : 'Check-Out Protocol'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Visual Verification */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className={cn(
                                "relative aspect-video bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-300 ring-1 ring-white/10",
                                isCapturing && "scale-[0.99] brightness-125"
                            )}>
                                {!photo ? (
                                    <>
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                                        <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white">
                                            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{metadata.time}</span>
                                        </div>
                                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                                            <button
                                                onClick={capturePhoto}
                                                className="group relative flex items-center justify-center"
                                            >
                                                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full border-2 border-white/50 transition-all group-hover:scale-110 group-active:scale-90" />
                                                <div className="absolute w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl group-active:bg-primary transition-all">
                                                    <Camera size={24} className="text-slate-950 group-active:text-white" />
                                                </div>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <img src={photo} alt="Capture" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                                        <button
                                            onClick={() => setPhoto(null)}
                                            className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all flex items-center gap-2 group shadow-2xl"
                                        >
                                            <X size={16} className="group-hover:rotate-90 transition-transform" />
                                            Discard & Retake
                                        </button>
                                    </>
                                )}
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                        </div>

                        {/* Right Column: Intelligence & Actions */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="space-y-4">
                                <div className={cn(
                                    "p-6 rounded-[2rem] border transition-all duration-500",
                                    location?.address ? "bg-blue-50/50 border-blue-100 shadow-inner" : "bg-slate-50 border-slate-100"
                                )}>
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-blue-500/10 rounded-xl">
                                            <MapPin className="text-blue-500" size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Geolocation Uplink</p>
                                            <p className="text-xs font-bold text-slate-700 leading-relaxed mb-2">
                                                {geoLoading ? "Synchronizing satellite payload..." : location?.address || "Calibrating..."}
                                            </p>
                                            <div className="inline-flex items-center gap-2 px-2 py-1 bg-white border border-slate-100 rounded-lg">
                                                <code className="text-[9px] font-black text-slate-400 tabular-nums">
                                                    {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "0.000000, 0.000000"}
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Zap className="text-primary" size={12} />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Terminal</p>
                                        </div>
                                        <p className="text-[11px] font-black text-slate-700 truncate">{metadata.device.split('-')[0]}</p>
                                    </div>
                                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Globe className="text-emerald-500" size={12} />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Network</p>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-700 font-mono truncate">{metadata.ip}</p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold rounded-2xl flex items-center gap-3 animate-shake">
                                    <AlertTriangle size={18} /> {error}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={!photo || !location || loading || geoLoading}
                                className="w-full py-6 bg-slate-900 hover:bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl transition-all disabled:opacity-20 disabled:scale-95 flex items-center justify-center gap-3 active:scale-[0.98] group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        <CheckCircle2 size={22} className="group-hover:scale-125 transition-transform" />
                                        Finalize Protocol
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Activity = ({ size, className }: { size?: number, className?: string }) => (
    <svg
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);
