import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    FlatList, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { X, Search, Check, Users } from 'lucide-react-native';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { useAuth } from '../context/AuthContext';

interface GroupCreationModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (group: any) => void;
}

export function GroupCreationModal({ visible, onClose, onSuccess }: GroupCreationModalProps) {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [groupName, setGroupName] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchUsers();
        }
    }, [visible]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users');
            if (data.success) {
                setUsers(data.users.filter((u: any) => u._id !== user?._id));
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to load colleagues');
        }
        setLoading(false);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (!groupName.trim()) return Alert.alert('Error', 'Please enter a group name');
        if (selectedIds.length === 0) return Alert.alert('Error', 'Please select at least one member');

        setCreating(true);
        try {
            const { data } = await api.post('/messages/groups', {
                name: groupName,
                members: selectedIds
            });
            if (data.success) {
                onSuccess(data.group);
                setGroupName('');
                setSelectedIds([]);
                onClose();
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to create group');
        }
        setCreating(false);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={s.overlay}>
                <View style={s.container}>
                    <View style={s.header}>
                        <View>
                            <Text style={s.title}>New Group</Text>
                            <Text style={s.subtitle}>{selectedIds.length} members selected</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <X size={24} color={colors.slate400} />
                        </TouchableOpacity>
                    </View>

                    <View style={s.content}>
                        <View style={s.inputBox}>
                            <Users size={20} color={colors.primary} />
                            <TextInput
                                style={s.nameInput}
                                placeholder="Group Name"
                                placeholderTextColor={colors.slate400}
                                value={groupName}
                                onChangeText={setGroupName}
                            />
                        </View>

                        <View style={s.searchBox}>
                            <Search size={18} color={colors.slate400} />
                            <TextInput
                                style={s.searchInput}
                                placeholder="Search colleagues..."
                                placeholderTextColor={colors.slate400}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>

                        {loading ? (
                            <ActivityIndicator style={s.loader} color={colors.primary} />
                        ) : (
                            <FlatList
                                data={filteredUsers}
                                keyExtractor={item => item._id}
                                renderItem={({ item }) => {
                                    const isSelected = selectedIds.includes(item._id);
                                    return (
                                        <TouchableOpacity
                                            style={[s.userItem, isSelected && s.userItemActive]}
                                            onPress={() => toggleSelect(item._id)}
                                        >
                                            <View style={s.avatar}>
                                                <Text style={s.avatarText}>{item.name[0]}</Text>
                                            </View>
                                            <View style={s.userInfo}>
                                                <Text style={s.userName}>{item.name}</Text>
                                                <Text style={s.userDept}>{item.department || 'Employee'}</Text>
                                            </View>
                                            <View style={[s.checkbox, isSelected && s.checkboxActive]}>
                                                {isSelected && <Check size={14} color={colors.white} />}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                                contentContainerStyle={s.list}
                            />
                        )}
                    </View>

                    <TouchableOpacity
                        style={[s.createBtn, (!groupName || selectedIds.length === 0) && s.createBtnDisabled]}
                        onPress={handleCreate}
                        disabled={creating}
                    >
                        {creating ? <ActivityIndicator color={colors.white} /> : <Text style={s.createBtnText}>Create Group</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    container: { backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '85%', padding: spacing.lg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    title: { fontSize: 24, fontFamily: typography.fontFamily.black, color: colors.slate800 },
    subtitle: { fontSize: 12, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: 2 },
    closeBtn: { padding: spacing.sm },
    content: { flex: 1 },
    inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.slate50, borderRadius: 20, padding: spacing.md, gap: spacing.sm, marginBottom: spacing.md },
    nameInput: { flex: 1, fontSize: 16, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.slate50, borderRadius: 15, padding: spacing.sm, gap: spacing.sm, marginBottom: spacing.md },
    searchInput: { flex: 1, fontSize: 14, fontFamily: typography.fontFamily.medium, color: colors.slate800 },
    loader: { marginTop: spacing.xl },
    list: { paddingBottom: spacing.xl },
    userItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: 20, marginBottom: spacing.xs, borderWidth: 1, borderColor: 'transparent' },
    userItemActive: { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' },
    avatar: { width: 45, height: 45, borderRadius: 15, backgroundColor: colors.slate100, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontFamily: typography.fontFamily.black, color: colors.slate400 },
    userInfo: { flex: 1, marginLeft: spacing.md },
    userName: { fontSize: 16, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
    userDept: { fontSize: 12, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: 2 },
    checkbox: { width: 22, height: 22, borderRadius: 8, borderWidth: 2, borderColor: colors.slate200, justifyContent: 'center', alignItems: 'center' },
    checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    createBtn: { backgroundColor: colors.primary, padding: spacing.lg, borderRadius: 20, alignItems: 'center', marginTop: spacing.md, ...shadows.lg },
    createBtnDisabled: { opacity: 0.5 },
    createBtnText: { color: colors.white, fontSize: 16, fontFamily: typography.fontFamily.black, textTransform: 'uppercase', letterSpacing: 1 },
});
