import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { QuestionWithProgress } from '../types';
import { colors } from '../utils/colors';
import { markdownStyles } from '../utils/markdown';
import { DifficultyBadge } from './DifficultyBadge';

interface Props {
  question: QuestionWithProgress;
  onReveal: (questionId: number) => void;
  onBookmarkToggle: (questionId: number, currentValue: boolean) => void;
}

export function QuestionCard({ question, onReveal, onBookmarkToggle }: Props) {
  const [isRevealed, setIsRevealed] = useState(false);
  const answerOpacity = useRef(new Animated.Value(0)).current;

  function handleReveal() {
    if (isRevealed) return;
    setIsRevealed(true);
    onReveal(question.id);
    Animated.timing(answerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  const isBookmarked = question.bookmarked === 1;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <DifficultyBadge difficulty={question.difficulty} />
        <TouchableOpacity
          onPress={() => onBookmarkToggle(question.id, isBookmarked)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkActive]}>
            {isBookmarked ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{question.title}</Text>

      {isRevealed ? (
        <Animated.View style={{ opacity: answerOpacity }}>
          <View style={styles.answerDivider} />
          <Markdown style={markdownStyles}>{question.answer_markdown}</Markdown>
        </Animated.View>
      ) : (
        <TouchableOpacity style={styles.revealButton} onPress={handleReveal} activeOpacity={0.8}>
          <Text style={styles.revealText}>Tap to reveal answer</Text>
        </TouchableOpacity>
      )}
    </View>
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
  },
  bookmarkIcon: {
    fontSize: 22,
    color: colors.onSurfaceMuted,
  },
  bookmarkActive: {
    color: colors.primary,
  },
  revealButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  revealText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  answerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
});
