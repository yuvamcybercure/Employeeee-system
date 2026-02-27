import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing } from '../theme';
import api from '../api';
import { Users as UsersIcon, UserCircle } from 'lucide-react-native';

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/users').then(({ data }) => {
      if (data.success) setUsers(data.users || []);
    }).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Employees</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatarWrap}>
              {item.profilePhoto ? (
                <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{item.name?.[0] || 'U'}</Text>
                </View>
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.role}>{item.designation || item.role}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: item.isActive !== false ? colors.success : colors.slate300 }]} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <UsersIcon size={48} color={colors.slate200} />
            <Text style={styles.emptyText}>No employees found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black,
    color: colors.slate900, padding: spacing.base, letterSpacing: -0.5,
  },
  list: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  avatarWrap: { marginRight: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: radius.lg },
  avatarPlaceholder: {
    width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.black, color: colors.white },
  info: { flex: 1 },
  name: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  role: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate400, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: {
    fontSize: typography.size.base, fontFamily: typography.fontFamily.medium,
    color: colors.slate400, marginTop: spacing.base,
  },
});
