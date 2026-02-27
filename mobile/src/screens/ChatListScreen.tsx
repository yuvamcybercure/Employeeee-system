import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Search, MessageCircle } from 'lucide-react-native';

export default function ChatListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => { fetchConversations(); }, []);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      if (data.success) setConversations(data.conversations || []);
    } catch (e) {}
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.convCard}
      onPress={() => navigation.navigate('Chat', { conversationId: item._id, name: item.name })}
      activeOpacity={0.7}
    >
      <View style={styles.avatarWrap}>
        {item.profilePhoto ? (
          <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.name?.[0] || 'U'}</Text>
          </View>
        )}
        {item.unread > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{item.unread}</Text></View>
        )}
      </View>
      <View style={styles.convInfo}>
        <Text style={styles.convName}>{item.name}</Text>
        <Text style={styles.convLast} numberOfLines={1}>{item.lastMessage || 'Start a conversation'}</Text>
      </View>
      <Text style={styles.convTime}>
        {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MessageCircle size={48} color={colors.slate200} />
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black,
    color: colors.slate900, paddingHorizontal: spacing.base, paddingTop: spacing.base,
    marginBottom: spacing.base, letterSpacing: -0.5,
  },
  list: { paddingHorizontal: spacing.base, paddingBottom: spacing['4xl'] },
  convCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  avatarWrap: { position: 'relative', marginRight: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: radius.lg },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: radius.lg, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.white },
  badge: {
    position: 'absolute', top: -4, right: -4, backgroundColor: colors.accent,
    borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontFamily: typography.fontFamily.black, color: colors.white },
  convInfo: { flex: 1 },
  convName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  convLast: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate400, marginTop: 2 },
  convTime: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400 },
  empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: {
    fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400,
    marginTop: spacing.base,
  },
});
