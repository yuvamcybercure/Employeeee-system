import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Modal,
    TextInput, FlatList, ActivityIndicator, Image
} from 'react-native';
import { Search, Building2, ChevronRight, X, Globe, Zap } from 'lucide-react-native';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import { useAuth } from '../context/AuthContext';

interface Organization {
    _id: string;
    name: string;
    subdomain: string;
    logo?: string;
}

interface ContextSwitcherModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ContextSwitcherModal({ visible, onClose }: ContextSwitcherModalProps) {
    const { switchContext } = useAuth();
    const [search, setSearch] = useState('');
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(false);
    const [switching, setSwitching] = useState<string | null>(null);

    useEffect(() => {
        if (visible) fetchOrgs();
    }, [visible]);

    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/master/organizations');
            if (data.success) setOrgs(data.organizations || []);
        } catch (e) { }
        setLoading(false);
    };

    const handleSwitch = async (orgId: string) => {
        setSwitching(orgId);
        try {
            const { data } = await api.post(`/master/switch-context/${orgId}`);
            if (data.success) {
                // Update context and refresh app state
                if (switchContext) switchContext(data.token, data.user);
                onClose();
            }
        } catch (e) { }
        setSwitching(null);
    };

    const filtered = orgs.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.subdomain.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={s.overlay}>
                <View style={s.card}>
                    <View style={s.header}>
                        <View>
                            <Text style={s.title}>Context Switcher</Text>
                            <Text style={s.subtitle}>MASTER ADMIN GOD-MODE</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <X size={20} color={colors.slate400} />
                        </TouchableOpacity>
                    </View>

                    <View style={s.searchWrap}>
                        <Search size={18} color={colors.slate400} />
                        <TextInput
                            style={s.searchInput}
                            placeholder="Search organization by name or subdomain..."
                            placeholderTextColor={colors.slate400}
                            value={search}
                            onChangeText={setSearch}
                            autoFocus
                        />
                    </View>

                    {loading ? (
                        <ActivityIndicator style={{ margin: spacing.xl }} color={colors.primary} />
                    ) : (
                        <FlatList
                            data={filtered}
                            keyExtractor={item => item._id}
                            contentContainerStyle={s.list}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={s.orgItem}
                                    onPress={() => handleSwitch(item._id)}
                                    disabled={!!switching}
                                >
                                    <View style={s.orgIcon}>
                                        {item.logo ? (
                                            <Image source={{ uri: item.logo }} style={s.logo} />
                                        ) : (
                                            <Building2 size={20} color={colors.primary} />
                                        )}
                                    </View>
                                    <View style={s.orgInfo}>
                                        <Text style={s.orgName}>{item.name}</Text>
                                        <View style={s.subdomainRow}>
                                            <Globe size={10} color={colors.slate400} />
                                            <Text style={s.orgSubdomain}>{item.subdomain}.cybercure.ai</Text>
                                        </View>
                                    </View>
                                    {switching === item._id ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <ChevronRight size={18} color={colors.slate200} />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={s.empty}>
                                    <Zap size={48} color={colors.slate100} />
                                    <Text style={s.emptyText}>No matching organizations found</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.9)', justifyContent: 'flex-end' },
    card: { backgroundColor: colors.white, borderTopLeftRadius: radius['3xl'], borderTopRightRadius: radius['3xl'], height: '80%', paddingBottom: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.slate100 },
    title: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate900 },
    subtitle: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.primary, letterSpacing: 2, marginTop: 2 },
    closeBtn: { width: 40, height: 40, borderRadius: radius.lg, backgroundColor: colors.slate50, justifyContent: 'center', alignItems: 'center' },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
    searchInput: { flex: 1, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
    list: { padding: spacing.base },
    orgItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.xl, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.slate100 },
    orgIcon: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.slate50, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    logo: { width: '100%', height: '100%' },
    orgInfo: { flex: 1 },
    orgName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.black, color: colors.slate800 },
    subdomainRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    orgSubdomain: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.slate400, textTransform: 'lowercase' },
    empty: { height: 300, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
    emptyText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate300 },
});
