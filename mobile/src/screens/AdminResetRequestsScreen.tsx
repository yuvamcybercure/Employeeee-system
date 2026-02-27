import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
    ArrowLeft, Key, Check, X, User,
    Clock, ShieldAlert, ShieldCheck
} from 'lucide-react-native';

export default function AdminResetRequestsScreen({ navigation }: any) {
    const { user } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/auth/reset-requests');
            if (data.success) {
                setRequests(data.requests);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchRequests();
        setRefreshing(false);
    };

    const handleProcess = async (requestId: string, status: 'approved' | 'rejected') => {
        setProcessingId(requestId);
        try {
            const { data } = await api.post(`/auth/process-reset/${requestId}`, { status });
            if (data.success) {
                Alert.alert('Success', `Password reset request ${status}`);
                fetchRequests();
            }
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to process request');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <ArrowLeft size={24} color={colors.slate900} />
                </TouchableOpacity>
                <View style={s.headerContent}>
                    <Text style={s.headerTitle}>Access Governance</Text>
                    <Text style={s.headerSubtitle}>Password Reset Requests</Text>
                </View>
            </View>

            <ScrollView
                style={s.body}
                contentContainerStyle={s.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {loading ? (
                    <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
                ) : requests.length === 0 ? (
                    <View style={s.emptyState}>
                        <ShieldCheck size={64} color={colors.slate100} />
                        <Text style={s.emptyTitle}>Secure Perimeter</Text>
                        <Text style={s.emptyText}>No pending reset signals detected.</Text>
                    </View>
                ) : (
                    requests.map((item) => (
                        <View key={item._id} style={s.requestCard}>
                            <View style={s.cardHeader}>
                                <View style={s.userBadge}>
                                    <User size={16} color={colors.primary} />
                                </View>
                                <View style={s.userInfo}>
                                    <Text style={s.userName}>{item.userId?.name || 'Unknown User'}</Text>
                                    <Text style={s.userEmail}>{item.email}</Text>
                                </View>
                                <View style={s.roleTag}>
                                    <Text style={s.roleText}>{(item.userId?.role || 'employee').toUpperCase()}</Text>
                                </View>
                            </View>

                            <View style={s.cardDivider} />

                            <View style={s.cardMeta}>
                                <View style={s.metaItem}>
                                    <Clock size={14} color={colors.slate400} />
                                    <Text style={s.metaText}>
                                        Requested {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View style={s.metaItem}>
                                    <ShieldAlert size={14} color={colors.warning} />
                                    <Text style={[s.metaText, { color: colors.warning }]}>Pending Authorization</Text>
                                </View>
                            </View>

                            <View style={s.cardActions}>
                                <TouchableOpacity
                                    style={[s.actionBtn, s.rejectBtn]}
                                    onPress={() => handleProcess(item._id, 'rejected')}
                                    disabled={!!processingId}
                                >
                                    <X size={18} color={colors.destructive} />
                                    <Text style={s.rejectText}>REJECT</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[s.actionBtn, s.approveBtn]}
                                    onPress={() => handleProcess(item._id, 'approved')}
                                    disabled={!!processingId}
                                >
                                    {processingId === item._id ? (
                                        <ActivityIndicator size="small" color={colors.white} />
                                    ) : (
                                        <>
                                            <Check size={18} color={colors.white} />
                                            <Text style={s.approveText}>AUTHORIZE</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
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
    body: { flex: 1 },
    scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
    emptyState: { alignItems: 'center', marginTop: spacing['4xl'] },
    emptyTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900, marginTop: spacing.xl },
    emptyText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.xs },
    requestCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    userBadge: { width: 40, height: 40, borderRadius: radius.xl, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    userInfo: { flex: 1 },
    userName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.black, color: colors.slate900 },
    userEmail: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate500 },
    roleTag: { backgroundColor: colors.slate100, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm },
    roleText: { fontSize: 8, fontFamily: typography.fontFamily.black, color: colors.slate600, letterSpacing: 0.5 },
    cardDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
    cardMeta: { gap: spacing.xs },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
    cardActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
    actionBtn: { flex: 1, height: 44, borderRadius: radius.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    approveBtn: { backgroundColor: colors.primary, ...shadows.md },
    rejectBtn: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.destructive + '40' },
    approveText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1 },
    rejectText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.destructive, letterSpacing: 1 },
});
