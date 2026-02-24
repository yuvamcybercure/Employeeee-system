"use client";

import React, { useState } from 'react';
import { Save, Loader2, User, Phone, Mail, MapPin, Users, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export function ProfileForm({ user, onUpdate }: { user: any, onUpdate: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        fatherName: user?.fatherName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        gender: user?.gender || '',
        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        designation: user?.designation || '',
        joinDate: user?.joinDate ? new Date(user.joinDate).toISOString().split('T')[0] : '',
        address: user?.address || '',
        nationality: user?.nationality || 'Indian',
        religion: user?.religion || '',
        maritalStatus: user?.maritalStatus || '',
        emergencyContact: {
            name: user?.emergencyContact?.name || '',
            relationship: user?.emergencyContact?.relationship || '',
            phone: user?.emergencyContact?.phone || '',
            email: user?.emergencyContact?.email || '',
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.patch(`/users/${user._id}`, formData);
            if (data.success) {
                onUpdate();
                alert('Profile updated successfully!');
            }
        } catch (err) {
            console.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* General Details */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <User className="text-primary" size={24} /> General Details
                    </h3>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Full Name *</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Father Name *</label>
                        <input
                            required
                            type="text"
                            value={formData.fatherName}
                            onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email Address *</label>
                        <input
                            required
                            disabled
                            type="email"
                            value={formData.email}
                            className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl outline-none font-bold text-slate-400 cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Phone Number *</label>
                        <input
                            required
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Gender</label>
                        <select
                            value={formData.gender}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Date of Birth *</label>
                        <input
                            required
                            type="date"
                            value={formData.dob}
                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700 cursor-pointer"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Designation *</label>
                        <input
                            required
                            disabled
                            type="text"
                            value={formData.designation}
                            className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl outline-none font-bold text-slate-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Date of Joining *</label>
                        <input
                            required
                            disabled
                            type="date"
                            value={formData.joinDate}
                            className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl outline-none font-bold text-slate-400"
                        />
                    </div>
                    <div className="space-y-2 lg:col-span-1">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Role *</label>
                        <input
                            required
                            disabled
                            type="text"
                            value={user?.role}
                            className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl outline-none font-black text-primary/60 uppercase tracking-widest text-xs"
                        />
                    </div>
                    <div className="space-y-2 lg:col-span-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Permanent Address</label>
                        <textarea
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-600 resize-none"
                            placeholder="Full address details..."
                        />
                    </div>
                </div>
            </div>

            {/* Profile Details (Demographics) */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <MapPin className="text-secondary" size={24} /> Profile Details
                    </h3>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Nationality</label>
                        <input
                            type="text"
                            value={formData.nationality}
                            onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Religion</label>
                        <input
                            type="text"
                            value={formData.religion}
                            onChange={e => setFormData({ ...formData, religion: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Marital Status</label>
                        <select
                            value={formData.maritalStatus}
                            onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                        >
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Heart className="text-red-500" size={24} /> Emergency Contact
                    </h3>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Contact Name</label>
                        <input
                            type="text"
                            value={formData.emergencyContact.name}
                            onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value } })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Relationship</label>
                        <input
                            type="text"
                            value={formData.emergencyContact.relationship}
                            onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, relationship: e.target.value } })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                        <input
                            type="tel"
                            value={formData.emergencyContact.phone}
                            onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phone: e.target.value } })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email (Optional)</label>
                        <input
                            type="email"
                            value={formData.emergencyContact.email}
                            onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, email: e.target.value } })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button Floating */}
            <div className="fixed bottom-10 right-10 z-50">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save All Changes</>}
                </button>
            </div>
        </form>
    );
}
