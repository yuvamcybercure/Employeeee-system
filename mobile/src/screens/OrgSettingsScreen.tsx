import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    TextInput, Alert, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
    ArrowLeft, Building, Save, Camera,
    Settings, Shield, Calendar, Globe
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function OrgSettingsScreen({ navigation }: any) {
    const { user } = useAuth();
    const [org, setOrg] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [logo, setLogo] = useState('');
    const [quotas, setQuotas] = useState<any>({
        sick: { yearly: 0 },
        casual: { yearly: 0 },
        wfh: { yearly: 0 }
    });

    useEffect(() => {
        if (user?.organizationId) {
            fetchOrg();
        }
    }, [user]);

    const fetchOrg = async () => {
        try {
            const orgId = user?.organizationId?._id || user?.organizationId;
            const { data } = await api.get(`/organization/${orgId}`);
            if (data.success) {
                const o = data.organization;
                setOrg(o);
                setName(o.name || '');
                setSlug(o.slug || '');
                setLogo(o.logo || '');
                setQuotas(o.settings?.defaultLeaveEntitlements || {
                    sick: { yearly: 12 },
                    casual: { yearly: 12 },
                    wfh: { yearly: 24 }
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setLogo(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const orgId = user?.organizationId?._id || user?.organizationId;
            const payload = {
                name,
                slug,
                logo,
                settings: {
                    ...org.settings,
                    defaultLeaveEntitlements: quotas
                }
            };
            const { data } = await api.patch(`/organization/${orgId}`, payload);
            if (data.success) {
                Alert.alert('Success', 'Organization settings updated clusterwide.');
                fetchOrg();
            }
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const updateQuota = (key: string, val: string) => {
        const num = parseInt(val) || 0;
        setQuotas({
            ...quotas,
            [key]: { ...quotas[key], yearly: num }
        });
    };

    if (loading) return (
        <View style={[s.container, { justifyContent: 'center' }]}>
            <ActivityIndicator color={colors.primary} size="large" />
        </View>
    );

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <ArrowLeft size={24} color={colors.slate900} />
                </TouchableOpacity>
                <View style={s.headerContent}>
                    <Text style={s.headerTitle}>Enterprise Matrix</Text>
                    <Text style={s.headerSubtitle}>Core Configuration</Text>
                </View>
                <TouchableOpacity style={s.saveBtnHeader} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator size="small" color={colors.white} /> : <Save size={20} color={colors.white} />}
                </TouchableOpacity>
            </View>

            <ScrollView style={s.body} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Branding Section */}
                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Building size={18} color={colors.primary} />
                        <Text style={s.sectionTitle}>Identity & Branding</Text>
                    </View>

                    <View style={s.logoContainer}>
                        <TouchableOpacity style={s.logoWrapper} onPress={pickImage}>
                            {logo ? (
                                <Image source={{ uri: logo }} style={s.logoImg} />
                            ) : (
                                <View style={s.logoPlaceholder}>
                                    <Building size={32} color={colors.slate200} />
                                </View>
                            )}
                            <View style={s.cameraBtn}>
                                <Camera size={14} color={colors.white} />
                            </View>
                        </TouchableOpacity>
                        <Text style={s.logoHint}>Tap to transmit new branding asset</Text>
                    </View>

                    <Text style={s.label}>Organization Name</Text>
                    <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Entity Name" />

                    <Text style={s.label}>Subdomain Slug</Text>
                    <View style={s.slugWrap}>
                        <TextInput style={s.slugInput} value={slug} onChangeText={setSlug} placeholder="slug" autoCapitalize="none" />
                        <Text style={s.slugSuffix}>.cybercure.io</Text>
                    </View>
                </View>

                {/* Policy Section */}
                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Shield size={18} color={colors.primary} />
                        <Text style={s.sectionTitle}>Global Leave Quotas</Text>
                    </View>
                    <Text style={s.sectionHint}>Annual entitlements distributed to all cluster nodes.</Text>

                    <View style={s.quotaGrid}>
                        <View style={s.quotaCard}>
                            <Text style={s.quotaLabel}>SICK LEAVE</Text>
                            <TextInput
                                style={s.quotaInput}
                                value={String(quotas.sick?.yearly || 0)}
                                onChangeText={(v) => updateQuota('sick', v)}
                                keyboardType="numeric"
                            />
                            <Text style={s.quotaSuffix}>Days / Year</Text>
                        </View>
                        <View style={s.quotaCard}>
                            <Text style={s.quotaLabel}>CASUAL LEAVE</Text>
                            <TextInput
                                style={s.quotaInput}
                                value={String(quotas.casual?.yearly || 0)}
                                onChangeText={(v) => updateQuota('casual', v)}
                                keyboardType="numeric"
                            />
                            <Text style={s.quotaSuffix}>Days / Year</Text>
                        </View>
                    </View>

                    <View style={[s.quotaCard, { marginTop: spacing.md }]}>
                        <Text style={s.quotaLabel}>WFH ALLOWANCE</Text>
                        <TextInput
                            style={s.quotaInput}
                            value={String(quotas.wfh?.yearly || 0)}
                            onChangeText={(v) => updateQuota('wfh', v)}
                            keyboardType="numeric"
                        />
                        <Text style={s.quotaSuffix}>Days / Year</Text>
                    </View>
                </View>

                <TouchableOpacity style={s.fullSaveBtn} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color={colors.white} /> : <Text style={s.fullSaveText}>SYNC ALL CONFIGURATIONS</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.white },
    backBtn: { marginRight: spacing.md, padding: spacing.xs },
    headerContent: { flex: 1 },
    headerTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate900 },
    headerSubtitle: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1 },
    saveBtnHeader: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.sm },
    body: { flex: 1 },
    scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
    section: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.lg },
    sectionTitle: { fontSize: typography.size.base, fontFamily: typography.fontFamily.black, color: colors.slate800, textTransform: 'uppercase', letterSpacing: 1 },
    sectionHint: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginBottom: spacing.lg },
    logoContainer: { alignItems: 'center', marginBottom: spacing.xl },
    logoWrapper: { width: 100, height: 100, borderRadius: radius['2xl'], backgroundColor: colors.slate50, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
    logoImg: { width: '100%', height: '100%', borderRadius: radius['2xl'] - 2 },
    logoPlaceholder: { opacity: 0.5 },
    cameraBtn: { position: 'absolute', bottom: -8, right: -8, width: 32, height: 32, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.white },
    logoHint: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: spacing.md },
    label: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.md },
    input: { backgroundColor: colors.slate50, borderRadius: radius.xl, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900, borderWidth: 1, borderColor: colors.border },
    slugWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.slate50, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    slugInput: { flex: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
    slugSuffix: { backgroundColor: colors.slate100, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: 12, fontFamily: typography.fontFamily.bold, color: colors.slate500 },
    quotaGrid: { flexDirection: 'row', gap: spacing.md },
    quotaCard: { flex: 1, backgroundColor: colors.slate50, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    quotaLabel: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.slate400, marginBottom: 8 },
    quotaInput: { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, textAlign: 'center' },
    quotaSuffix: { fontSize: 9, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: 4 },
    fullSaveBtn: { backgroundColor: colors.slate900, borderRadius: radius.xl, paddingVertical: spacing.xl, alignItems: 'center', marginTop: spacing.md, ...shadows.xl },
    fullSaveText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
});
