import { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { openDatabase, getDatabase } from './src/db/client';
import { runMigrations } from './src/db/migrations';
import { colors } from './src/utils/colors';

function App() {
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      openDatabase();
      const db = getDatabase();
      runMigrations(db);

      const catResult = db.execute('SELECT COUNT(*) as count FROM category');
      const qResult = db.execute('SELECT COUNT(*) as count FROM question');

      setCategoryCount(catResult.rows?._array[0].count as number ?? 0);
      setQuestionCount(qResult.rows?._array[0].count as number ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        <Text style={styles.title}>DevDrill DB Check</Text>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : categoryCount === null ? (
          <Text style={styles.text}>Initializing…</Text>
        ) : (
          <>
            <Text style={styles.text}>{categoryCount} categories</Text>
            <Text style={styles.text}>{questionCount} questions</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 8,
  },
  text: {
    fontSize: 18,
    color: colors.primary,
  },
  error: {
    fontSize: 14,
    color: colors.difficultyHard,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default App;
