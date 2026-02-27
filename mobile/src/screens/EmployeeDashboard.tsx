import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Image, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Clock, Calendar, TrendingUp, Bell, ChevronRight, MapPin,
  Briefcase, CheckCircle, Camera, Sparkles
} from 'lucide-react-native';
import AttendanceProtocolModal from '../components/AttendanceProtocolModal';
import CelebrationModal from '../components/CelebrationModal';

export default function EmployeeDashboard({ navigation }: any) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [time, setTime] = useState(new Date());
  const [clockLoading, setClockLoading] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchData();
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const now = new Date();
      const [attRes, histRes, statsRes] = await Promise.allSettled([
        api.get('/attendance/today'),
        api.get(`/attendance/history?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
        api.get('/dashboard/employee-stats'),
      ]);
      if (attRes.status === 'fulfilled' && attRes.value.data?.success) setAttendance(attRes.value.data.attendance);
      if (histRes.status === 'fulfilled' && histRes.value.data?.success) setHistory(histRes.value.data.records || []);
      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setDashboardStats(statsRes.value.data);
        if (statsRes.value.data.birthdays?.length > 0) setShowCelebration(true);
      }
    } catch (e) { }
    setLoading(false);
  };

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const handleClockAction = async () => {
    if (attendance?.clockOut) return;
    setShowProtocol(true);
  };

  const greeting = () => {
    const h = time.getHours();
    return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  };

  if (loading) return (
    <SafeAreaView style={s.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </SafeAreaView>
  );

  const projectStats = dashboardStats?.projectStats;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View style={s.heroSection}>
          <View>
            <Text style={s.greeting}>Good {greeting()},</Text>
            <Text style={s.userName}>{user?.name?.split(' ')[0]}!</Text>
            <Text style={s.dateText}>
              {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <View style={s.timeCard}>
            <Text style={s.timeText}>
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </Text>
            <View style={s.liveRow}>
              <View style={s.liveDot} />
              <Text style={s.liveText}>LIVE TRACKING</Text>
            </View>
          </View>
        </View>

        {/* Attendance Action Card */}
        <View style={s.attendanceCard}>
          <View style={s.badgeRow}>
            <View style={s.aiBadge}>
              <Sparkles size={12} color={colors.primary} />
              <Text style={s.aiBadgeText}>AI Verification Active</Text>
            </View>
          </View>
          <Text style={s.attendanceTitle}>Secure Attendance Log</Text>
          <Text style={s.attendanceDesc}>
            Mark your daily presence using high-precision geofencing and facial detection.
          </Text>

          <View style={s.attendanceActions}>
            <TouchableOpacity
              style={[s.clockBtn, attendance?.clockIn && s.clockBtnOut, attendance?.clockOut && s.clockBtnDisabled]}
              onPress={handleClockAction}
              disabled={!!attendance?.clockOut || clockLoading}
              activeOpacity={0.8}
            >
              {clockLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={s.clockBtnText}>
                    {attendance?.clockOut ? 'DAY COMPLETE' : attendance?.clockIn ? 'END YOUR DAY' : 'START YOUR DAY'}
                  </Text>
                  <Camera size={18} color={colors.white} />
                </>
              )}
            </TouchableOpacity>

            <View style={s.statusCard}>
              <View style={[s.statusDot, { backgroundColor: attendance?.clockIn ? colors.success : colors.slate300 }]} />
              <View>
                <Text style={s.statusLabel}>STATUS</Text>
                <Text style={s.statusValue}>
                  {attendance?.clockIn?.time
                    ? `In: ${new Date(attendance.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Waiting for In'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={s.quickStats}>
          <View style={s.quickStatItem}>
            <View style={[s.quickStatIcon, { backgroundColor: colors.primary + '12' }]}>
              <Calendar size={20} color={colors.primary} />
            </View>
            <Text style={s.quickStatValue}>{history.filter(r => r.status === 'present').length}</Text>
            <Text style={s.quickStatLabel}>Present</Text>
          </View>
          <View style={s.quickStatItem}>
            <View style={[s.quickStatIcon, { backgroundColor: colors.warning + '12' }]}>
              <Clock size={20} color={colors.warning} />
            </View>
            <Text style={s.quickStatValue}>{history.filter(r => r.status === 'late').length}</Text>
            <Text style={s.quickStatLabel}>Late</Text>
          </View>
          <View style={s.quickStatItem}>
            <View style={[s.quickStatIcon, { backgroundColor: colors.success + '12' }]}>
              <TrendingUp size={20} color={colors.success} />
            </View>
            <Text style={s.quickStatValue}>
              {history.length > 0 ? Math.round(history.reduce((a, r) => a + (r.totalHours || 0), 0) / Math.max(history.filter(r => r.totalHours).length, 1) * 10) / 10 : 0}h
            </Text>
            <Text style={s.quickStatLabel}>Avg Hours</Text>
          </View>
          <View style={s.quickStatItem}>
            <View style={[s.quickStatIcon, { backgroundColor: colors.accent + '12' }]}>
              <Briefcase size={20} color={colors.accent} />
            </View>
            <Text style={s.quickStatValue}>{projectStats?.total || 0}</Text>
            <Text style={s.quickStatLabel}>Projects</Text>
          </View>
        </View>

        {/* Project Overview */}
        {projectStats && (
          <View style={s.projectCard}>
            <Text style={s.sectionTitle}>Project Overview</Text>
            <View style={s.projectStats}>
              <View style={s.projStatItem}>
                <Text style={[s.projStatValue, { color: colors.primary }]}>{projectStats.active || 0}</Text>
                <Text style={s.projStatLabel}>Active</Text>
              </View>
              <View style={s.projStatDivider} />
              <View style={s.projStatItem}>
                <Text style={[s.projStatValue, { color: colors.success }]}>{projectStats.completed || 0}</Text>
                <Text style={s.projStatLabel}>Done</Text>
              </View>
              <View style={s.projStatDivider} />
              <View style={s.projStatItem}>
                <Text style={[s.projStatValue, { color: colors.warning }]}>{projectStats.pending || 0}</Text>
                <Text style={s.projStatLabel}>Pending</Text>
              </View>
            </View>
          </View>
        )}

        {/* Birthdays & Holidays */}
        {dashboardStats?.birthdays?.length > 0 && (
          <View style={s.birthdayCard}>
            <Text style={s.sectionTitle}>🎂 Birthdays Today</Text>
            {dashboardStats.birthdays.map((b: any, i: number) => (
              <Text key={i} style={s.birthdayName}>{b.name}</Text>
            ))}
          </View>
        )}

        {/* Recent Activity Log */}
        <View style={s.activityCard}>
          <View style={s.activityHeader}>
            <Text style={s.sectionTitle}>Recent Activity</Text>
            <Text style={s.activitySub}>Weekly Summary</Text>
          </View>

          {history.slice(0, 7).map((record, i) => {
            const remark = record.status === 'present'
              ? (record.totalHours >= 8 ? 'Well Done' : 'Half Day')
              : record.status === 'late' ? 'Late Arrival'
                : record.status === 'Sunday' ? 'Weekly Off' : record.status;

            const remarkColor = record.status === 'present'
              ? (record.totalHours >= 8 ? colors.success : colors.warning)
              : record.status === 'Sunday' ? colors.primary : colors.destructive;

            return (
              <View key={i} style={s.activityRow}>
                <View style={s.activityDay}>
                  <Text style={s.activityDayText}>
                    {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={s.activityDate}>{record.date?.split('-')[2]}</Text>
                </View>
                <View style={s.activityTimes}>
                  <Text style={[s.activityIn, { color: colors.success }]}>
                    {record.clockIn?.time ? new Date(record.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                  </Text>
                  <Text style={[s.activityOut, { color: colors.destructive }]}>
                    {record.clockOut?.time ? new Date(record.clockOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                  </Text>
                </View>
                <Text style={s.activityHours}>{record.totalHours ? `${record.totalHours}h` : '0h'}</Text>
                <View style={[s.remarkBadge, { backgroundColor: remarkColor + '15' }]}>
                  <Text style={[s.remarkText, { color: remarkColor }]}>{remark}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <AttendanceProtocolModal
        visible={showProtocol}
        type={attendance?.clockIn ? 'out' : 'in'}
        onClose={() => setShowProtocol(false)}
        onSuccess={() => {
          Alert.alert('Success', attendance?.clockIn ? 'Check-out protocol finalized' : 'Check-in protocol finalized');
          fetchData();
        }}
      />

      <CelebrationModal
        visible={showCelebration}
        birthdayUsers={dashboardStats?.birthdays || []}
        onClose={() => setShowCelebration(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  heroSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  greeting: { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.slate900 },
  userName: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.primary, letterSpacing: -0.5 },
  dateText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate500, marginTop: spacing.xs },
  timeCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-end', ...shadows.sm },
  timeText: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.primary, letterSpacing: 1 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  liveText: { fontSize: 8, fontFamily: typography.fontFamily.black, color: colors.slate400, letterSpacing: 2 },

  attendanceCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.xl, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border, ...shadows.md },
  badgeRow: { marginBottom: spacing.md },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary + '08', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.primary + '15' },
  aiBadgeText: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.primary, letterSpacing: 1.5, textTransform: 'uppercase' },
  attendanceTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  attendanceDesc: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate500, marginTop: spacing.xs, lineHeight: 18 },
  attendanceActions: { marginTop: spacing.xl, gap: spacing.md },
  clockBtn: { backgroundColor: colors.primary, borderRadius: radius['2xl'], paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, ...shadows.xl },
  clockBtnOut: { backgroundColor: colors.slate900 },
  clockBtnDisabled: { backgroundColor: colors.slate300, opacity: 0.7 },
  clockBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.slate50, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 8, fontFamily: typography.fontFamily.black, color: colors.slate400, letterSpacing: 2 },
  statusValue: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.slate700, letterSpacing: 1, marginTop: 2 },

  quickStats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  quickStatItem: { flex: 1, backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  quickStatIcon: { width: 40, height: 40, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  quickStatValue: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  quickStatLabel: { fontSize: 9, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  projectCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate800, marginBottom: spacing.md },
  projectStats: { flexDirection: 'row', alignItems: 'center' },
  projStatItem: { flex: 1, alignItems: 'center' },
  projStatValue: { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black },
  projStatLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  projStatDivider: { width: 1, height: 40, backgroundColor: colors.slate100 },

  birthdayCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  birthdayName: { fontSize: typography.size.md, fontFamily: typography.fontFamily.bold, color: colors.slate700, marginBottom: spacing.xs },

  activityCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  activityHeader: { padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  activitySub: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1 },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  activityDay: { width: 40, alignItems: 'center' },
  activityDayText: { fontSize: 9, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'uppercase' },
  activityDate: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  activityTimes: { flex: 1, marginLeft: spacing.md },
  activityIn: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold },
  activityOut: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, marginTop: 1 },
  activityHours: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.slate900, marginRight: spacing.md },
  remarkBadge: { borderRadius: radius.lg, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  remarkText: { fontSize: 8, fontFamily: typography.fontFamily.black, letterSpacing: 0.5, textTransform: 'uppercase' },
});
