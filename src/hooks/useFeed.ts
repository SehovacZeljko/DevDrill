import { useCallback, useEffect, useRef, useState } from 'react';
import { getDatabase } from '../db/client';
import { getFeedPage } from '../db/repositories/questionRepository';
import { QuestionWithProgress } from '../types';

const PAGE_SIZE = 20;

export function useFeed(categoryId: number) {
  const [questions, setQuestions] = useState<QuestionWithProgress[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offset = useRef(0);

  useEffect(() => {
    offset.current = 0;
    setHasMore(true);

    const db = getDatabase();
    const firstPage = getFeedPage(db, categoryId, 0, PAGE_SIZE);
    console.log(`[useFeed] Loaded ${firstPage.length} questions for category ${categoryId}`);
    setQuestions(firstPage);
    offset.current = firstPage.length;
    if (firstPage.length < PAGE_SIZE) {
      setHasMore(false);
    }
  }, [categoryId]);

  const loadNextPage = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const db = getDatabase();
    const nextPage = getFeedPage(db, categoryId, offset.current, PAGE_SIZE);
    console.log(`[useFeed] Loaded ${nextPage.length} more questions (offset ${offset.current})`);

    setQuestions(prev => [...prev, ...nextPage]);
    offset.current += nextPage.length;

    if (nextPage.length < PAGE_SIZE) {
      setHasMore(false);
    }
    setIsLoadingMore(false);
  }, [categoryId, isLoadingMore, hasMore]);

  return { questions, isLoadingMore, hasMore, loadNextPage };
}
