import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Switch, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { Building2, Plus, X, Search, ChevronRight, ToggleLeft } from 'lucide-react-native';

export default function MasterOrganizationsScreen({ navigation }: any) {
    const [orgs, setOrgs] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formIndustry, setFormIndustry] = useState('');

    useEffect(() => { fetchOrgs(); }, []);
    const fetchOrgs = async () => { try { const { data } = await api.get('/organizations'); if (data.success) setOrgs(data.organizations || []); } catch (e) { } };
    const onRefresh = async () => { setRefreshing(true); await fetchOrgs(); setRefreshing(false); };

    const handleCreate = async () => {
        if (!formName || !formEmail) { Alert.alert('Error', 'Name & email required'); return; }
        setSaving(true);
        try {
            const { data } = await api.post('/organizations', { name: formName, email: formEmail, industry: formIndustry });
            if (data.success) { Alert.alert('Success', 'Organization created'); setShowForm(false); fetchOrgs(); }
            else Alert.alert('Error', data.message || 'Failed');
        } catch (e: any) { Alert.alert('Error', e.response?.data?.message || 'Failed'); }
        setSaving(false);
    };

    const toggleStatus = async (id: string, current: boolean) => {
        try { await api.put(`/organizations/${id}/status`, { isActive: !current }); fetchOrgs(); }
        catch (e) { Alert.alert('Error', 'Failed'); }
    };

    const filtered = orgs.filter(o => !search || (o.name || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <SafeAreaView style={s.container}>
            <View style={s.headerRow}><Text style={s.title}>Organizations</Text>
                <TouchableOpacity style={s.addBtn} onPress={() => { setFormName(''); setFormEmail(''); setFormIndustry(''); setShowForm(true); }}><Plus size={20} color={colors.white} /></TouchableOpacity>
            </View>
            <View style={s.searchWrap}><Search size={16} color={colors.slate400} /><TextInput style={s.searchInput} placeholder="Search..." placeholderTextColor={colors.slate400} value={search} onChangeText={setSearch} /></View>
            <ScrollView contentContainerStyle={s.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />} showsVerticalScrollIndicator={false}>
                {filtered.map((org: any) => (
                    <View key={org._id} style={s.card}>
                        <View style={s.cardRow}>
                            <View style={[s.iconWrap, { backgroundColor: colors.primary + '12' }]}><Building2 size={22} color={colors.primary} /></View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.cardTitle}>{org.name}</Text>
                                <Text style={s.cardSub}>{org.industry || org.email}</Text>
                            </View>
                            <Switch value={org.isActive !== false} onValueChange={() => toggleStatus(org._id, org.isActive !== false)}
                                trackColor={{ false: colors.slate200, true: colors.success + '40' }} thumbColor={org.isActive !== false ? colors.success : colors.slate400}
                                style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }} />
                        </View>
                    </View>
                ))}
                {filtered.length === 0 && <View style={s.empty}><Building2 size={48} color={colors.slate200} /><Text style={s.emptyText}>No organizations</Text></View>}
            </ScrollView>
            <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={s.modalContainer}>
                    <View style={s.modalHeader}><Text style={s.modalTitle}>New Organization</Text><TouchableOpacity onPress={() => setShowForm(false)}><X size={24} color={colors.slate600} /></TouchableOpacity></View>
                    <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
                        <Text style={s.fieldLabel}>Name</Text><TextInput style={s.input} value={formName} onChangeText={setFormName} placeholder="Org name" placeholderTextColor={colors.slate300} />
                        <Text style={s.fieldLabel}>Email</Text><TextInput style={s.input} value={formEmail} onChangeText={setFormEmail} placeholder="admin@org.com" placeholderTextColor={colors.slate300} keyboardType="email-address" autoCapitalize="none" />
                        <Text style={s.fieldLabel}>Industry</Text><TextInput style={s.input} value={formIndustry} onChangeText={setFormIndustry} placeholder="Technology" placeholderTextColor={colors.slate300} />
                        <TouchableOpacity style={s.saveBtn} onPress={handleCreate} disabled={saving}>{saving ? <ActivityIndicator color={colors.white} /> : <Text style={s.saveBtnText}>CREATE</Text>}</TouchableOpacity>
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
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.base, marginBottom: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
    searchInput: { flex: 1, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
    scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
    card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    iconWrap: { width: 44, height: 44, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: typography.size.md, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
    cardSub: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: 1 },
    empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
    emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
    modalContainer: { flex: 1, backgroundColor: colors.background },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
    modalBody: { flex: 1, padding: spacing.base },
    fieldLabel: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.md },
    input: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.base, paddingVertical: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate900, borderWidth: 1, borderColor: colors.border },
    saveBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.xl, ...shadows.xl },
    saveBtnText: { fontSize: 11, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
});
