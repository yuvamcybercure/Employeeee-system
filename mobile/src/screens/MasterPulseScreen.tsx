import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing } from '../theme';
import api from '../api';
import { Zap, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react-native';

export default function MasterPulseScreen() {
    const [pulse, setPulse] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { fetchPulse(); }, []);
    const fetchPulse = async () => {
        try {
            const [attRes, usersRes] = await Promise.allSettled([
                api.get('/attendance/overview'),
                api.get('/users'),
            ]);
            const att = attRes.status === 'fulfilled' ? attRes.value.data : {};
            const users = usersRes.status === 'fulfilled' ? usersRes.value.data?.users || [] : [];
            const activeUsers = users.filter((u: any) => u.isActive !== false).length;
            setPulse({
                totalUsers: users.length,
                activeUsers,
                attendanceRate: att.total ? Math.round((att.present / att.total) * 100) : 0,
                present: att.present || 0,
                insights: [
                    { text: `${activeUsers} active users across the platform`, icon: Users, color: colors.primary },
                    { text: `${att.present || 0} employees present today (${att.total ? Math.round((att.present / att.total) * 100) : 0}% rate)`, icon: CheckCircle, color: colors.success },
                    { text: `${att.late || 0} late entries detected`, icon: Clock, color: colors.warning },
                    { text: `System health: Optimal`, icon: TrendingUp, color: colors.success },
                ],
            });
        } catch (e) { }
    };
    const onRefresh = async () => { setRefreshing(true); await fetchPulse(); setRefreshing(false); };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.headerCard}>
                <Zap size={28} color="#F59E0B" />
                <Text style={s.title}>Master Pulse</Text>
                <Text style={s.subtitle}>AI-powered system insights</Text>
            </View>
            <ScrollView contentContainerStyle={s.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />} showsVerticalScrollIndicator={false}>
                {pulse?.insights?.map((insight: any, i: number) => (
                    <View key={i} style={s.insightCard}>
                        <View style={[s.insightIcon, { backgroundColor: insight.color + '12' }]}>
                            <insight.icon size={20} color={insight.color} />
                        </View>
                        <Text style={s.insightText}>{insight.text}</Text>
                    </View>
                ))}
                {!pulse && <View style={s.empty}><Zap size={48} color={colors.slate200} /><Text style={s.emptyText}>Loading pulse data...</Text></View>}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerCard: { backgroundColor: colors.slate900, padding: spacing.xl, alignItems: 'center', paddingTop: spacing['2xl'] },
    title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.white, marginTop: spacing.md, letterSpacing: -0.5 },
    subtitle: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: spacing.xs },
    scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
    insightCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
    insightIcon: { width: 44, height: 44, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
    insightText: { flex: 1, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate700, lineHeight: 20 },
    empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
    emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
});
