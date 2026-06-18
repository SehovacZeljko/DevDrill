import { useEffect, useLayoutEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { getDatabase } from '../db/client';
import { getLessonById } from '../db/repositories/lessonRepository';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { LessonWithProgress, RootStackParamList } from '../types';
import { colors } from '../utils/colors';
import { markdownStyles } from '../utils/markdown';
import { LevelBadge } from '../components/LevelBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonDetail'>;

export default function LessonDetailScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const { handleView, handleBookmarkToggle } = useLessonProgress();
  const [lesson, setLesson] = useState<LessonWithProgress | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const loaded = getLessonById(db, lessonId);
    setLesson(loaded);
    setIsBookmarked(loaded?.bookmarked === 1);
    handleView(lessonId);
  }, [lessonId, handleView]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            handleBookmarkToggle(lessonId, isBookmarked);
            setIsBookmarked(prev => !prev);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkActive]}>
            {isBookmarked ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, lessonId, isBookmarked, handleBookmarkToggle]);

  if (!lesson) { return null; }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <LevelBadge level={lesson.level} />
      </View>
      <Text style={styles.title}>{lesson.title}</Text>
      <View style={styles.divider} />
      <Markdown style={markdownStyles}>{lesson.content_markdown}</Markdown>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
    lineHeight: 28,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  bookmarkIcon: {
    fontSize: 22,
    color: colors.onSurfaceMuted,
    marginRight: 4,
  },
  bookmarkActive: {
    color: colors.primary,
  },
});
