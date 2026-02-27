import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  ActivityIndicator, Image, TextInput, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Users, Clock, TrendingUp, Calendar, Activity,
  CheckCircle, AlertCircle, ShieldCheck, Search, Zap
} from 'lucide-react-native';
import CelebrationModal from '../components/CelebrationModal';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, weeklyRes] = await Promise.allSettled([
        api.get('/attendance/overview'),
        api.get('/attendance/weekly'),
      ]);
      if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.success) {
        setOverview(overviewRes.value.data);
        if (overviewRes.value.data.birthdays?.length > 0) setShowCelebration(true);
      }
      if (weeklyRes.status === 'fulfilled' && weeklyRes.value.data?.success) setWeeklyData(weeklyRes.value.data.data || []);
    } catch (e) { }
    setLoading(false);
  };

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const attendanceRate = overview ? Math.round((overview.present / Math.max(overview.total, 1)) * 100) : 0;

  const dashboardStats = [
    { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: CheckCircle, color: colors.success, bg: colors.success + '12' },
    { label: 'Late Entries', value: String(overview?.late || 0), icon: Clock, color: colors.warning, bg: colors.warning + '12' },
    { label: 'Active Requests', value: String(overview?.pending || 0), icon: Activity, color: colors.primary, bg: colors.primary + '12' },
    { label: 'Security Alerts', value: String(overview?.ipConflicts?.length || 0), icon: ShieldCheck, color: colors.destructive, bg: colors.destructive + '12' },
  ];

  // Filter records by search
  const filteredRecords = (overview?.records || []).filter((r: any) => {
    if (!searchQuery) return true;
    const name = r.userId?.name?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase());
  });

  if (loading) return (
    <SafeAreaView style={s.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[s.subtitle, { marginTop: spacing.base }]}>Optimizing View...</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Team Operations</Text>
          <Text style={s.subtitle}>Real-time team performance & monitoring</Text>
        </View>

        {/* Performance Stats */}
        <View style={s.statsGrid}>
          {dashboardStats.map((stat, i) => (
            <View key={i} style={s.statCard}>
              <View style={s.statCardHeader}>
                <View style={[s.statIconWrap, { backgroundColor: stat.bg }]}>
                  <stat.icon size={22} color={stat.color} />
                </View>
                <View style={s.liveBadge}>
                  <Text style={s.liveBadgeText}>LIVE</Text>
                </View>
              </View>
              <Text style={s.statLabel}>{stat.label}</Text>
              <Text style={s.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Engagement Chart */}
        {weeklyData.length > 0 && (
          <View style={s.chartCard}>
            <View style={s.chartHeader}>
              <View>
                <Text style={s.chartTitle}>Weekly Engagement</Text>
                <Text style={s.chartSub}>Attendance over last 7 days</Text>
              </View>
              <View style={s.growthBadge}>
                <TrendingUp size={14} color={colors.success} />
                <Text style={s.growthText}>+5.2%</Text>
              </View>
            </View>
            <View style={s.barChart}>
              {weeklyData.slice(-7).map((day: any, i: number) => {
                const pct = day.percentage || 0;
                const isLast = i === Math.min(weeklyData.length, 7) - 1;
                return (
                  <View key={i} style={s.barCol}>
                    <View style={s.barTrack}>
                      <View style={[s.barFill, {
                        height: `${Math.max(pct, 5)}%`,
                        backgroundColor: isLast ? colors.primary : colors.slate200,
                      } as any]} />
                    </View>
                    <Text style={s.barLabel}>
                      {day.date ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2) : ''}
                    </Text>
                    <Text style={[s.barPct, isLast && { color: colors.primary }]}>{pct}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Security Center */}
        <View style={s.securityCard}>
          <View style={s.securityHeader}>
            <View style={s.securityIconWrap}>
              <AlertCircle size={24} color={colors.destructive} />
            </View>
            <Text style={s.securityTitle}>Security Center</Text>
          </View>

          {(overview?.ipConflicts?.length || 0) > 0 ? (
            overview.ipConflicts.map((conflict: any, i: number) => (
              <View key={i} style={s.conflictCard}>
                <View style={s.conflictHeader}>
                  <Text style={s.conflictLabel}>IP CONFLICT</Text>
                  <View style={s.critBadge}><Text style={s.critBadgeText}>CRITICAL</Text></View>
                </View>
                <Text style={s.conflictIp}>{conflict.ip}</Text>
                <Text style={s.conflictUsers}>
                  {conflict.users?.map((u: any) => u.userId?.name || 'Unknown').join(', ')}
                </Text>
              </View>
            ))
          ) : (
            <View style={s.securityOk}>
              <ShieldCheck size={36} color={colors.success + '60'} />
              <Text style={s.securityOkText}>No security threats detected. System at peak integrity.</Text>
            </View>
          )}
        </View>

        {/* Today's Pulse - Employee Table */}
        <View style={s.tableCard}>
          <View style={s.tableHeader}>
            <View>
              <Text style={s.tableTitle}>Today's Pulse</Text>
              <Text style={s.tableSub}>Live team attendance & check-in statuses</Text>
            </View>
          </View>

          {/* Search */}
          <View style={s.searchWrap}>
            <Search size={16} color={colors.slate400} />
            <TextInput
              style={s.searchInput}
              placeholder="Search member..."
              placeholderTextColor={colors.slate400}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Records */}
          {filteredRecords.length === 0 ? (
            <View style={s.emptyTable}>
              <Text style={s.emptyTableText}>No records found</Text>
            </View>
          ) : filteredRecords.map((record: any, i: number) => (
            <View key={record._id || i} style={s.recordRow}>
              <View style={s.recordUser}>
                {record.userId?.profilePhoto ? (
                  <Image source={{ uri: record.userId.profilePhoto }} style={s.recordAvatar} />
                ) : (
                  <View style={s.recordAvatarPlaceholder}>
                    <Text style={s.recordAvatarText}>{record.userId?.name?.[0] || 'U'}</Text>
                  </View>
                )}
                <View style={s.recordInfo}>
                  <Text style={s.recordName}>{record.userId?.name || 'Unknown'}</Text>
                  <Text style={s.recordDept}>{record.userId?.department || 'General'}</Text>
                </View>
              </View>
              <View style={s.recordMeta}>
                <View style={[s.statusBadge, {
                  backgroundColor: record.status === 'present' ? colors.success + '15' :
                    record.status === 'late' ? colors.warning + '15' : colors.destructive + '15'
                }]}>
                  <Text style={[s.statusText, {
                    color: record.status === 'present' ? colors.success :
                      record.status === 'late' ? colors.warning : colors.destructive
                  }]}>{record.status?.toUpperCase()}</Text>
                </View>
                <Text style={s.clockTime}>
                  {record.clockIn?.time ? new Date(record.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <CelebrationModal
        visible={showCelebration}
        birthdayUsers={overview?.birthdays || []}
        onClose={() => setShowCelebration(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  header: { marginBottom: spacing.xl },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -0.5 },
  subtitle: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate500, marginTop: spacing.xs },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statCard: { width: '47%', backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.base, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  statCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  statIconWrap: { width: 48, height: 48, borderRadius: radius.xl, justifyContent: 'center', alignItems: 'center' },
  liveBadge: { backgroundColor: colors.slate100, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  liveBadgeText: { fontSize: 8, fontFamily: typography.fontFamily.black, color: colors.slate400, letterSpacing: 1 },
  statLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1.5 },
  statValue: { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, marginTop: spacing.xs },
  chartCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.base, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  chartTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  chartSub: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: 2 },
  growthBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success + '12', borderRadius: radius.lg, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  growthText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.success },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, gap: spacing.xs },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { width: '80%', height: 100, backgroundColor: colors.slate50, borderRadius: radius.sm, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: radius.sm, minHeight: 4 },
  barLabel: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.slate400, marginTop: 4, textTransform: 'uppercase' },
  barPct: { fontSize: 8, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: 1 },
  securityCard: { backgroundColor: colors.slate900, borderRadius: radius['2xl'], padding: spacing.xl, marginBottom: spacing.xl, ...shadows.lg },
  securityHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  securityIconWrap: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.xl, justifyContent: 'center', alignItems: 'center' },
  securityTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.white },
  conflictCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  conflictHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  conflictLabel: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.destructive, letterSpacing: 2 },
  critBadge: { backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  critBadgeText: { fontSize: 8, fontFamily: typography.fontFamily.black, color: '#FCA5A5', letterSpacing: 1 },
  conflictIp: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
  conflictUsers: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.xs },
  securityOk: { alignItems: 'center', paddingVertical: spacing.xl },
  securityOkText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate400, textAlign: 'center', marginTop: spacing.md, maxWidth: 250 },
  tableCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing.xl },
  tableHeader: { padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  tableTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  tableSub: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: 2 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.base, marginVertical: spacing.md, backgroundColor: colors.slate50, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
  emptyTable: { padding: spacing.xl, alignItems: 'center' },
  emptyTableText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  recordUser: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  recordAvatar: { width: 40, height: 40, borderRadius: radius.lg },
  recordAvatarPlaceholder: { width: 40, height: 40, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  recordAvatarText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.white },
  recordInfo: { flex: 1 },
  recordName: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  recordDept: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  recordMeta: { alignItems: 'flex-end', gap: spacing.xs },
  statusBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  statusText: { fontSize: 9, fontFamily: typography.fontFamily.black, letterSpacing: 1 },
  clockTime: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate900 },
});
