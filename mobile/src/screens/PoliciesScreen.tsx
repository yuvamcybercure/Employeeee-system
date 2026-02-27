import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { FileText, CheckCircle, Download, Shield } from 'lucide-react-native';

export default function PoliciesScreen() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchPolicies(); }, []);

  const fetchPolicies = async () => {
    try {
      const { data } = await api.get('/policies');
      if (data.success) setPolicies(data.policies || []);
    } catch (e) {}
  };

  const onRefresh = async () => { setRefreshing(true); await fetchPolicies(); setRefreshing(false); };

  const handleAcknowledge = async (id: string) => {
    try {
      const { data } = await api.post(`/policies/${id}/acknowledge`);
      if (data.success) { Alert.alert('Success', 'Policy acknowledged'); fetchPolicies(); }
    } catch (e) { Alert.alert('Error', 'Failed to acknowledge'); }
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>Policies</Text>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {policies.length === 0 ? (
          <View style={s.empty}><Shield size={48} color={colors.slate200} /><Text style={s.emptyText}>No policies to review</Text></View>
        ) : policies.map((policy: any) => (
          <View key={policy._id} style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.iconWrap, { backgroundColor: colors.primary + '12' }]}>
                <FileText size={20} color={colors.primary} />
              </View>
              <View style={s.cardInfo}>
                <Text style={s.policyName}>{policy.title}</Text>
                <Text style={s.policyCat}>{policy.category?.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={s.policyDesc} numberOfLines={3}>{policy.description || 'No description provided.'}</Text>
            <View style={s.cardActions}>
              {policy.fileUrl && (
                <TouchableOpacity style={s.downloadBtn} onPress={() => Linking.openURL(policy.fileUrl)}>
                  <Download size={14} color={colors.primary} />
                  <Text style={s.downloadText}>VIEW</Text>
                </TouchableOpacity>
              )}
              {policy.acknowledged ? (
                <View style={s.ackBadge}><CheckCircle size={14} color={colors.success} /><Text style={s.ackText}>Acknowledged</Text></View>
              ) : (
                <TouchableOpacity style={s.ackBtn} onPress={() => handleAcknowledge(policy._id)}>
                  <CheckCircle size={14} color={colors.white} />
                  <Text style={s.ackBtnText}>ACKNOWLEDGE</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  iconWrap: { width: 44, height: 44, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  cardInfo: { flex: 1 },
  policyName: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  policyCat: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, letterSpacing: 1, marginTop: 2 },
  policyDesc: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate500, lineHeight: 20, marginBottom: spacing.md },
  cardActions: { flexDirection: 'row', gap: spacing.sm },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary + '10', borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  downloadText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.primary, letterSpacing: 1 },
  ackBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success + '15', borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  ackText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.success },
  ackBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, ...shadows.md },
  ackBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1 },
});
