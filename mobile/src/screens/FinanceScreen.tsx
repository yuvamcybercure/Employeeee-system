import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { TrendingUp, Receipt, Users, DollarSign, ShieldCheck, Plus, CheckCircle, Calculator } from 'lucide-react-native';

const TABS = [
  { id: 'overview', label: 'Overview' },
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

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'overview') {
        const { data } = await api.get('/finance/stats');
        setStats(data.stats);
      } else if (activeTab === 'payroll') {
        const { data } = await api.get('/finance/payroll');
        setPayroll(data.payrolls || []);
      } else if (activeTab === 'invoices') {
        const { data } = await api.get('/finance/invoices');
        setInvoices(data.invoices || []);
      } else if (activeTab === 'expenses') {
        const { data } = await api.get('/finance/expenses');
        setExpenses(data.expenses || []);
      }
    } catch (e) {}
  };

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const handleMarkAsPaid = async (type: string, id: string) => {
    try {
      await api.put(`/finance/${type}/${id}/status`, { status: 'paid' });
      fetchData();
    } catch (e) { Alert.alert('Error', 'Failed to update status'); }
  };

  const handleGeneratePayroll = async () => {
    try {
      const { data } = await api.post('/finance/payroll/generate', { month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      if (data.success) { Alert.alert('Success', 'Payroll generated!'); fetchData(); }
    } catch (e) { Alert.alert('Error', 'Failed to generate payroll'); }
  };

  const summaryCards = [
    { title: 'Gross Revenue', value: stats?.summary?.grossRevenue ? `₹${stats.summary.grossRevenue.toLocaleString()}` : '₹0', icon: TrendingUp, color: colors.primary },
    { title: 'Tax Deductions', value: stats?.summary?.totalTax ? `₹${stats.summary.totalTax.toLocaleString()}` : '₹0', icon: Receipt, color: colors.warning },
    { title: 'Net Disbursement', value: stats?.summary?.netProfit ? `₹${stats.summary.netProfit.toLocaleString()}` : '₹0', icon: DollarSign, color: colors.success },
    { title: 'Compliance', value: '98.5%', icon: ShieldCheck, color: colors.info },
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>Finance Hub</Text>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabScroll} contentContainerStyle={s.tabRow}>
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

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <View style={s.statsGrid}>
              {summaryCards.map((card, i) => (
                <View key={i} style={s.statCard}>
                  <View style={[s.statIcon, { backgroundColor: card.color + '12' }]}>
                    <card.icon size={22} color={card.color} />
                  </View>
                  <Text style={s.statLabel}>{card.title}</Text>
                  <Text style={s.statValue}>{card.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Payroll */}
        {activeTab === 'payroll' && (
          <>
            <TouchableOpacity style={s.generateBtn} onPress={handleGeneratePayroll}>
              <Calculator size={16} color={colors.white} />
              <Text style={s.generateBtnText}>GENERATE PAYROLL</Text>
            </TouchableOpacity>
            {payroll.length === 0 ? <Text style={s.emptyText}>No active payroll cycle</Text> :
              payroll.map((pr: any) => (
                <View key={pr._id} style={s.recordCard}>
                  <View style={s.recordHeader}>
                    <Text style={s.recordName}>{pr.userId?.name}</Text>
                    <Text style={[s.recordAmount, { color: colors.success }]}>₹{pr.netPayable?.toLocaleString()}</Text>
                  </View>
                  <View style={s.recordMeta}>
                    <Text style={s.recordSub}>{pr.userId?.salaryStructure?.compensationType || 'monthly'}</Text>
                    {pr.status === 'draft' ? (
                      <TouchableOpacity style={s.paidBtn} onPress={() => handleMarkAsPaid('payroll', pr._id)}>
                        <CheckCircle size={14} color={colors.white} />
                        <Text style={s.paidBtnText}>MARK PAID</Text>
                      </TouchableOpacity>
                    ) : <Text style={s.paidLabel}>✅ PAID</Text>}
                  </View>
                </View>
              ))
            }
          </>
        )}

        {/* Invoices */}
        {activeTab === 'invoices' && (
          <>
            {invoices.length === 0 ? <Text style={s.emptyText}>No invoices issued</Text> :
              invoices.map((inv: any) => (
                <View key={inv._id} style={s.recordCard}>
                  <View style={s.recordHeader}>
                    <Text style={[s.recordName, { color: colors.primary }]}>{inv.invoiceNumber}</Text>
                    <Text style={s.recordAmount}>₹{inv.grandTotal?.toLocaleString()}</Text>
                  </View>
                  <View style={s.recordMeta}>
                    <Text style={s.recordSub}>{inv.client?.name}</Text>
                    <View style={[s.statusPill, { backgroundColor: inv.status === 'paid' ? colors.success + '15' : colors.warning + '15' }]}>
                      <Text style={[s.statusPillText, { color: inv.status === 'paid' ? colors.success : colors.warning }]}>{inv.status}</Text>
                    </View>
                  </View>
                </View>
              ))
            }
          </>
        )}

        {/* Expenses */}
        {activeTab === 'expenses' && (
          <>
            {expenses.length === 0 ? <Text style={s.emptyText}>No expenditures found</Text> :
              expenses.map((exp: any) => (
                <View key={exp._id} style={s.recordCard}>
                  <View style={s.recordHeader}>
                    <Text style={s.recordName}>{exp.title}</Text>
                    <Text style={s.recordAmount}>₹{exp.totalAmount?.toLocaleString()}</Text>
                  </View>
                  <View style={s.recordMeta}>
                    <Text style={s.recordSub}>{exp.category}</Text>
                    <View style={[s.statusPill, { backgroundColor: exp.status === 'paid' ? colors.success + '15' : colors.warning + '15' }]}>
                      <Text style={[s.statusPillText, { color: exp.status === 'paid' ? colors.success : colors.warning }]}>{exp.status}</Text>
                    </View>
                  </View>
                </View>
              ))
            }
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -0.5, marginBottom: spacing.base },
  tabScroll: { marginBottom: spacing.xl },
  tabRow: { gap: spacing.sm },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.xl, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.slate900, borderColor: colors.slate900 },
  tabText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate500, textTransform: 'uppercase', letterSpacing: 1.5 },
  tabTextActive: { color: colors.white },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: { width: '47%', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  statIcon: { width: 44, height: 44, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  statLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.xs },
  statValue: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md, marginBottom: spacing.lg, ...shadows.xl },
  generateBtnText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
  emptyText: { textAlign: 'center', padding: spacing.xl, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate400, fontStyle: 'italic' },
  recordCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  recordName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  recordAmount: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  recordMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordSub: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1 },
  statusPill: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  statusPillText: { fontSize: 10, fontFamily: typography.fontFamily.black, textTransform: 'uppercase', letterSpacing: 0.5 },
  paidBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.slate900, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  paidBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1 },
  paidLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.success },
});
