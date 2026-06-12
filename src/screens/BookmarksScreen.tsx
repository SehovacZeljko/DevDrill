import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { QuestionCard } from '../components/QuestionCard';
import { getDatabase } from '../db/client';
import { getBookmarkedQuestions } from '../db/repositories/questionRepository';
import { toggleBookmark } from '../db/repositories/progressRepository';
import { QuestionWithProgress, RootStackParamList } from '../types';
import { colors } from '../utils/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Bookmarks'>;

export default function BookmarksScreen(_props: Props) {
  const [questions, setQuestions] = useState<QuestionWithProgress[]>([]);

  useFocusEffect(
    useCallback(() => {
      const db = getDatabase();
      setQuestions(getBookmarkedQuestions(db));
    }, []),
  );

  function onReveal(_questionId: number) {
    // reveal progress is tracked but we don't need to update local list here
  }

  function onBookmarkToggle(questionId: number, currentlyBookmarked: boolean) {
    const db = getDatabase();
    toggleBookmark(db, questionId, currentlyBookmarked);
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  }

  function renderItem({ item }: { item: QuestionWithProgress }) {
    return (
      <QuestionCard
        question={item}
        onReveal={onReveal}
        onBookmarkToggle={onBookmarkToggle}
      />
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No bookmarks yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the star on any question in the feed to save it here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={questions}
      keyExtractor={item => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={[styles.content, questions.length === 0 && styles.contentEmpty]}
      style={styles.list}
      ListEmptyComponent={renderEmpty}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  contentEmpty: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.onSurfaceMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
