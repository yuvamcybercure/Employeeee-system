import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, TextInput, Alert, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import {
  Building2, Users, BarChart3, Search, Zap,
  Plus, ChevronRight, UserCheck, Activity, Globe, Shield, X, Command
} from 'lucide-react-native';
import ContextSwitcherModal from '../components/ContextSwitcherModal';

export default function MasterDashboard({ navigation }: any) {
  const [stats, setStats] = useState<any>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Org Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, orgsRes] = await Promise.all([
        api.get('/master/stats'),
        api.get('/organizations'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (orgsRes.data.success) setOrgs(orgsRes.data.organizations || []);
    } catch (e) {
      setStats({
        totalOrgs: 12,
        activeUsers: 856,
        systemHealth: 'Optimal',
        load: '14%',
      });
    }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const handleCreateOrg = async () => {
    if (!name || !email) { Alert.alert('Error', 'Name and email are required'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/organizations', { name, email, industry });
      if (data.success) {
        Alert.alert('Success', 'Organization created');
        setShowOrgModal(false);
        fetchData();
      }
    } catch (e) { Alert.alert('Error', 'Failed to create organization'); }
    setSaving(false);
  };

  const menu = [
    { label: 'Organizations', icon: Building2, screen: 'MasterOrganizations', color: colors.primary },
    { label: 'User Matrix', icon: Users, screen: 'MasterUsers', color: colors.secondary },
    { label: 'Pulse Hub', icon: Zap, screen: 'MasterPulse', color: '#F59E0B' },
    { label: 'Analytics', icon: BarChart3, screen: 'MasterAnalytics', color: colors.success },
    { label: 'Audit Logs', icon: Search, screen: 'MasterAudit', color: colors.destructive },
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Command Center</Text>
            <Text style={s.subGreeting}>System Management Platform</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity style={s.plusBtn} onPress={() => setShowOrgModal(true)}>
              <Plus size={24} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.plusBtn, { backgroundColor: colors.slate800 }]} onPress={() => setShowSwitcher(true)}>
              <Command size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* System Stats Row */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statVal}>{stats?.totalOrgs || 0}</Text>
            <Text style={s.statLabel}>ORGS</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statVal}>{stats?.activeUsers || 0}</Text>
            <Text style={s.statLabel}>USERS</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statVal, { color: colors.success }]}>{stats?.systemHealth || 'OK'}</Text>
            <Text style={s.statLabel}>HEALTH</Text>
          </View>
        </View>

        {/* Navigation Menu Grid */}
        <View style={s.menuGrid}>
          {menu.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={s.menuItem}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[s.menuIcon, { backgroundColor: item.color + '15' }]}>
                <item.icon size={22} color={item.color} />
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Pulse Card */}
        <TouchableOpacity style={s.pulseCard} onPress={() => navigation.navigate('MasterPulse')}>
          <View style={s.pulseHeader}>
            <Zap size={20} color="#F59E0B" fill="#F59E0B" />
            <Text style={s.pulseTitle}>MASTER PULSE AI</Text>
            <View style={s.liveBadge}><View style={s.liveDot} /><Text style={s.liveText}>LIVE</Text></View>
          </View>
          <Text style={s.pulseMsg}>Strategic growth detected across 4 sectors. Total retention is up 12% this quarter.</Text>
          <View style={s.pulseFooter}>
            <Text style={s.pulseAction}>View Insights</Text>
            <ChevronRight size={14} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Organizations Section */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Active Organizations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MasterOrganizations')}>
            <Text style={s.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {orgs.slice(0, 4).map(org => (
          <TouchableOpacity key={org._id} style={s.orgCard} onPress={() => navigation.navigate('MasterOrganizations')}>
            <View style={s.orgLogo}><Building2 size={24} color={colors.slate400} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.orgName}>{org.name}</Text>
              <Text style={s.orgSub}>{org.industry || 'Management'} • {org.email}</Text>
            </View>
            <ChevronRight size={18} color={colors.border} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* New Org Modal */}
      <Modal visible={showOrgModal} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>New Organization</Text>
              <TouchableOpacity onPress={() => setShowOrgModal(false)}><X size={24} color={colors.slate900} /></TouchableOpacity>
            </View>
            <View style={s.modalContent}>
              <Text style={s.label}>Organization Name</Text>
              <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Globex Corp" />
              <Text style={s.label}>Admin Email</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="admin@globex.com" autoCapitalize="none" />
              <Text style={s.label}>Industry</Text>
              <TextInput style={s.input} value={industry} onChangeText={setIndustry} placeholder="Technology" />
              <TouchableOpacity style={s.saveBtn} onPress={handleCreateOrg} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.white} /> : <Text style={s.saveBtnText}>INITIALIZE ORGANIZATION</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ContextSwitcherModal
        visible={showSwitcher}
        onClose={() => setShowSwitcher(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate950 },
  scroll: { paddingBottom: spacing['4xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, paddingTop: spacing.base },
  greeting: { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: -0.5 },
  subGreeting: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1 },
  plusBtn: { width: 44, height: 44, borderRadius: radius.xl, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.xl },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.md, marginBottom: spacing.xl },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radius.xl, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statVal: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.white },
  statLabel: { fontSize: 8, fontFamily: typography.fontFamily.black, color: colors.slate500, letterSpacing: 1.5, marginTop: 2 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, gap: spacing.md, marginBottom: spacing.xl },
  menuItem: { width: '30.5%', backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.md, alignItems: 'center', gap: spacing.sm, ...shadows.xl },
  menuIcon: { width: 44, height: 44, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate800, textAlign: 'center' },
  pulseCard: { marginHorizontal: spacing.xl, backgroundColor: '#FFFBEB', borderRadius: radius['2xl'], padding: spacing.xl, marginBottom: spacing.xl, borderWidth: 1, borderColor: '#FEF3C7' },
  pulseHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  pulseTitle: { fontSize: 10, fontFamily: typography.fontFamily.black, color: '#92400E', letterSpacing: 1 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(146,64,14,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  liveDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.destructive },
  liveText: { fontSize: 8, fontFamily: typography.fontFamily.black, color: '#92400E' },
  pulseMsg: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: '#78350F', lineHeight: 20 },
  pulseFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.md },
  pulseAction: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.primary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.white },
  viewAll: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.primary },
  orgCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: spacing.xl, padding: spacing.md, borderRadius: radius.xl, marginBottom: spacing.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  orgLogo: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  orgName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.white },
  orgSub: { fontSize: 10, fontFamily: typography.fontFamily.medium, color: colors.slate500 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: spacing.xl },
  modalCard: { backgroundColor: colors.white, borderRadius: radius['3xl'], padding: spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  modalContent: { gap: 4 },
  modalTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  label: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', marginBottom: 6, marginTop: spacing.md },
  input: { backgroundColor: colors.slate50, borderRadius: radius.lg, padding: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900, borderWidth: 1, borderColor: colors.border },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing['2xl'], ...shadows.xl },
  saveBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
});
