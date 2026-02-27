import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { ShieldCheck, Settings, Globe, Activity, Users, FileText, Zap } from 'lucide-react-native';

export default function SuperadminDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const stats = [
    { label: 'Active Nodes', value: '156', icon: Users, color: colors.primary },
    { label: 'Protocols', value: '12', icon: FileText, color: colors.success },
    { label: 'Grid Status', value: 'Online', icon: Globe, color: colors.success },
    { label: 'Compute Load', value: '42%', icon: Activity, color: colors.warning },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>System Matrix</Text>
          <Text style={styles.subtitle}>Global infrastructure & governance</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <View style={styles.statRow}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '12' }]}>
                  <stat.icon size={24} color={stat.color} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Admin Panels */}
        {[
          { title: 'Security Hardening', sub: 'RBAC & Governance Protocol', icon: ShieldCheck, color: colors.primary },
          { title: 'Global Parameters', sub: 'Geospatial Enforcement', icon: Settings, color: colors.accent },
          { title: 'Attendance Lifecycle', sub: 'Automated Operations', icon: Activity, color: colors.warning },
        ].map((panel, i) => (
          <TouchableOpacity key={i} style={styles.panelCard} activeOpacity={0.7}>
            <View style={[styles.panelIcon, { backgroundColor: panel.color }]}>
              <panel.icon size={24} color={colors.white} />
            </View>
            <View style={styles.panelText}>
              <Text style={styles.panelTitle}>{panel.title}</Text>
              <Text style={styles.panelSub}>{panel.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Critical Lockdown Card */}
        <View style={styles.lockdownCard}>
          <View style={styles.lockdownHeader}>
            <Zap size={24} color="#F59E0B" />
            <Text style={styles.lockdownTitle}>Critical Lockdown</Text>
          </View>
          <Text style={styles.lockdownDesc}>
            Override system access, force session terminations, or deploy global MFA requirements.
          </Text>
          <TouchableOpacity style={styles.lockdownBtn}>
            <Text style={styles.lockdownBtnText}>DEPLOY MFA</Text>
          </TouchableOpacity>
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
    width: '47%', backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.base,
    borderWidth: 1, borderColor: colors.border, ...shadows.sm,
  },
  statLabel: {
    fontSize: typography.size.xs, fontFamily: typography.fontFamily.black,
    color: colors.slate400, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: spacing.md,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statValue: {
    fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black,
  },
  statIcon: {
    width: 44, height: 44, borderRadius: radius.xl, justifyContent: 'center', alignItems: 'center',
  },
  panelCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border, ...shadows.sm, gap: spacing.md,
  },
  panelIcon: {
    width: 48, height: 48, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center',
    ...shadows.md,
  },
  panelText: { flex: 1 },
  panelTitle: {
    fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800,
  },
  panelSub: {
    fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 2,
  },
  lockdownCard: {
    backgroundColor: colors.slate900, borderRadius: radius['2xl'], padding: spacing.xl,
    marginTop: spacing.md, ...shadows.lg,
  },
  lockdownHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  lockdownTitle: {
    fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.white,
    fontStyle: 'italic',
  },
  lockdownDesc: {
    fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.slate400,
    lineHeight: 20,
  },
  lockdownBtn: {
    backgroundColor: colors.white, borderRadius: radius.lg, paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl, alignSelf: 'flex-start', marginTop: spacing.lg,
  },
  lockdownBtnText: {
    fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate900,
    letterSpacing: 2,
  },
});
