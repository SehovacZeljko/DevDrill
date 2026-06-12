import { useCallback } from 'react';
import { getDatabase } from '../db/client';
import { upsertReveal, toggleBookmark } from '../db/repositories/progressRepository';

export function useProgress() {
  const handleReveal = useCallback((questionId: number) => {
    const db = getDatabase();
    upsertReveal(db, questionId);
    console.log(`[useProgress] Revealed question ${questionId}`);
  }, []);

  const handleBookmarkToggle = useCallback(
    (questionId: number, currentlyBookmarked: boolean) => {
      const db = getDatabase();
      toggleBookmark(db, questionId, currentlyBookmarked);
      console.log(
        `[useProgress] Bookmark toggled for question ${questionId} → ${!currentlyBookmarked}`,
      );
    },
    [],
  );

  return { handleReveal, handleBookmarkToggle };
}
