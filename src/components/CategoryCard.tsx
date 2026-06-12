import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CategoryWithCount } from '../types';
import { colors } from '../utils/colors';

interface Props {
  category: CategoryWithCount;
  onPress: (category: CategoryWithCount) => void;
}

export function CategoryCard({ category, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(category)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Text style={styles.name}>{category.name}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{category.question_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
