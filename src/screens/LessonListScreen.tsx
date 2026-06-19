import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generatePDF } from 'react-native-html-to-pdf';
import { LessonCard } from '../components/LessonCard';
import { useLessons } from '../hooks/useLessons';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { LessonWithProgress, RootStackParamList } from '../types';
import { colors } from '../utils/colors';
import { exportLessonsPdf } from '../utils/fileExport';
import { generateLessonsPdfHtml, getLessonsPdfFileName } from '../utils/pdfExport';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonList'>;

export default function LessonListScreen({ route, navigation }: Props) {
  const { categoryId, categoryName, level } = route.params;
  const { lessons, refetch } = useLessons(categoryId, level);
  const { handleBookmarkToggle } = useLessonProgress();
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<number>>(new Set());
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  function onPress(lesson: LessonWithProgress) {
    navigation.navigate('LessonDetail', { lessonId: lesson.id, lessonTitle: lesson.title });
  }

  function onBookmarkToggle(lessonId: number, currentlyBookmarked: boolean) {
    handleBookmarkToggle(lessonId, currentlyBookmarked);
    refetch();
  }

  function onToggleSelection(lessonId: number) {
    setSelectedLessonIds(previousSelection => {
      const nextSelection = new Set(previousSelection);
      if (nextSelection.has(lessonId)) {
        nextSelection.delete(lessonId);
      } else {
        nextSelection.add(lessonId);
      }
      return nextSelection;
    });
  }

  async function handleGeneratePdf() {
    const selectedLessons = lessons.filter(lesson => selectedLessonIds.has(lesson.id));
    if (selectedLessons.length === 0) {
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const html = generateLessonsPdfHtml(selectedLessons);
      const fileName = getLessonsPdfFileName(categoryName);
      const pdf = await generatePDF({ html, fileName });
      const result = await exportLessonsPdf(pdf.filePath, `${fileName}.pdf`);
      Alert.alert(result.success ? 'Success' : 'Error', result.message);
      if (result.success) {
        setSelectedLessonIds(new Set());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to generate PDF: ${errorMessage}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function renderItem({ item }: { item: LessonWithProgress }) {
    return (
      <LessonCard
        lesson={item}
        isSelected={selectedLessonIds.has(item.id)}
        onPress={onPress}
        onBookmarkToggle={onBookmarkToggle}
        onToggleSelection={onToggleSelection}
      />
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No lessons in this section yet.</Text>
      </View>
    );
  }

  const hasSelection = selectedLessonIds.size > 0;

  return (
    <View style={styles.list}>
      <FlatList
        data={lessons}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={[styles.content, hasSelection && styles.contentWithSelectionBar]}
        ListEmptyComponent={renderEmpty}
      />
      {hasSelection && (
        <View style={styles.selectionBar}>
          <TouchableOpacity
            style={[styles.generateButton, isGeneratingPdf && styles.generateButtonDisabled]}
            onPress={handleGeneratePdf}
            disabled={isGeneratingPdf}
            activeOpacity={0.7}
          >
            {isGeneratingPdf ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.generateButtonText}>Generate PDF ({selectedLessonIds.size})</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  contentWithSelectionBar: {
    paddingBottom: 96,
  },
  selectionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  generateButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: colors.onSurfaceMuted,
    fontSize: 15,
  },
});
