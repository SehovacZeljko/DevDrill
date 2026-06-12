import { useEffect, useLayoutEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { getDatabase } from '../db/client';
import { getCategoriesWithCount } from '../db/repositories/questionRepository';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryWithCount, RootStackParamList } from '../types';
import { colors } from '../utils/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface RootSection {
  root: CategoryWithCount;
  leaves: CategoryWithCount[];
}

function buildTree(flat: CategoryWithCount[]): RootSection[] {
  const roots = flat.filter(c => c.parent_id === null);
  return roots.map(root => ({
    root,
    leaves: flat.filter(c => c.parent_id === root.id),
  }));
}

export default function HomeScreen({ navigation }: Props) {
  const [sections, setSections] = useState<RootSection[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Bookmarks')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ marginRight: 4 }}
        >
          <Bookmark size={22} color={colors.onSurface} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const db = getDatabase();
    const flat = getCategoriesWithCount(db);
    setSections(buildTree(flat));
  }, []);

  function handleLeafPress(leaf: CategoryWithCount) {
    navigation.navigate('Feed', { categoryId: leaf.id, categoryName: leaf.name });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {sections.map(({ root, leaves }) => (
        <View key={root.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{root.name}</Text>
          {leaves.map(leaf => (
            <CategoryCard key={leaf.id} category={leaf} onPress={handleLeafPress} />
          ))}
        </View>
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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurfaceMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
});
