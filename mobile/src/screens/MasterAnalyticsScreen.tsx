import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react-native';

export default function MasterAnalyticsScreen() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { fetchAnalytics(); }, []);
    const fetchAnalytics = async () => {
        try {
            const [attRes, usersRes] = await Promise.allSettled([
                api.get('/attendance/overview'),
                api.get('/users'),
            ]);
            const att = attRes.status === 'fulfilled' ? attRes.value.data : {};
            const users = usersRes.status === 'fulfilled' ? usersRes.value.data : {};
            setAnalytics({
                totalUsers: users.users?.length || 0,
                present: att.present || 0,
                absent: att.absent || 0,
                late: att.late || 0,
                total: att.total || 0,
                attendanceRate: att.total ? Math.round((att.present / att.total) * 100) : 0,
            });
        } catch (e) { }
    };
    const onRefresh = async () => { setRefreshing(true); await fetchAnalytics(); setRefreshing(false); };

    const stats = analytics ? [
        { label: 'Total Users', value: analytics.totalUsers, icon: Users, color: colors.primary },
        { label: 'Attendance Rate', value: `${analytics.attendanceRate}%`, icon: TrendingUp, color: colors.success },
        { label: 'Present Today', value: analytics.present, icon: Clock, color: colors.success },
        { label: 'Late Today', value: analytics.late, icon: Clock, color: colors.warning },
        { label: 'Absent Today', value: analytics.absent, icon: BarChart3, color: colors.destructive },
    ] : [];

    return (
        <SafeAreaView style={s.container}>
            <Text style={s.title}>Analytics Hub</Text>
            <Text style={s.subtitle}>Organization-wide performance metrics</Text>
            <ScrollView contentContainerStyle={s.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />} showsVerticalScrollIndicator={false}>
                <View style={s.grid}>
                    {stats.map((stat, i) => (
                        <View key={i} style={s.statCard}>
                            <View style={[s.statIcon, { backgroundColor: stat.color + '12' }]}><stat.icon size={24} color={stat.color} /></View>
                            <Text style={s.statValue}>{stat.value}</Text>
                            <Text style={s.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, paddingHorizontal: spacing.base, paddingTop: spacing.base, letterSpacing: -0.5 },
    subtitle: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate500, paddingHorizontal: spacing.base, marginBottom: spacing.lg },
    scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    statCard: { width: '47%', backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.border, ...shadows.sm },
    statIcon: { width: 52, height: 52, borderRadius: radius.xl, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
    statValue: { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.slate900 },
    statLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.xs, textAlign: 'center' },
});
