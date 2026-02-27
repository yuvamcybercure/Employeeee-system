import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Switch, Alert, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Settings, Bell, Shield, Palette, Clock, Globe, Save } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user } = useAuth();
  const isAdmin = ['admin', 'superadmin', 'master-admin'].includes(user?.role || '');
  const [settings, setSettings] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [orgName, setOrgName] = useState('');
  const [autoClockOut, setAutoClockOut] = useState(false);
  const [clockOutTime, setClockOutTime] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/organization/settings');
      if (data.success) {
        const s = data.settings || {};
        setSettings(s);
        setOrgName(s.organizationName || '');
        setAutoClockOut(s.attendance?.autoClockOut || false);
        setClockOutTime(s.attendance?.clockOutTime || '18:00');
        setPrimaryColor(s.branding?.primaryColor || colors.primary);
      }
    } catch (e) { }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        organizationName: orgName,
        attendance: { autoClockOut, clockOutTime },
        branding: { primaryColor }
      };
      const { data } = await api.put('/organization/settings', payload);
      if (data.success) {
        Alert.alert('Success', 'Settings updated');
        fetchData();
      }
    } catch (e) { Alert.alert('Error', 'Failed to save settings'); }
    setSaving(false);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Settings</Text>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={colors.white} /> : <Save size={18} color={colors.white} />}
          <Text style={s.saveBtnText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Preferences</Text>
          <View style={s.row}>
            <View style={s.rowInfo}>
              <Bell size={20} color={colors.slate400} />
              <Text style={s.rowLabel}>Push Notifications</Text>
            </View>
            <Switch value={true} trackColor={{ false: colors.slate200, true: colors.primary + '40' }} thumbColor={colors.primary} />
          </View>
          <View style={s.row}>
            <View style={s.rowInfo}>
              <Shield size={20} color={colors.slate400} />
              <Text style={s.rowLabel}>Biometric Sign-in</Text>
            </View>
            <Switch value={false} trackColor={{ false: colors.slate200, true: colors.primary + '40' }} />
          </View>
        </View>

        {/* Organization Section (Admin Only) */}
        {isAdmin && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Organization Controls</Text>

            <Text style={s.label}>Organization Name</Text>
            <TextInput style={s.input} value={orgName} onChangeText={setOrgName} placeholder="Company Name" />

            <View style={s.divider} />

            <View style={s.row}>
              <View style={s.rowInfo}>
                <Clock size={20} color={colors.slate400} />
                <View>
                  <Text style={s.rowLabel}>Auto Clock-Out</Text>
                  <Text style={s.rowSub}>Automatically end shifts</Text>
                </View>
              </View>
              <Switch
                value={autoClockOut}
                onValueChange={setAutoClockOut}
                trackColor={{ false: colors.slate200, true: colors.primary + '40' }}
                thumbColor={autoClockOut ? colors.primary : colors.white}
              />
            </View>

            {autoClockOut && (
              <View style={s.subRow}>
                <Text style={s.label}>Clock-Out Time (24h format)</Text>
                <TextInput style={s.input} value={clockOutTime} onChangeText={setClockOutTime} placeholder="18:00" />
              </View>
            )}

            <View style={s.divider} />

            <Text style={s.label}>Brand Primary Color</Text>
            <View style={s.colorRow}>
              <TextInput style={[s.input, { flex: 1 }]} value={primaryColor} onChangeText={setPrimaryColor} placeholder="#4F46E5" />
              <View style={[s.colorPreview, { backgroundColor: primaryColor || colors.primary }]} />
            </View>
          </View>
        )}

        <View style={s.footer}>
          <Text style={s.versionText}>Application Version 1.2.0 (Build 42)</Text>
          <Text style={s.copyright}>© 2025 Antigravity Enterprise. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -1 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.slate900, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.lg, ...shadows.md },
  saveBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1 },
  scroll: { paddingBottom: spacing['4xl'] },
  section: { backgroundColor: colors.white, marginTop: spacing.lg, padding: spacing.base, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  rowInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  rowLabel: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  rowSub: { fontSize: 10, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: 2 },
  subRow: { marginTop: spacing.md, paddingLeft: 36 },
  label: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: spacing.md },
  input: { backgroundColor: colors.slate50, borderRadius: radius.lg, padding: spacing.md, fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.slate900, borderWidth: 1, borderColor: colors.border },
  divider: { height: 1, backgroundColor: colors.slate50, marginVertical: spacing.md },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  colorPreview: { width: 44, height: 44, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  footer: { padding: spacing['2xl'], alignItems: 'center' },
  versionText: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
  copyright: { fontSize: 9, fontFamily: typography.fontFamily.medium, color: colors.slate300, marginTop: 4 },
});
