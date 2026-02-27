import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    RefreshControl, Modal, TextInput, Alert, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
    Package, Plus, X, Search, Edit3, Trash2,
    UserPlus, UserMinus, Monitor, Smartphone, Laptop, Headphones, Cpu, ChevronDown
} from 'lucide-react-native';

const CATEGORIES = ['Laptop', 'Mobile', 'Monitor', 'Headphones', 'Hardware', 'Other'];

export default function AssetInventoryScreen() {
    const [assets, setAssets] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // Form
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Laptop');
    const [serialNumber, setSerialNumber] = useState('');
    const [showCatPicker, setShowCatPicker] = useState(false);

    // Assignment
    const [showAssign, setShowAssign] = useState<any>(null);
    const [assignSearch, setAssignSearch] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [assetRes, userRes] = await Promise.all([
                api.get('/assets/inventory'), // Admin endpoint
                api.get('/users')
            ]);
            if (assetRes.data.success) setAssets(assetRes.data.assets || []);
            if (userRes.data.success) setUsers(userRes.data.users || []);
        } catch (e) {
            // Fallback if inventory endpoint doesn't exist yet
            try {
                const { data } = await api.get('/assets');
                if (data.success) setAssets(data.assets || []);
            } catch (e2) { }
        }
    };

    const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

    const openForm = (asset?: any) => {
        if (asset) {
            setEditing(asset);
            setName(asset.name || '');
            setCategory(asset.category || 'Laptop');
            setSerialNumber(asset.serialNumber || '');
        } else {
            setEditing(null);
            setName(''); setCategory('Laptop'); setSerialNumber('');
        }
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!name.trim()) { Alert.alert('Error', 'Name is required'); return; }
        setSaving(true);
        try {
            const payload = { name, category, serialNumber };
            const { data } = editing
                ? await api.put(`/assets/${editing._id}`, payload)
                : await api.post('/assets', payload);
            if (data.success) {
                Alert.alert('Success', editing ? 'Asset updated' : 'Asset added');
                setShowForm(false);
                fetchData();
            }
        } catch (e: any) { Alert.alert('Error', e.response?.data?.message || 'Failed'); }
        setSaving(false);
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Asset', 'Are you sure?', [
            { text: 'Cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try { await api.delete(`/assets/${id}`); fetchData(); } catch (e) { Alert.alert('Error', 'Failed'); }
                }
            }
        ]);
    };

    const handleAssign = async (userId: string) => {
        try {
            const { data } = await api.post(`/assets/${showAssign._id}/assign`, { userId });
            if (data.success) {
                Alert.alert('Success', 'Asset assigned');
                setShowAssign(null);
                fetchData();
            }
        } catch (e) { Alert.alert('Error', 'Assignment failed'); }
    };

    const handleRevoke = async (assetId: string) => {
        Alert.alert('Revoke Asset', 'Remove this asset from the user?', [
            { text: 'Cancel' },
            {
                text: 'Revoke', style: 'destructive', onPress: async () => {
                    try {
                        const { data } = await api.post(`/assets/${assetId}/revoke`);
                        if (data.success) { fetchData(); }
                    } catch (e) { Alert.alert('Error', 'Revoke failed'); }
                }
            }
        ]);
    };

    const getIcon = (cat: string) => {
        const c = cat?.toLowerCase();
        if (c === 'laptop') return Laptop;
        if (c === 'mobile' || c === 'phone') return Smartphone;
        if (c === 'monitor') return Monitor;
        if (c === 'headphones') return Headphones;
        if (c === 'hardware') return Cpu;
        return Package;
    };

    const filtered = assets.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.serialNumber?.toLowerCase().includes(search.toLowerCase()));
    const filteredUsers = users.filter(u => !assignSearch || u.name.toLowerCase().includes(assignSearch.toLowerCase()) || u.email.toLowerCase().includes(assignSearch.toLowerCase()));

    return (
        <SafeAreaView style={s.container}>
            <View style={s.headerRow}>
                <Text style={s.title}>Inventory</Text>
                <TouchableOpacity style={s.addBtn} onPress={() => openForm()}><Plus size={20} color={colors.white} /></TouchableOpacity>
            </View>

            <View style={s.searchWrap}>
                <Search size={16} color={colors.slate400} />
                <TextInput style={s.searchInput} placeholder="Search serial or name..." placeholderTextColor={colors.slate400} value={search} onChangeText={setSearch} />
            </View>

            <ScrollView
                contentContainerStyle={s.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {filtered.length === 0 ? (
                    <View style={s.empty}><Package size={48} color={colors.slate200} /><Text style={s.emptyText}>No assets found</Text></View>
                ) : filtered.map((asset) => {
                    const IconComp = getIcon(asset.category);
                    const isAssigned = !!asset.assignedTo;
                    return (
                        <View key={asset._id} style={s.card}>
                            <View style={s.cardTop}>
                                <View style={[s.iconWrap, { backgroundColor: colors.primary + '12' }]}><IconComp size={22} color={colors.primary} /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.assetName}>{asset.name}</Text>
                                    <Text style={s.assetId}>{asset.category} • {asset.serialNumber || 'No SN'}</Text>
                                </View>
                                <View style={s.actions}>
                                    <TouchableOpacity onPress={() => openForm(asset)} style={s.miniBtn}><Edit3 size={15} color={colors.primary} /></TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(asset._id)} style={s.miniBtn}><Trash2 size={15} color={colors.destructive} /></TouchableOpacity>
                                </View>
                            </View>

                            <View style={s.cardDivider} />

                            <View style={s.cardBottom}>
                                {isAssigned ? (
                                    <>
                                        <View style={s.userInfo}>
                                            <View style={s.userAvatar}><Text style={s.userAvatarText}>{asset.assignedTo?.name?.[0]}</Text></View>
                                            <View>
                                                <Text style={s.userName}>{asset.assignedTo?.name}</Text>
                                                <Text style={s.userDept}>{asset.assignedTo?.department || 'Employee'}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={s.revokeBtn} onPress={() => handleRevoke(asset._id)}>
                                            <UserMinus size={14} color={colors.destructive} />
                                            <Text style={s.revokeBtnText}>REVOKE</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={s.unassignedText}>Unassigned</Text>
                                        <TouchableOpacity style={s.assignBtn} onPress={() => setShowAssign(asset)}>
                                            <UserPlus size={14} color={colors.white} />
                                            <Text style={s.assignBtnText}>ASSIGN</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Asset Form Modal */}
            <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={s.modalContainer}>
                    <View style={s.modalHeader}><Text style={s.modalTitle}>{editing ? 'Edit Asset' : 'Add Asset'}</Text><TouchableOpacity onPress={() => setShowForm(false)}><X size={24} color={colors.slate600} /></TouchableOpacity></View>
                    <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
                        <Text style={s.label}>Asset Name</Text>
                        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="MacBook Pro M2" placeholderTextColor={colors.slate300} />

                        <Text style={s.label}>Category</Text>
                        <TouchableOpacity style={s.pickerBtn} onPress={() => setShowCatPicker(!showCatPicker)}>
                            <Text style={s.pickerText}>{category}</Text>
                            <ChevronDown size={18} color={colors.slate400} />
                        </TouchableOpacity>
                        {showCatPicker && (
                            <View style={s.dropdown}>
                                {CATEGORIES.map(c => (
                                    <TouchableOpacity key={c} style={s.dropOption} onPress={() => { setCategory(c); setShowCatPicker(false); }}>
                                        <Text style={[s.dropText, category === c && { color: colors.primary, fontFamily: typography.fontFamily.black }]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <Text style={s.label}>Serial Number</Text>
                        <TextInput style={s.input} value={serialNumber} onChangeText={setSerialNumber} placeholder="XYZ-123-ABC" placeholderTextColor={colors.slate300} />

                        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                            {saving ? <ActivityIndicator color={colors.white} /> : <Text style={s.saveBtnText}>{editing ? 'UPDATE ASSET' : 'ADD TO INVENTORY'}</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Assign User Modal */}
            <Modal visible={!!showAssign} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={s.modalContainer}>
                    <View style={s.modalHeader}><Text style={s.modalTitle}>Assign Asset</Text><TouchableOpacity onPress={() => setShowAssign(null)}><X size={24} color={colors.slate600} /></TouchableOpacity></View>
                    <View style={s.assignSearchWrap}>
                        <Search size={16} color={colors.slate400} />
                        <TextInput style={s.searchInput} placeholder="Search employees..." placeholderTextColor={colors.slate400} value={assignSearch} onChangeText={setAssignSearch} />
                    </View>
                    <ScrollView contentContainerStyle={s.assignList}>
                        {filteredUsers.map(u => (
                            <TouchableOpacity key={u._id} style={s.userCard} onPress={() => handleAssign(u._id)}>
                                <View style={s.userAvatar}><Text style={s.userAvatarText}>{u.name?.[0]}</Text></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.userName}>{u.name}</Text>
                                    <Text style={s.userDept}>{u.email}</Text>
                                </View>
                                <ChevronDown size={18} color={colors.slate300} style={{ transform: [{ rotate: '-90deg' }] }} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, paddingBottom: spacing.sm },
    title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -0.5 },
    addBtn: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.xl },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.base, marginBottom: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
    searchInput: { flex: 1, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
    scroll: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
    empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
    emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
    card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    iconWrap: { width: 44, height: 44, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
    assetName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.black, color: colors.slate800 },
    assetId: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.slate400, marginTop: 2, textTransform: 'uppercase' },
    actions: { flexDirection: 'row', gap: spacing.xs },
    miniBtn: { padding: spacing.xs },
    cardDivider: { height: 1, backgroundColor: colors.slate50, marginVertical: spacing.md },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    userAvatar: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: colors.slate100, justifyContent: 'center', alignItems: 'center' },
    userAvatarText: { fontSize: 12, fontFamily: typography.fontFamily.black, color: colors.slate500 },
    userName: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate700 },
    userDept: { fontSize: 10, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
    revokeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.destructive + '10' },
    revokeBtnText: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.destructive },
    assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.slate900, paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.md },
    assignBtnText: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 0.5 },
    unassignedText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate300, fontStyle: 'italic' },
    modalContainer: { flex: 1, backgroundColor: colors.background },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
    modalBody: { padding: spacing.base },
    label: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.lg, marginBottom: 4 },
    input: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900, borderWidth: 1, borderColor: colors.border },
    pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
    pickerText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
    dropdown: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginTop: 4, overflow: 'hidden' },
    dropOption: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
    dropText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate700 },
    saveBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing['2xl'], ...shadows.xl },
    saveBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
    assignSearchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, margin: spacing.base, backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
    assignList: { paddingHorizontal: spacing.base },
    userCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
});
