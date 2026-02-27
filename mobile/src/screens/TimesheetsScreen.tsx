import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing } from '../theme';
import api from '../api';
import { ClipboardList } from 'lucide-react-native';

export default function TimesheetsScreen() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    api.get(`/timesheets?date=${today}`).then(({ data }) => {
      if (data.success) setEntries(data.timesheets || []);
    }).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Timesheets</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.taskName}>{item.task || 'Untitled Task'}</Text>
            <Text style={styles.project}>{item.projectId?.name || 'No project'}</Text>
            <View style={styles.hoursRow}>
              <Text style={styles.hours}>{item.hours || 0}h</Text>
              <Text style={styles.date}>
                {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ClipboardList size={48} color={colors.slate200} />
            <Text style={styles.emptyText}>No timesheet entries today</Text>
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
  taskName: {
    fontSize: typography.size.md, fontFamily: typography.fontFamily.bold, color: colors.slate800,
  },
  project: {
    fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate400,
    marginTop: 2,
  },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  hours: {
    fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.primary,
  },
  date: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
  empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: {
    fontSize: typography.size.base, fontFamily: typography.fontFamily.medium,
    color: colors.slate400, marginTop: spacing.base,
  },
});
