import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator, Alert, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Target, Save, ArrowLeft, Loader2, Globe } from 'lucide-react-native';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import * as Location from 'expo-location';

export default function GeofenceSettingsScreen({ navigation }: any) {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locating, setLocating] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/geofence');
            if (data.success) {
                setSettings(data.geofence || {
                    lat: 0,
                    lng: 0,
                    radiusMeters: 200,
                    officeName: 'Main Office',
                    isActive: true
                });
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch geofence settings');
        } finally {
            setLoading(false);
        }
    };

    const handleUseCurrentLocation = async () => {
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to fetch coordinates.');
                setLocating(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setSettings({
                ...settings,
                lat: location.coords.latitude,
                lng: location.coords.longitude
            });
        } catch (err) {
            Alert.alert('Error', 'Could not get current location');
        }
        setLocating(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await api.put('/geofence', settings);
            if (data.success) {
                Alert.alert('Success', 'Geofence settings updated successfully');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={s.loader}>
                <ActivityIndicator color={colors.primary} size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <ArrowLeft size={24} color={colors.slate900} />
                </TouchableOpacity>
                <Text style={s.title}>Geofence Settings</Text>
            </View>

            <ScrollView contentContainerStyle={s.scrollContent}>
                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <View style={s.iconContainer}>
                            <Globe size={24} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={s.cardTitle}>Global Boundary</Text>
                            <Text style={s.cardSubtitle}>Configure office proximity verification</Text>
                        </View>
                    </View>

                    <View style={s.inputGroup}>
                        <Text style={s.label}>OFFICE NAME</Text>
                        <TextInput
                            style={s.input}
                            value={settings.officeName}
                            onChangeText={(text) => setSettings({ ...settings, officeName: text })}
                            placeholder="e.g. Headquarters"
                        />
                    </View>

                    <View style={s.row}>
                        <View style={[s.inputGroup, { flex: 1 }]}>
                            <Text style={s.label}>LATITUDE</Text>
                            <TextInput
                                style={s.input}
                                value={String(settings.lat)}
                                onChangeText={(text) => setSettings({ ...settings, lat: parseFloat(text) || 0 })}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[s.inputGroup, { flex: 1 }]}>
                            <Text style={s.label}>LONGITUDE</Text>
                            <TextInput
                                style={s.input}
                                value={String(settings.lng)}
                                onChangeText={(text) => setSettings({ ...settings, lng: parseFloat(text) || 0 })}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={s.locationBtn}
                        onPress={handleUseCurrentLocation}
                        disabled={locating}
                    >
                        {locating ? <ActivityIndicator size="small" color={colors.primary} /> : <MapPin size={16} color={colors.primary} />}
                        <Text style={s.locationBtnText}>Use My Current Location</Text>
                    </TouchableOpacity>

                    <View style={s.divider} />

                    <View style={s.radiusHeader}>
                        <Text style={s.label}>WORK RADIUS</Text>
                        <View style={s.badge}>
                            <Text style={s.badgeText}>{settings.radiusMeters}m</Text>
                        </View>
                    </View>

                    <View style={s.radiusRange}>
                        <Text style={s.rangeValue}>50m</Text>
                        <View style={s.spacer} />
                        <Text style={s.rangeValue}>5km</Text>
                    </View>
                    <Text style={s.radiusInfo}>Employees must stay within this distance from the coordinates to clock in/out.</Text>

                    <View style={s.switchRow}>
                        <View>
                            <Text style={s.switchLabel}>Enforce Geofencing</Text>
                            <Text style={s.switchSub}>Strict verification for attendance</Text>
                        </View>
                        <Switch
                            value={settings.isActive}
                            onValueChange={(val) => setSettings({ ...settings, isActive: val })}
                            trackColor={{ false: colors.slate200, true: colors.primary + '80' }}
                            thumbColor={settings.isActive ? colors.primary : colors.slate400}
                        />
                    </View>
                </View>

                <View style={s.previewCard}>
                    <Target size={32} color={colors.slate300} />
                    <Text style={s.previewTitle}>Visual Map Preview</Text>
                    <Text style={s.previewText}>Coordinates: {settings.lat.toFixed(4)}, {settings.lng.toFixed(4)}</Text>
                    <Text style={s.previewText}>Radius: {settings.radiusMeters} meters</Text>
                </View>
            </ScrollView>

            <View style={s.footer}>
                <TouchableOpacity
                    style={s.saveBtn}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? <ActivityIndicator color={colors.white} /> : (
                        <>
                            <Save size={20} color={colors.white} />
                            <Text style={s.saveBtnText}>Save Configuration</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { padding: spacing.sm, marginRight: spacing.sm },
    title: { fontSize: 20, fontFamily: typography.fontFamily.black, color: colors.slate900 },
    scrollContent: { padding: spacing.lg },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: colors.white, borderRadius: radius['3xl'], padding: spacing.xl, ...shadows.md, marginBottom: spacing.lg },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
    iconContainer: { width: 50, height: 50, borderRadius: 15, backgroundColor: colors.primary + '10', justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: 18, fontFamily: typography.fontFamily.black, color: colors.slate800 },
    cardSubtitle: { fontSize: 12, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
    inputGroup: { marginBottom: spacing.lg },
    label: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate400, letterSpacing: 1.5, marginBottom: 8 },
    input: { backgroundColor: colors.slate50, borderRadius: radius.xl, padding: spacing.md, fontSize: 16, fontFamily: typography.fontFamily.bold, color: colors.slate800, borderWidth: 1, borderColor: colors.border },
    row: { flexDirection: 'row', gap: spacing.md },
    locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -spacing.sm, marginBottom: spacing.lg },
    locationBtnText: { fontSize: 12, fontFamily: typography.fontFamily.bold, color: colors.primary },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
    radiusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    badge: { backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 12, fontFamily: typography.fontFamily.black, color: colors.primary },
    radiusRange: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    rangeValue: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
    spacer: { flex: 1 },
    radiusInfo: { fontSize: 11, fontFamily: typography.fontFamily.medium, color: colors.slate400, fontStyle: 'italic', marginBottom: spacing.xl },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.slate50, padding: spacing.md, borderRadius: radius.xl },
    switchLabel: { fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
    switchSub: { fontSize: 11, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
    previewCard: { backgroundColor: colors.slate50, borderRadius: radius['2xl'], padding: spacing.xl, alignItems: 'center', borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
    previewTitle: { fontSize: 14, fontFamily: typography.fontFamily.black, color: colors.slate600, marginTop: spacing.md, marginBottom: 4 },
    previewText: { fontSize: 12, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
    footer: { padding: spacing.lg, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
    saveBtn: { backgroundColor: colors.primary, padding: spacing.lg, borderRadius: radius.xl, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, ...shadows.lg },
    saveBtnText: { color: colors.white, fontSize: 16, fontFamily: typography.fontFamily.black, letterSpacing: 0.5 },
});
