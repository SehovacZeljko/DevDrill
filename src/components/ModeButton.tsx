import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../utils/colors';

interface Props {
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function ModeButton({ title, subtitle, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceMuted,
    lineHeight: 20,
  },
});
