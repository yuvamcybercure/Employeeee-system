import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Modal,
    ActivityIndicator, Image, Alert, Dimensions
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Camera, MapPin, X, CheckCircle2, Zap, Globe, AlertTriangle } from 'lucide-react-native';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';

const { width } = Dimensions.get('window');

interface AttendanceProtocolModalProps {
    visible: boolean;
    type: 'in' | 'out';
    onClose: () => void;
    onSuccess: (attendance: any) => void;
}

export default function AttendanceProtocolModal({ visible, type, onClose, onSuccess }: AttendanceProtocolModalProps) {
    const [photo, setPhoto] = useState<string | null>(null);
    const [location, setLocation] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(true);
    const [error, setError] = useState('');
    const [metadata, setMetadata] = useState({ ip: '...', device: '...', time: '' });

    useEffect(() => {
        if (visible) {
            getLocation();
            fetchMetadata();
            const interval = setInterval(() => {
                setMetadata(prev => ({ ...prev, time: new Date().toLocaleTimeString() }));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [visible]);

    const fetchMetadata = async () => {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            setMetadata(prev => ({
                ...prev,
                ip: data.ip,
                device: 'Mobile Terminal'
            }));
        } catch (e) {
            setMetadata(prev => ({ ...prev, ip: 'Local/Restricted' }));
        }
    };

    const getLocation = async () => {
        setGeoLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Location permission denied');
                setGeoLoading(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

            // Reverse geocode
            const reverse = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });

            const addr = reverse[0] ? `${reverse[0].street || ''}, ${reverse[0].city || ''}` : 'Location Identified';

            setLocation({
                lat: loc.coords.latitude,
                lng: loc.coords.longitude,
                address: addr
            });
        } catch (e) {
            setError('GPS Calibration Failed');
        }
        setGeoLoading(false);
    };

    const capturePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Camera access is required');
                return;
            }

            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                aspect: [4, 3],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled) {
                setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
        } catch (e) {
            Alert.alert('Error', 'Could not open camera');
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
        <Modal visible={visible} animationType="slide" transparent>
            <View style={s.overlay}>
                <View style={s.card}>
                    <View style={s.header}>
                        <View>
                            <Text style={s.protocolTitle}>{type === 'in' ? 'Check-In Protocol' : 'Check-Out Protocol'}</Text>
                            <Text style={s.protocolSub}>Security Verification Step</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <X size={20} color={colors.slate400} />
                        </TouchableOpacity>
                    </View>

                    <View style={s.content}>
                        {/* Camera Area */}
                        <View style={s.cameraContainer}>
                            {!photo ? (
                                <View style={s.placeholder}>
                                    <Camera size={48} color={colors.slate100} />
                                    <TouchableOpacity style={s.captureBtn} onPress={capturePhoto}>
                                        <View style={s.captureBtnInner}>
                                            <Camera size={24} color={colors.white} />
                                        </View>
                                        <Text style={s.captureText}>OPEN CAMERA</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={s.photoPreview}>
                                    <Image source={{ uri: photo }} style={s.image} />
                                    <View style={s.timeOverlay}>
                                        <Text style={s.timeText}>{metadata.time}</Text>
                                    </View>
                                    <TouchableOpacity style={s.retakeBtn} onPress={() => setPhoto(null)}>
                                        <X size={14} color={colors.white} />
                                        <Text style={s.retakeText}>RETAKE</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Meta Area */}
                        <View style={s.metaSection}>
                            <View style={[s.geoCard, location && s.geoCardActive]}>
                                <MapPin size={18} color={location ? colors.primary : colors.slate300} />
                                <View style={{ flex: 1 }}>
                                    <Text style={s.metaLabel}>GPS UPLINK</Text>
                                    <Text style={s.metaVal} numberOfLines={2}>
                                        {geoLoading ? 'Synchronizing satellite payload...' : location?.address || 'Calibrating...'}
                                    </Text>
                                </View>
                            </View>

                            <View style={s.grid}>
                                <View style={s.gridItem}>
                                    <Zap size={14} color={colors.primary} />
                                    <View>
                                        <Text style={s.metaLabel}>IP ADDR</Text>
                                        <Text style={s.metaValText}>{metadata.ip}</Text>
                                    </View>
                                </View>
                                <View style={s.gridItem}>
                                    <Globe size={14} color={colors.success} />
                                    <View>
                                        <Text style={s.metaLabel}>TERMINAL</Text>
                                        <Text style={s.metaValText}>{metadata.device}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {error ? (
                            <View style={s.errorBadge}>
                                <AlertTriangle size={14} color={colors.destructive} />
                                <Text style={s.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[s.submitBtn, (!photo || !location || loading) && s.submitDisabled]}
                            onPress={handleSubmit}
                            disabled={!photo || !location || loading}
                        >
                            {loading ? <ActivityIndicator color={colors.white} /> : (
                                <>
                                    <CheckCircle2 size={18} color={colors.white} />
                                    <Text style={s.submitText}>FINALIZE PROTOCOL</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.9)', justifyContent: 'flex-end' },
    card: { backgroundColor: colors.white, borderTopLeftRadius: radius['3xl'], borderTopRightRadius: radius['3xl'], paddingBottom: 40, maxHeight: '90%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
    protocolTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate900, fontStyle: 'italic' },
    protocolSub: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 },
    closeBtn: { width: 40, height: 40, borderRadius: radius.lg, backgroundColor: colors.slate50, justifyContent: 'center', alignItems: 'center' },
    content: { padding: spacing.xl },
    cameraContainer: { backgroundColor: colors.slate950, borderRadius: radius['2xl'], width: '100%', aspectRatio: 4 / 3, overflow: 'hidden', ...shadows.xl },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.xl },
    captureBtn: { alignItems: 'center', gap: 12 },
    captureBtnInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' },
    captureText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1 },
    photoPreview: { flex: 1 },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    timeOverlay: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    timeText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1 },
    retakeBtn: { position: 'absolute', bottom: 16, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    retakeText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1 },
    metaSection: { marginTop: spacing.xl, gap: spacing.md },
    geoCard: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.slate50, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate100 },
    geoCardActive: { backgroundColor: colors.primary + '05', borderColor: colors.primary + '20' },
    metaLabel: { fontSize: 8, fontFamily: typography.fontFamily.black, color: colors.slate400, letterSpacing: 1, marginBottom: 2 },
    metaVal: { fontSize: 11, fontFamily: typography.fontFamily.bold, color: colors.slate700, lineHeight: 14 },
    grid: { flexDirection: 'row', gap: spacing.md },
    gridItem: { flex: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.slate50, borderRadius: radius.xl, alignItems: 'center' },
    metaValText: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
    submitBtn: { marginTop: spacing.xl, backgroundColor: colors.slate900, borderRadius: radius.xl, paddingVertical: spacing.lg, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.md, ...shadows.xl },
    submitDisabled: { opacity: 0.3 },
    submitText: { fontSize: 12, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
    errorBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.destructive + '10', padding: 12, borderRadius: radius.lg, marginTop: spacing.md },
    errorText: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.destructive },
});
