import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { Laptop, Smartphone, Monitor, Headphones, Cpu, Package, AlertCircle, CheckCircle } from 'lucide-react-native';

export default function AssetsScreen() {
  const [assets, setAssets] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/assets');
      if (data.success) setAssets(data.assets || []);
    } catch (e) {}
  };

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const getIcon = (category: string) => {
    const map: Record<string, any> = { laptop: Laptop, phone: Smartphone, monitor: Monitor, headphones: Headphones, hardware: Cpu };
    return map[category?.toLowerCase()] || Package;
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>Assets</Text>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {assets.length === 0 ? (
          <View style={s.empty}><Package size={48} color={colors.slate200} /><Text style={s.emptyText}>No assets assigned</Text></View>
        ) : assets.map((asset: any, i: number) => {
          const IconComp = getIcon(asset.category);
          return (
            <View key={i} style={s.card}>
              <View style={s.cardRow}>
                <View style={[s.iconWrap, { backgroundColor: colors.primary + '12' }]}>
                  <IconComp size={24} color={colors.primary} />
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.assetName}>{asset.name}</Text>
                  <Text style={s.assetId}>ID: {asset.serialNumber || asset._id?.slice(-6)}</Text>
                </View>
                <View style={[s.statusPill, { backgroundColor: asset.status === 'active' ? colors.success + '15' : colors.warning + '15' }]}>
                  {asset.status === 'active' ? <CheckCircle size={12} color={colors.success} /> : <AlertCircle size={12} color={colors.warning} />}
                  <Text style={[s.statusText, { color: asset.status === 'active' ? colors.success : colors.warning }]}>{asset.status || 'assigned'}</Text>
                </View>
              </View>
              <View style={s.cardMeta}>
                <Text style={s.metaText}>Category: {asset.category}</Text>
                <Text style={s.metaText}>Assigned: {asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : 'N/A'}</Text>
              </View>
              <TouchableOpacity style={s.reportBtn} onPress={() => Alert.alert('Report Issue', 'Issue reporting coming soon')}>
                <AlertCircle size={14} color={colors.warning} />
                <Text style={s.reportBtnText}>Report Issue</Text>
              </TouchableOpacity>
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
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  iconWrap: { width: 48, height: 48, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  cardInfo: { flex: 1 },
  assetName: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  assetId: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  statusText: { fontSize: 10, fontFamily: typography.fontFamily.black, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  metaText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.warning + '10', borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignSelf: 'flex-start' },
  reportBtnText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.warning },
});
