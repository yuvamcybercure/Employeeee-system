import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image,
  TextInput, Modal, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Search, MessageCircle, Plus, X, Users, UserPlus } from 'lucide-react-native';
import { GroupCreationModal } from '../components/GroupCreationModal';

export default function ChatListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [colleagues, setColleagues] = useState<any[]>([]);
  const [colleagueSearch, setColleagueSearch] = useState('');

  useEffect(() => { fetchConversations(); }, []);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      if (data.success) setConversations(data.conversations || []);
    } catch (e) { }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const openNewChat = async () => {
    setShowNewChat(true);
    try {
      const { data } = await api.get('/users');
      if (data.success) setColleagues((data.users || []).filter((u: any) => u._id !== user?._id));
    } catch (e) { }
  };

  const startConversation = (colleague: any) => {
    setShowNewChat(false);
    navigation.navigate('Chat', { conversationId: colleague._id, name: colleague.name });
  };

  const onGroupCreated = (group: any) => {
    fetchConversations();
    navigation.navigate('Chat', { conversationId: group._id, name: group.name, type: 'group' });
  };

  const filteredConvos = conversations.filter(c => {
    if (!search) return true;
    return (c.name || '').toLowerCase().includes(search.toLowerCase());
  });

  const filteredColleagues = colleagues.filter(c => {
    if (!colleagueSearch) return true;
    return (c.name || '').toLowerCase().includes(colleagueSearch.toLowerCase());
  });

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={s.convCard}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id, name: item.name, type: item.type })}
      activeOpacity={0.7}
    >
      <View style={s.avatarWrap}>
        {item.profilePhoto ? (
          <Image source={{ uri: item.profilePhoto }} style={s.avatar} />
        ) : (
          <View style={s.avatarPlaceholder}>
            <Text style={s.avatarText}>{item.name?.[0] || 'U'}</Text>
          </View>
        )}
        {item.unread > 0 && (
          <View style={s.badge}><Text style={s.badgeText}>{item.unread}</Text></View>
        )}
      </View>
      <View style={s.convInfo}>
        <Text style={s.convName}>{item.name}</Text>
        <Text style={s.convLast} numberOfLines={1}>{item.lastMessage || 'Start a conversation'}</Text>
      </View>
      <Text style={s.convTime}>
        {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.headerRow}>
        <Text style={s.title}>Messages</Text>
        <TouchableOpacity style={s.newBtn} onPress={openNewChat}>
          <Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Search size={16} color={colors.slate400} />
        <TextInput
          style={s.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={colors.slate400}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredConvos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <MessageCircle size={48} color={colors.slate200} />
            <Text style={s.emptyText}>No conversations yet</Text>
            <TouchableOpacity style={s.startBtn} onPress={openNewChat}>
              <Text style={s.startBtnText}>START A CHAT</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* New Chat Modal */}
      <Modal visible={showNewChat} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>New Conversation</Text>
            <TouchableOpacity onPress={() => setShowNewChat(false)}><X size={24} color={colors.slate600} /></TouchableOpacity>
          </View>

          <View style={s.modalSearch}>
            <Search size={16} color={colors.slate400} />
            <TextInput
              style={s.searchInput}
              placeholder="Search colleagues..."
              placeholderTextColor={colors.slate400}
              value={colleagueSearch}
              onChangeText={setColleagueSearch}
            />
          </View>

          <FlatList
            data={filteredColleagues}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.colleagueCard} onPress={() => startConversation(item)} activeOpacity={0.7}>
                {item.profilePhoto ? (
                  <Image source={{ uri: item.profilePhoto }} style={s.colleagueAvatar} />
                ) : (
                  <View style={s.colleagueAvatarPlaceholder}>
                    <Text style={s.colleagueAvatarText}>{item.name?.[0] || 'U'}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={s.colleagueName}>{item.name}</Text>
                  <Text style={s.colleagueRole}>{item.designation || item.role}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={s.colleagueList}
            ListHeaderComponent={
              <TouchableOpacity
                style={s.createGroupRow}
                onPress={() => { setShowNewChat(false); setShowNewGroup(true); }}
              >
                <View style={s.groupIcon}><Users size={20} color={colors.primary} /></View>
                <Text style={s.createGroupText}>Create New Group</Text>
              </TouchableOpacity>
            }
            ListEmptyComponent={
              <View style={s.empty}><Users size={40} color={colors.slate200} /><Text style={s.emptyText}>No colleagues found</Text></View>
            }
          />
        </SafeAreaView>
      </Modal>

      <GroupCreationModal
        visible={showNewGroup}
        onClose={() => setShowNewGroup(false)}
        onSuccess={onGroupCreated}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.base, paddingTop: spacing.base, marginBottom: spacing.md },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -0.5 },
  newBtn: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.xl },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.base, marginBottom: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate900 },
  list: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
  convCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  avatarWrap: { position: 'relative', marginRight: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: radius.lg },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.white },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: colors.accent, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white },
  convInfo: { flex: 1 },
  convName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  convLast: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate400, marginTop: 2 },
  convTime: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
  empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
  startBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.lg, ...shadows.xl },
  startBtnText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.size.xl, fontFamily: typography.fontFamily.black, color: colors.slate900 },
  modalSearch: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, margin: spacing.base, backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  colleagueList: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
  colleagueCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  colleagueAvatar: { width: 44, height: 44, borderRadius: radius.lg },
  colleagueAvatarPlaceholder: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  colleagueAvatarText: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.white },
  colleagueName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  colleagueRole: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400, textTransform: 'capitalize', marginTop: 1 },
  createGroupRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.md, gap: spacing.md },
  groupIcon: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' },
  createGroupText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.black, color: colors.primary },
});
