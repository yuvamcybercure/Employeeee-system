import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Image, TextInput, Modal, Alert, ActivityIndicator, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Users, Search, Plus, X, Mail, Phone, Shield, ChevronDown } from 'lucide-react-native';

const ROLES = ['employee', 'admin', 'superadmin'];

export default function UsersScreen() {
  const { user, hasPermission } = useAuth();
  const isAdmin = ['admin', 'superadmin', 'master-admin'].includes(user?.role || '');
  const [users, setUsers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('employee');
  const [formDept, setFormDept] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [showRolePicker, setShowRolePicker] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      if (data.success) setUsers(data.users || []);
    } catch (e) { }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchUsers(); setRefreshing(false); };

  const openForm = () => {
    setFormName(''); setFormEmail(''); setFormPassword('');
    setFormRole('employee'); setFormDept(''); setFormDesignation('');
    setShowForm(true);
  };

  const handleCreate = async () => {
    if (!formName || !formEmail || !formPassword) { Alert.alert('Error', 'Name, email & password required'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: formName, email: formEmail, password: formPassword,
        role: formRole, department: formDept, designation: formDesignation,
      });
      if (data.success) {
        Alert.alert('Success', 'User created');
        setShowForm(false);
        fetchUsers();
      } else {
        Alert.alert('Error', data.message || 'Failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/users/${userId}/status`, { isActive: !currentStatus });
      fetchUsers();
    } catch (e) { Alert.alert('Error', 'Status update failed'); }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>Users</Text>
        {isAdmin && (
          <TouchableOpacity style={s.addBtn} onPress={openForm} activeOpacity={0.8}>
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Search size={16} color={colors.slate400} />
        <TextInput style={s.searchInput} placeholder="Search users..." placeholderTextColor={colors.slate400} value={search} onChangeText={setSearch} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={s.empty}><Users size={48} color={colors.slate200} /><Text style={s.emptyText}>No users found</Text></View>
        ) : (
          filtered.map((u: any) => (
            <TouchableOpacity key={u._id} style={s.userCard} onPress={() => setShowDetail(u)} activeOpacity={0.7}>
              <View style={s.userRow}>
                {u.profilePhoto ? (
                  <Image source={{ uri: u.profilePhoto }} style={s.avatar} />
                ) : (
                  <View style={s.avatarPlaceholder}>
                    <Text style={s.avatarText}>{u.name?.[0] || 'U'}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={s.userName}>{u.name}</Text>
                  <Text style={s.userSub}>{u.designation || u.role}</Text>
                </View>
                <View style={s.userRight}>
                  <View style={[s.roleBadge, { backgroundColor: u.role === 'admin' ? colors.primary + '15' : u.role === 'superadmin' ? colors.accent + '15' : colors.slate100 }]}>
                    <Text style={[s.roleBadgeText, { color: u.role === 'admin' ? colors.primary : u.role === 'superadmin' ? colors.accent : colors.slate500 }]}>
                      {u.role?.toUpperCase()}
                    </Text>
                  </View>
                  {isAdmin && (
                    <Switch
                      value={u.isActive !== false}
                      onValueChange={() => toggleStatus(u._id, u.isActive !== false)}
                      trackColor={{ false: colors.slate200, true: colors.success + '40' }}
                      thumbColor={u.isActive !== false ? colors.success : colors.slate400}
                      style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add User Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Add User</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}><X size={24} color={colors.slate600} /></TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={s.fieldLabel}>Full Name</Text>
            <TextInput style={s.input} value={formName} onChangeText={setFormName} placeholder="John Doe" placeholderTextColor={colors.slate300} />

            <Text style={s.fieldLabel}>Email</Text>
            <TextInput style={s.input} value={formEmail} onChangeText={setFormEmail} placeholder="john@example.com" placeholderTextColor={colors.slate300} keyboardType="email-address" autoCapitalize="none" />

            <Text style={s.fieldLabel}>Password</Text>
            <TextInput style={s.input} value={formPassword} onChangeText={setFormPassword} placeholder="Password" placeholderTextColor={colors.slate300} secureTextEntry />

            <Text style={s.fieldLabel}>Role</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowRolePicker(!showRolePicker)}>
              <Text style={s.pickerText}>{formRole.charAt(0).toUpperCase() + formRole.slice(1)}</Text>
              <ChevronDown size={18} color={colors.slate400} />
            </TouchableOpacity>
            {showRolePicker && (
              <View style={s.pickerDropdown}>
                {ROLES.map(r => (
                  <TouchableOpacity key={r} style={s.pickerOption} onPress={() => { setFormRole(r); setShowRolePicker(false); }}>
                    <Text style={[s.pickerOptionText, r === formRole && { color: colors.primary, fontFamily: typography.fontFamily.black }]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={s.fieldLabel}>Department</Text>
            <TextInput style={s.input} value={formDept} onChangeText={setFormDept} placeholder="Engineering" placeholderTextColor={colors.slate300} />

            <Text style={s.fieldLabel}>Designation</Text>
            <TextInput style={s.input} value={formDesignation} onChangeText={setFormDesignation} placeholder="Developer" placeholderTextColor={colors.slate300} />

            <TouchableOpacity style={s.saveBtn} onPress={handleCreate} disabled={saving} activeOpacity={0.8}>
              {saving ? <ActivityIndicator color={colors.white} /> : <Text style={s.saveBtnText}>CREATE USER</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* User Detail Modal */}
      <Modal visible={!!showDetail} animationType="slide" transparent>
        <View style={s.detailOverlay}>
          <View style={s.detailCard}>
            <View style={s.detailHeader}>
              <Text style={s.detailTitle}>User Details</Text>
              <TouchableOpacity onPress={() => setShowDetail(null)}><X size={22} color={colors.slate600} /></TouchableOpacity>
            </View>
            {showDetail && (
              <>
                <View style={s.detailRow}><Mail size={16} color={colors.slate400} /><Text style={s.detailText}>{showDetail.email}</Text></View>
                <View style={s.detailRow}><Phone size={16} color={colors.slate400} /><Text style={s.detailText}>{showDetail.phone || 'N/A'}</Text></View>
                <View style={s.detailRow}><Shield size={16} color={colors.slate400} /><Text style={s.detailText}>{showDetail.role}</Text></View>
                <View style={s.detailRow}><Users size={16} color={colors.slate400} /><Text style={s.detailText}>{showDetail.department || 'N/A'}</Text></View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.base, paddingTop: spacing.base, marginBottom: spacing.md },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -0.5 },
  addBtn: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.xl },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.base, marginBottom: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
  scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
  empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
  userCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: radius.lg },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.white },
  userName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  userSub: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400, textTransform: 'capitalize', marginTop: 1 },
  userRight: { alignItems: 'flex-end', gap: spacing.xs },
  roleBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  roleBadgeText: { fontSize: 8, fontFamily: typography.fontFamily.black, letterSpacing: 0.5 },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  modalBody: { flex: 1, padding: spacing.base },
  fieldLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.base, paddingVertical: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900, borderWidth: 1, borderColor: colors.border },
  pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border },
  pickerText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
  pickerDropdown: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.xs, overflow: 'hidden' },
  pickerOption: { paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  pickerOptionText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate700 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.xl, ...shadows.xl },
  saveBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.xl },
  detailCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.xl },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  detailTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  detailText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate700 },
});
