import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, FolderOpen, ClipboardList, Users, Shield,
  DollarSign, Package, Lightbulb, FileText, ChevronRight,
  Activity, Building2, BarChart3, Search, Zap, Box, Globe
} from 'lucide-react-native';

export default function MoreScreen({ navigation }: any) {
  const { user } = useAuth();
  const isAdmin = ['admin', 'superadmin', 'master-admin'].includes(user?.role || '');
  const isMaster = user?.role === 'master-admin';

  const items = [
    { label: 'Leaves', sub: 'Request & track leaves', icon: Calendar, color: colors.success, screen: 'Leaves' },
    { label: 'Projects', sub: 'View assigned projects', icon: FolderOpen, color: colors.primary, screen: 'Projects' },
    { label: 'Timesheets', sub: 'Log your work hours', icon: ClipboardList, color: colors.secondary, screen: 'Timesheets' },
    { label: 'Assets', sub: 'Company equipment & devices', icon: Package, color: colors.info, screen: 'Assets' },
    { label: 'Documents', sub: 'Certificates & ID cards', icon: FileText, color: colors.success, screen: 'Documents' },
    { label: 'Policies', sub: 'Organization policies', icon: Shield, color: colors.accent, screen: 'Policies' },
    { label: 'Suggestions', sub: 'Ideas & feedback', icon: Lightbulb, color: '#F59E0B', screen: 'Suggestions' },
    ...(isAdmin ? [
      { label: 'Finance', sub: 'Payroll, invoices & expenses', icon: DollarSign, color: colors.success, screen: 'Finance' },
      { label: 'Users', sub: 'Manage employees', icon: Users, color: colors.primary, screen: 'Users' },
      { label: 'Permissions', sub: 'Role-based access control', icon: Shield, color: colors.destructive, screen: 'Permissions' },
      { label: 'Activity Logs', sub: 'System event log', icon: Activity, color: colors.slate600, screen: 'Logs' },
      { label: 'Asset Inventory', sub: 'Manage company equipment', icon: Box, color: colors.info, screen: 'AssetInventory' },
      { label: 'Geofence Settings', sub: 'Set office location', icon: Globe, color: '#f59e0b', screen: 'GeofenceSettings' },
      { label: 'Org Settings', sub: 'Global configuration', icon: Building2, color: colors.slate800, screen: 'OrgSettings' },
      { label: 'Reset Requests', sub: 'Password approvals', icon: Shield, color: colors.destructive, screen: 'AdminResetRequests' },
    ] : []),
    ...(isMaster ? [
      { label: 'Organizations', sub: 'Multi-org management', icon: Building2, color: '#7C3AED', screen: 'MasterOrganizations' },
      { label: 'User Matrix', sub: 'Cross-org user overview', icon: Users, color: '#0284C7', screen: 'MasterUsers' },
      { label: 'Analytics Hub', sub: 'Organization-wide metrics', icon: BarChart3, color: '#059669', screen: 'Analytics' },
      { label: 'Audit Stream', sub: 'System-wide event log', icon: Search, color: '#DC2626', screen: 'MasterAudit' },
      { label: 'Master Pulse', sub: 'AI-powered insights', icon: Zap, color: '#F59E0B', screen: 'MasterPulse' },
    ] : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>More</Text>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {items.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.menuCard}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '12' }]}>
              <item.icon size={22} color={item.color} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
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
  title: {
    fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black,
    color: colors.slate900, paddingHorizontal: spacing.base, paddingTop: spacing.base,
    marginBottom: spacing.base, letterSpacing: -0.5,
  },
  scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
  menuCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  menuIcon: {
    width: 48, height: 48, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  menuText: { flex: 1 },
  menuLabel: {
    fontSize: typography.size.md, fontFamily: typography.fontFamily.bold, color: colors.slate800,
  },
  menuSub: {
    fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate400,
    marginTop: 2,
  },
});
