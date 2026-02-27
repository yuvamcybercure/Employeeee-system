import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Calendar, CheckCircle, XCircle, Clock, Plus } from 'lucide-react-native';

export default function LeavesScreen() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/leaves');
      if (data.success) setLeaves(data.leaves || []);
    } catch (e) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaves();
    setRefreshing(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return { bg: colors.success + '15', color: colors.success, icon: CheckCircle };
      case 'rejected': return { bg: colors.destructive + '15', color: colors.destructive, icon: XCircle };
      default: return { bg: colors.warning + '15', color: colors.warning, icon: Clock };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Leaves</Text>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
          <Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {leaves.length === 0 ? (
          <View style={styles.emptyCard}>
            <Calendar size={48} color={colors.slate200} />
            <Text style={styles.emptyText}>No leave requests yet</Text>
          </View>
        ) : (
          leaves.map((leave: any, i: number) => {
            const s = getStatusStyle(leave.status);
            const StatusIcon = s.icon;
            return (
              <View key={i} style={styles.leaveCard}>
                <View style={styles.leaveHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: colors.primary + '12' }]}>
                    <Text style={[styles.typeText, { color: colors.primary }]}>{leave.type?.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <StatusIcon size={14} color={s.color} />
                    <Text style={[styles.statusText, { color: s.color }]}>{leave.status}</Text>
                  </View>
                </View>
                <Text style={styles.leaveDates}>
                  {new Date(leave.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  {' → '}
                  {new Date(leave.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                {leave.reason && <Text style={styles.leaveReason} numberOfLines={2}>{leave.reason}</Text>}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.base, paddingTop: spacing.base, marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black,
    color: colors.slate900, letterSpacing: -0.5,
  },
  addBtn: {
    width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', ...shadows.xl,
  },
  scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
  emptyCard: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: {
    fontSize: typography.size.base, fontFamily: typography.fontFamily.medium,
    color: colors.slate400, marginTop: spacing.base,
  },
  leaveCard: {
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  leaveHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  typeBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  typeText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, letterSpacing: 0.5 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  statusText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, textTransform: 'capitalize' },
  leaveDates: {
    fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800,
  },
  leaveReason: {
    fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate500,
    marginTop: spacing.sm,
  },
});
