import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  ClipboardList, Plus, X, Clock, Calendar,
  ChevronLeft, ChevronRight, Edit3, Trash2, ChevronDown
} from 'lucide-react-native';

export default function TimesheetsScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Date filter
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Form
  const [taskName, setTaskName] = useState('');
  const [hours, setHours] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [entryDate, setEntryDate] = useState(filterDate);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  useEffect(() => { fetchData(); }, [filterDate]);

  const fetchData = async () => {
    try {
      const [tsRes, projRes] = await Promise.allSettled([
        api.get(`/timesheets?date=${filterDate}`),
        api.get('/projects'),
      ]);
      if (tsRes.status === 'fulfilled' && tsRes.value.data?.success) setEntries(tsRes.value.data.timesheets || tsRes.value.data.entries || []);
      if (projRes.status === 'fulfilled' && projRes.value.data?.success) setProjects(projRes.value.data.projects || []);
    } catch (e) { }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const changeDate = (delta: number) => {
    const d = new Date(filterDate);
    d.setDate(d.getDate() + delta);
    setFilterDate(d.toISOString().split('T')[0]);
  };

  const openForm = (entry?: any) => {
    if (entry) {
      setEditing(entry);
      setTaskName(entry.task || entry.taskName || '');
      setHours(String(entry.hours || ''));
      setProjectId(entry.projectId?._id || entry.projectId || '');
      setDescription(entry.description || '');
      setEntryDate(entry.date || filterDate);
    } else {
      setEditing(null);
      setTaskName(''); setHours(''); setProjectId(''); setDescription('');
      setEntryDate(filterDate);
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!taskName.trim() || !hours) { Alert.alert('Error', 'Task name and hours are required'); return; }
    setSaving(true);
    try {
      const payload = { task: taskName, taskName, hours: parseFloat(hours), projectId: projectId || undefined, description, date: entryDate };
      const { data } = editing
        ? await api.put(`/timesheets/${editing._id}`, payload)
        : await api.post('/timesheets', payload);
      if (data.success) {
        Alert.alert('Success', editing ? 'Entry updated' : 'Entry created');
        setShowForm(false);
        fetchData();
      } else {
        Alert.alert('Error', data.message || 'Failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await api.delete(`/timesheets/${id}`); fetchData(); }
          catch (e) { Alert.alert('Error', 'Delete failed'); }
        }
      },
    ]);
  };

  const totalHours = entries.reduce((a, e) => a + (e.hours || 0), 0);
  const selectedProject = projects.find((p: any) => p._id === projectId);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>Timesheets</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => openForm()} activeOpacity={0.8}>
          <Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      <View style={s.datePicker}>
        <TouchableOpacity onPress={() => changeDate(-1)}><ChevronLeft size={24} color={colors.slate600} /></TouchableOpacity>
        <View style={s.dateCenter}>
          <Calendar size={16} color={colors.primary} />
          <Text style={s.dateText}>{new Date(filterDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
        </View>
        <TouchableOpacity onPress={() => changeDate(1)}><ChevronRight size={24} color={colors.slate600} /></TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryValue}>{entries.length}</Text>
          <Text style={s.summaryLabel}>Entries</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={[s.summaryValue, { color: colors.primary }]}>{totalHours}h</Text>
          <Text style={s.summaryLabel}>Total Hours</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {entries.length === 0 ? (
          <View style={s.empty}>
            <ClipboardList size={48} color={colors.slate200} />
            <Text style={s.emptyText}>No entries for this date</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => openForm()}>
              <Text style={s.emptyBtnText}>LOG TIME</Text>
            </TouchableOpacity>
          </View>
        ) : (
          entries.map((entry: any) => (
            <View key={entry._id} style={s.entryCard}>
              <View style={s.entryHeader}>
                <View style={[s.hoursCircle, { backgroundColor: colors.primary + '12' }]}>
                  <Text style={s.hoursCircleText}>{entry.hours}h</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.entryTask}>{entry.task || entry.taskName}</Text>
                  {(entry.projectId?.name || entry.project) && (
                    <Text style={s.entryProject}>{entry.projectId?.name || entry.project}</Text>
                  )}
                </View>
                <View style={s.entryActions}>
                  <TouchableOpacity onPress={() => openForm(entry)} style={s.miniBtn}>
                    <Edit3 size={14} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(entry._id)} style={s.miniBtn}>
                    <Trash2 size={14} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
              </View>
              {entry.description && <Text style={s.entryDesc}>{entry.description}</Text>}
            </View>
          ))
        )}
      </ScrollView>

      {/* Form Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{editing ? 'Edit Entry' : 'Log Time'}</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}><X size={24} color={colors.slate600} /></TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={s.fieldLabel}>Task Name</Text>
            <TextInput style={s.input} value={taskName} onChangeText={setTaskName} placeholder="What did you work on?" placeholderTextColor={colors.slate300} />

            <Text style={s.fieldLabel}>Hours</Text>
            <TextInput style={s.input} value={hours} onChangeText={setHours} placeholder="2.5" placeholderTextColor={colors.slate300} keyboardType="decimal-pad" />

            <Text style={s.fieldLabel}>Project (Optional)</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowProjectPicker(!showProjectPicker)}>
              <Text style={s.pickerText}>{selectedProject?.name || 'Select project...'}</Text>
              <ChevronDown size={18} color={colors.slate400} />
            </TouchableOpacity>
            {showProjectPicker && (
              <View style={s.pickerDropdown}>
                <TouchableOpacity style={s.pickerOption} onPress={() => { setProjectId(''); setShowProjectPicker(false); }}>
                  <Text style={s.pickerOptionText}>None</Text>
                </TouchableOpacity>
                {projects.map((p: any) => (
                  <TouchableOpacity key={p._id} style={s.pickerOption} onPress={() => { setProjectId(p._id); setShowProjectPicker(false); }}>
                    <Text style={[s.pickerOptionText, p._id === projectId && { color: colors.primary, fontFamily: typography.fontFamily.black }]}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={s.fieldLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput style={s.input} value={entryDate} onChangeText={setEntryDate} placeholder="2025-01-15" placeholderTextColor={colors.slate300} />

            <Text style={s.fieldLabel}>Description (Optional)</Text>
            <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} placeholder="Details..." placeholderTextColor={colors.slate300} multiline />

            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
              {saving ? <ActivityIndicator color={colors.white} /> : <Text style={s.saveBtnText}>{editing ? 'UPDATE ENTRY' : 'LOG TIME'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.base, paddingTop: spacing.base, marginBottom: spacing.md },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -0.5 },
  addBtn: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.xl },
  datePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: spacing.base, backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  dateCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dateText: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  summaryRow: { flexDirection: 'row', gap: spacing.md, marginHorizontal: spacing.base, marginBottom: spacing.md },
  summaryCard: { flex: 1, backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  summaryValue: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  summaryLabel: { fontSize: 9, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
  empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
  emptyBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.lg, ...shadows.xl },
  emptyBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
  entryCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hoursCircle: { width: 48, height: 48, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
  hoursCircleText: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.primary },
  entryTask: { fontSize: typography.size.md, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  entryProject: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: 1 },
  entryActions: { flexDirection: 'row', gap: spacing.xs },
  miniBtn: { padding: spacing.xs },
  entryDesc: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate500, marginTop: spacing.sm },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  modalBody: { flex: 1, padding: spacing.base },
  fieldLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.base, paddingVertical: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900, borderWidth: 1, borderColor: colors.border },
  pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border },
  pickerText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate700 },
  pickerDropdown: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.xs, overflow: 'hidden' },
  pickerOption: { paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
  pickerOptionText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate700 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.xl, ...shadows.xl },
  saveBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
});
