import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LessonWithProgress } from '../types';
import { colors } from '../utils/colors';
import { LevelBadge } from './LevelBadge';

interface Props {
  lesson: LessonWithProgress;
  onPress: (lesson: LessonWithProgress) => void;
  onBookmarkToggle: (lessonId: number, currentlyBookmarked: boolean) => void;
}

export function LessonCard({ lesson, onPress, onBookmarkToggle }: Props) {
  const isRead = lesson.status === 1;
  const isBookmarked = lesson.bookmarked === 1;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(lesson)} activeOpacity={0.7}>
      <View style={styles.header}>
        <LevelBadge level={lesson.level} />
        <TouchableOpacity
          onPress={() => onBookmarkToggle(lesson.id, isBookmarked)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkActive]}>
            {isBookmarked ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.status}>{isRead ? 'Read' : 'Unread'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    lineHeight: 22,
    marginBottom: 6,
  },
  status: {
    fontSize: 12,
    color: colors.onSurfaceMuted,
  },
  bookmarkIcon: {
    fontSize: 22,
    color: colors.onSurfaceMuted,
  },
  bookmarkActive: {
    color: colors.primary,
  },
});
