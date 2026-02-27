import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert, RefreshControl, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { Globe, Users, Building2, Activity, Plus, Search, Power, ShieldCheck, Zap, Eye, X } from 'lucide-react-native';

export default function MasterDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, orgsRes] = await Promise.all([
        api.get('/master/stats').catch(() => ({ data: {} })),
        api.get('/master/organizations').catch(() => ({ data: {} })),
      ]);
      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (orgsRes.data?.success) setOrganizations(orgsRes.data.organizations || []);
    } catch (e) {}
    setLoading(false);
  };

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const fetchOrgUsers = async (orgId: string) => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get(`/users?organizationId=${orgId}`);
      if (data.success) setUsers(data.users || []);
    } catch (e) {}
    setLoadingUsers(false);
  };

  const handleImpersonate = async (userId: string) => {
    try {
      const { data } = await api.post('/master/impersonate', { userId });
      if (data.success) Alert.alert('Success', 'Context switched!');
    } catch (e) { Alert.alert('Error', 'Impersonation failed'); }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const { data } = await api.post(`/master/organizations/${id}/toggle`);
      if (data.success) fetchData();
    } catch (e) { Alert.alert('Error', 'Failed to update status'); }
  };

  const filteredOrgs = organizations.filter(o =>
    o.name?.toLowerCase().includes(searchQuery.toLowerCase()) || o.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    { label: 'Global Tenants', value: stats?.totalOrganizations || 0, icon: Building2, color: colors.info },
    { label: 'Platform Users', value: stats?.totalUsers || 0, icon: Users, color: colors.primary },
    { label: 'Active Flux', value: stats?.activeUsers || 0, icon: Activity, color: colors.success },
    { label: 'Monthly ARR', value: `$${stats?.subscriptionRevenue || 0}`, icon: Zap, color: colors.warning },
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>Master Command</Text>
        <Text style={s.subtitle}>Platform-wide infrastructure & governance</Text>

        {/* Stats */}
        <View style={s.statsGrid}>
          {statCards.map((stat, i) => (
            <View key={i} style={s.statCard}>
              <View style={[s.statIcon, { backgroundColor: stat.color + '12' }]}>
                <stat.icon size={24} color={stat.color} />
              </View>
              <Text style={s.statLabel}>{stat.label}</Text>
              <Text style={s.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Search size={16} color={colors.slate400} />
            <TextInput
              style={s.searchInput}
              placeholder="Find organization..."
              placeholderTextColor={colors.slate400}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Organizations */}
        <Text style={s.sectionTitle}>Platform Clients</Text>
        {filteredOrgs.map((org) => (
          <View key={org._id} style={s.orgCard}>
            <View style={s.orgRow}>
              <View style={s.orgAvatar}>
                {org.logo ? <Image source={{ uri: org.logo }} style={s.orgAvatarImg} /> :
                  <Text style={s.orgAvatarText}>{org.name?.[0]}</Text>}
              </View>
              <View style={s.orgInfo}>
                <Text style={s.orgName}>{org.name}</Text>
                <Text style={s.orgSlug}>{org.slug}</Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: org.isActive ? colors.success + '15' : colors.destructive + '15' }]}>
                <View style={[s.statusDot, { backgroundColor: org.isActive ? colors.success : colors.destructive }]} />
                <Text style={[s.statusText, { color: org.isActive ? colors.success : colors.destructive }]}>
                  {org.isActive ? 'Active' : 'Locked'}
                </Text>
              </View>
            </View>
            <View style={s.orgActions}>
              <TouchableOpacity style={s.actionBtnSmall} onPress={() => handleToggleStatus(org._id)}>
                <Power size={16} color={colors.slate400} />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.actionBtnPrimary}
                onPress={() => { setSelectedOrg(org); fetchOrgUsers(org._id); }}
              >
                <Eye size={14} color={colors.white} />
                <Text style={s.actionBtnText}>SWITCH CONTEXT</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* AI Pulse */}
        <View style={s.pulseCard}>
          <Zap size={24} color={colors.primary} />
          <Text style={s.pulseTitle}>Master Pulse</Text>
          <Text style={s.pulseSub}>AI Platform Transformation Engine</Text>
          <Text style={s.pulseDesc}>Enter a natural language command to modify platform architecture or update tenant configurations.</Text>
        </View>
      </ScrollView>

      {/* Switch Context Modal */}
      <Modal visible={!!selectedOrg} transparent animationType="fade" onRequestClose={() => setSelectedOrg(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <View>
                <Text style={s.modalTitle}>Switch: {selectedOrg?.name}</Text>
                <Text style={s.modalSub}>Select an identity to assume</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedOrg(null)}><X size={24} color={colors.slate400} /></TouchableOpacity>
            </View>
            <ScrollView style={s.modalBody}>
              {loadingUsers ? <Text style={s.loadingText}>Scanning users...</Text> :
                users.map(u => (
                  <TouchableOpacity key={u._id} style={s.userCard} onPress={() => handleImpersonate(u._id)}>
                    <View style={s.userAvatar}>
                      {u.profilePhoto ? <Image source={{ uri: u.profilePhoto }} style={s.userAvatarImg} /> :
                        <Text style={s.userAvatarText}>{u.name?.[0]}</Text>}
                    </View>
                    <View style={s.userInfo}>
                      <Text style={s.userCardName}>{u.name}</Text>
                      <View style={[s.roleBadge, { backgroundColor: u.role === 'superadmin' ? '#EEF2FF' : u.role === 'admin' ? '#DBEAFE' : colors.slate100 }]}>
                        <Text style={[s.roleText, { color: u.role === 'superadmin' ? '#4F46E5' : u.role === 'admin' ? '#2563EB' : colors.slate600 }]}>{u.role}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              }
            </ScrollView>
            <Text style={s.modalWarning}>⚠️ All actions while impersonated are logged to your Master Admin account.</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -0.5 },
  subtitle: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate500, marginBottom: spacing.xl },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statCard: { width: '47%', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  statIcon: { width: 48, height: 48, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  statLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.xs },
  statValue: { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.slate900 },
  searchRow: { marginBottom: spacing.base },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.slate50, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 44, gap: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
  sectionTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate800, marginBottom: spacing.base },
  orgCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  orgRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  orgAvatar: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.slate50, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  orgAvatarImg: { width: '100%', height: '100%' },
  orgAvatarText: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate400 },
  orgInfo: { flex: 1 },
  orgName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  orgSlug: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4, gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontFamily: typography.fontFamily.black, textTransform: 'uppercase', letterSpacing: 1 },
  orgActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtnSmall: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  actionBtnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.slate900, borderRadius: radius.md, paddingVertical: spacing.sm, ...shadows.lg },
  actionBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1.5 },
  pulseCard: { backgroundColor: colors.slate900, borderRadius: radius['2xl'], padding: spacing.xl, marginTop: spacing.lg, ...shadows.lg },
  pulseTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.white, marginTop: spacing.md },
  pulseSub: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, fontStyle: 'italic', marginTop: 4 },
  pulseDesc: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.md, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', padding: spacing.base },
  modalContent: { backgroundColor: colors.white, borderRadius: radius['2xl'], maxHeight: '80%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  modalTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  modalSub: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1 },
  modalBody: { padding: spacing.base },
  loadingText: { textAlign: 'center', padding: spacing.xl, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.slate50, borderRadius: radius.xl, marginBottom: spacing.sm },
  userAvatar: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  userAvatarImg: { width: '100%', height: '100%' },
  userAvatarText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.black, color: colors.primary },
  userInfo: { flex: 1 },
  userCardName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  roleBadge: { borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  roleText: { fontSize: 9, fontFamily: typography.fontFamily.black, textTransform: 'uppercase', letterSpacing: 1 },
  modalWarning: { padding: spacing.base, backgroundColor: colors.slate50, fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, textAlign: 'center' },
});
