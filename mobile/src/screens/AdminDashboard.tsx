import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Users, Clock, TrendingUp, Calendar, Activity } from 'lucide-react-native';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/attendance/overview');
      if (data.success) setOverview(data);
    } catch (e) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const stats = [
    { label: 'Total Employees', value: overview?.total || 0, icon: Users, color: colors.primary, bg: colors.primary + '12' },
    { label: 'Present Today', value: overview?.present || 0, icon: Clock, color: colors.success, bg: colors.success + '12' },
    { label: 'On Leave', value: overview?.onLeave || 0, icon: Calendar, color: colors.warning, bg: colors.warning + '12' },
    { label: 'Absent', value: overview?.absent || 0, icon: Activity, color: colors.destructive, bg: colors.destructive + '12' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Command Center</Text>
          <Text style={styles.subtitle}>Organization overview & control</Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                <stat.icon size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityPlaceholder}>Pull down to refresh attendance overview</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  header: { marginBottom: spacing.xl },
  title: {
    fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black,
    color: colors.slate900, letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.size.base, fontFamily: typography.fontFamily.bold,
    color: colors.slate500, marginTop: spacing.xs,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statCard: {
    width: '47%', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base,
    borderWidth: 1, borderColor: colors.border, ...shadows.sm,
  },
  statIcon: {
    width: 48, height: 48, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.slate900,
  },
  statLabel: {
    fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400,
    marginTop: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: typography.size.lg, fontFamily: typography.fontFamily.black,
    color: colors.slate800, marginBottom: spacing.base,
  },
  activityCard: {
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  activityPlaceholder: {
    fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.slate400,
  },
});
