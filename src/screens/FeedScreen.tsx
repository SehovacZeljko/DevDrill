import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet } from 'react-native';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionWithProgress, RootStackParamList } from '../types';
import { colors } from '../utils/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Feed'>;

const SAMPLE_QUESTION: QuestionWithProgress = {
  id: 1,
  category_id: 1,
  title: 'What is the difference between `==` and `===` in JavaScript?',
  answer_markdown: `The \`==\` operator performs **type coercion** before comparing, while \`===\` (strict equality) compares both value and type without coercion.

\`\`\`js
0 == '0'   // true  — string coerced to number
0 === '0'  // false — different types
null == undefined   // true
null === undefined  // false
\`\`\`

Always prefer \`===\` in production code. Use \`==\` only when you explicitly want to allow type coercion, which is rare. Linters like ESLint enforce this via the \`eqeqeq\` rule.`,
  difficulty: 2,
  tags: 'equality,types,coercion',
  sort_order: 1,
  is_active: 1,
  created_at: 1700000000,
  status: 0,
  bookmarked: 0,
  times_revealed: 0,
};

export default function FeedScreen({ route }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <QuestionCard
        question={SAMPLE_QUESTION}
        onReveal={(id) => console.log('reveal', id)}
        onBookmarkToggle={(id, current) => console.log('bookmark', id, current)}
      />
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
  },
});
