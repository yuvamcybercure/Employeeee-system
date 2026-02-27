import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    Image, Dimensions, Animated
} from 'react-native';
import { X, Gift, Sparkles, Mail, Star } from 'lucide-react-native';
import { colors, typography, radius, shadows, spacing } from '../theme';

const { width, height } = Dimensions.get('window');

interface BirthdayUser {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    designation: string;
}

interface CelebrationModalProps {
    visible: boolean;
    birthdayUsers: BirthdayUser[];
    onClose: () => void;
}

export default function CelebrationModal({ visible, birthdayUsers, onClose }: CelebrationModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
        }
    }, [visible, currentIndex]);

    if (birthdayUsers.length === 0) return null;
    const user = birthdayUsers[currentIndex];

    return (
        <Modal visible={visible} transparent animationType="none">
            <View style={s.overlay}>
                <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />

                <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    {/* Confetti Placeholder (Simple Dots) */}
                    <View style={s.confettiContainer}>
                        {[...Array(15)].map((_, i) => (
                            <View key={i} style={[s.dot, {
                                backgroundColor: [colors.primary, colors.success, colors.warning, '#FF69B4'][i % 4],
                                left: Math.random() * width * 0.8,
                                top: Math.random() * 400
                            }]} />
                        ))}
                    </View>

                    <TouchableOpacity style={s.closeTop} onPress={onClose}>
                        <X size={24} color={colors.slate400} />
                    </TouchableOpacity>

                    <View style={s.content}>
                        <View style={s.header}>
                            <View style={s.balloonRow}>
                                <View style={[s.balloon, { backgroundColor: colors.primary }]} />
                                <View style={[s.balloon, { backgroundColor: colors.warning, marginTop: -10 }]} />
                                <View style={[s.balloon, { backgroundColor: '#FF69B4' }]} />
                            </View>
                            <Text style={s.title}>Happy Birthday! 🎉</Text>
                            <Text style={s.subtitle}>CELEBRATING ONE OF OUR FINEST</Text>
                        </View>

                        <View style={s.profileCard}>
                            <View style={s.avatarWrap}>
                                {user.profilePhoto ? (
                                    <Image source={{ uri: user.profilePhoto }} style={s.avatar} />
                                ) : (
                                    <View style={s.avatarPlaceholder}>
                                        <Text style={s.avatarInitial}>{user.name[0]}</Text>
                                    </View>
                                )}
                                <View style={s.sparkleBadge}>
                                    <Sparkles size={12} color={colors.white} />
                                </View>
                            </View>

                            <View style={s.userInfo}>
                                <Text style={s.userName}>{user.name}</Text>
                                <Text style={s.userRole}>{user.designation?.toUpperCase()}</Text>

                                <View style={s.metaRow}>
                                    <Mail size={12} color={colors.slate400} />
                                    <Text style={s.metaText}>{user.email}</Text>
                                </View>
                                <View style={s.metaRow}>
                                    <Star size={12} color={colors.warning} fill={colors.warning} />
                                    <Text style={s.metaText}>Birthday Star</Text>
                                </View>
                            </View>
                        </View>

                        {birthdayUsers.length > 1 && (
                            <View style={s.pagination}>
                                {birthdayUsers.map((_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[s.dotIndicator, i === currentIndex && s.dotActive]}
                                        onPress={() => setCurrentIndex(i)}
                                    />
                                ))}
                            </View>
                        )}

                        <View style={s.actions}>
                            <TouchableOpacity style={s.wishBtn} onPress={onClose}>
                                <Text style={s.wishBtnText}>WISH THEM A FANTASTIC DAY!</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.giftBtn}>
                                <Gift size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    backdrop: { ...StyleSheet.absoluteFillObject },
    card: { backgroundColor: colors.white, borderRadius: radius['3xl'], width: '100%', overflow: 'hidden', ...shadows.xl, borderWidth: 1, borderColor: colors.slate100 },
    closeTop: { position: 'absolute', top: 20, right: 20, zIndex: 10, padding: 8, backgroundColor: colors.slate50, borderRadius: radius.full },
    confettiContainer: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
    dot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, opacity: 0.4 },
    content: { padding: spacing.xl, alignItems: 'center', zIndex: 1 },
    header: { alignItems: 'center', marginVertical: spacing.xl },
    balloonRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    balloon: { width: 30, height: 40, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, textAlign: 'center' },
    subtitle: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.slate400, letterSpacing: 2, marginTop: 8 },
    profileCard: { width: '100%', backgroundColor: colors.slate50, borderRadius: radius['2xl'], padding: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, borderWidth: 1, borderColor: colors.slate100 },
    avatarWrap: { width: 80, height: 80, borderRadius: radius.xl, backgroundColor: colors.white, padding: 4, ...shadows.md },
    avatar: { width: '100%', height: '100%', borderRadius: radius.lg },
    avatarPlaceholder: { width: '100%', height: '100%', borderRadius: radius.lg, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.primary },
    sparkleBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#10B981', padding: 4, borderRadius: 10, borderWidth: 2, borderColor: colors.white },
    userInfo: { flex: 1, gap: 4 },
    userName: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate800 },
    userRole: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.primary, letterSpacing: 1 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    metaText: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
    pagination: { flexDirection: 'row', gap: 8, marginTop: spacing.xl },
    dotIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.slate200 },
    dotActive: { width: 20, backgroundColor: colors.primary },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing['2xl'], width: '100%' },
    wishBtn: { flex: 1, backgroundColor: colors.slate900, height: 56, borderRadius: radius.xl, justifyContent: 'center', alignItems: 'center', ...shadows.md },
    wishBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1.5 },
    giftBtn: { width: 56, height: 56, backgroundColor: colors.primary + '10', borderRadius: radius.xl, justifyContent: 'center', alignItems: 'center' }
});
