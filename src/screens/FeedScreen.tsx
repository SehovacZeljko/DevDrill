import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { QuestionCard } from '../components/QuestionCard';
import { useFeed } from '../hooks/useFeed';
import { useProgress } from '../hooks/useProgress';
import { QuestionWithProgress, RootStackParamList } from '../types';
import { colors } from '../utils/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Feed'>;

export default function FeedScreen({ route }: Props) {
  const { categoryId } = route.params;
  const { questions, isLoadingMore, hasMore, loadNextPage, setQuestionBookmarked } = useFeed(categoryId);
  const { handleReveal, handleBookmarkToggle } = useProgress();

  function onBookmarkToggle(questionId: number, currentlyBookmarked: boolean) {
    handleBookmarkToggle(questionId, currentlyBookmarked);
    setQuestionBookmarked(questionId, !currentlyBookmarked);
  }

  function renderItem({ item }: { item: QuestionWithProgress }) {
    return (
      <QuestionCard
        question={item}
        onReveal={handleReveal}
        onBookmarkToggle={onBookmarkToggle}
      />
    );
  }

  function renderFooter() {
    if (!isLoadingMore) return null;
    return <ActivityIndicator style={styles.spinner} color={colors.primary} />;
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No questions in this category yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={questions}
      keyExtractor={item => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={styles.content}
      style={styles.list}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={hasMore ? loadNextPage : undefined}
      onEndReachedThreshold={0.4}
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
  spinner: {
    marginVertical: 16,
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
