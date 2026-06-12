import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../utils/colors';

const DIFFICULTY_LABEL: Record<number, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

const DIFFICULTY_COLOR: Record<number, string> = {
  1: colors.difficultyEasy,
  2: colors.difficultyMedium,
  3: colors.difficultyHard,
};

interface Props {
  difficulty: number;
}

export function DifficultyBadge({ difficulty }: Props) {
  const label = DIFFICULTY_LABEL[difficulty] ?? 'Easy';
  const badgeColor = DIFFICULTY_COLOR[difficulty] ?? colors.difficultyEasy;

  return (
    <View style={[styles.badge, { borderColor: badgeColor }]}>
      <Text style={[styles.label, { color: badgeColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
