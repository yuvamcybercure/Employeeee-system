import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FolderOpen, Plus, X, Users, Calendar, ChevronRight, Edit3, Trash2 } from 'lucide-react-native';

export default function ProjectsScreen({ navigation }: any) {
  const { user, hasPermission } = useAuth();
  const isAdmin = ['admin', 'superadmin', 'master-admin'].includes(user?.role || '');
  const [projects, setProjects] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      if (data.success) setProjects(data.projects || []);
    } catch (e) { }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchProjects(); setRefreshing(false); };

  const openForm = (project?: any) => {
    if (project) {
      setEditing(project);
      setName(project.name || '');
      setDescription(project.description || '');
      setStatus(project.status || 'active');
    } else {
      setEditing(null);
      setName(''); setDescription(''); setStatus('active');
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Project name is required'); return; }
    setSaving(true);
    try {
      const payload = { name, description, status };
      const { data } = editing
        ? await api.put(`/projects/${editing._id}`, payload)
        : await api.post('/projects', payload);
      if (data.success) {
        Alert.alert('Success', editing ? 'Project updated' : 'Project created');
        setShowForm(false);
        fetchProjects();
      } else {
        Alert.alert('Error', data.message || 'Failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Project', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/projects/${id}`);
            fetchProjects();
          } catch (e) { Alert.alert('Error', 'Delete failed'); }
        }
      },
    ]);
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'active': return colors.success;
      case 'completed': return colors.primary;
      case 'on-hold': return colors.warning;
      default: return colors.slate400;
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>Projects</Text>
        {isAdmin && (
          <TouchableOpacity style={s.addBtn} onPress={() => openForm()} activeOpacity={0.8}>
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {projects.length === 0 ? (
          <View style={s.empty}>
            <FolderOpen size={48} color={colors.slate200} />
            <Text style={s.emptyText}>No projects found</Text>
          </View>
        ) : (
          projects.map((project) => {
            const sc = getStatusColor(project.status);
            return (
              <TouchableOpacity
                key={project._id}
                style={s.projectCard}
                onPress={() => navigation.navigate('ProjectDetail', { projectId: project._id, name: project.name })}
                activeOpacity={0.7}
              >
                <View style={s.projectHeader}>
                  <View style={[s.statusDot, { backgroundColor: sc }]} />
                  <Text style={s.projectName}>{project.name}</Text>
                  {isAdmin && (
                    <View style={s.projectActions}>
                      <TouchableOpacity onPress={() => openForm(project)} style={s.iconBtn}>
                        <Edit3 size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(project._id)} style={s.iconBtn}>
                        <Trash2 size={16} color={colors.destructive} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {project.description && (
                  <Text style={s.projectDesc} numberOfLines={2}>{project.description}</Text>
                )}
                <View style={s.projectMeta}>
                  <View style={s.metaItem}>
                    <Users size={14} color={colors.slate400} />
                    <Text style={s.metaText}>{project.members?.length || 0} members</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: sc + '15' }]}>
                    <Text style={[s.statusText, { color: sc }]}>{(project.status || 'active').toUpperCase()}</Text>
                  </View>
                </View>
                <View style={s.viewDetail}>
                  <Text style={s.viewDetailText}>View Details</Text>
                  <ChevronRight size={16} color={colors.primary} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{editing ? 'Edit Project' : 'New Project'}</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}><X size={24} color={colors.slate600} /></TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={s.fieldLabel}>Project Name</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Project name" placeholderTextColor={colors.slate300} />

            <Text style={s.fieldLabel}>Description</Text>
            <TextInput style={[s.input, { height: 100, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} placeholder="Project description..." placeholderTextColor={colors.slate300} multiline />

            <Text style={s.fieldLabel}>Status</Text>
            <View style={s.statusRow}>
              {['active', 'on-hold', 'completed'].map(st => (
                <TouchableOpacity
                  key={st}
                  style={[s.statusOption, status === st && { borderColor: getStatusColor(st), backgroundColor: getStatusColor(st) + '12' }]}
                  onPress={() => setStatus(st)}
                >
                  <Text style={[s.statusOptionText, status === st && { color: getStatusColor(st) }]}>
                    {st.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
              {saving ? <ActivityIndicator color={colors.white} /> : (
                <Text style={s.saveBtnText}>{editing ? 'UPDATE PROJECT' : 'CREATE PROJECT'}</Text>
              )}
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
  scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
  empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
  projectCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  projectHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  projectName: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800, flex: 1 },
  projectActions: { flexDirection: 'row', gap: spacing.xs },
  iconBtn: { padding: spacing.xs },
  projectDesc: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate500, marginBottom: spacing.md, lineHeight: 18 },
  projectMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
  statusBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  statusText: { fontSize: 9, fontFamily: typography.fontFamily.black, letterSpacing: 0.5 },
  viewDetail: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, borderTopWidth: 1, borderTopColor: colors.slate50, paddingTop: spacing.md },
  viewDetailText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.primary },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  modalBody: { flex: 1, padding: spacing.base },
  fieldLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.base, paddingVertical: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900, borderWidth: 1, borderColor: colors.border },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusOption: { flex: 1, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
  statusOptionText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate400, letterSpacing: 1 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.xl, ...shadows.xl },
  saveBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
});
