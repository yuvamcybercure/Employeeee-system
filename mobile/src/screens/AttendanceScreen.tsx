import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, Image, TextInput, Modal, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Clock, Calendar, MapPin, CheckCircle, Camera, X, Search, ChevronLeft, ChevronRight,
  Globe, FileDown, MoreVertical
} from 'lucide-react-native';
import AttendanceProtocolModal from '../components/AttendanceProtocolModal';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function AttendanceScreen({ navigation }: any) {
  const { user } = useAuth();
  const isAdmin = ['admin', 'superadmin', 'master-admin'].includes(user?.role || '');
  const [refreshing, setRefreshing] = useState(false);
  const [attendance, setAttendance] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [clockLoading, setClockLoading] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [tab, setTab] = useState<'my' | 'team'>('my');
  const [teamRecords, setTeamRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showProtocol, setShowProtocol] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Date filter
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchData(); }, [month, year, tab]);

  const fetchData = async () => {
    try {
      const [todayRes, histRes] = await Promise.allSettled([
        api.get('/attendance/today'),
        api.get(`/attendance/history?month=${month}&year=${year}`),
      ]);
      if (todayRes.status === 'fulfilled' && todayRes.value.data?.success) setAttendance(todayRes.value.data.attendance);
      if (histRes.status === 'fulfilled' && histRes.value.data?.success) setRecords(histRes.value.data.records || []);
    } catch (e) { }

    if (isAdmin && tab === 'team') {
      try {
        const { data } = await api.get('/attendance/overview');
        if (data.success) setTeamRecords(data.records || []);
      } catch (e) { }
    }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const handleClock = () => {
    if (attendance?.clockOut) return;
    setShowProtocol(true);
  };

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m); setYear(y);
  };

  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });

  const filteredTeam = teamRecords.filter(r => {
    if (!search) return true;
    return (r.userId?.name || '').toLowerCase().includes(search.toLowerCase());
  });

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(true);
    try {
      const endpoint = format === 'pdf' ? '/reports/attendance-pdf' : '/reports/attendance-excel';
      const filename = `Attendance_Report_${month}_${year}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      const fileUri = `${(FileSystem as any).documentDirectory}${filename}`;

      const { uri } = await FileSystem.downloadAsync(
        `${api.defaults.baseURL}${endpoint}?month=${month}&year=${year}`,
        fileUri,
        {
          headers: {
            'Authorization': api.defaults.headers.common['Authorization'] as string
          }
        }
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Download Complete', `File saved to: ${uri}`);
      }
    } catch (e) {
      Alert.alert('Export Error', 'Failed to generate report');
    }
    setExporting(false);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Attendance</Text>
        {isAdmin && (
          <View style={s.headerActions}>
            <TouchableOpacity
              style={s.headerBtn}
              onPress={() => navigation.navigate('GeofenceSettings')}
            >
              <Globe size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.headerBtn}
              onPress={() => {
                Alert.alert('Export Report', 'Choose format', [
                  { text: 'PDF', onPress: () => handleExport('pdf') },
                  { text: 'Excel', onPress: () => handleExport('excel') },
                  { text: 'Cancel', style: 'cancel' }
                ]);
              }}
              disabled={exporting}
            >
              {exporting ? <ActivityIndicator size="small" color={colors.primary} /> : <FileDown size={22} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Admin Tabs */}
      {isAdmin && (
        <View style={s.tabRow}>
          <TouchableOpacity style={[s.tab, tab === 'my' && s.tabActive]} onPress={() => setTab('my')}>
            <Text style={[s.tabText, tab === 'my' && s.tabTextActive]}>My Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab, tab === 'team' && s.tabActive]} onPress={() => setTab('team')}>
            <Text style={[s.tabText, tab === 'team' && s.tabTextActive]}>Team View</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'my' ? (
          <>
            {/* Clock Action */}
            <View style={s.clockCard}>
              <View style={s.clockInfo}>
                <Text style={s.clockTitle}>
                  {attendance?.clockOut ? 'Day Complete' : attendance?.clockIn ? 'Currently Working' : 'Ready to Start'}
                </Text>
                <Text style={s.clockTime}>
                  {attendance?.clockIn?.time
                    ? `In: ${new Date(attendance.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Not clocked in'}
                  {attendance?.clockOut?.time
                    ? ` | Out: ${new Date(attendance.clockOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={[s.clockBtn, attendance?.clockIn && s.clockBtnOut, attendance?.clockOut && s.clockBtnDisabled]}
                onPress={handleClock}
                disabled={!!attendance?.clockOut || clockLoading}
                activeOpacity={0.8}
              >
                {clockLoading ? <ActivityIndicator color={colors.white} /> : (
                  <>
                    <Camera size={18} color={colors.white} />
                    <Text style={s.clockBtnText}>
                      {attendance?.clockOut ? 'DONE' : attendance?.clockIn ? 'CLOCK OUT' : 'CLOCK IN'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Month Picker */}
            <View style={s.monthPicker}>
              <TouchableOpacity onPress={() => changeMonth(-1)}>
                <ChevronLeft size={24} color={colors.slate600} />
              </TouchableOpacity>
              <Text style={s.monthText}>{monthName} {year}</Text>
              <TouchableOpacity onPress={() => changeMonth(1)}>
                <ChevronRight size={24} color={colors.slate600} />
              </TouchableOpacity>
            </View>

            {/* History */}
            {records.length === 0 ? (
              <View style={s.emptyCard}>
                <Calendar size={48} color={colors.slate200} />
                <Text style={s.emptyText}>No records for this month</Text>
              </View>
            ) : (
              records.map((record, i) => {
                const isPresent = record.status === 'present';
                const isLate = record.status === 'late';
                const isSunday = record.status === 'Sunday';
                const statusColor = isPresent ? colors.success : isLate ? colors.warning : isSunday ? colors.primary : colors.destructive;

                return (
                  <TouchableOpacity key={i} style={s.recordCard} onPress={() => setShowDetail(record)} activeOpacity={0.7}>
                    <View style={s.recordLeft}>
                      <View style={[s.dayCircle, { backgroundColor: statusColor + '15' }]}>
                        <Text style={[s.dayText, { color: statusColor }]}>
                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                        </Text>
                      </View>
                      <View>
                        <Text style={s.recordDate}>{record.date}</Text>
                        <View style={s.timesRow}>
                          <Text style={s.inTime}>
                            {record.clockIn?.time ? new Date(record.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                          </Text>
                          <Text style={s.timeSep}>→</Text>
                          <Text style={s.outTime}>
                            {record.clockOut?.time ? new Date(record.clockOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={s.recordRight}>
                      <Text style={s.hours}>{record.totalHours ? `${record.totalHours}h` : '0h'}</Text>
                      <View style={[s.statusBadge, { backgroundColor: statusColor + '15' }]}>
                        <Text style={[s.statusText, { color: statusColor }]}>
                          {record.status?.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        ) : (
          <>
            {/* Team View */}
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

            {filteredTeam.map((record: any, i: number) => (
              <TouchableOpacity key={record._id || i} style={s.teamCard} onPress={() => setShowDetail(record)} activeOpacity={0.7}>
                <View style={s.teamUser}>
                  {record.userId?.profilePhoto ? (
                    <Image source={{ uri: record.userId.profilePhoto }} style={s.teamAvatar} />
                  ) : (
                    <View style={s.teamAvatarPlaceholder}>
                      <Text style={s.teamAvatarText}>{record.userId?.name?.[0] || 'U'}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={s.teamName}>{record.userId?.name || 'Unknown'}</Text>
                    <Text style={s.teamDept}>{record.userId?.department || 'General'}</Text>
                  </View>
                </View>
                <View style={s.teamMeta}>
                  <View style={[s.statusBadge, {
                    backgroundColor: (record.status === 'present' ? colors.success : record.status === 'late' ? colors.warning : colors.destructive) + '15'
                  }]}>
                    <Text style={[s.statusText, {
                      color: record.status === 'present' ? colors.success : record.status === 'late' ? colors.warning : colors.destructive
                    }]}>{record.status?.toUpperCase()}</Text>
                  </View>
                  <Text style={s.teamClock}>
                    {record.clockIn?.time ? new Date(record.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!showDetail} animationType="slide" transparent>
        <View style={s.detailOverlay}>
          <View style={s.detailCard}>
            <View style={s.detailHeader}>
              <Text style={s.detailTitle}>Attendance Detail</Text>
              <TouchableOpacity onPress={() => setShowDetail(null)}><X size={22} color={colors.slate600} /></TouchableOpacity>
            </View>
            {showDetail && (
              <>
                {showDetail.userId?.name && <Text style={s.detailField}>Name: {showDetail.userId.name}</Text>}
                <Text style={s.detailField}>Date: {showDetail.date || 'Today'}</Text>
                <Text style={s.detailField}>Status: {showDetail.status || 'N/A'}</Text>
                <Text style={s.detailField}>
                  Clock In: {showDetail.clockIn?.time ? new Date(showDetail.clockIn.time).toLocaleTimeString() : 'N/A'}
                </Text>
                <Text style={s.detailField}>
                  Clock Out: {showDetail.clockOut?.time ? new Date(showDetail.clockOut.time).toLocaleTimeString() : 'N/A'}
                </Text>
                <Text style={s.detailField}>Total Hours: {showDetail.totalHours || 0}h</Text>
                {showDetail.clockIn?.ip && <Text style={s.detailField}>IP: {showDetail.clockIn.ip}</Text>}
              </>
            )}
          </View>
        </View>
      </Modal>

      <AttendanceProtocolModal
        visible={showProtocol}
        type={attendance?.clockIn ? 'out' : 'in'}
        onClose={() => setShowProtocol(false)}
        onSuccess={() => {
          Alert.alert('Success', attendance?.clockIn ? 'Check-out protocol finalized' : 'Check-in protocol finalized');
          fetchData();
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: spacing.base },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: spacing.sm },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, paddingHorizontal: spacing.base, paddingTop: spacing.base, marginBottom: spacing.sm, letterSpacing: -0.5 },
  tabRow: { flexDirection: 'row', marginHorizontal: spacing.base, marginBottom: spacing.md, backgroundColor: colors.slate100, borderRadius: radius.lg, padding: 4 },
  tab: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white, ...shadows.sm },
  tabText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
  tabTextActive: { color: colors.primary, fontFamily: typography.fontFamily.black },
  scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },

  clockCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.base, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border, ...shadows.md },
  clockInfo: { flex: 1 },
  clockTitle: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  clockTime: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: 2 },
  clockBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, ...shadows.xl },
  clockBtnOut: { backgroundColor: colors.slate900 },
  clockBtnDisabled: { backgroundColor: colors.slate300, opacity: 0.7 },
  clockBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1.5 },

  monthPicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  monthText: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800 },

  emptyCard: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },

  recordCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  recordLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  dayCircle: { width: 40, height: 40, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, letterSpacing: 1 },
  recordDate: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  timesRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  inTime: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.success },
  timeSep: { fontSize: typography.size.xs, color: colors.slate300 },
  outTime: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.destructive },
  recordRight: { alignItems: 'flex-end', gap: spacing.xs },
  hours: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  statusBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  statusText: { fontSize: 9, fontFamily: typography.fontFamily.black, letterSpacing: 0.5 },

  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  searchInput: { flex: 1, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate900 },

  teamCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  teamUser: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  teamAvatar: { width: 40, height: 40, borderRadius: radius.lg },
  teamAvatarPlaceholder: { width: 40, height: 40, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  teamAvatarText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.white },
  teamName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  teamDept: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginTop: 1 },
  teamMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  teamClock: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.slate800 },

  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.xl },
  detailCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.xl },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  detailTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  detailField: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate700, marginBottom: spacing.md },
});
