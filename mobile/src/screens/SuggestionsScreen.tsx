import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Lightbulb, ThumbsUp, MessageCircle, Plus, ChevronUp, ChevronDown, Send } from 'lucide-react-native';

export default function SuggestionsScreen() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentText, setCommentText] = useState('');

  useEffect(() => { fetchSuggestions(); }, []);

  const fetchSuggestions = async () => {
    try {
      const { data } = await api.get('/suggestions');
      if (data.success) setIdeas(data.suggestions || []);
    } catch (e) {}
  };

  const onRefresh = async () => { setRefreshing(true); await fetchSuggestions(); setRefreshing(false); };

  const handleCreate = async () => {
    if (!newTitle) return;
    try {
      const { data } = await api.post('/suggestions', { title: newTitle, description: newDesc });
      if (data.success) { setShowCreate(false); setNewTitle(''); setNewDesc(''); fetchSuggestions(); }
    } catch (e) { Alert.alert('Error', 'Failed to create suggestion'); }
  };

  const handleVote = async (id: string) => {
    try {
      await api.post(`/suggestions/${id}/vote`);
      fetchSuggestions();
    } catch (e) {}
  };

  const toggleComments = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    try {
      const { data } = await api.get(`/suggestions/${id}/comments`);
      if (data.success) setComments(prev => ({ ...prev, [id]: data.comments || [] }));
    } catch (e) {}
  };

  const handleAddComment = async (id: string) => {
    if (!commentText.trim()) return;
    try {
      await api.post(`/suggestions/${id}/comments`, { content: commentText.trim() });
      setCommentText('');
      const { data } = await api.get(`/suggestions/${id}/comments`);
      if (data.success) setComments(prev => ({ ...prev, [id]: data.comments || [] }));
    } catch (e) {}
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>Suggestions</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowCreate(!showCreate)}>
          <Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Create Form */}
        {showCreate && (
          <View style={s.createCard}>
            <TextInput style={s.createInput} placeholder="Title" placeholderTextColor={colors.slate400} value={newTitle} onChangeText={setNewTitle} />
            <TextInput style={[s.createInput, { height: 80, textAlignVertical: 'top' }]} placeholder="Description..." placeholderTextColor={colors.slate400} value={newDesc} onChangeText={setNewDesc} multiline />
            <TouchableOpacity style={s.submitBtn} onPress={handleCreate}>
              <Text style={s.submitBtnText}>SUBMIT IDEA</Text>
            </TouchableOpacity>
          </View>
        )}

        {ideas.length === 0 ? (
          <View style={s.empty}><Lightbulb size={48} color={colors.slate200} /><Text style={s.emptyText}>No suggestions yet</Text></View>
        ) : ideas.map((idea: any) => {
          const hasVoted = idea.votes?.includes(user?._id);
          const isExpanded = expandedId === idea._id;
          return (
            <View key={idea._id} style={s.ideaCard}>
              <View style={s.ideaHeader}>
                <TouchableOpacity style={[s.voteBtn, hasVoted && s.voteBtnActive]} onPress={() => handleVote(idea._id)}>
                  <ChevronUp size={20} color={hasVoted ? colors.primary : colors.slate400} />
                  <Text style={[s.voteCount, hasVoted && { color: colors.primary }]}>{idea.votes?.length || 0}</Text>
                </TouchableOpacity>
                <View style={s.ideaInfo}>
                  <Text style={s.ideaTitle}>{idea.title}</Text>
                  <Text style={s.ideaAuthor}>{idea.author?.name || 'Anonymous'}</Text>
                </View>
              </View>
              {idea.description && <Text style={s.ideaDesc} numberOfLines={3}>{idea.description}</Text>}

              <TouchableOpacity style={s.commentToggle} onPress={() => toggleComments(idea._id)}>
                <MessageCircle size={14} color={colors.slate400} />
                <Text style={s.commentToggleText}>{idea.commentCount || 0} Comments</Text>
                {isExpanded ? <ChevronUp size={14} color={colors.slate400} /> : <ChevronDown size={14} color={colors.slate400} />}
              </TouchableOpacity>

              {isExpanded && (
                <View style={s.commentsSection}>
                  {(comments[idea._id] || []).map((c: any, ci: number) => (
                    <View key={ci} style={s.commentRow}>
                      <Text style={s.commentAuthor}>{c.author?.name || 'User'}</Text>
                      <Text style={s.commentContent}>{c.content}</Text>
                    </View>
                  ))}
                  <View style={s.commentInputRow}>
                    <TextInput style={s.commentInput} placeholder="Add comment..." placeholderTextColor={colors.slate400} value={commentText} onChangeText={setCommentText} />
                    <TouchableOpacity style={s.sendBtn} onPress={() => handleAddComment(idea._id)}>
                      <Send size={16} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.base, paddingTop: spacing.base },
  title: { fontSize: typography.size['3xl'], fontFamily: typography.fontFamily.black, color: colors.slate900, letterSpacing: -0.5 },
  addBtn: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.xl },
  scroll: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  createCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.primary + '30' },
  createInput: { backgroundColor: colors.slate50, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: typography.size.sm, fontFamily: typography.fontFamily.bold, color: colors.slate900, marginBottom: spacing.sm },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', ...shadows.md },
  submitBtnText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.white, letterSpacing: 2 },
  empty: { alignItems: 'center', paddingTop: spacing['4xl'] },
  emptyText: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: spacing.base },
  ideaCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  ideaHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  voteBtn: { alignItems: 'center', marginRight: spacing.md, paddingTop: 2 },
  voteBtnActive: {},
  voteCount: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.black, color: colors.slate400 },
  ideaInfo: { flex: 1 },
  ideaTitle: { fontSize: typography.size.md, fontFamily: typography.fontFamily.black, color: colors.slate800 },
  ideaAuthor: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.medium, color: colors.slate400, marginTop: 2 },
  ideaDesc: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate500, lineHeight: 20, marginBottom: spacing.md },
  commentToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.slate50 },
  commentToggleText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bold, color: colors.slate400, flex: 1 },
  commentsSection: { marginTop: spacing.md },
  commentRow: { backgroundColor: colors.slate50, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  commentAuthor: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.black, color: colors.slate600, marginBottom: 2 },
  commentContent: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate700 },
  commentInputRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  commentInput: { flex: 1, backgroundColor: colors.slate50, borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.slate900 },
  sendBtn: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
});
