import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Animated, Dimensions, Modal, ActivityIndicator
} from 'react-native';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useCall } from '../context/CallContext';
import {
    Phone, PhoneOff, Video, VideoOff,
    Mic, MicOff, User, Monitor
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function CallingOverlay() {
    const { call, answerCall, rejectCall, endCall } = useCall();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (call.status === 'ringing') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [call.status]);

    if (!call.active) return null;

    const isIncoming = call.isReceiving;
    const isRinging = call.status === 'ringing';
    const isConnected = call.status === 'connected';

    return (
        <Modal transparent animationType="fade" visible={call.active}>
            <View style={s.overlay}>
                <View style={s.content}>
                    {/* Header Info */}
                    <View style={s.header}>
                        <View style={s.typeLabel}>
                            {call.type === 'video' ? <Video size={14} color={colors.white} /> : <Phone size={14} color={colors.white} />}
                            <Text style={s.typeText}>{call.type.toUpperCase()} CALL</Text>
                        </View>
                        <Text style={s.statusText}>{call.status.toUpperCase()}...</Text>
                    </View>

                    {/* Avatar / Pulse Area */}
                    <View style={s.centerArea}>
                        <Animated.View style={[s.pulseCircle, { transform: [{ scale: pulseAnim }], opacity: isRinging ? 0.3 : 0 }]} />
                        <View style={s.avatarContainer}>
                            <View style={s.avatarShadow}>
                                <View style={s.avatar}>
                                    <User size={64} color={colors.white} />
                                </View>
                            </View>
                        </View>
                        <Text style={s.calleeName}>{call.name || 'External Node'}</Text>
                        <Text style={s.orgTag}>Secured Link • 256-bit AES</Text>
                    </View>

                    {/* Action Controls */}
                    <View style={s.footer}>
                        {isIncoming && isRinging ? (
                            <View style={s.actionRow}>
                                <TouchableOpacity style={[s.actionBtn, s.declineBtn]} onPress={rejectCall}>
                                    <PhoneOff size={28} color={colors.white} />
                                    <Text style={s.btnLabel}>DECLINE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[s.actionBtn, s.acceptBtn]} onPress={answerCall}>
                                    <Phone size={28} color={colors.white} />
                                    <Text style={s.btnLabel}>ACCEPT</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={s.activeControls}>
                                <View style={s.controlGrid}>
                                    <TouchableOpacity style={s.controlSubBtn}>
                                        <Mic size={24} color={colors.slate400} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={s.controlSubBtn}>
                                        {call.type === 'video' ? <VideoOff size={24} color={colors.slate400} /> : <Monitor size={24} color={colors.slate400} />}
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={[s.actionBtn, s.endBtn]} onPress={endCall}>
                                    <PhoneOff size={32} color={colors.white} />
                                    <Text style={s.btnLabel}>END CALL</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.98)', justifyContent: 'center', alignItems: 'center' },
    content: { width: '100%', height: '100%', padding: spacing['2xl'], justifyContent: 'space-between' },
    header: { alignItems: 'center', marginTop: spacing['4xl'] },
    typeLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
    typeText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
    statusText: { fontSize: 13, fontFamily: typography.fontFamily.bold, color: colors.primary, marginTop: spacing.md, letterSpacing: 1 },
    centerArea: { alignItems: 'center', justifyContent: 'center' },
    pulseCircle: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: colors.primary },
    avatarContainer: { width: 140, height: 140, borderRadius: 70, padding: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
    avatarShadow: { flex: 1, borderRadius: 66, backgroundColor: colors.slate800, overflow: 'hidden', ...shadows.xl },
    avatar: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.slate700 },
    calleeName: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.white, marginTop: spacing.xl },
    orgTag: { fontSize: 11, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
    footer: { marginBottom: spacing['4xl'] },
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
    actionBtn: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', ...shadows.lg },
    acceptBtn: { backgroundColor: colors.success },
    declineBtn: { backgroundColor: colors.destructive },
    endBtn: { backgroundColor: colors.destructive, width: 100, height: 100, borderRadius: 50 },
    btnLabel: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.white, marginTop: 8, letterSpacing: 1 },
    activeControls: { alignItems: 'center', gap: spacing['2xl'] },
    controlGrid: { flexDirection: 'row', gap: spacing.xl },
    controlSubBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
});
