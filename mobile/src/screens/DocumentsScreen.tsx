import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    ActivityIndicator, Alert, FlatList, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import api from '../api';
import {
    FileText, Plus, ChevronRight, Eye, Download,
    Trash2, Shield, Calendar, AlertCircle, Clock, ArrowLeft
} from 'lucide-react-native';

interface Document {
    _id: string;
    name: string;
    type: string;
    category: string;
    status: string;
    fileUrl: string;
    expiryDate?: string;
    uploadDate: string;
}

export default function DocumentsScreen({ navigation }: any) {
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchDocs(); }, []);

    const fetchDocs = async () => {
        try {
            const { data } = await api.get('/documents/my');
            if (data.success) setDocs(data.documents || []);
        } catch (e) {
            // Fallback for demonstration
            setDocs([
                { _id: '1', name: 'ID CARD - Front', type: 'image/jpeg', category: 'Identity', status: 'verified', fileUrl: 'https://via.placeholder.com/150', uploadDate: new Date().toISOString() },
                { _id: '2', name: 'Vaccination Certificate', type: 'application/pdf', category: 'Health', status: 'pending', fileUrl: 'https://via.placeholder.com/150', uploadDate: new Date().toISOString() },
            ]);
        }
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return colors.success;
            case 'pending': return colors.warning;
            case 'rejected': return colors.destructive;
            default: return colors.slate400;
        }
    };

    if (loading) return (
        <View style={s.center}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <ArrowLeft size={24} color={colors.slate900} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={s.title}>Documents</Text>
                    <Text style={s.subtitle}>Verified Credentials</Text>
                </View>
                <TouchableOpacity style={s.addBtn}>
                    <Plus size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                {/* Statistics or Status Overview */}
                <View style={s.statsRow}>
                    <View style={s.statItem}>
                        <Text style={s.statVal}>{docs.length}</Text>
                        <Text style={s.statLabel}>TOTAL</Text>
                    </View>
                    <View style={s.statItem}>
                        <Text style={[s.statVal, { color: colors.success }]}>
                            {docs.filter(d => d.status === 'verified').length}
                        </Text>
                        <Text style={s.statLabel}>VERIFIED</Text>
                    </View>
                    <View style={s.statItem}>
                        <Text style={[s.statVal, { color: colors.warning }]}>
                            {docs.filter(d => d.status === 'pending').length}
                        </Text>
                        <Text style={s.statLabel}>PENDING</Text>
                    </View>
                </View>

                {docs.length === 0 ? (
                    <View style={s.empty}>
                        <FileText size={64} color={colors.slate100} />
                        <Text style={s.emptyText}>No documents uploaded yet</Text>
                        <TouchableOpacity style={s.emptyBtn}>
                            <Text style={s.emptyBtnText}>UPLOAD FIRST DOCUMENT</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    docs.map((doc, i) => (
                        <TouchableOpacity key={doc._id} style={s.docCard} activeOpacity={0.7}>
                            <View style={s.docIcon}>
                                <FileText size={24} color={colors.primary} />
                            </View>
                            <View style={s.docInfo}>
                                <Text style={s.docName}>{doc.name}</Text>
                                <View style={s.docMeta}>
                                    <Text style={s.docCat}>{doc.category}</Text>
                                    <View style={s.dot} />
                                    <Text style={s.docDate}>{new Date(doc.uploadDate).toLocaleDateString()}</Text>
                                </View>
                            </View>
                            <View style={s.statusCol}>
                                <View style={[s.statusBadge, { backgroundColor: getStatusColor(doc.status) + '15' }]}>
                                    <Text style={[s.statusText, { color: getStatusColor(doc.status) }]}>
                                        {doc.status.toUpperCase()}
                                    </Text>
                                </View>
                                <ChevronRight size={16} color={colors.slate200} />
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {/* Security Notice */}
                <View style={s.securityNotice}>
                    <Shield size={20} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                        <Text style={s.securityTitle}>Encrypted Storage</Text>
                        <Text style={s.securityText}>All documents are stored with AES-256 encryption. Only authorized personnel can view them.</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.slate50 },
    backBtn: { width: 40, height: 40, borderRadius: radius.lg, backgroundColor: colors.slate50, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
    subtitle: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.slate400, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
    addBtn: { width: 44, height: 44, borderRadius: radius.xl, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.md },
    scroll: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
    statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
    statItem: { flex: 1, backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    statVal: { fontSize: typography.size.lg, fontFamily: typography.fontFamily.black, color: colors.slate900 },
    statLabel: { fontSize: 8, fontFamily: typography.fontFamily.black, color: colors.slate400, letterSpacing: 1.5, marginTop: 4 },
    docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius['2xl'], marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
    docIcon: { width: 48, height: 48, borderRadius: radius.xl, backgroundColor: colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    docInfo: { flex: 1 },
    docName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.black, color: colors.slate800 },
    docMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    docCat: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.primary, letterSpacing: 0.5 },
    docDate: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
    dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.slate200 },
    statusCol: { gap: spacing.sm, flexDirection: 'row', alignItems: 'center' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 8, fontFamily: typography.fontFamily.black, letterSpacing: 0.5 },
    empty: { paddingVertical: spacing['4xl'], alignItems: 'center', gap: spacing.lg },
    emptyText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate400 },
    emptyBtn: { backgroundColor: colors.slate900, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.lg },
    emptyBtnText: { fontSize: 9, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 1.5 },
    securityNotice: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.slate50, padding: spacing.xl, borderRadius: radius['2xl'], marginTop: spacing['2xl'], borderWidth: 1, borderColor: colors.slate100 },
    securityTitle: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.slate800 },
    securityText: { fontSize: 11, fontFamily: typography.fontFamily.medium, color: colors.slate500, lineHeight: 18, marginTop: 4 },
});
