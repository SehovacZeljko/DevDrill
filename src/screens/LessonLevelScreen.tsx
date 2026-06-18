import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { ModeButton } from '../components/ModeButton';
import { RootStackParamList } from '../types';
import { colors } from '../utils/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonLevel'>;

export default function LessonLevelScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;

  function handleLevelPress(level: number, levelLabel: string) {
    navigation.navigate('LessonList', { categoryId, categoryName, level, levelLabel });
  }

  return (
    <View style={styles.container}>
      <ModeButton
        title="Fundamentals"
        subtitle={`Core concepts and everyday ${categoryName} knowledge.`}
        onPress={() => handleLevelPress(1, 'Fundamentals')}
      />
      <ModeButton
        title="Advanced"
        subtitle={`Deeper architecture and senior-level ${categoryName} topics.`}
        onPress={() => handleLevelPress(2, 'Advanced')}
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
