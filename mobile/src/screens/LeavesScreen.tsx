import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, Modal, TextInput, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Calendar, CheckCircle, XCircle, Clock, Plus, X,
  Search, Eye, ChevronDown
} from 'lucide-react-native';

const LEAVE_TYPES = ['sick', 'casual', 'emergency', 'annual', 'other'];

export default function LeavesScreen() {
  const { user, hasPermission } = useAuth();
  const isAdmin = ['admin', 'superadmin', 'master-admin'].includes(user?.role || '');
  const [leaves, setLeaves] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [tab, setTab] = useState<'my' | 'pending'>('my');
  const [search, setSearch] = useState('');

  // Apply form state
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  useEffect(() => { fetchLeaves(); }, [tab]);

  const fetchLeaves = async () => {
    try {
      const url = isAdmin && tab === 'pending' ? '/leaves?status=pending' : '/leaves';
      const { data } = await api.get(url);
      if (data.success) setLeaves(data.leaves || []);
    } catch (e) { }
    try {
      const { data } = await api.get('/leaves/balance');
      if (data.success) setBalances(data.balance || data);
    } catch (e) { }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchLeaves(); setRefreshing(false); };

  const handleApply = async () => {
    if (!startDate || !endDate) { Alert.alert('Error', 'Please enter start and end dates'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/leaves', { type: leaveType, startDate, endDate, reason });
      if (data.success) {
        Alert.alert('Success', 'Leave request submitted');
        setShowApply(false);
        setStartDate(''); setEndDate(''); setReason(''); setLeaveType(LEAVE_TYPES[0]);
        fetchLeaves();
      } else {
        Alert.alert('Error', data.message || 'Failed to submit');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to submit leave request');
    }
    setSubmitting(false);
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { data } = await api.put(`/leaves/${id}/review`, { status });
      if (data.success) {
        Alert.alert('Success', `Leave ${status}`);
        fetchLeaves();
        setShowDetail(null);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update leave');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return { bg: colors.success + '15', color: colors.success, icon: CheckCircle };
      case 'rejected': return { bg: colors.destructive + '15', color: colors.destructive, icon: XCircle };
      default: return { bg: colors.warning + '15', color: colors.warning, icon: Clock };
    }
  };

  const filteredLeaves = leaves.filter(l => {
    if (!search) return true;
    const name = (l.userId?.name || l.userName || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.headerRow}>
        <Text style={s.title}>Leaves</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowApply(true)} activeOpacity={0.8}>
          <Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Admin Tabs */}
      {isAdmin && (
        <View style={s.tabRow}>
          <TouchableOpacity style={[s.tab, tab === 'my' && s.tabActive]} onPress={() => setTab('my')}>
            <Text style={[s.tabText, tab === 'my' && s.tabTextActive]}>My Leaves</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab, tab === 'pending' && s.tabActive]} onPress={() => setTab('pending')}>
            <Text style={[s.tabText, tab === 'pending' && s.tabTextActive]}>Pending Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search */}
      {isAdmin && tab === 'pending' && (
        <View style={s.searchWrap}>
          <Search size={16} color={colors.slate400} />
          <TextInput
            style={s.searchInput}
            placeholder="Search employee..."
            placeholderTextColor={colors.slate400}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      )}

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Cards */}
        {tab === 'my' && balances && (
          <View style={s.balanceRow}>
            {Object.entries(balances).filter(([k]) => ['sick', 'casual', 'emergency', 'annual'].includes(k)).map(([type, val]: [string, any]) => {
              const available = typeof val === 'object' ? val.available : val;
              return (
                <View key={type} style={s.balanceCard}>
                  <Text style={s.balanceType}>{type.toUpperCase()}</Text>
                  <Text style={s.balanceValue}>{available ?? 0}</Text>
                  <Text style={s.balanceLabel}>Available</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Leave List */}
        {filteredLeaves.length === 0 ? (
          <View style={s.emptyCard}>
            <Calendar size={48} color={colors.slate200} />
            <Text style={s.emptyText}>No leave requests</Text>
          </View>
        ) : (
          filteredLeaves.map((leave: any, i: number) => {
            const st = getStatusStyle(leave.status);
            const StatusIcon = st.icon;
            return (
              <TouchableOpacity key={i} style={s.leaveCard} onPress={() => setShowDetail(leave)} activeOpacity={0.7}>
                {/* Show employee name for admin pending view */}
                {isAdmin && tab === 'pending' && (
                  <Text style={s.empName}>{leave.userId?.name || 'Employee'}</Text>
                )}
                <View style={s.leaveHeader}>
                  <View style={[s.typeBadge, { backgroundColor: colors.primary + '12' }]}>
                    <Text style={[s.typeText, { color: colors.primary }]}>{(leave.type || 'leave').toUpperCase()}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
                    <StatusIcon size={14} color={st.color} />
                    <Text style={[s.statusText, { color: st.color }]}>{leave.status}</Text>
                  </View>
                </View>
                <Text style={s.leaveDates}>
                  {new Date(leave.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  {' → '}
                  {new Date(leave.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                {leave.reason && <Text style={s.leaveReason} numberOfLines={2}>{leave.reason}</Text>}

                {/* Admin actions */}
                {isAdmin && leave.status === 'pending' && (
                  <View style={s.reviewActions}>
                    <TouchableOpacity style={s.approveBtn} onPress={() => handleReview(leave._id, 'approved')}>
                      <CheckCircle size={14} color={colors.white} />
                      <Text style={s.approveBtnText}>APPROVE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.rejectBtn} onPress={() => handleReview(leave._id, 'rejected')}>
                      <XCircle size={14} color={colors.destructive} />
                      <Text style={s.rejectBtnText}>REJECT</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Apply Leave Modal */}
      <Modal visible={showApply} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Apply for Leave</Text>
            <TouchableOpacity onPress={() => setShowApply(false)}><X size={24} color={colors.slate600} /></TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={s.fieldLabel}>Leave Type</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowTypePicker(!showTypePicker)}>
              <Text style={s.pickerText}>{leaveType.charAt(0).toUpperCase() + leaveType.slice(1)}</Text>
              <ChevronDown size={18} color={colors.slate400} />
            </TouchableOpacity>
            {showTypePicker && (
              <View style={s.pickerDropdown}>
                {LEAVE_TYPES.map(t => (
                  <TouchableOpacity key={t} style={s.pickerOption} onPress={() => { setLeaveType(t); setShowTypePicker(false); }}>
                    <Text style={[s.pickerOptionText, t === leaveType && { color: colors.primary, fontFamily: typography.fontFamily.black }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={s.fieldLabel}>Start Date (YYYY-MM-DD)</Text>
            <TextInput style={s.input} value={startDate} onChangeText={setStartDate} placeholder="2025-01-15" placeholderTextColor={colors.slate300} />

            <Text style={s.fieldLabel}>End Date (YYYY-MM-DD)</Text>
            <TextInput style={s.input} value={endDate} onChangeText={setEndDate} placeholder="2025-01-16" placeholderTextColor={colors.slate300} />

            <Text style={s.fieldLabel}>Reason</Text>
            <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={reason} onChangeText={setReason} placeholder="Reason for leave..." placeholderTextColor={colors.slate300} multiline />

            <TouchableOpacity style={s.submitBtn} onPress={handleApply} disabled={submitting} activeOpacity={0.8}>
              <Text style={s.submitBtnText}>{submitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Leave Detail Modal */}
      <Modal visible={!!showDetail} animationType="slide" transparent>
        <View style={s.detailOverlay}>
          <View style={s.detailCard}>
            <View style={s.detailHeader}>
              <Text style={s.detailTitle}>Leave Details</Text>
              <TouchableOpacity onPress={() => setShowDetail(null)}><X size={22} color={colors.slate600} /></TouchableOpacity>
            </View>
            {showDetail && (
              <>
                {showDetail.userId?.name && <Text style={s.detailField}>Employee: {showDetail.userId.name}</Text>}
                <Text style={s.detailField}>Type: {showDetail.type}</Text>
                <Text style={s.detailField}>
                  From: {new Date(showDetail.startDate).toLocaleDateString()}
                </Text>
                <Text style={s.detailField}>
                  To: {new Date(showDetail.endDate).toLocaleDateString()}
                </Text>
                <Text style={s.detailField}>Status: {showDetail.status}</Text>
                {showDetail.reason && <Text style={s.detailField}>Reason: {showDetail.reason}</Text>}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.base, paddingTop: spacing.base, marginBottom: spacing.sm },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -0.5 },
  addBtn: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.xl },
  tabRow: { flexDirection: 'row', marginHorizontal: spacing.base, marginBottom: spacing.md, backgroundColor: colors.slate100, borderRadius: radius.lg, padding: 4 },
  tab: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white, ...shadows.sm },
  tabText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
  tabTextActive: { color: colors.primary, fontFamily: typography.fontFamily.black },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.base, marginBottom: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
  scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
  balanceRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  balanceCard: { flex: 1, backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  balanceType: { fontSize: 8, fontFamily: typography.fontFamily.black, color: colors.primary, letterSpacing: 1.5 },
  balanceValue: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900, marginVertical: spacing.xs },
  balanceLabel: { fontSize: 9, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
  emptyCard: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
  leaveCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  empName: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800, marginBottom: spacing.sm },
  leaveHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  typeBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  typeText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, letterSpacing: 0.5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  statusText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, textTransform: 'capitalize' },
  leaveDates: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  leaveReason: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate500, marginTop: spacing.sm },
  reviewActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  approveBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, ...shadows.md },
  approveBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1 },
  rejectBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.destructive + '15', borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  rejectBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.destructive, letterSpacing: 1 },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  modalBody: { flex: 1, padding: spacing.base },
  fieldLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.base, paddingVertical: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900, borderWidth: 1, borderColor: colors.border },
  pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border },
  pickerText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
  pickerDropdown: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.xs, overflow: 'hidden' },
  pickerOption: { paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  pickerOptionText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate700 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.xl, ...shadows.xl },
  submitBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.xl },
  detailCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.xl },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  detailTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  detailField: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate700, marginBottom: spacing.md },
});
