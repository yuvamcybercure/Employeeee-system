import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet, Image, ActivityIndicator, Alert
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { useSocket } from '../context/SocketContext';
import { useCall } from '../context/CallContext';
import { Send, ArrowLeft, Image as ImageIcon, Paperclip, MoreVertical, Check, CheckCheck, Trash2, Smile, X, Phone, Video } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { BASE_URL } from '../api';

const TypingDot = ({ delay }: { delay: number }) => {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 400 }),
          withTiming(0, { duration: 400 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={[s.typingDot, animatedStyle]} />;
};

const TypingAnimation = () => (
  <View style={s.typingContainer}>
    <TypingDot delay={0} />
    <TypingDot delay={150} />
    <TypingDot delay={300} />
  </View>
);

export default function ChatScreen({ route, navigation }: any) {
  const { conversationId, name, type } = route.params; // type: 'dm' or 'group'
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);
  const { startCall } = useCall();

  useEffect(() => {
    fetchMessages();

    if (socket) {
      const roomId = type === 'group' ? conversationId : [user?._id, conversationId].sort().join('-');
      socket.emit('join_room', roomId);

      socket.on('receive_message', (msg: any) => {
        setMessages(prev => [msg, ...prev]);
      });

      socket.on('user_typing', (data: any) => {
        if (data.userId !== user?._id) setTyping(data);
      });

      socket.on('user_stop_typing', () => {
        setTyping(null);
      });

      socket.on('message_deleted', ({ messageId, mode }: any) => {
        setMessages(prev => {
          if (mode === 'everyone') {
            return prev.map(m => m._id === messageId ? { ...m, content: 'This message was deleted', isDeletedForEveryone: true, attachments: [] } : m);
          }
          return prev.filter(m => m._id !== messageId);
        });
      });

      return () => {
        socket.emit('leaveConversation', roomId);
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
        socket.off('message_deleted');
      };
    }
  }, [conversationId, socket, type]);

  const fetchMessages = async () => {
    try {
      const endpoint = type === 'group' ? `/messages/groups/${conversationId}` : `/messages/${conversationId}`;
      const { data } = await api.get(endpoint);
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (e) { }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!inputText.trim() && attachments.length === 0) return;
    setSending(true);

    try {
      const formData = new FormData();
      if (inputText.trim()) formData.append('content', inputText);
      if (type === 'group') formData.append('groupId', conversationId);
      else formData.append('receiverId', conversationId);

      attachments.forEach((att, idx) => {
        formData.append('attachments', {
          uri: att.uri,
          name: att.name || `file_${idx}`,
          type: att.mimeType || 'image/jpeg'
        } as any);
      });

      const { data } = await api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        setMessages(prev => [data.message, ...prev]);
        setInputText('');
        setAttachments([]);

        // Emit via socket for instant update
        if (socket) {
          const roomId = type === 'group' ? conversationId : [user?._id, conversationId].sort().join('-');
          socket.emit('send_message', { ...data.message, room: roomId });
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to send message');
    }
    setSending(false);
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!socket) return;

    const roomId = type === 'group' ? conversationId : [user?._id, conversationId].sort().join('-');

    if (text.length > 0) {
      socket.emit('typing', { roomId, userId: user?._id, userName: user?.name });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { roomId, userId: user?._id });
      }, 3000);
    } else {
      socket.emit('stop_typing', { roomId, userId: user?._id });
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true
    });

    if (!result.canceled) {
      const newAtts = result.assets.map((a: any) => ({ uri: a.uri, name: a.fileName || 'image.jpg', mimeType: 'image/jpeg' }));
      setAttachments(prev => [...prev, ...newAtts]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: true
    });

    if (!result.canceled) {
      const newAtts = result.assets.map((a: any) => ({ uri: a.uri, name: a.name, mimeType: a.mimeType }));
      setAttachments(prev => [...prev, ...newAtts]);
    }
  };

  const deleteMessage = async (msgId: string, mode: 'me' | 'everyone') => {
    try {
      const { data } = await api.delete(`/messages/${msgId}?mode=${mode}`);
      if (data.success) {
        if (socket) {
          const roomId = type === 'group' ? conversationId : [user?._id, conversationId].sort().join('-');
          socket.emit('delete_message', { roomId, messageId: msgId, mode });
        }
        // Local update
        if (mode === 'everyone') {
          setMessages(prev => prev.map(m => m._id === msgId ? { ...m, content: 'This message was deleted', isDeletedForEveryone: true, attachments: [] } : m));
        } else {
          setMessages(prev => prev.filter(m => m._id !== msgId));
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to delete message');
    }
  };

  const showOptions = (msg: any) => {
    const isMine = msg.senderId === user?._id;
    const options = ['Delete for me'];
    if (isMine) options.push('Delete for everyone');
    options.push('Cancel');

    Alert.alert(
      'Message Options',
      '',
      options.map(opt => ({
        text: opt,
        style: opt === 'Cancel' ? 'cancel' : opt.includes('Delete') ? 'destructive' : 'default',
        onPress: () => {
          if (opt === 'Delete for me') deleteMessage(msg._id, 'me');
          if (opt === 'Delete for everyone') deleteMessage(msg._id, 'everyone');
        }
      }))
    );
  };

  const downloadFile = async (url: string, name: string) => {
    try {
      const fs = FileSystem as any;
      const docDir = fs.documentDirectory || fs.cacheDirectory;
      if (!docDir) throw new Error('No storage available');
      const fileUri = docDir + name;
      const { uri } = await fs.downloadAsync(url, fileUri);
      await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const renderMessage = ({ item }: any) => {
    const isMine = item.senderId === user?._id || item.sender?._id === user?._id;
    return (
      <TouchableOpacity
        style={[s.msgWrapper, isMine ? s.msgMine : s.msgTheirs]}
        onLongPress={() => showOptions(item)}
      >
        <View style={[s.msgBubble, isMine ? s.bubbleMine : s.bubbleTheirs]}>
          {item.attachments?.map((att: any, idx: number) => {
            const fullUrl = att.url.startsWith('http') ? att.url : `${BASE_URL}${att.url}`;
            return (
              <TouchableOpacity key={idx} style={s.attachment} onPress={() => downloadFile(fullUrl, att.name)}>
                {att.type === 'image' ? (
                  <Image source={{ uri: fullUrl }} style={s.msgImage} />
                ) : (
                  <View style={s.fileBox}>
                    <Paperclip size={16} color={isMine ? colors.white : colors.primary} />
                    <Text style={[s.fileName, isMine ? s.textMine : s.textTheirs]}>{att.name}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          {item.content ? (
            <Text style={[s.msgText, isMine ? s.textMine : s.textTheirs]}>
              {item.isDeletedForEveryone ? 'This message was deleted' : item.content}
            </Text>
          ) : null}
          <View style={s.msgFooter}>
            <Text style={[s.msgTime, isMine ? s.timeMine : s.timeTheirs]}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMine && (
              <View style={s.statusIcon}>
                {item.readBy?.length > 0 ? <CheckCheck size={12} color={colors.white} /> : <Check size={12} color={colors.white} />}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><ArrowLeft size={24} color={colors.slate900} /></TouchableOpacity>
        <TouchableOpacity style={s.headerInfo}>
          <View style={s.avatar}><Text style={s.avatarText}>{name?.[0]}</Text></View>
          <View>
            <Text style={s.headerName}>{name}</Text>
            {typing ? (
              <View style={s.typingRow}>
                <Text style={s.headerStatus}>{typing.userName} is typing</Text>
                <TypingAnimation />
              </View>
            ) : (
              <Text style={s.headerStatus}>Online</Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.headerActionBtn} onPress={() => startCall(conversationId, name, 'audio', type === 'group')}>
            <Phone size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerActionBtn} onPress={() => startCall(conversationId, name, 'video', type === 'group')}>
            <Video size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.moreBtn}><MoreVertical size={20} color={colors.slate400} /></TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.flex1}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading ? (
          <View style={s.loader}><ActivityIndicator color={colors.primary} /></View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
            inverted
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <View style={s.attachmentsPreview}>
            <FlatList
              horizontal
              data={attachments}
              renderItem={({ item, index }) => (
                <View style={s.previewItem}>
                  {item.mimeType?.startsWith('image') ? (
                    <Image source={{ uri: item.uri }} style={s.previewImg} />
                  ) : (
                    <View style={s.previewFile}><Paperclip size={20} color={colors.primary} /></View>
                  )}
                  <TouchableOpacity
                    style={s.removeAtt}
                    onPress={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                  >
                    <X size={12} color={colors.white} />
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={{ padding: spacing.sm }}
            />
          </View>
        )}

        {/* Input */}
        <View style={s.inputContainer}>
          <TouchableOpacity style={s.attachBtn} onPress={pickDocument}><Paperclip size={22} color={colors.slate400} /></TouchableOpacity>
          <TouchableOpacity style={s.attachBtn} onPress={pickImage}><ImageIcon size={22} color={colors.slate400} /></TouchableOpacity>
          <View style={s.inputWrapper}>
            <TextInput
              style={s.input}
              placeholder="Type a message..."
              placeholderTextColor={colors.slate400}
              value={inputText}
              onChangeText={handleInputChange}
              multiline
              maxLength={1000}
            />
          </View>
          <TouchableOpacity
            style={[s.sendBtn, (!inputText.trim() && attachments.length === 0) && s.sendBtnDisabled]}
            onPress={handleSend}
            disabled={(!inputText.trim() && attachments.length === 0) || sending}
          >
            {sending ? <ActivityIndicator size="small" color={colors.white} /> : <Send size={20} color={colors.white} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  flex1: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.white },
  backBtn: { padding: spacing.sm },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontFamily: typography.fontFamily.black, color: colors.white },
  headerName: { fontSize: typography.size.base, fontFamily: typography.fontFamily.bold, color: colors.slate800 },
  headerStatus: { fontSize: 10, fontFamily: typography.fontFamily.medium, color: colors.success },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typingContainer: { flexDirection: 'row', gap: 2, alignItems: 'center' },
  typingDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.success },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerActionBtn: { padding: spacing.sm },
  moreBtn: { padding: spacing.sm },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: spacing.base },
  msgWrapper: { marginBottom: spacing.sm, maxWidth: '85%' },
  msgMine: { alignSelf: 'flex-end' },
  msgTheirs: { alignSelf: 'flex-start' },
  msgBubble: { borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, ...shadows.sm },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.slate50, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  msgText: { fontSize: 15, lineHeight: 20 },
  textMine: { color: colors.white, fontFamily: typography.fontFamily.medium },
  textTheirs: { color: colors.slate800, fontFamily: typography.fontFamily.medium },
  msgFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 2 },
  msgTime: { fontSize: 9, fontFamily: typography.fontFamily.medium },
  timeMine: { color: 'rgba(255,255,255,0.7)' },
  timeTheirs: { color: colors.slate400 },
  statusIcon: { marginLeft: 2 },
  attachment: { marginBottom: 4 },
  msgImage: { width: 240, height: 180, borderRadius: radius.md, marginBottom: 4 },
  fileBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: radius.md },
  fileName: { fontSize: 12, fontFamily: typography.fontFamily.medium },
  attachmentsPreview: { maxHeight: 100, backgroundColor: colors.slate50, borderTopWidth: 1, borderTopColor: colors.border },
  previewItem: { width: 60, height: 60, marginRight: 8, position: 'relative' },
  previewImg: { width: 60, height: 60, borderRadius: 10 },
  previewFile: { width: 60, height: 60, borderRadius: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  removeAtt: { position: 'absolute', top: -4, right: -4, backgroundColor: colors.destructive, borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, gap: 4 },
  attachBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  inputWrapper: { flex: 1, backgroundColor: colors.slate50, borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: 8, maxHeight: 100 },
  input: { fontSize: 14, color: colors.slate800, fontFamily: typography.fontFamily.medium, padding: 0 },
  sendBtn: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.lg },
  sendBtnDisabled: { opacity: 0.5 },
});
