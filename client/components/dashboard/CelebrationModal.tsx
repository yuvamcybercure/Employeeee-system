"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Mail, Star, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BirthdayUser {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    designation: string;
}

export function CelebrationModal({ birthdayUsers, onClose }: { birthdayUsers: BirthdayUser[], onClose: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const user = birthdayUsers[currentIndex];

    if (!user) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
                {/* Backdrop with Animated Gradient */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                />

                {/* Confetti / Particles (CSS Only) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                y: -20,
                                x: Math.random() * 2000,
                                rotate: 0,
                                opacity: 1
                            }}
                            animate={{
                                y: 1200,
                                x: (Math.random() - 0.5) * 500 + 1000,
                                rotate: 360,
                                opacity: 0
                            }}
                            transition={{
                                duration: Math.random() * 5 + 3,
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 5
                            }}
                            className={cn(
                                "w-3 h-3 rounded-full absolute",
                                ["bg-primary", "bg-secondary", "bg-yellow-400", "bg-pink-400", "bg-emerald-400"][i % 5]
                            )}
                        />
                    ))}
                </div>

                {/* Main Card */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotateY: -90 }}
                    transition={{ type: "spring", damping: 15, stiffness: 100 }}
                    className="relative w-full max-w-2xl perspective-1000"
                >
                    <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group border border-slate-100">
                        {/* Decorative 3D-ish Background Elements */}
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-50"
                        />
                        <motion.div
                            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-10 left-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl opacity-50"
                        />

                        {/* Top Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-all z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                            {/* 3D Balloon Section */}
                            <div className="flex gap-4 mb-4">
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            y: [0, -15, 0],
                                            rotate: [0, i % 2 === 0 ? 5 : -5, 0]
                                        }}
                                        transition={{
                                            duration: 3 + i,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: i * 0.5
                                        }}
                                        className={cn(
                                            "w-12 h-16 rounded-[40%] shadow-lg relative",
                                            i === 1 ? "bg-primary shadow-primary/30" :
                                                i === 2 ? "bg-secondary shadow-secondary/30" :
                                                    "bg-yellow-400 shadow-yellow-200"
                                        )}
                                    >
                                        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[2px] h-6 bg-slate-200" />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Cake Animation */}
                            <div className="relative group">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="w-48 h-32 bg-orange-50 rounded-2xl shadow-xl relative mt-4 border-b-8 border-orange-100"
                                >
                                    {/* Frosting */}
                                    <div className="absolute top-[-10px] left-0 w-full h-8 bg-pink-100 rounded-full blur-[2px]" />
                                    {/* Candle */}
                                    <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 w-4 h-12 bg-yellow-400 rounded-full">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                            className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-6 h-8 bg-orange-500 rounded-full blur-[4px]"
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            <div className="space-y-4">
                                <motion.h2
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-4xl font-black text-slate-900 tracking-tight"
                                >
                                    Happy Birthday! 🎉
                                </motion.h2>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-slate-400 font-bold uppercase tracking-widest text-xs"
                                >
                                    Celebrating One of Our Finest
                                </motion.p>
                            </div>

                            {/* User Profile Card */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-slate-50/50 p-8 rounded-[2.5rem] w-full border border-slate-100 flex flex-col md:flex-row items-center gap-6"
                            >
                                <div className="w-24 h-24 rounded-[1.8rem] bg-white p-1 shadow-lg ring-4 ring-white relative overflow-hidden">
                                    {user.profilePhoto ? (
                                        <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-2xl uppercase">
                                            {user.name[0]}
                                        </div>
                                    )}
                                    <div className="absolute top-0 right-0 p-1">
                                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white ring-2 ring-white">
                                            <Sparkles size={12} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-1">
                                    <h3 className="text-2xl font-black text-slate-800">{user.name}</h3>
                                    <p className="text-sm font-bold text-primary tracking-wide uppercase">{user.designation}</p>
                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-2 text-slate-400 font-medium">
                                        <div className="flex items-center gap-1 text-xs">
                                            <Mail size={14} />
                                            <span>{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs">
                                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                            <span>Birthday Star</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Carousel Indicators */}
                            {birthdayUsers.length > 1 && (
                                <div className="flex gap-2">
                                    {birthdayUsers.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentIndex(i)}
                                            className={cn(
                                                "w-2 h-2 rounded-full transition-all",
                                                i === currentIndex ? "w-8 bg-primary" : "bg-slate-200 hover:bg-slate-300"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="pt-6 w-full flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Wish them a Fantastic Day!
                                </button>
                                <button
                                    className="px-8 py-5 bg-primary/10 text-primary rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-primary/20 transition-all"
                                >
                                    <Gift size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
