import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Image, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { Users, Search, Shield, UserCheck } from 'lucide-react-native';

export default function MasterUsersScreen() {
    const [users, setUsers] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => { fetchUsers(); }, []);
    const fetchUsers = async () => { try { const { data } = await api.get('/master/users'); if (data.success) setUsers(data.users || []); else { const r = await api.get('/users'); if (r.data?.success) setUsers(r.data.users || []); } } catch (e) { try { const { data } = await api.get('/users'); if (data.success) setUsers(data.users || []); } catch (e2) { } } };
    const onRefresh = async () => { setRefreshing(true); await fetchUsers(); setRefreshing(false); };

    const handleImpersonate = async (userId: string) => {
        Alert.alert('Impersonate', 'Switch to this user\'s session?', [
            { text: 'Cancel' },
            { text: 'Impersonate', onPress: async () => { try { await api.post(`/master/impersonate/${userId}`); Alert.alert('Info', 'Impersonation started. Refresh the app.'); } catch (e) { Alert.alert('Error', 'Impersonation failed'); } } }
        ]);
    };

    const filtered = users.filter(u => !search || (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <SafeAreaView style={s.container}>
            <Text style={s.title}>User Matrix</Text>
            <View style={s.searchWrap}><Search size={16} color={colors.slate400} /><TextInput style={s.searchInput} placeholder="Search users..." placeholderTextColor={colors.slate400} value={search} onChangeText={setSearch} /></View>
            <ScrollView contentContainerStyle={s.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />} showsVerticalScrollIndicator={false}>
                {filtered.map((u: any) => (
                    <View key={u._id} style={s.card}>
                        <View style={s.cardRow}>
                            {u.profilePhoto ? <Image source={{ uri: u.profilePhoto }} style={s.avatar} /> :
                                <View style={s.avatarPlaceholder}><Text style={s.avatarText}>{u.name?.[0] || 'U'}</Text></View>}
                            <View style={{ flex: 1 }}>
                                <Text style={s.cardTitle}>{u.name}</Text>
                                <Text style={s.cardSub}>{u.email}</Text>
                                <Text style={s.orgName}>{u.organizationId?.name || ''}</Text>
                            </View>
                            <View style={s.rightCol}>
                                <View style={[s.roleBadge, { backgroundColor: colors.primary + '12' }]}>
                                    <Text style={[s.roleBadgeText, { color: colors.primary }]}>{u.role?.toUpperCase()}</Text>
                                </View>
                                <TouchableOpacity style={s.impBtn} onPress={() => handleImpersonate(u._id)}>
                                    <UserCheck size={14} color={colors.accent} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
                {filtered.length === 0 && <View style={s.empty}><Users size={48} color={colors.slate200} /><Text style={s.emptyText}>No users</Text></View>}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, paddingHorizontal: spacing.base, paddingTop: spacing.base, marginBottom: spacing.md, letterSpacing: -0.5 },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.base, marginBottom: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
    searchInput: { flex: 1, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
    scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
    card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    avatar: { width: 44, height: 44, borderRadius: radius.lg },
    avatarPlaceholder: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.white },
    cardTitle: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
    cardSub: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
    orgName: { fontSize: 9, fontFamily: typography.fontFamily.bold, color: colors.primary, marginTop: 2 },
    rightCol: { alignItems: 'flex-end', gap: spacing.xs },
    roleBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
    roleBadgeText: { fontSize: 8, fontFamily: typography.fontFamily.black, letterSpacing: 0.5 },
    impBtn: { padding: spacing.xs },
    empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
    emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
});
