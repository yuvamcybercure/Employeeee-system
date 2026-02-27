import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Switch, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { Shield, ChevronDown, ChevronRight, Lock, Unlock, CheckSquare } from 'lucide-react-native';

export default function PermissionsScreen() {
  const [roles, setRoles] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { fetchPermissions(); }, []);

  const fetchPermissions = async () => {
    try {
      const [rolesRes, matrixRes] = await Promise.all([
        api.get('/permissions/roles'),
        api.get('/permissions/matrix'),
      ]);
      if (rolesRes.data.success) {
        setRoles(rolesRes.data.roles || []);
        if (rolesRes.data.roles?.length > 0) {
          setSelectedRole(rolesRes.data.roles[0]);
        }
      }
      if (matrixRes.data.success) setMatrix(matrixRes.data.matrix);
    } catch (e) { }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchPermissions(); setRefreshing(false); };

  const togglePermission = async (module: string, action: string) => {
    if (!selectedRole) return;
    const key = `${module}-${action}`;
    setUpdating(key);
    try {
      const current = matrix[selectedRole.key]?.[module]?.[action] || false;
      const { data } = await api.put('/permissions/matrix', {
        role: selectedRole.key,
        module,
        action,
        value: !current
      });
      if (data.success) {
        setMatrix(data.matrix);
      }
    } catch (e) { Alert.alert('Error', 'Update failed'); }
    setUpdating(null);
  };

  const modules = matrix && selectedRole ? Object.keys(matrix[selectedRole.key] || {}) : [];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Security</Text>
        <Text style={s.subtitle}>Role-Based Access Control</Text>
      </View>

      {/* Role Picker */}
      <View style={s.roleBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.roleRow}>
          {roles.map(role => (
            <TouchableOpacity
              key={role._id}
              style={[s.roleTab, selectedRole?._id === role._id && s.roleTabActive]}
              onPress={() => setSelectedRole(role)}
            >
              <Text style={[s.roleTabText, selectedRole?._id === role._id && s.roleTabTextActive]}>
                {role.name?.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.infoCard}>
          <Shield size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={s.infoTitle}>Matrix Management</Text>
            <Text style={s.infoSub}>Grant permissions for {selectedRole?.name} across system modules.</Text>
          </View>
        </View>

        {modules.map(module => (
          <View key={module} style={s.moduleSection}>
            <View style={s.moduleHeader}>
              <Text style={s.moduleTitle}>{module.charAt(0).toUpperCase() + module.slice(1)}</Text>
              <Lock size={14} color={colors.slate300} />
            </View>
            <View style={s.actionGrid}>
              {Object.keys(matrix[selectedRole.key][module]).map(action => {
                const isActive = matrix[selectedRole.key][module][action];
                const key = `${module}-${action}`;
                const isUpdating = updating === key;
                return (
                  <TouchableOpacity
                    key={action}
                    style={[s.actionCard, isActive && s.actionCardActive]}
                    onPress={() => togglePermission(module, action)}
                    disabled={isUpdating}
                  >
                    <View style={s.actionInfo}>
                      <Text style={[s.actionLabel, isActive && s.actionLabelActive]}>{action.toUpperCase()}</Text>
                      {isUpdating ? <ActivityIndicator size="small" color={isActive ? colors.white : colors.primary} /> :
                        <Switch
                          value={isActive}
                          onValueChange={() => togglePermission(module, action)}
                          trackColor={{ false: colors.slate200, true: 'rgba(255,255,255,0.4)' }}
                          thumbColor={isActive ? colors.white : colors.slate300}
                          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                      }
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {modules.length === 0 && !refreshing && (
          <View style={s.empty}><Shield size={48} color={colors.slate100} /><Text style={s.emptyText}>Loading matrix data...</Text></View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.base, backgroundColor: colors.white },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -1 },
  subtitle: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 },
  roleBar: { backgroundColor: colors.white, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  roleRow: { paddingHorizontal: spacing.base, gap: spacing.sm },
  roleTab: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.slate50, borderWidth: 1, borderColor: colors.border },
  roleTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleTabText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate500, letterSpacing: 1 },
  roleTabTextActive: { color: colors.white },
  scroll: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  infoCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.xl, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  infoTitle: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  infoSub: { fontSize: 10, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: 2 },
  moduleSection: { marginBottom: spacing.xl },
  moduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, paddingHorizontal: 4 },
  moduleTitle: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: 0.5 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionCard: { width: '48%', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  actionCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionLabel: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.slate500, letterSpacing: 0.5 },
  actionLabelActive: { color: colors.white },
  empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate300, marginTop: spacing.base },
});
