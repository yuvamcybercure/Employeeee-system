import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Clock, Calendar, TrendingUp, Bell, ChevronRight, MapPin
} from 'lucide-react-native';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [attendance, setAttendance] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attRes, statsRes] = await Promise.all([
        api.get('/attendance/today').catch(() => ({ data: {} })),
        api.get('/dashboard/employee-stats').catch(() => ({ data: {} })),
      ]);
      if (attRes.data?.attendance) setAttendance(attRes.data.attendance);
      if (statsRes.data?.success) setStats(statsRes.data);
    } catch (e) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer}>
            {user?.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Today's Attendance Card */}
        <View style={styles.attendanceCard}>
          <View style={styles.attendanceGradient}>
            <View style={styles.attendanceHeader}>
              <Clock size={20} color={colors.white} />
              <Text style={styles.attendanceLabel}>TODAY'S STATUS</Text>
            </View>
            <View style={styles.attendanceRow}>
              <View>
                <Text style={styles.attendanceTime}>
                  {attendance?.clockIn?.time
                    ? new Date(attendance.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                </Text>
                <Text style={styles.attendanceSub}>Clock In</Text>
              </View>
              <View style={styles.attendanceDivider} />
              <View>
                <Text style={styles.attendanceTime}>
                  {attendance?.clockOut?.time
                    ? new Date(attendance.clockOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                </Text>
                <Text style={styles.attendanceSub}>Clock Out</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {attendance?.status === 'present' ? '✅ Present' : attendance?.status || 'Not Clocked In'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'Days Present', value: stats?.present || 0, icon: Calendar, iconColor: colors.success },
            { label: 'Leaves Taken', value: stats?.leavesTaken || 0, icon: Calendar, iconColor: colors.warning },
            { label: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: Bell, iconColor: colors.accent },
            { label: 'Work Hours', value: stats?.totalHours || 0, icon: TrendingUp, iconColor: colors.primary },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.iconColor + '15' }]}>
                <stat.icon size={20} color={stat.iconColor} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {[
          { label: 'Request Leave', sub: 'Apply for time off', icon: Calendar },
          { label: 'View Attendance', sub: 'Check your records', icon: Clock },
          { label: 'My Projects', sub: 'View assigned projects', icon: TrendingUp },
        ].map((action, i) => (
          <TouchableOpacity key={i} style={styles.actionCard} activeOpacity={0.7}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '10' }]}>
                <action.icon size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <Text style={styles.actionSub}>{action.sub}</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.slate300} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.size.base, fontFamily: typography.fontFamily.medium,
    color: colors.slate500,
  },
  userName: {
    fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black,
    color: colors.slate900, letterSpacing: -0.5,
  },
  avatarContainer: { width: 48, height: 48, borderRadius: radius.lg, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%', height: '100%', backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', borderRadius: radius.lg,
  },
  avatarText: {
    fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.white,
  },
  attendanceCard: { marginBottom: spacing.xl, borderRadius: radius['2xl'], overflow: 'hidden', ...shadows.lg },
  attendanceGradient: {
    backgroundColor: colors.primary, padding: spacing.xl, borderRadius: radius['2xl'],
  },
  attendanceHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  attendanceLabel: {
    fontSize: typography.size.xs, fontFamily: typography.fontFamily.black,
    color: 'rgba(255,255,255,0.7)', letterSpacing: 2,
  },
  attendanceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    marginBottom: spacing.base,
  },
  attendanceTime: {
    fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black,
    color: colors.white, textAlign: 'center',
  },
  attendanceSub: {
    fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold,
    color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: spacing.xs,
  },
  attendanceDivider: {
    width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.full,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.base, alignSelf: 'center',
  },
  statusText: {
    fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.white,
  },
  sectionTitle: {
    fontSize: typography.size.lg, fontFamily: typography.fontFamily.black,
    color: colors.slate800, marginBottom: spacing.base, letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl,
  },
  statCard: {
    width: '47%', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base,
    borderWidth: 1, borderColor: colors.border, ...shadows.sm,
  },
  statIcon: {
    width: 40, height: 40, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.slate900,
  },
  statLabel: {
    fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold,
    color: colors.slate400, marginTop: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  actionIcon: {
    width: 44, height: 44, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: {
    fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800,
  },
  actionSub: {
    fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400,
  },
});
