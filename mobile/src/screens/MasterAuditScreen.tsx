import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing } from '../theme';
import api from '../api';
import { FileSearch, Shield, Database, Activity } from 'lucide-react-native';

export default function MasterAuditScreen() {
    const [logs, setLogs] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { fetchLogs(); }, []);
    const fetchLogs = async () => { try { const { data } = await api.get('/logs'); if (data.success) setLogs(data.logs || []); } catch (e) { } };
    const onRefresh = async () => { setRefreshing(true); await fetchLogs(); setRefreshing(false); };

    const getIcon = (type: string) => {
        if (type === 'security') return Shield;
        if (type === 'database') return Database;
        return Activity;
    };

    return (
        <SafeAreaView style={s.container}>
            <Text style={s.title}>Audit Stream</Text>
            <Text style={s.subtitle}>System-wide event log</Text>
            <ScrollView contentContainerStyle={s.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />} showsVerticalScrollIndicator={false}>
                {logs.map((log: any, i: number) => {
                    const Icon = getIcon(log.type);
                    return (
                        <View key={i} style={s.card}>
                            <View style={[s.iconWrap, { backgroundColor: colors.primary + '12' }]}><Icon size={18} color={colors.primary} /></View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.action}>{log.action}</Text>
                                <Text style={s.meta}>{log.userId?.name || 'System'} • {log.resource || ''}</Text>
                                <Text style={s.time}>{log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}</Text>
                            </View>
                        </View>
                    );
                })}
                {logs.length === 0 && <View style={s.empty}><FileSearch size={48} color={colors.slate200} /><Text style={s.emptyText}>No audit logs</Text></View>}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, paddingHorizontal: spacing.base, paddingTop: spacing.base, letterSpacing: -0.5 },
    subtitle: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate500, paddingHorizontal: spacing.base, marginBottom: spacing.lg },
    scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
    card: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
    iconWrap: { width: 36, height: 36, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    action: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
    meta: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: 2 },
    time: { fontSize: 9, fontFamily: typography.fontFamily.medium, color: colors.slate300, marginTop: 2 },
    empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
    emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
});
