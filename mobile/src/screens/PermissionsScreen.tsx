import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react-native';

export default function PermissionsScreen() {
  const [roles, setRoles] = useState<any[]>([]);
  const [matrices, setMatrices] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, matRes] = await Promise.all([
        api.get('/permissions/roles').catch(() => ({ data: {} })),
        api.get('/permissions/matrix').catch(() => ({ data: {} })),
      ]);
      if (rolesRes.data?.success) setRoles(rolesRes.data.roles || []);
      if (Array.isArray(matRes.data?.data)) setMatrices(matRes.data.data);
    } catch (e) {}
  };

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const handleToggle = async (roleId: string, permKey: string, value: boolean) => {
    try {
      await api.put(`/permissions/matrix/${roleId}`, { [permKey]: value });
      fetchData();
    } catch (e) { Alert.alert('Error', 'Failed to update permission'); }
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>Permissions</Text>
      <Text style={s.subtitle}>Role-Based Access Control</Text>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {roles.map((role: any) => {
          const isExpanded = expandedRole === role._id;
          const matrix = matrices?.find((m: any) => m.roleId === role._id);
          return (
            <View key={role._id} style={s.roleCard}>
              <TouchableOpacity style={s.roleHeader} onPress={() => setExpandedRole(isExpanded ? null : role._id)}>
                <View style={s.roleLeft}>
                  <View style={[s.roleIcon, { backgroundColor: colors.primary + '12' }]}>
                    <Shield size={20} color={colors.primary} />
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
                      <Text style={s.permLabel}>{key.replace(/_/g, ' ')}</Text>
                      <Switch
                        value={!!value}
                        onValueChange={(v) => handleToggle(role._id, key, v)}
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
        {roles.length === 0 && (
          <View style={s.empty}><Shield size={48} color={colors.slate200} /><Text style={s.emptyText}>No roles configured</Text></View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, paddingHorizontal: spacing.base, paddingTop: spacing.base, letterSpacing: -0.5 },
  subtitle: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate500, paddingHorizontal: spacing.base, marginBottom: spacing.base },
  scroll: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  roleCard: { backgroundColor: colors.white, borderRadius: radius.xl, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  roleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.base },
  roleLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  roleIcon: { width: 44, height: 44, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
  roleName: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800, textTransform: 'capitalize' },
  roleDesc: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: 2 },
  permsList: { borderTopWidth: 1, borderTopColor: colors.slate50, paddingHorizontal: spacing.base, paddingBottom: spacing.base },
  permRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  permLabel: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate600, textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
});
