import { useCallback, useEffect, useState } from 'react';
import { getDatabase } from '../db/client';
import { getLessonsForCategoryAndLevel } from '../db/repositories/lessonRepository';
import { LessonWithProgress } from '../types';

export function useLessons(categoryId: number, level: number) {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(() => {
    const db = getDatabase();
    setLessons(getLessonsForCategoryAndLevel(db, categoryId, level));
    setIsLoading(false);
  }, [categoryId, level]);

  useEffect(() => {
    setIsLoading(true);
    refetch();
  }, [refetch]);

  return { lessons, isLoading, refetch };
}
