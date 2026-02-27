import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    RefreshControl, ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import {
    ArrowLeft, BarChart3, TrendingUp, Users,
    Briefcase, Zap, Globe, Signal, ShieldCheck,
    Box, Building
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ navigation }: any) {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const { data } = await api.get('/master/analytics');
            if (data.success) {
                setAnalytics(data.analytics);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAnalytics();
        setRefreshing(false);
    };

    const MetricCard = ({ title, value, unit, icon: Icon, color, trend }: any) => (
        <View style={s.metricCard}>
            <View style={[s.metricIcon, { backgroundColor: color + '15' }]}>
                <Icon size={20} color={color} />
            </View>
            <View style={s.metricContent}>
                <Text style={s.metricLabel}>{title}</Text>
                <View style={s.metricValueRow}>
                    <Text style={s.metricValue}>{value}</Text>
                    {unit && <Text style={s.metricUnit}>{unit}</Text>}
                </View>
            </View>
            {trend && (
                <View style={s.trendBadge}>
                    <TrendingUp size={12} color={colors.success} />
                    <Text style={s.trendText}>{trend}%</Text>
                </View>
            )}
        </View>
    );

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
                    <Text style={s.headerTitle}>Intelligence Hub</Text>
                    <Text style={s.headerSubtitle}>Cross-Cluster Analytics</Text>
                </View>
                <View style={s.liveBadge}>
                    <View style={s.pulseDot} />
                    <Text style={s.liveText}>LIVE FEED</Text>
                </View>
            </View>

            <ScrollView
                style={s.body}
                contentContainerStyle={s.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Global Pulse Section */}
                <View style={s.pulseSection}>
                    <View style={s.sectionHeader}>
                        <Zap size={18} color={colors.primary} />
                        <Text style={s.sectionTitle}>Global System Pulse</Text>
                    </View>

                    <View style={s.metricGrid}>
                        <MetricCard
                            title="Avg Attendance"
                            value={analytics?.avgAttendance || 0}
                            unit="%"
                            icon={ShieldCheck}
                            color={colors.success}
                        />
                        <MetricCard
                            title="Active Nodes"
                            value={analytics?.activeSessions || 0}
                            icon={Users}
                            color={colors.primary}
                            trend={analytics?.growthRate}
                        />
                    </View>

                    <View style={s.metricGrid}>
                        <MetricCard
                            title="Project Flux"
                            value={analytics?.projectFlux || 0}
                            icon={Briefcase}
                            color={colors.info}
                        />
                        <MetricCard
                            title="Platform Growth"
                            value={analytics?.growthRate || 0}
                            unit="%"
                            icon={TrendingUp}
                            color={colors.warning}
                        />
                    </View>
                </View>

                {/* Top Organizations */}
                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Globe size={18} color={colors.primary} />
                        <Text style={s.sectionTitle}>Top Performing Clusters</Text>
                    </View>

                    {(analytics?.topOrganizations || []).map((org: any, idx: number) => (
                        <View key={idx} style={s.orgCard}>
                            <View style={s.orgInfo}>
                                <View style={s.orgAvatar}>
                                    <Building size={16} color={colors.primary} />
                                </View>
                                <View style={s.orgText}>
                                    <Text style={s.orgName}>{org.name}</Text>
                                    <Text style={s.orgMeta}>Cluster Efficiency Index</Text>
                                </View>
                            </View>
                            <View style={s.orgScore}>
                                <Text style={s.scoreValue}>{org.score}%</Text>
                                <View style={s.progressBar}>
                                    <View style={[s.progressFill, { width: `${org.score}%` }]} />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Insight Panel */}
                <View style={s.insightCard}>
                    <BarChart3 size={32} color={colors.white} />
                    <View style={s.insightContent}>
                        <Text style={s.insightTitle}>Platform Intelligence Summary</Text>
                        <Text style={s.insightText}>
                            Overall system stability is optimal. Cluster growth is up {analytics?.growthRate}% this cycle. Attendance vectors remain stable at {analytics?.avgAttendance}%.
                        </Text>
                    </View>
                </View>
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
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.destructive + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, gap: 6 },
    pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.destructive },
    liveText: { fontSize: 8, fontFamily: typography.fontFamily.black, color: colors.destructive, letterSpacing: 0.5 },
    body: { flex: 1 },
    scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
    pulseSection: { marginBottom: spacing.xl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.lg },
    sectionTitle: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.slate800, textTransform: 'uppercase', letterSpacing: 1 },
    metricGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    metricCard: { flex: 1, backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
    metricIcon: { width: 36, height: 36, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
    metricContent: {},
    metricLabel: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 0.5 },
    metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 2 },
    metricValue: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
    metricUnit: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
    trendBadge: { position: 'absolute', top: spacing.md, right: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 2 },
    trendText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.success },
    section: { marginBottom: spacing.xl },
    orgCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    orgInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    orgAvatar: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    orgText: { flex: 1 },
    orgName: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.slate800 },
    orgMeta: { fontSize: 9, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
    orgScore: { alignItems: 'flex-end', width: 80 },
    scoreValue: { fontSize: 12, fontFamily: typography.fontFamily.black, color: colors.slate900 },
    progressBar: { height: 4, width: '100%', backgroundColor: colors.slate100, borderRadius: 2, marginTop: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.primary },
    insightCard: { backgroundColor: colors.slate900, borderRadius: radius['2xl'], padding: spacing.xl, flexDirection: 'row', gap: spacing.lg, alignItems: 'center', ...shadows.xl },
    insightContent: { flex: 1 },
    insightTitle: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.white, textTransform: 'uppercase', letterSpacing: 1 },
    insightText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400, lineHeight: 18, marginTop: 4 },
});
