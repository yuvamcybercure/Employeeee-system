"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Camera, MapPin, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
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
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [geoLoading, setGeoLoading] = useState(true);

    useEffect(() => {
        startCamera();
        getLocation();
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
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
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
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
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setPhoto(dataUrl);
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
                device: "Web Browser",
                faceDetected: true // Simplified for demo
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Camera className="text-primary" />
                        {type === 'in' ? 'Clock In' : 'Clock Out'} Verification
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Camera Section */}
                    <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-100 italic flex items-center justify-center">
                        {!photo ? (
                            <>
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                <button
                                    onClick={capturePhoto}
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all border-4 border-slate-200"
                                >
                                    <div className="w-10 h-10 bg-primary rounded-full" />
                                </button>
                            </>
                        ) : (
                            <>
                                <img src={photo} alt="Capture" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setPhoto(null)}
                                    className="absolute top-4 right-4 p-2 bg-slate-900/50 text-white rounded-full hover:bg-slate-900/80 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Location & Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={cn(
                            "p-4 rounded-2xl border transition-all flex flex-col gap-1",
                            location ? "bg-green-50 border-green-100" : "bg-slate-50 border-slate-100"
                        )}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Geolocation</span>
                            <div className="flex items-center gap-2">
                                {geoLoading ? (
                                    <Loader2 className="animate-spin text-slate-300" size={16} />
                                ) : location ? (
                                    <CheckCircle2 className="text-green-500" size={16} />
                                ) : (
                                    <AlertTriangle className="text-orange-400" size={16} />
                                )}
                                <span className="text-xs font-bold text-slate-700">
                                    {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Detecting..."}
                                </span>
                            </div>
                        </div>

                        <div className={cn(
                            "p-4 rounded-2xl border transition-all flex flex-col gap-1",
                            photo ? "bg-green-50 border-green-100" : "bg-slate-50 border-slate-100"
                        )}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identification</span>
                            <div className="flex items-center gap-2">
                                {photo ? (
                                    <CheckCircle2 className="text-green-500" size={16} />
                                ) : (
                                    <Loader2 className="animate-spin text-slate-300" size={16} />
                                )}
                                <span className="text-xs font-bold text-slate-700">
                                    {photo ? "Selfie Captured" : "Waiting for capture"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!photo || !location || loading}
                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Submit Attendance"}
                    </button>
                </div>
            </div>
        </div>
    );
}
