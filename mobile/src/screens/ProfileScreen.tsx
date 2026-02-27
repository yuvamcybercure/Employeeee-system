import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Phone, Building2, Briefcase, ChevronRight,
  Settings, LogOut, Shield
} from 'lucide-react-native';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const fields = [
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Phone', value: user?.phone || 'Not set', icon: Phone },
    { label: 'Department', value: user?.department || 'Not set', icon: Building2 },
    { label: 'Designation', value: user?.designation || 'Not set', icon: Briefcase },
    { label: 'Role', value: user?.role?.toUpperCase(), icon: Shield },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            {user?.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarInitial}>{user?.name?.[0] || 'U'}</Text>
            )}
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.role}>{user?.designation || user?.role}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCard}>
          {fields.map((field, i) => (
            <View key={i} style={[styles.infoRow, i < fields.length - 1 && styles.infoRowBorder]}>
              <View style={styles.infoLeft}>
                <field.icon size={18} color={colors.slate400} />
                <Text style={styles.infoLabel}>{field.label}</Text>
              </View>
              <Text style={styles.infoValue}>{field.value}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
          <View style={[styles.menuIcon, { backgroundColor: colors.primary + '12' }]}>
            <Settings size={20} color={colors.primary} />
          </View>
          <Text style={styles.menuLabel}>Settings</Text>
          <ChevronRight size={18} color={colors.slate300} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout} activeOpacity={0.7}>
          <View style={[styles.menuIcon, { backgroundColor: colors.destructive + '12' }]}>
            <LogOut size={20} color={colors.destructive} />
          </View>
          <Text style={[styles.menuLabel, { color: colors.destructive }]}>Logout</Text>
          <ChevronRight size={18} color={colors.slate300} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  profileHeader: { alignItems: 'center', marginBottom: spacing.xl, paddingTop: spacing.base },
  avatarLarge: {
    width: 96, height: 96, borderRadius: radius['3xl'], backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: spacing.base,
    ...shadows.lg,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitial: {
    fontSize: typography.size['4xl'], fontFamily: typography.fontFamily.black, color: colors.white,
  },
  name: {
    fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.slate900,
  },
  role: {
    fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate400,
    marginTop: spacing.xs, textTransform: 'capitalize',
  },
  infoCard: {
    backgroundColor: colors.white, borderRadius: radius.xl, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.base,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoLabel: {
    fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.slate500,
  },
  infoValue: {
    fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate800,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800,
  },
  logoutItem: { marginTop: spacing.md },
});
