import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing } from '../theme';
import api from '../api';
import { Activity, Terminal, ShieldAlert, Database } from 'lucide-react-native';

export default function LogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/logs');
      if (data.success) setLogs(data.logs || []);
    } catch (e) {}
  };

  const onRefresh = async () => { setRefreshing(true); await fetchLogs(); setRefreshing(false); };

  const getLogIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'SEC': return { icon: ShieldAlert, color: colors.destructive };
      case 'DB': return { icon: Database, color: colors.primary };
      case 'SYS': return { icon: Terminal, color: colors.secondary };
      default: return { icon: Activity, color: colors.info };
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>Activity Logs</Text>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {logs.length === 0 ? (
          <View style={s.empty}><Activity size={48} color={colors.slate200} /><Text style={s.emptyText}>No logs available</Text></View>
        ) : logs.map((log: any, i: number) => {
          const { icon: LogIcon, color } = getLogIcon(log.type);
          return (
            <View key={i} style={s.logCard}>
              <View style={s.logRow}>
                <View style={[s.logIcon, { backgroundColor: color + '12' }]}>
                  <LogIcon size={18} color={color} />
                </View>
                <View style={s.logInfo}>
                  <Text style={s.logAction}>{log.action}</Text>
                  <View style={s.logMetaRow}>
                    <Text style={s.logType}>{log.type}</Text>
                    <Text style={s.logDot}>•</Text>
                    <Text style={s.logResource}>{log.resource}</Text>
                  </View>
                </View>
              </View>
              <View style={s.logFooter}>
                <Text style={s.logUser}>{log.user || 'System'}</Text>
                <Text style={s.logTime}>{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, padding: spacing.base, paddingBottom: 0, letterSpacing: -0.5 },
  scroll: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
  logCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  logRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  logIcon: { width: 36, height: 36, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  logInfo: { flex: 1 },
  logAction: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  logMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  logType: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  logDot: { fontSize: 10, color: colors.slate300 },
  logResource: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'uppercase' },
  logFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.slate50, paddingTop: spacing.sm },
  logUser: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate500 },
  logTime: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
});
