import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../utils/colors';

const LEVEL_LABEL: Record<number, string> = {
  1: 'Fundamentals',
  2: 'Advanced',
};

const LEVEL_COLOR: Record<number, string> = {
  1: colors.difficultyEasy,
  2: colors.difficultyHard,
};

interface Props {
  level: number;
}

export function LevelBadge({ level }: Props) {
  const label = LEVEL_LABEL[level] ?? 'Fundamentals';
  const badgeColor = LEVEL_COLOR[level] ?? colors.difficultyEasy;

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
