import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { Clock, MapPin, Camera, CheckCircle, XCircle } from 'lucide-react-native';

export default function AttendanceScreen() {
  const [attendance, setAttendance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.get('/attendance/today').catch(() => ({ data: {} })),
        api.get(`/attendance/history?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`).catch(() => ({ data: {} })),
      ]);
      if (todayRes.data?.attendance) setAttendance(todayRes.data.attendance);
      if (historyRes.data?.success) setHistory(historyRes.data.records || []);
    } catch (e) {}
  };

  const handleClockIn = async () => {
    try {
      const { data } = await api.post('/attendance/clock-in', {});
      if (data.success) {
        Alert.alert('Success', 'Clocked in successfully!');
        fetchData();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Clock in failed');
    }
  };

  const handleClockOut = async () => {
    try {
      const { data } = await api.post('/attendance/clock-out', {});
      if (data.success) {
        Alert.alert('Success', 'Clocked out successfully!');
        fetchData();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Clock out failed');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const isCheckedIn = attendance?.clockIn && !attendance?.clockOut?.time;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Attendance</Text>

        {/* Clock In/Out Card */}
        <View style={styles.clockCard}>
          <View style={styles.clockTimeRow}>
            <View style={styles.clockCol}>
              <Text style={styles.clockLabel}>CLOCK IN</Text>
              <Text style={styles.clockTime}>
                {attendance?.clockIn?.time
                  ? new Date(attendance.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.clockCol}>
              <Text style={styles.clockLabel}>CLOCK OUT</Text>
              <Text style={styles.clockTime}>
                {attendance?.clockOut?.time
                  ? new Date(attendance.clockOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.clockBtn, isCheckedIn && styles.clockBtnOut]}
            onPress={isCheckedIn ? handleClockOut : handleClockIn}
            activeOpacity={0.8}
          >
            <Clock size={20} color={colors.white} />
            <Text style={styles.clockBtnText}>{isCheckedIn ? 'CLOCK OUT' : 'CLOCK IN'}</Text>
          </TouchableOpacity>
        </View>

        {/* History */}
        <Text style={styles.sectionTitle}>This Month</Text>
        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No attendance records this month</Text>
          </View>
        ) : (
          history.slice(0, 15).map((record: any, i: number) => (
            <View key={i} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <View style={[styles.statusDot, { backgroundColor: record.status === 'present' ? colors.success : record.status === 'absent' ? colors.destructive : colors.warning }]} />
                <View>
                  <Text style={styles.historyDate}>
                    {new Date(record.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.historyStatus}>{record.status?.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyTime}>
                  {record.clockIn?.time ? new Date(record.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                </Text>
                <Text style={styles.historyTimeSep}>→</Text>
                <Text style={styles.historyTime}>
                  {record.clockOut?.time ? new Date(record.clockOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  title: {
    fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black,
    color: colors.slate900, marginBottom: spacing.xl, letterSpacing: -0.5,
  },
  clockCard: {
    backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.xl,
    marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border, ...shadows.md,
  },
  clockTimeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  clockCol: { flex: 1, alignItems: 'center' },
  clockLabel: {
    fontSize: typography.size.xs, fontFamily: typography.fontFamily.black,
    color: colors.slate400, letterSpacing: 1.5, marginBottom: spacing.sm,
  },
  clockTime: {
    fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.slate900,
  },
  divider: { width: 1, height: 50, backgroundColor: colors.border },
  clockBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.base,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    ...shadows.xl,
  },
  clockBtnOut: { backgroundColor: colors.destructive },
  clockBtnText: {
    fontSize: typography.size.sm, fontFamily: typography.fontFamily.black,
    color: colors.white, letterSpacing: 2,
  },
  sectionTitle: {
    fontSize: typography.size.lg, fontFamily: typography.fontFamily.black,
    color: colors.slate800, marginBottom: spacing.base,
  },
  emptyCard: {
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  emptyText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
  historyCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.base,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  historyDate: {
    fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800,
  },
  historyStatus: {
    fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400,
    letterSpacing: 0.5, marginTop: 2,
  },
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  historyTime: {
    fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate600,
    fontVariant: ['tabular-nums'],
  },
  historyTimeSep: { fontSize: typography.size.sm, color: colors.slate300 },
});
