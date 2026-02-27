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
    ArrowLeft, Plus, X, CheckSquare, Clock, Users,
    Edit3, Trash2, Calendar, MessageCircle, Send,
    AlertCircle
} from 'lucide-react-native';

export default function ProjectDetailScreen({ route, navigation }: any) {
    const { projectId } = route.params;
    const { user } = useAuth();
    const isAdmin = ['admin', 'superadmin', 'master-admin'].includes(user?.role || '');
    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [selectedTaskView, setSelectedTaskView] = useState<any>(null);

    // Task form
    const [taskName, setTaskName] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [taskStatus, setTaskStatus] = useState('pending');
    const [taskPriority, setTaskPriority] = useState('medium');
    const [commentText, setCommentText] = useState('');
    const [addingComment, setAddingComment] = useState(false);

    useEffect(() => { fetchProject(); }, []);

    const fetchProject = async () => {
        try {
            const { data } = await api.get(`/projects/${projectId}`);
            if (data.success) {
                setProject(data.project);
                setTasks(data.project?.tasks || data.tasks || []);
                if (selectedTaskView) {
                    const updatedTask = (data.project?.tasks || []).find((t: any) => t._id === selectedTaskView._id);
                    if (updatedTask) setSelectedTaskView(updatedTask);
                }
            }
        } catch (e) { }
    };

    const onRefresh = async () => { setRefreshing(true); await fetchProject(); setRefreshing(false); };

    const openTaskForm = (task?: any) => {
        if (task) {
            setEditingTask(task);
            setTaskName(task.name || task.title || '');
            setTaskDesc(task.description || '');
            setTaskStatus(task.status || 'pending');
            setTaskPriority(task.priority || 'medium');
        } else {
            setEditingTask(null);
            setTaskName(''); setTaskDesc(''); setTaskStatus('pending'); setTaskPriority('medium');
        }
        setShowTaskForm(true);
    };

    const handleSaveTask = async () => {
        if (!taskName.trim()) { Alert.alert('Error', 'Task name required'); return; }
        setSaving(true);
        try {
            const payload = {
                name: taskName,
                title: taskName,
                description: taskDesc,
                status: taskStatus,
                priority: taskPriority
            };
            const { data } = editingTask
                ? await api.patch(`/projects/${projectId}/tasks/${editingTask._id}`, payload)
                : await api.post(`/projects/${projectId}/tasks`, payload);
            if (data.success) {
                setShowTaskForm(false);
                fetchProject();
            }
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed');
        }
        setSaving(false);
    };

    const handleDeleteTask = (taskId: string) => {
        Alert.alert('Delete Task', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try { await api.delete(`/projects/${projectId}/tasks/${taskId}`); fetchProject(); }
                    catch (e) { Alert.alert('Error', 'Delete failed'); }
                }
            },
        ]);
    };

    const toggleTaskStatus = async (task: any) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        try {
            await api.patch(`/projects/${projectId}/tasks/${task._id}`, { status: newStatus });
            fetchProject();
        } catch (e) { }
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !selectedTaskView) return;
        setAddingComment(true);
        try {
            const { data } = await api.post(`/projects/${projectId}/tasks/${selectedTaskView._id}/comments`, {
                text: commentText
            });
            if (data.success) {
                setCommentText('');
                fetchProject();
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to post comment');
        }
        setAddingComment(false);
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'completed': return colors.success;
            case 'in-progress': return colors.primary;
            case 'review': return colors.info;
            default: return colors.warning;
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'high': return colors.destructive;
            case 'medium': return colors.info;
            default: return colors.slate400;
        }
    };

    return (
        <SafeAreaView style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <ArrowLeft size={24} color={colors.slate900} />
                </TouchableOpacity>
                <Text style={s.headerTitle} numberOfLines={1}>{project?.name || 'Project'}</Text>
                {isAdmin && (
                    <TouchableOpacity style={s.addBtn} onPress={() => openTaskForm()}>
                        <Plus size={18} color={colors.white} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                contentContainerStyle={s.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Project Info */}
                {project && (
                    <View style={s.infoCard}>
                        <Text style={s.projectName}>{project.name}</Text>
                        {project.description && <Text style={s.projectDesc}>{project.description}</Text>}
                        <View style={s.infoRow}>
                            <View style={s.infoItem}>
                                <Users size={16} color={colors.slate400} />
                                <Text style={s.infoText}>{project.members?.length || 0} Members</Text>
                            </View>
                            <View style={s.infoItem}>
                                <Calendar size={16} color={colors.slate400} />
                                <Text style={s.infoText}>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''}</Text>
                            </View>
                            <View style={[s.statusBadge, { backgroundColor: getStatusColor(project.status) + '15' }]}>
                                <Text style={[s.statusBadgeText, { color: getStatusColor(project.status) }]}>
                                    {(project.status || 'active').toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Tasks */}
                <View style={s.sectionHeader}>
                    <Text style={s.sectionTitle}>Tasks</Text>
                    <Text style={s.taskCount}>{tasks.length} total</Text>
                </View>

                {tasks.length === 0 ? (
                    <View style={s.empty}>
                        <CheckSquare size={48} color={colors.slate200} />
                        <Text style={s.emptyText}>No tasks yet</Text>
                    </View>
                ) : (
                    tasks.map((task: any) => {
                        const sc = getStatusColor(task.status);
                        return (
                            <View key={task._id} style={s.taskCard}>
                                <TouchableOpacity onPress={() => toggleTaskStatus(task)} style={s.checkBtn}>
                                    <View style={[s.checkbox, task.status === 'completed' && s.checkboxDone]}>
                                        {task.status === 'completed' && <CheckSquare size={18} color={colors.white} />}
                                    </View>
                                </TouchableOpacity>
                                <View style={s.taskContent}>
                                    <View style={s.taskTitleRow}>
                                        <Text style={[s.taskName, task.status === 'completed' && s.taskNameDone]}>
                                            {task.name || task.title}
                                        </Text>
                                        <View style={[s.prioTag, { backgroundColor: getPriorityColor(task.priority) + '15' }]}>
                                            <Text style={[s.prioTagText, { color: getPriorityColor(task.priority) }]}>{(task.priority || 'medium').toUpperCase()}</Text>
                                        </View>
                                    </View>
                                    {task.description && <Text style={s.taskDesc} numberOfLines={1}>{task.description}</Text>}
                                    <View style={s.taskMeta}>
                                        <View style={[s.miniStatus, { backgroundColor: sc + '15' }]}>
                                            <Text style={[s.miniStatusText, { color: sc }]}>{task.status?.toUpperCase()}</Text>
                                        </View>
                                        <TouchableOpacity style={s.commentCount} onPress={() => setSelectedTaskView(task)}>
                                            <MessageCircle size={14} color={colors.slate400} />
                                            <Text style={s.commentCountText}>{task.comments?.length || 0}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {isAdmin && (
                                    <View style={s.taskActions}>
                                        <TouchableOpacity onPress={() => openTaskForm(task)} style={s.miniBtn}>
                                            <Edit3 size={14} color={colors.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteTask(task._id)} style={s.miniBtn}>
                                            <Trash2 size={14} color={colors.destructive} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Task Form Modal */}
            <Modal visible={showTaskForm} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={s.modalContainer}>
                    <View style={s.modalHeader}>
                        <Text style={s.modalTitle}>{editingTask ? 'Edit Task' : 'New Task'}</Text>
                        <TouchableOpacity onPress={() => setShowTaskForm(false)}><X size={24} color={colors.slate600} /></TouchableOpacity>
                    </View>
                    <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
                        <Text style={s.fieldLabel}>Task Name</Text>
                        <TextInput style={s.input} value={taskName} onChangeText={setTaskName} placeholder="Task name" placeholderTextColor={colors.slate300} />

                        <Text style={s.fieldLabel}>Description</Text>
                        <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={taskDesc} onChangeText={setTaskDesc} placeholder="Description..." placeholderTextColor={colors.slate300} multiline />

                        <Text style={s.fieldLabel}>Status</Text>
                        <View style={s.statusRow}>
                            {['pending', 'in-progress', 'review', 'completed'].map(st => (
                                <TouchableOpacity key={st} style={[s.statusOption, taskStatus === st && { borderColor: getStatusColor(st), backgroundColor: getStatusColor(st) + '12' }]} onPress={() => setTaskStatus(st)}>
                                    <Text style={[s.statusOptionText, taskStatus === st && { color: getStatusColor(st) }]}>{st.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={s.fieldLabel}>Priority</Text>
                        <View style={s.statusRow}>
                            {['low', 'medium', 'high'].map(p => (
                                <TouchableOpacity key={p} style={[s.statusOption, taskPriority === p && { borderColor: getPriorityColor(p), backgroundColor: getPriorityColor(p) + '12' }]} onPress={() => setTaskPriority(p)}>
                                    <Text style={[s.statusOptionText, taskPriority === p && { color: getPriorityColor(p) }]}>{p.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={s.saveBtn} onPress={handleSaveTask} disabled={saving} activeOpacity={0.8}>
                            {saving ? <ActivityIndicator color={colors.white} /> : <Text style={s.saveBtnText}>{editingTask ? 'UPDATE TASK' : 'CREATE TASK'}</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Task Detail & Comments Modal */}
            <Modal visible={!!selectedTaskView} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={s.modalContainer}>
                    <View style={s.modalHeader}>
                        <View style={s.modalHeaderContent}>
                            <Text style={s.modalTitle}>Task Details</Text>
                            <Text style={s.modalSubtitle}>Collaboration Hub</Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedTaskView(null)}><X size={24} color={colors.slate600} /></TouchableOpacity>
                    </View>
                    <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
                        <View style={s.detailMain}>
                            <View style={[s.prioTag, { backgroundColor: getPriorityColor(selectedTaskView?.priority) + '15', alignSelf: 'flex-start' }]}>
                                <Text style={[s.prioTagText, { color: getPriorityColor(selectedTaskView?.priority) }]}>{(selectedTaskView?.priority || 'medium').toUpperCase()} PRIORITY</Text>
                            </View>
                            <Text style={s.detailName}>{selectedTaskView?.name || selectedTaskView?.title}</Text>
                            <Text style={s.detailDesc}>{selectedTaskView?.description || 'No description provided.'}</Text>

                            <View style={s.detailMeta}>
                                <View style={s.detailMetaItem}>
                                    <Clock size={14} color={colors.slate400} />
                                    <Text style={s.detailMetaText}>Status: {selectedTaskView?.status?.toUpperCase()}</Text>
                                </View>
                                <View style={s.detailMetaItem}>
                                    <Users size={14} color={colors.slate400} />
                                    <Text style={s.detailMetaText}>Added by: {selectedTaskView?.createdBy?.name}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={s.commentSection}>
                            <View style={s.sectionHeader}>
                                <Text style={s.sectionTitle}>Activity Stream</Text>
                                <View style={s.commentBadge}><Text style={s.commentBadgeText}>{selectedTaskView?.comments?.length || 0}</Text></View>
                            </View>

                            {(selectedTaskView?.comments || []).length === 0 ? (
                                <View style={s.emptyComments}>
                                    <MessageCircle size={40} color={colors.slate100} />
                                    <Text style={s.emptyCommentsText}>No signals detected yet</Text>
                                </View>
                            ) : (
                                selectedTaskView.comments.map((c: any, i: number) => (
                                    <View key={i} style={s.commentCard}>
                                        <View style={s.commentAvatar}>
                                            <Text style={s.commentAvatarText}>{c.userId?.name?.[0]}</Text>
                                        </View>
                                        <View style={s.commentContent}>
                                            <View style={s.commentHeader}>
                                                <Text style={s.commentUser}>{c.userId?.name}</Text>
                                                <Text style={s.commentTime}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                            </View>
                                            <Text style={s.commentText}>{c.text}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </ScrollView>

                    <View style={s.commentInputArea}>
                        <View style={s.commentInputWrap}>
                            <TextInput
                                style={s.commentInput}
                                placeholder="Transmit to cluster..."
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                            />
                            <TouchableOpacity
                                style={[s.sendBtn, !commentText.trim() && { opacity: 0.5 }]}
                                onPress={handleAddComment}
                                disabled={addingComment || !commentText.trim()}
                            >
                                {addingComment ? <ActivityIndicator size="small" color={colors.white} /> : <Send size={18} color={colors.white} />}
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.white },
    backBtn: { marginRight: spacing.md, padding: spacing.xs },
    headerTitle: { flex: 1, fontSize: typography.size.lg, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
    addBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: spacing.base, paddingBottom: spacing['4xl'] },
    infoCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing.xl, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
    projectName: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900, marginBottom: spacing.sm },
    projectDesc: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate500, lineHeight: 20, marginBottom: spacing.md },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    infoText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
    statusBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
    statusBadgeText: { fontSize: 9, fontFamily: typography.fontFamily.black, letterSpacing: 0.5 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    sectionTitle: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate800 },
    taskCount: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
    empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
    emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
    taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    checkBtn: { marginRight: spacing.md },
    checkbox: { width: 28, height: 28, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.slate200, justifyContent: 'center', alignItems: 'center' },
    checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
    taskContent: { flex: 1 },
    taskName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
    taskNameDone: { textDecorationLine: 'line-through', color: colors.slate400 },
    taskDesc: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.regular, color: colors.slate400, marginTop: 2 },
    miniStatus: { borderRadius: radius.sm, paddingHorizontal: spacing.xs, paddingVertical: 2, alignSelf: 'flex-start', marginTop: spacing.xs },
    miniStatusText: { fontSize: 8, fontFamily: typography.fontFamily.black, letterSpacing: 0.5 },
    taskActions: { flexDirection: 'row', gap: spacing.xs, marginLeft: spacing.sm },
    miniBtn: { padding: spacing.xs },
    modalContainer: { flex: 1, backgroundColor: colors.background },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
    modalBody: { flex: 1, padding: spacing.base },
    fieldLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.md },
    input: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.base, paddingVertical: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900, borderWidth: 1, borderColor: colors.border },
    statusRow: { flexDirection: 'row', gap: spacing.sm },
    statusOption: { flex: 1, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
    statusOptionText: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.slate400, letterSpacing: 1 },
    saveBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.xl, ...shadows.xl },
    saveBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
    taskTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    prioTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm },
    prioTagText: { fontSize: 8, fontFamily: typography.fontFamily.black, letterSpacing: 1 },
    taskMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
    commentCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    commentCountText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate400 },
    modalHeaderContent: { flex: 1 },
    modalSubtitle: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
    detailMain: { paddingHorizontal: spacing.base, paddingVertical: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
    detailName: { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, marginTop: spacing.md },
    detailDesc: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate600, lineHeight: 22, marginTop: spacing.sm },
    detailMeta: { flexDirection: 'column', gap: spacing.sm, marginTop: spacing.xl },
    detailMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailMetaText: { fontSize: 11, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
    commentSection: { padding: spacing.base },
    commentBadge: { backgroundColor: colors.slate100, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
    commentBadgeText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate600 },
    emptyComments: { alignItems: 'center', paddingVertical: spacing['4xl'] },
    emptyCommentsText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.slate200, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: 2 },
    commentCard: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
    commentAvatar: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
    commentAvatarText: { fontSize: 12, fontFamily: typography.fontFamily.black, color: colors.primary },
    commentContent: { flex: 1, backgroundColor: colors.slate50, padding: spacing.md, borderRadius: radius.lg, borderTopLeftRadius: 0 },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    commentUser: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.slate800 },
    commentTime: { fontSize: 9, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
    commentText: { fontSize: 13, fontFamily: typography.fontFamily.medium, color: colors.slate600, lineHeight: 18 },
    commentInputArea: { padding: spacing.base, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
    commentInputWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.slate50, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.border },
    commentInput: { flex: 1, fontSize: 14, fontFamily: typography.fontFamily.medium, color: colors.slate800, minHeight: 40, maxHeight: 100, paddingVertical: spacing.sm },
    sendBtn: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
});
