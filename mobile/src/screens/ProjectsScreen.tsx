import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing } from '../theme';
import api from '../api';
import { FolderOpen } from 'lucide-react-native';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    api.get('/projects').then(({ data }) => {
      if (data.success) setProjects(data.projects || []);
    }).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Projects</Text>
      <FlatList
        data={projects}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.badge, { backgroundColor: item.status === 'active' ? colors.success + '15' : colors.slate100 }]}>
              <Text style={[styles.badgeText, { color: item.status === 'active' ? colors.success : colors.slate500 }]}>
                {item.status?.toUpperCase() || 'N/A'}
              </Text>
            </View>
            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.projectDesc} numberOfLines={2}>{item.description || 'No description'}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{item.members?.length || 0} members</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <FolderOpen size={48} color={colors.slate200} />
            <Text style={styles.emptyText}>No projects found</Text>
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
    backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  badge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: spacing.sm },
  badgeText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, letterSpacing: 0.5 },
  projectName: {
    fontSize: typography.size.md, fontFamily: typography.fontFamily.bold, color: colors.slate800,
  },
  projectDesc: {
    fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate500,
    marginTop: spacing.xs,
  },
  metaRow: { flexDirection: 'row', marginTop: spacing.sm },
  metaText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
  empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: {
    fontSize: typography.size.base, fontFamily: typography.fontFamily.medium,
    color: colors.slate400, marginTop: spacing.base,
  },
});
