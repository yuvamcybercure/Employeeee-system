import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, Modal, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { Laptop, Smartphone, Monitor, Headphones, Cpu, Package, AlertCircle, CheckCircle, X } from 'lucide-react-native';

export default function AssetsScreen() {
  const [assets, setAssets] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [reportAsset, setReportAsset] = useState<any>(null);
  const [issue, setIssue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/assets');
      if (data.success) setAssets(data.assets || []);
    } catch (e) { }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const handleReport = async () => {
    if (!issue.trim()) { Alert.alert('Error', 'Please describe the issue'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/assets/${reportAsset._id}/report-issue`, { issue });
      if (data.success) {
        Alert.alert('Success', 'Issue reported successfully');
        setReportAsset(null);
        setIssue('');
        fetchData();
      }
    } catch (e) { Alert.alert('Error', 'Failed to report issue'); }
    setSubmitting(false);
  };

  const getIcon = (category: string) => {
    const map: Record<string, any> = { laptop: Laptop, phone: Smartphone, mobile: Smartphone, monitor: Monitor, headphones: Headphones, hardware: Cpu };
    return map[category?.toLowerCase()] || Package;
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>My Assets</Text>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {assets.length === 0 ? (
          <View style={s.empty}><Package size={48} color={colors.slate200} /><Text style={s.emptyText}>No assets assigned to you</Text></View>
        ) : assets.map((asset: any, i: number) => {
          const IconComp = getIcon(asset.category);
          return (
            <View key={asset._id} style={s.card}>
              <View style={s.cardRow}>
                <View style={[s.iconWrap, { backgroundColor: colors.primary + '12' }]}>
                  <IconComp size={24} color={colors.primary} />
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.assetName}>{asset.name}</Text>
                  <Text style={s.assetId}>{asset.category} • {asset.serialNumber || 'No SN'}</Text>
                </View>
                <View style={[s.statusPill, { backgroundColor: asset.status === 'active' ? colors.success + '15' : colors.warning + '15' }]}>
                  {asset.status === 'active' ? <CheckCircle size={12} color={colors.success} /> : <AlertCircle size={12} color={colors.warning} />}
                  <Text style={[s.statusText, { color: asset.status === 'active' ? colors.success : colors.warning }]}>{asset.status || 'assigned'}</Text>
                </View>
              </View>
              <View style={s.cardMeta}>
                <Text style={s.metaText}>ID: {asset._id?.slice(-8).toUpperCase()}</Text>
                <Text style={s.metaText}>Assigned: {asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : 'N/A'}</Text>
              </View>

              <TouchableOpacity
                style={[s.reportBtn, asset.hasIssue && { opacity: 0.6 }]}
                onPress={() => setReportAsset(asset)}
                disabled={asset.hasIssue}
              >
                <AlertCircle size={14} color={asset.hasIssue ? colors.slate400 : colors.warning} />
                <Text style={[s.reportBtnText, asset.hasIssue && { color: colors.slate400 }]}>
                  {asset.hasIssue ? 'Issue Reported' : 'Report Issue'}
                </Text>
              </TouchableOpacity>

              {asset.hasIssue && asset.lastIssue && (
                <View style={s.issueNote}>
                  <Text style={s.issueNoteText} numberOfLines={2}>Note: {asset.lastIssue}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Report Issue Modal */}
      <Modal visible={!!reportAsset} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Report Issue</Text>
              <TouchableOpacity onPress={() => setReportAsset(null)}><X size={22} color={colors.slate600} /></TouchableOpacity>
            </View>
            <Text style={s.modalAssetName}>{reportAsset?.name}</Text>
            <Text style={s.label}>Describe the issue</Text>
            <TextInput
              style={s.input}
              value={issue}
              onChangeText={setIssue}
              placeholder="Broken screen, battery issues, etc..."
              placeholderTextColor={colors.slate300}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={s.submitBtn} onPress={handleReport} disabled={submitting}>
              {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={s.submitBtnText}>SUBMIT REPORT</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  assetId: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: 2, textTransform: 'uppercase' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  statusText: { fontSize: 10, fontFamily: typography.fontFamily.black, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md, borderTopWidth: 1, borderTopColor: colors.slate50, paddingTop: spacing.md },
  metaText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.warning + '10', borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignSelf: 'flex-start' },
  reportBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.warning, letterSpacing: 0.5 },
  issueNote: { marginTop: spacing.sm, backgroundColor: colors.slate50, padding: spacing.sm, borderRadius: radius.md },
  issueNoteText: { fontSize: 10, fontFamily: typography.fontFamily.medium, color: colors.slate500 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modalCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.xl, ...shadows.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  modalAssetName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.primary, marginBottom: spacing.lg },
  label: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: colors.slate50, borderRadius: radius.lg, padding: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate900, borderWidth: 1, borderColor: colors.border, textAlignVertical: 'top', height: 100 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.xl, ...shadows.xl },
  submitBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
});
