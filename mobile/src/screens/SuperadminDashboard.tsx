import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Switch, Alert, TextInput, Modal, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  ShieldCheck, Settings, Globe, Activity, Users, FileText, Zap,
  ChevronDown, ChevronUp, MapPin, Clock, ShieldAlert, X, Save
} from 'lucide-react-native';

export default function SuperadminDashboard() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [userCount, setUserCount] = useState(0);
  const [roles, setRoles] = useState<any[]>([]);
  const [matrices, setMatrices] = useState<any[]>([]);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [geofence, setGeofence] = useState<any>(null);
  const [resetRequests, setResetRequests] = useState<any[]>([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgSettings, setOrgSettings] = useState<any>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [overviewRes, usersRes, rolesRes, matRes, geoRes, resetRes, orgRes] = await Promise.allSettled([
        api.get('/attendance/overview'),
        api.get('/users'),
        api.get('/permissions/roles'),
        api.get('/permissions/matrix'),
        api.get('/geofence'),
        api.get('/auth/reset-requests').catch(() => ({ data: { requests: [] } })),
        api.get('/organization/settings'),
      ]);
      if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.success) setOverview(overviewRes.value.data);
      if (usersRes.status === 'fulfilled' && usersRes.value.data?.success) setUserCount(usersRes.value.data.users?.length || 0);
      if (rolesRes.status === 'fulfilled' && rolesRes.value.data?.success) setRoles(rolesRes.value.data.roles || []);
      if (matRes.status === 'fulfilled' && Array.isArray(matRes.value.data?.data)) setMatrices(matRes.value.data.data);
      if (geoRes.status === 'fulfilled' && geoRes.value.data?.success) setGeofence(geoRes.value.data.geofence);
      if (resetRes.status === 'fulfilled') setResetRequests(resetRes.value.data?.requests || []);
      if (orgRes.status === 'fulfilled' && orgRes.value.data?.success) setOrgSettings(orgRes.value.data.organization);
    } catch (e) { }
    setLoading(false);
  };

  const onRefresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  const handleTogglePerm = async (roleId: string, permKey: string, value: boolean) => {
    try {
      await api.put(`/permissions/matrix/${roleId}`, { [permKey]: value });
      fetchAll();
    } catch (e) { Alert.alert('Error', 'Failed to update permission'); }
  };

  const handleResetAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      await api.post(`/auth/reset-requests/${userId}/${action}`);
      Alert.alert('Success', `Request ${action}d`);
      fetchAll();
    } catch (e) { Alert.alert('Error', 'Action failed'); }
  };

  const attendanceRate = overview ? Math.round((overview.present / Math.max(overview.total, 1)) * 100) : 0;

  const stats = [
    { label: 'Active Nodes', value: String(userCount), icon: Users, color: colors.primary },
    { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: Activity, color: colors.success },
    { label: 'Grid Status', value: 'Online', icon: Globe, color: colors.success },
    { label: 'On Leave', value: String(overview?.onLeave || 0), icon: FileText, color: colors.warning },
  ];

  if (loading) return (
    <SafeAreaView style={s.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[s.subtitle, { marginTop: spacing.base }]}>Loading System Matrix...</Text>
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
          <Text style={s.title}>System Matrix</Text>
          <Text style={s.subtitle}>Global infrastructure & governance</Text>
        </View>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statLabel}>{stat.label}</Text>
              <View style={s.statRow}>
                <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                <View style={[s.statIcon, { backgroundColor: stat.color + '12' }]}>
                  <stat.icon size={24} color={stat.color} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Org Settings Button */}
        <TouchableOpacity style={s.panelCard} onPress={() => setShowOrgModal(true)} activeOpacity={0.7}>
          <View style={[s.panelIcon, { backgroundColor: colors.secondary }]}>
            <Settings size={24} color={colors.white} />
          </View>
          <View style={s.panelText}>
            <Text style={s.panelTitle}>Organization Settings</Text>
            <Text style={s.panelSub}>{orgSettings?.name || 'Configure'}</Text>
          </View>
        </TouchableOpacity>

        {/* Geofence Settings Summary */}
        <TouchableOpacity style={s.panelCard} activeOpacity={0.7}>
          <View style={[s.panelIcon, { backgroundColor: colors.accent }]}>
            <MapPin size={24} color={colors.white} />
          </View>
          <View style={s.panelText}>
            <Text style={s.panelTitle}>Geofence Settings</Text>
            <Text style={s.panelSub}>
              {geofence ? `Radius: ${geofence.radius}m` : 'Not configured'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* RBAC - Permission Matrix */}
        <View style={s.sectionHeader}>
          <ShieldCheck size={22} color={colors.primary} />
          <Text style={s.sectionTitle}>Security Hardening</Text>
        </View>
        <Text style={s.sectionSub}>RBAC & Governance Protocol</Text>

        {roles.map((role: any) => {
          const isExpanded = expandedRole === role._id;
          const matrix = matrices?.find((m: any) => m.roleId === role._id);
          return (
            <View key={role._id} style={s.roleCard}>
              <TouchableOpacity style={s.roleHeader} onPress={() => setExpandedRole(isExpanded ? null : role._id)}>
                <View style={s.roleLeft}>
                  <View style={[s.roleIconWrap, { backgroundColor: colors.primary + '12' }]}>
                    <ShieldCheck size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={s.roleName}>{role.name}</Text>
                    <Text style={s.roleDesc}>{role.description || 'Custom role'}</Text>
                  </View>
                </View>
                {isExpanded ? <ChevronUp size={20} color={colors.slate400} /> : <ChevronDown size={20} color={colors.slate400} />}
              </TouchableOpacity>
              {isExpanded && matrix?.permissions && (
                <View style={s.permsList}>
                  {Object.entries(matrix.permissions).map(([key, value]: [string, any]) => (
                    <View key={key} style={s.permRow}>
                      <Text style={s.permLabel}>{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</Text>
                      <Switch
                        value={!!value}
                        onValueChange={(v) => handleTogglePerm(role._id, key, v)}
                        trackColor={{ false: colors.slate200, true: colors.primary + '40' }}
                        thumbColor={value ? colors.primary : colors.slate400}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Password Reset Requests */}
        {resetRequests.length > 0 && (
          <>
            <View style={[s.sectionHeader, { marginTop: spacing.xl }]}>
              <ShieldAlert size={22} color={colors.destructive} />
              <Text style={s.sectionTitle}>Reset Requests</Text>
            </View>
            {resetRequests.map((req: any, i: number) => (
              <View key={i} style={s.resetCard}>
                <Text style={s.resetName}>{req.name || req.email}</Text>
                <Text style={s.resetEmail}>{req.email}</Text>
                <View style={s.resetActions}>
                  <TouchableOpacity style={s.approveBtn} onPress={() => handleResetAction(req._id, 'approve')}>
                    <Text style={s.approveBtnText}>APPROVE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.rejectBtn} onPress={() => handleResetAction(req._id, 'reject')}>
                    <Text style={s.rejectBtnText}>REJECT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Critical Lockdown Card */}
        <View style={s.lockdownCard}>
          <View style={s.lockdownHeader}>
            <Zap size={24} color="#F59E0B" />
            <Text style={s.lockdownTitle}>Critical Lockdown</Text>
          </View>
          <Text style={s.lockdownDesc}>
            Override system access, force session terminations, or deploy global MFA requirements.
          </Text>
          <TouchableOpacity style={s.lockdownBtn}>
            <Text style={s.lockdownBtnText}>DEPLOY MFA</Text>
          </TouchableOpacity>
        </View>

        {/* Org Settings Modal */}
        <Modal visible={showOrgModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={s.modalContainer}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Organization Settings</Text>
              <TouchableOpacity onPress={() => setShowOrgModal(false)}>
                <X size={24} color={colors.slate600} />
              </TouchableOpacity>
            </View>
            <ScrollView style={s.modalBody}>
              {orgSettings && (
                <View style={s.modalContent}>
                  <View style={s.modalField}>
                    <Text style={s.modalLabel}>Organization Name</Text>
                    <Text style={s.modalValue}>{orgSettings.name}</Text>
                  </View>
                  <View style={s.modalField}>
                    <Text style={s.modalLabel}>Industry</Text>
                    <Text style={s.modalValue}>{orgSettings.industry || 'Not set'}</Text>
                  </View>
                  <View style={s.modalField}>
                    <Text style={s.modalLabel}>Address</Text>
                    <Text style={s.modalValue}>{orgSettings.address || 'Not set'}</Text>
                  </View>
                  <View style={s.modalField}>
                    <Text style={s.modalLabel}>Contact Email</Text>
                    <Text style={s.modalValue}>{orgSettings.contactEmail || orgSettings.email || 'Not set'}</Text>
                  </View>
                  <View style={s.modalField}>
                    <Text style={s.modalLabel}>Status</Text>
                    <View style={[s.statusPill, { backgroundColor: orgSettings.isActive !== false ? colors.success + '15' : colors.destructive + '15' }]}>
                      <Text style={[s.statusText, { color: orgSettings.isActive !== false ? colors.success : colors.destructive }]}>
                        {orgSettings.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </ScrollView>
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
  statLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: spacing.md },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statValue: { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black },
  statIcon: { width: 44, height: 44, borderRadius: radius.xl, justifyContent: 'center', alignItems: 'center' },
  panelCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm, gap: spacing.md },
  panelIcon: { width: 48, height: 48, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', ...shadows.md },
  panelText: { flex: 1 },
  panelTitle: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  panelSub: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.xs },
  sectionTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  sectionSub: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.base },
  roleCard: { backgroundColor: colors.white, borderRadius: radius.xl, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  roleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.base },
  roleLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  roleIconWrap: { width: 40, height: 40, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
  roleName: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800, textTransform: 'capitalize' },
  roleDesc: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: 2 },
  permsList: { borderTopWidth: 1, borderTopColor: colors.slate50, paddingHorizontal: spacing.base, paddingBottom: spacing.base },
  permRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  permLabel: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate600, textTransform: 'capitalize', flex: 1 },
  resetCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  resetName: { fontSize: typography.size.md, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  resetEmail: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate400, marginTop: 2 },
  resetActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  approveBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.base },
  approveBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1 },
  rejectBtn: { backgroundColor: colors.destructive + '15', borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.base },
  rejectBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.destructive, letterSpacing: 1 },
  lockdownCard: { backgroundColor: colors.slate900, borderRadius: radius['2xl'], padding: spacing.xl, marginTop: spacing.lg, ...shadows.lg },
  lockdownHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  lockdownTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.white, fontStyle: 'italic' },
  lockdownDesc: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.slate400, lineHeight: 20 },
  lockdownBtn: { backgroundColor: colors.white, borderRadius: radius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, alignSelf: 'flex-start', marginTop: spacing.lg },
  lockdownBtnText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: 2 },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  modalBody: { flex: 1 },
  modalContent: { padding: spacing.base },
  modalField: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  modalLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  modalValue: { fontSize: typography.size.md, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  statusPill: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4, alignSelf: 'flex-start' },
  statusText: { fontSize: 10, fontFamily: typography.fontFamily.black, letterSpacing: 1 },
});
