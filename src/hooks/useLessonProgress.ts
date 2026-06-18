import { useCallback } from 'react';
import { getDatabase } from '../db/client';
import { toggleLessonBookmark, upsertLessonView } from '../db/repositories/lessonRepository';

export function useLessonProgress() {
  const handleView = useCallback((lessonId: number) => {
    const db = getDatabase();
    upsertLessonView(db, lessonId);
  }, []);

  const handleBookmarkToggle = useCallback(
    (lessonId: number, currentlyBookmarked: boolean) => {
      const db = getDatabase();
      toggleLessonBookmark(db, lessonId, currentlyBookmarked);
    },
    [],
  );

  return { handleView, handleBookmarkToggle };
}
