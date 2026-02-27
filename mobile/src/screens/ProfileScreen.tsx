import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Alert, Modal, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  User, Mail, Phone, Building2, Briefcase, ChevronRight, Settings,
  LogOut, Shield, Edit3, X, Save, Lock, CreditCard, FileText
} from 'lucide-react-native';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, refreshUser } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editDepartment, setEditDepartment] = useState(user?.department || '');
  const [editDesignation, setEditDesignation] = useState(user?.designation || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: editName, phone: editPhone, department: editDepartment,
        designation: editDesignation, address: editAddress,
      });
      if (data.success) {
        Alert.alert('Success', 'Profile updated');
        refreshUser();
        setShowEdit(false);
      } else {
        Alert.alert('Error', data.message || 'Update failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (newPassword.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (data.success) {
        Alert.alert('Success', 'Password changed');
        setShowPassword(false);
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        Alert.alert('Error', data.message || 'Failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to change password');
    }
    setSaving(false);
  };

  const fields = [
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Phone', value: user?.phone || 'Not set', icon: Phone },
    { label: 'Department', value: user?.department || 'Not set', icon: Building2 },
    { label: 'Designation', value: user?.designation || 'Not set', icon: Briefcase },
    { label: 'Role', value: user?.role?.toUpperCase(), icon: Shield },
  ];

  const menuItems = [
    { label: 'Edit Profile', sub: 'Update your information', icon: Edit3, color: colors.primary, onPress: () => { setEditName(user?.name || ''); setEditPhone(user?.phone || ''); setEditDepartment(user?.department || ''); setEditDesignation(user?.designation || ''); setEditAddress(user?.address || ''); setShowEdit(true); } },
    { label: 'Documents', sub: 'ID cards & certifications', icon: FileText, color: colors.success, onPress: () => navigation.navigate('Documents') },
    { label: 'Change Password', sub: 'Update your security', icon: Lock, color: colors.warning, onPress: () => setShowPassword(true) },
    { label: 'Settings', sub: 'App preferences', icon: Settings, color: colors.secondary, onPress: () => navigation.navigate('Settings') },
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={s.profileHeader}>
          <View style={s.avatarLarge}>
            {user?.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={s.avatarImg} />
            ) : (
              <Text style={s.avatarInitial}>{user?.name?.[0] || 'U'}</Text>
            )}
          </View>
          <Text style={s.name}>{user?.name || 'User'}</Text>
          <Text style={s.role}>{user?.designation || user?.role}</Text>
        </View>

        {/* Info Cards */}
        <View style={s.infoCard}>
          {fields.map((field, i) => (
            <View key={i} style={[s.infoRow, i < fields.length - 1 && s.infoRowBorder]}>
              <View style={s.infoLeft}>
                <field.icon size={18} color={colors.slate400} />
                <Text style={s.infoLabel}>{field.label}</Text>
              </View>
              <Text style={s.infoValue}>{field.value}</Text>
            </View>
          ))}
        </View>

        {/* Bank Details */}
        {(user?.bankDetails || user?.bankName) && (
          <View style={s.bankCard}>
            <View style={s.bankHeader}>
              <CreditCard size={18} color={colors.primary} />
              <Text style={s.bankTitle}>Bank Details</Text>
            </View>
            <View style={s.bankRow}>
              <Text style={s.bankLabel}>Bank</Text>
              <Text style={s.bankValue}>{user?.bankDetails?.bankName || user?.bankName || 'N/A'}</Text>
            </View>
            <View style={s.bankRow}>
              <Text style={s.bankLabel}>Account</Text>
              <Text style={s.bankValue}>{user?.bankDetails?.accountNumber || user?.accountNumber || 'N/A'}</Text>
            </View>
            <View style={s.bankRow}>
              <Text style={s.bankLabel}>IFSC</Text>
              <Text style={s.bankValue}>{user?.bankDetails?.ifsc || user?.ifsc || 'N/A'}</Text>
            </View>
          </View>
        )}

        {/* Menu Items */}
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={s.menuItem} onPress={item.onPress} activeOpacity={0.7}>
            <View style={[s.menuIcon, { backgroundColor: item.color + '12' }]}>
              <item.icon size={20} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Text style={s.menuSub}>{item.sub}</Text>
            </View>
            <ChevronRight size={18} color={colors.slate300} />
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity style={[s.menuItem, s.logoutItem]} onPress={handleLogout} activeOpacity={0.7}>
          <View style={[s.menuIcon, { backgroundColor: colors.destructive + '12' }]}>
            <LogOut size={20} color={colors.destructive} />
          </View>
          <Text style={[s.menuLabel, { color: colors.destructive }]}>Logout</Text>
          <ChevronRight size={18} color={colors.slate300} />
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEdit} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEdit(false)}><X size={24} color={colors.slate600} /></TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={s.fieldLabel}>Full Name</Text>
            <TextInput style={s.input} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor={colors.slate300} />

            <Text style={s.fieldLabel}>Phone</Text>
            <TextInput style={s.input} value={editPhone} onChangeText={setEditPhone} placeholder="Phone number" placeholderTextColor={colors.slate300} keyboardType="phone-pad" />

            <Text style={s.fieldLabel}>Department</Text>
            <TextInput style={s.input} value={editDepartment} onChangeText={setEditDepartment} placeholder="Department" placeholderTextColor={colors.slate300} />

            <Text style={s.fieldLabel}>Designation</Text>
            <TextInput style={s.input} value={editDesignation} onChangeText={setEditDesignation} placeholder="Designation" placeholderTextColor={colors.slate300} />

            <Text style={s.fieldLabel}>Address</Text>
            <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={editAddress} onChangeText={setEditAddress} placeholder="Address" placeholderTextColor={colors.slate300} multiline />

            <TouchableOpacity style={s.saveBtn} onPress={handleSaveProfile} disabled={saving} activeOpacity={0.8}>
              {saving ? <ActivityIndicator color={colors.white} /> : (
                <>
                  <Save size={18} color={colors.white} />
                  <Text style={s.saveBtnText}>SAVE CHANGES</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPassword} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={() => setShowPassword(false)}><X size={24} color={colors.slate600} /></TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={s.fieldLabel}>Current Password</Text>
            <TextInput style={s.input} value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" placeholderTextColor={colors.slate300} secureTextEntry />

            <Text style={s.fieldLabel}>New Password</Text>
            <TextInput style={s.input} value={newPassword} onChangeText={setNewPassword} placeholder="New password" placeholderTextColor={colors.slate300} secureTextEntry />

            <Text style={s.fieldLabel}>Confirm New Password</Text>
            <TextInput style={s.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm password" placeholderTextColor={colors.slate300} secureTextEntry />

            <TouchableOpacity style={s.saveBtn} onPress={handleChangePassword} disabled={saving} activeOpacity={0.8}>
              {saving ? <ActivityIndicator color={colors.white} /> : (
                <>
                  <Lock size={18} color={colors.white} />
                  <Text style={s.saveBtnText}>UPDATE PASSWORD</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  profileHeader: { alignItems: 'center', marginBottom: spacing.xl, paddingTop: spacing.base },
  avatarLarge: { width: 96, height: 96, borderRadius: radius['3xl'], backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: spacing.base, ...shadows.lg },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitial: { fontSize: typography.size['4xl'], fontFamily: typography.fontFamily.black, color: colors.white },
  name: { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.slate900 },
  role: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: spacing.xs, textTransform: 'capitalize' },
  infoCard: { backgroundColor: colors.white, borderRadius: radius.xl, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoLabel: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.slate500 },
  infoValue: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  bankCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  bankHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  bankTitle: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  bankLabel: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.slate500 },
  bankValue: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  menuIcon: { width: 40, height: 40, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  menuLabel: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  menuSub: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.regular, color: colors.slate400, marginTop: 1 },
  logoutItem: { marginTop: spacing.md },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  modalBody: { flex: 1, padding: spacing.base },
  fieldLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.base, paddingVertical: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900, borderWidth: 1, borderColor: colors.border },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xl, ...shadows.xl },
  saveBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
});
