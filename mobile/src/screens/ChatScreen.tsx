import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Send, ArrowLeft } from 'lucide-react-native';

export default function ChatScreen({ route, navigation }: any) {
  const { conversationId, name } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${conversationId}`);
      if (data.success) setMessages((data.messages || []).reverse());
    } catch (e) {}
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await api.post('/messages', { receiverId: conversationId, content: text.trim() });
      setText('');
      fetchMessages();
    } catch (e) {}
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.senderId === user?._id;
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
          <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.content}</Text>
          <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.slate900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={styles.messagesList}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.slate400}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Send size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backBtn: { marginRight: spacing.md, padding: spacing.xs },
  headerTitle: {
    fontSize: typography.size.lg, fontFamily: typography.fontFamily.bold, color: colors.slate900,
  },
  messagesList: { padding: spacing.base },
  msgRow: { marginBottom: spacing.sm, alignItems: 'flex-start' },
  msgRowMe: { alignItems: 'flex-end' },
  msgBubble: {
    maxWidth: '80%', borderRadius: radius.xl, padding: spacing.md,
  },
  msgBubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  msgBubbleOther: { backgroundColor: colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  msgText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.regular, color: colors.slate800 },
  msgTextMe: { color: colors.white },
  msgTime: {
    fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400,
    marginTop: spacing.xs, alignSelf: 'flex-end',
  },
  msgTimeMe: { color: 'rgba(255,255,255,0.6)' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: spacing.sm,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.sm,
  },
  input: {
    flex: 1, backgroundColor: colors.slate50, borderRadius: radius.xl, paddingHorizontal: spacing.base,
    paddingVertical: spacing.md, fontSize: typography.size.base, fontFamily: typography.fontFamily.regular,
    color: colors.slate900, maxHeight: 100, marginRight: spacing.sm,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
});
