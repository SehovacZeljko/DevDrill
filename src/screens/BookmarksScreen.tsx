import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QuestionCard } from '../components/QuestionCard';
import { LessonCard } from '../components/LessonCard';
import { getDatabase } from '../db/client';
import { getBookmarkedQuestions } from '../db/repositories/questionRepository';
import { toggleBookmark } from '../db/repositories/progressRepository';
import { getBookmarkedLessons, toggleLessonBookmark } from '../db/repositories/lessonRepository';
import { LessonWithProgress, QuestionWithProgress, RootStackParamList } from '../types';
import { colors } from '../utils/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Bookmarks'>;
type BookmarkTab = 'quizzes' | 'lessons';

export default function BookmarksScreen({ navigation }: Props) {
  const [tab, setTab] = useState<BookmarkTab>('quizzes');
  const [questions, setQuestions] = useState<QuestionWithProgress[]>([]);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);

  useFocusEffect(
    useCallback(() => {
      const db = getDatabase();
      setQuestions(getBookmarkedQuestions(db));
      setLessons(getBookmarkedLessons(db));
    }, []),
  );

  function onReveal(_questionId: number) {
    // reveal progress is tracked but we don't need to update local list here
  }

  function onQuestionBookmarkToggle(questionId: number, currentlyBookmarked: boolean) {
    const db = getDatabase();
    toggleBookmark(db, questionId, currentlyBookmarked);
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  }

  function onLessonBookmarkToggle(lessonId: number, currentlyBookmarked: boolean) {
    const db = getDatabase();
    toggleLessonBookmark(db, lessonId, currentlyBookmarked);
    setLessons(prev => prev.filter(l => l.id !== lessonId));
  }

  function onLessonPress(lesson: LessonWithProgress) {
    navigation.navigate('LessonDetail', { lessonId: lesson.id, lessonTitle: lesson.title });
  }

  function renderQuestionItem({ item }: { item: QuestionWithProgress }) {
    return (
      <QuestionCard question={item} onReveal={onReveal} onBookmarkToggle={onQuestionBookmarkToggle} />
    );
  }

  function renderLessonItem({ item }: { item: LessonWithProgress }) {
    return (
      <LessonCard lesson={item} onPress={onLessonPress} onBookmarkToggle={onLessonBookmarkToggle} />
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No bookmarks yet</Text>
        <Text style={styles.emptySubtitle}>
          {tab === 'quizzes'
            ? 'Tap the star on any question in the feed to save it here.'
            : 'Tap the star on any lesson to save it here.'}
        </Text>
      </View>
    );
  }

  const data = tab === 'quizzes' ? questions : lessons;

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'quizzes' && styles.tabActive]}
          onPress={() => setTab('quizzes')}
        >
          <Text style={[styles.tabText, tab === 'quizzes' && styles.tabTextActive]}>Quizzes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'lessons' && styles.tabActive]}
          onPress={() => setTab('lessons')}
        >
          <Text style={[styles.tabText, tab === 'lessons' && styles.tabTextActive]}>Lessons</Text>
        </TouchableOpacity>
      </View>

      {tab === 'quizzes' ? (
        <FlatList
          data={questions}
          keyExtractor={item => String(item.id)}
          renderItem={renderQuestionItem}
          contentContainerStyle={[styles.content, data.length === 0 && styles.contentEmpty]}
          style={styles.list}
          ListEmptyComponent={renderEmpty}
        />
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={item => String(item.id)}
          renderItem={renderLessonItem}
          contentContainerStyle={[styles.content, data.length === 0 && styles.contentEmpty]}
          style={styles.list}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
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
