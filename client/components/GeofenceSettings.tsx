"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { MapPin, Target, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn, formatDate, formatDuration } from "@/lib/utils";

export function GeofenceSettings() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/geofence');
            if (data.success) setSettings(data.geofence || { lat: 0, lng: 0, radiusMeters: 200, officeName: 'Main Office' });
        } catch (err) {
            setError('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleManualLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setSettings({ ...settings, lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess('');
        setError('');
        try {
            const { data } = await api.put('/geofence', settings);
            if (data.success) {
                setSuccess('Settings saved successfully!');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8">
            <div>
                <h3 className="text-xl font-extrabold text-slate-800">Geofencing Configuration</h3>
                <p className="text-slate-500 text-sm mt-1">Set the primary office location and work radius for proximity verification.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Office Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={settings.officeName}
                            onChange={(e) => setSettings({ ...settings, officeName: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Latitude</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={settings.lat}
                                onChange={(e) => setSettings({ ...settings, lat: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Longitude</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={settings.lng}
                                onChange={(e) => setSettings({ ...settings, lng: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleManualLocation}
                        className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                    >
                        <MapPin size={16} /> Use my current location as office coordinates
                    </button>

                    <div className="space-y-2 pt-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700">Work Radius (meters)</label>
                            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-md">{settings.radiusMeters}m</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="5000"
                            step="50"
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                            value={settings.radiusMeters}
                            onChange={(e) => setSettings({ ...settings, radiusMeters: parseInt(e.target.value) })}
                        />
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            <span>50m</span>
                            <span>5km</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-primary mb-6">
                        <Target size={32} />
                    </div>
                    <h4 className="font-extrabold text-slate-800">Visual Map Preview</h4>
                    <p className="text-slate-500 text-xs mt-2 max-w-[240px]">Map integration (Leaflet) will dynamically show the radius circle around the coordinates.</p>

                    <div className="mt-8 p-4 bg-white rounded-xl border border-slate-200 w-full text-left space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Geofence</p>
                        <p className="text-xs font-bold text-slate-700 italic">Radius: {settings.radiusMeters} meters</p>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: '40%' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    {error && <p className="text-red-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
                    {success && <p className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={14} /> {success}</p>}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Geofence Settings</>}
                </button>
            </div>
        </div>
    );
}
