import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Building2, Clock, Palette, Save, ArrowLeft } from 'lucide-react-native';

const TABS = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'branding', label: 'Branding', icon: Palette },
];

export default function SettingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [org, setOrg] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => { fetchOrg(); }, []);

  const fetchOrg = async () => {
    try {
      if (user?.organizationId) {
        const { data } = await api.get(`/org/${user.organizationId}`);
        if (data.success || data.organization) {
          const o = data.organization || data;
          setOrg(o);
          setForm(o);
        }
      }
    } catch (e) {}
  };

  const onRefresh = async () => { setRefreshing(true); await fetchOrg(); setRefreshing(false); };

  const handleUpdate = async () => {
    try {
      const { data } = await api.put(`/org/${user?.organizationId}`, form);
      if (data.success) Alert.alert('Success', 'Settings updated!');
    } catch (e) { Alert.alert('Error', 'Update failed'); }
  };

  const isAdmin = ['admin', 'superadmin', 'master-admin'].includes(user?.role || '');

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ArrowLeft size={24} color={colors.slate900} />
        </TouchableOpacity>
        <Text style={s.title}>Settings</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabScroll} contentContainerStyle={s.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.id} style={[s.tab, activeTab === tab.id && s.tabActive]} onPress={() => setActiveTab(tab.id)}>
            <tab.icon size={14} color={activeTab === tab.id ? colors.white : colors.slate500} />
            <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* General */}
        {activeTab === 'general' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Organization Details</Text>
            <View style={s.formCard}>
              <View style={s.field}>
                <Text style={s.label}>Organization Name</Text>
                <TextInput style={s.input} value={form.name || ''} onChangeText={v => setForm({ ...form, name: v })} editable={isAdmin} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Address</Text>
                <TextInput style={s.input} value={form.address || ''} onChangeText={v => setForm({ ...form, address: v })} editable={isAdmin} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Phone</Text>
                <TextInput style={s.input} value={form.phone || ''} onChangeText={v => setForm({ ...form, phone: v })} keyboardType="phone-pad" editable={isAdmin} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Website</Text>
                <TextInput style={s.input} value={form.website || ''} onChangeText={v => setForm({ ...form, website: v })} editable={isAdmin} />
              </View>
            </View>
          </View>
        )}

        {/* Attendance */}
        {activeTab === 'attendance' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Attendance Configuration</Text>
            <View style={s.formCard}>
              <View style={s.field}>
                <Text style={s.label}>Work Start Time</Text>
                <TextInput style={s.input} value={form.attendanceSettings?.workStartTime || '09:00'} onChangeText={v => setForm({ ...form, attendanceSettings: { ...form.attendanceSettings, workStartTime: v } })} editable={isAdmin} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Work End Time</Text>
                <TextInput style={s.input} value={form.attendanceSettings?.workEndTime || '18:00'} onChangeText={v => setForm({ ...form, attendanceSettings: { ...form.attendanceSettings, workEndTime: v } })} editable={isAdmin} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Late Threshold (mins)</Text>
                <TextInput style={s.input} value={String(form.attendanceSettings?.lateThresholdMinutes || 15)} onChangeText={v => setForm({ ...form, attendanceSettings: { ...form.attendanceSettings, lateThresholdMinutes: Number(v) } })} keyboardType="numeric" editable={isAdmin} />
              </View>
            </View>
          </View>
        )}

        {/* Branding */}
        {activeTab === 'branding' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Organization Branding</Text>
            <View style={s.formCard}>
              {org?.logo && (
                <View style={s.logoPreview}>
                  <Image source={{ uri: org.logo }} style={s.logoImg} resizeMode="contain" />
                </View>
              )}
              <View style={s.field}>
                <Text style={s.label}>Primary Color</Text>
                <TextInput style={s.input} value={form.brandColor || '#3346D3'} onChangeText={v => setForm({ ...form, brandColor: v })} editable={isAdmin} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Tagline</Text>
                <TextInput style={s.input} value={form.tagline || ''} onChangeText={v => setForm({ ...form, tagline: v })} editable={isAdmin} />
              </View>
            </View>
          </View>
        )}

        {isAdmin && (
          <TouchableOpacity style={s.saveBtn} onPress={handleUpdate}>
            <Save size={16} color={colors.white} />
            <Text style={s.saveBtnText}>SAVE CHANGES</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.base, paddingTop: spacing.base },
  title: { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -0.5 },
  tabScroll: { marginTop: spacing.base },
  tabRow: { paddingHorizontal: spacing.base, gap: spacing.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.xl, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.slate900, borderColor: colors.slate900 },
  tabText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate500, textTransform: 'uppercase', letterSpacing: 1 },
  tabTextActive: { color: colors.white },
  scroll: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate800, marginBottom: spacing.base },
  formCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  field: { marginBottom: spacing.base },
  label: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  input: { backgroundColor: colors.slate50, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
  logoPreview: { alignItems: 'center', marginBottom: spacing.base },
  logoImg: { width: 120, height: 60, borderRadius: radius.md },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.base, ...shadows.xl },
  saveBtnText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
});
