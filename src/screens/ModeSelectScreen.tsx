import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { ModeButton } from '../components/ModeButton';
import { RootStackParamList } from '../types';
import { colors } from '../utils/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ModeSelect'>;

export default function ModeSelectScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <ModeButton
        title="Quizzes"
        subtitle="Short flashcard-style questions. Answers stay hidden until you tap to reveal."
        onPress={() => navigation.navigate('Home')}
      />
      <ModeButton
        title="Lessons"
        subtitle="Structured, article-length lessons covering fundamentals and advanced topics."
        onPress={() => navigation.navigate('LessonField')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    justifyContent: 'center',
  },
});
