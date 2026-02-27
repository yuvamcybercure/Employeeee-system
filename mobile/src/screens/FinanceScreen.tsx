import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, Modal, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import {
  TrendingUp, Receipt, Users, DollarSign, ShieldCheck,
  Plus, CheckCircle, Calculator, ChevronRight, FileText,
  BarChart3, Download, Package
} from 'lucide-react-native';

const TABS = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'expenses', label: 'Expenses' },
];

export default function FinanceScreen() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const { data } = await api.get('/finance/stats');
        setStats(data.stats || data.overview);
      } else if (activeTab === 'payroll') {
        const { data } = await api.get('/finance/payroll');
        setPayroll(data.payrolls || data.data || []);
      } else if (activeTab === 'invoices') {
        const { data } = await api.get('/finance/invoices');
        setInvoices(data.invoices || data.data || []);
      } else if (activeTab === 'expenses') {
        const { data } = await api.get('/finance/expenses');
        setExpenses(data.expenses || data.data || []);
      }
    } catch (e) { }
    setLoading(false);
  };

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const handleMarkAsPaid = async (type: string, id: string) => {
    try {
      await api.put(`/finance/${type}/${id}/status`, { status: 'paid' });
      Alert.alert('Success', 'Status updated');
      fetchData();
    } catch (e) { Alert.alert('Error', 'Failed to update status'); }
  };

  const handleGeneratePayroll = async () => {
    Alert.alert('Generate Payroll', 'Generate payroll for current month?', [
      { text: 'Cancel' },
      {
        text: 'Generate', onPress: async () => {
          try {
            const { data } = await api.post('/finance/payroll/generate', { month: new Date().getMonth() + 1, year: new Date().getFullYear() });
            if (data.success) { Alert.alert('Success', 'Payroll generated!'); fetchData(); }
          } catch (e) { Alert.alert('Error', 'Failed to generate payroll'); }
        }
      }
    ]);
  };

  const summaryCards = [
    { title: 'Gross Revenue', value: stats?.summary?.grossRevenue || stats?.grossRevenue || 0, icon: TrendingUp, color: colors.primary },
    { title: 'Tax Deductions', value: stats?.summary?.totalTax || stats?.totalTax || 0, icon: Receipt, color: colors.warning },
    { title: 'Net Disbursement', value: stats?.summary?.netProfit || stats?.netProfit || 0, icon: DollarSign, color: colors.success },
    { title: 'Financial Health', value: 'Excellent', icon: ShieldCheck, color: colors.info },
  ];

  const renderContent = () => {
    if (loading && !refreshing) return <View style={s.loader}><ActivityIndicator color={colors.primary} size="large" /></View>;

    switch (activeTab) {
      case 'overview':
        return (
          <View style={s.overview}>
            <View style={s.statsGrid}>
              {summaryCards.map((card, i) => (
                <View key={i} style={s.statCard}>
                  <View style={[s.statIcon, { backgroundColor: card.color + '12' }]}>
                    <card.icon size={20} color={card.color} />
                  </View>
                  <Text style={s.statLabel}>{card.title}</Text>
                  <Text style={s.statValue}>{typeof card.value === 'number' ? `₹${card.value.toLocaleString()}` : card.value}</Text>
                  <View style={s.statProgress}><View style={[s.progressBar, { backgroundColor: card.color, width: '70%', opacity: 0.3 }]} /></View>
                </View>
              ))}
            </View>

            <View style={s.sectionHeader}><Text style={s.sectionTitle}>Recent Invoices</Text><TouchableOpacity><Text style={s.viewAll}>View All</Text></TouchableOpacity></View>
            {invoices.slice(0, 3).map(inv => (
              <View key={inv._id} style={s.miniCard}>
                <View style={s.miniIcon}><FileText size={18} color={colors.primary} /></View>
                <View style={{ flex: 1 }}><Text style={s.miniTitle}>{inv.invoiceNumber}</Text><Text style={s.miniSub}>{inv.client?.name}</Text></View>
                <Text style={s.miniAmount}>₹{inv.grandTotal?.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        );

      case 'payroll':
        return (
          <View>
            <TouchableOpacity style={s.actionBtn} onPress={handleGeneratePayroll}>
              <Calculator size={18} color={colors.white} />
              <Text style={s.actionBtnText}>PROBE PAYROLL CYCLE</Text>
            </TouchableOpacity>
            {payroll.length === 0 ? <View style={s.empty}><Package size={40} color={colors.slate200} /><Text style={s.emptyText}>No payroll records</Text></View> :
              payroll.map((pr: any) => (
                <View key={pr._id} style={s.recordCard}>
                  <View style={s.recordHeader}>
                    <View style={s.avatar}><Text style={s.avatarText}>{pr.userId?.name?.[0]}</Text></View>
                    <View style={{ flex: 1 }}><Text style={s.recordName}>{pr.userId?.name}</Text><Text style={s.recordSub}>{pr.userId?.department || 'Employee'}</Text></View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.recordAmount}>₹{pr.netPayable?.toLocaleString()}</Text>
                      {pr.status === 'paid' ? <Text style={s.paidLabel}>PAID</Text> : <Text style={s.pendingLabel}>PENDING</Text>}
                    </View>
                  </View>
                  {pr.status !== 'paid' && (
                    <TouchableOpacity style={s.payBtn} onPress={() => handleMarkAsPaid('payroll', pr._id)}>
                      <CheckCircle size={14} color={colors.white} />
                      <Text style={s.payBtnText}>DISBURSE SALARY</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            }
          </View>
        );

      case 'invoices':
        return (
          <View>
            {invoices.length === 0 ? <View style={s.empty}><FileText size={40} color={colors.slate200} /><Text style={s.emptyText}>No invoices issued</Text></View> :
              invoices.map((inv: any) => (
                <View key={inv._id} style={s.recordCard}>
                  <View style={s.recordHeader}>
                    <View style={s.invIcon}><Receipt size={20} color={colors.primary} /></View>
                    <View style={{ flex: 1 }}><Text style={s.recordName}>{inv.invoiceNumber}</Text><Text style={s.recordSub}>{inv.client?.name || 'Walk-in Client'}</Text></View>
                    <Text style={s.recordAmount}>₹{inv.grandTotal?.toLocaleString()}</Text>
                  </View>
                  <View style={s.cardFooter}>
                    <Text style={s.dateText}>{inv.date ? new Date(inv.date).toLocaleDateString() : 'No date'}</Text>
                    <View style={[s.badge, { backgroundColor: inv.status === 'paid' ? colors.success + '15' : colors.warning + '15' }]}>
                      <Text style={[s.badgeText, { color: inv.status === 'paid' ? colors.success : colors.warning }]}>{inv.status?.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
              ))
            }
          </View>
        );

      case 'expenses':
        return (
          <View>
            {expenses.length === 0 ? <View style={s.empty}><BarChart3 size={40} color={colors.slate200} /><Text style={s.emptyText}>No expenses recorded</Text></View> :
              expenses.map((exp: any) => (
                <View key={exp._id} style={s.recordCard}>
                  <View style={s.recordHeader}>
                    <View style={[s.invIcon, { backgroundColor: colors.accent + '15' }]}><TrendingUp size={20} color={colors.accent} /></View>
                    <View style={{ flex: 1 }}><Text style={s.recordName}>{exp.title}</Text><Text style={s.recordSub}>{exp.category} • {exp.paymentMethod || 'Cash'}</Text></View>
                    <Text style={[s.recordAmount, { color: colors.destructive }]}>₹{exp.totalAmount?.toLocaleString()}</Text>
                  </View>
                  <View style={s.cardFooter}>
                    <Text style={s.dateText}>{exp.date ? new Date(exp.date).toLocaleDateString() : 'No date'}</Text>
                    <TouchableOpacity style={s.receiptBtn}><Download size={12} color={colors.primary} /><Text style={s.receiptText}>Receipt</Text></TouchableOpacity>
                  </View>
                </View>
              ))
            }
          </View>
        );
      default: return null;
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Finance</Text>
        <Text style={s.subtitle}>Real-time fiscal monitoring</Text>
      </View>

      <View style={s.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[s.tab, activeTab === tab.id && s.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={s.flex1}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.base, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -1 },
  subtitle: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  tabContainer: { backgroundColor: colors.white, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabRow: { paddingHorizontal: spacing.base, gap: spacing.sm },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.slate50, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.slate900, borderColor: colors.slate900 },
  tabText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.slate500, letterSpacing: 0.5 },
  tabTextActive: { color: colors.white },
  flex1: { flex: 1 },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  loader: { paddingTop: spacing['4xl'] },
  overview: { flex: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statCard: { width: '47%', backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  statIcon: { width: 40, height: 40, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  statLabel: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  statProgress: { height: 3, backgroundColor: colors.slate50, borderRadius: 2, marginTop: spacing.md, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, marginTop: spacing.sm },
  sectionTitle: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  viewAll: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.primary },
  miniCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: spacing.md, borderRadius: radius.xl, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  miniIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  miniTitle: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  miniSub: { fontSize: 10, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
  miniAmount: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.lg, marginBottom: spacing.xl, ...shadows.xl },
  actionBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
  empty: { alignItems: 'center', padding: spacing['4xl'] },
  emptyText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate300, marginTop: spacing.base, fontStyle: 'italic' },
  recordCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  recordHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.white },
  invIcon: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary + '10', justifyContent: 'center', alignItems: 'center' },
  recordName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  recordSub: { fontSize: 10, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: 1 },
  recordAmount: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  paidLabel: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.success, marginTop: 4 },
  pendingLabel: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.warning, marginTop: 4 },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.slate900, borderRadius: radius.lg, paddingVertical: spacing.md, marginTop: spacing.md },
  payBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.slate50, paddingTop: spacing.md },
  dateText: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  badgeText: { fontSize: 9, fontFamily: typography.fontFamily.black, letterSpacing: 0.5 },
  receiptBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.primary + '10' },
  receiptText: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.primary },
});
