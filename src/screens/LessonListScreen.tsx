import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { LessonCard } from '../components/LessonCard';
import { useLessons } from '../hooks/useLessons';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { LessonWithProgress, RootStackParamList } from '../types';
import { colors } from '../utils/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonList'>;

export default function LessonListScreen({ route, navigation }: Props) {
  const { categoryId, level } = route.params;
  const { lessons, refetch } = useLessons(categoryId, level);
  const { handleBookmarkToggle } = useLessonProgress();

  function onPress(lesson: LessonWithProgress) {
    navigation.navigate('LessonDetail', { lessonId: lesson.id, lessonTitle: lesson.title });
  }

  function onBookmarkToggle(lessonId: number, currentlyBookmarked: boolean) {
    handleBookmarkToggle(lessonId, currentlyBookmarked);
    refetch();
  }

  function renderItem({ item }: { item: LessonWithProgress }) {
    return <LessonCard lesson={item} onPress={onPress} onBookmarkToggle={onBookmarkToggle} />;
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No lessons in this section yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={lessons}
      keyExtractor={item => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={styles.content}
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: colors.onSurfaceMuted,
    fontSize: 15,
  },
});
