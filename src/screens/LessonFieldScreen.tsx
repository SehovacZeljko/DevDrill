import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getDatabase } from '../db/client';
import { getLeafCategoriesWithLessons } from '../db/repositories/lessonRepository';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryWithLessonCount, RootStackParamList } from '../types';
import { colors } from '../utils/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonField'>;

export default function LessonFieldScreen({ navigation }: Props) {
  const [fields, setFields] = useState<CategoryWithLessonCount[]>([]);

  useEffect(() => {
    const db = getDatabase();
    setFields(getLeafCategoriesWithLessons(db));
  }, []);

  function handleFieldPress(field: CategoryWithLessonCount) {
    navigation.navigate('LessonLevel', { categoryId: field.id, categoryName: field.name });
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No lesson content yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {fields.length === 0
        ? renderEmpty()
        : fields.map(field => (
          <CategoryCard
            key={field.id}
            category={{ ...field, question_count: field.lesson_count }}
            onPress={() => handleFieldPress(field)}
          />
        ))}
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
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: colors.onSurfaceMuted,
    fontSize: 15,
  },
});
