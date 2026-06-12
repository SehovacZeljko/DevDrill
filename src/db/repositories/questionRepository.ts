import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';
import { CategoryWithCount, QuestionWithProgress } from '../../types';

export function getFeedPage(
  db: QuickSQLiteConnection,
  categoryId: number,
  offset: number,
  limit: number = 20,
): QuestionWithProgress[] {
  const result = db.execute(
    `SELECT q.*, up.status, up.bookmarked, up.times_revealed
     FROM question q
     LEFT JOIN user_progress up ON up.question_id = q.id
     WHERE q.category_id = ? AND q.is_active = 1
     ORDER BY q.sort_order ASC
     LIMIT ? OFFSET ?`,
    [categoryId, limit, offset],
  );
  return (result.rows?._array ?? []) as QuestionWithProgress[];
}

export function getBookmarkedQuestions(db: QuickSQLiteConnection): QuestionWithProgress[] {
  const result = db.execute(
    `SELECT q.*, up.status, up.bookmarked, up.times_revealed
     FROM question q
     INNER JOIN user_progress up ON up.question_id = q.id
     WHERE up.bookmarked = 1 AND q.is_active = 1
     ORDER BY up.id DESC`,
  );
  return (result.rows?._array ?? []) as QuestionWithProgress[];
}

export function getCategoriesWithCount(db: QuickSQLiteConnection): CategoryWithCount[] {
  const result = db.execute(
    `SELECT c.*, COUNT(q.id) as question_count
     FROM category c
     LEFT JOIN question q ON q.category_id = c.id AND q.is_active = 1
     WHERE c.is_active = 1
     GROUP BY c.id
     ORDER BY c.sort_order ASC`,
  );
  return (result.rows?._array ?? []) as CategoryWithCount[];
}
