import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';
import { CategoryWithLessonCount, LessonWithProgress } from '../../types';

export function getLeafCategoriesWithLessons(db: QuickSQLiteConnection): CategoryWithLessonCount[] {
  const result = db.execute(
    `SELECT c.*, COUNT(l.id) as lesson_count
     FROM category c
     LEFT JOIN lesson l ON l.category_id = c.id AND l.is_active = 1
     WHERE c.parent_id IS NOT NULL AND c.is_active = 1
     GROUP BY c.id
     HAVING lesson_count > 0
     ORDER BY c.sort_order ASC`,
  );
  return (result.rows?._array ?? []) as CategoryWithLessonCount[];
}

export function getLessonsForCategoryAndLevel(
  db: QuickSQLiteConnection,
  categoryId: number,
  level: number,
): LessonWithProgress[] {
  const result = db.execute(
    `SELECT l.*, lp.status, lp.bookmarked, lp.last_viewed_at
     FROM lesson l
     LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id
     WHERE l.category_id = ? AND l.level = ? AND l.is_active = 1
     ORDER BY l.sort_order ASC`,
    [categoryId, level],
  );
  return (result.rows?._array ?? []) as LessonWithProgress[];
}

export function getLessonById(db: QuickSQLiteConnection, lessonId: number): LessonWithProgress | null {
  const result = db.execute(
    `SELECT l.*, lp.status, lp.bookmarked, lp.last_viewed_at
     FROM lesson l
     LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id
     WHERE l.id = ? AND l.is_active = 1`,
    [lessonId],
  );
  if (!result.rows || result.rows.length === 0) { return null; }
  return result.rows._array[0] as LessonWithProgress;
}

export function getBookmarkedLessons(db: QuickSQLiteConnection): LessonWithProgress[] {
  const result = db.execute(
    `SELECT l.*, lp.status, lp.bookmarked, lp.last_viewed_at
     FROM lesson l
     INNER JOIN lesson_progress lp ON lp.lesson_id = l.id
     WHERE lp.bookmarked = 1 AND l.is_active = 1
     ORDER BY lp.id DESC`,
  );
  return (result.rows?._array ?? []) as LessonWithProgress[];
}

export function upsertLessonView(db: QuickSQLiteConnection, lessonId: number): void {
  const now = Math.floor(Date.now() / 1000);
  db.execute(
    `INSERT INTO lesson_progress (lesson_id, status, last_viewed_at)
     VALUES (?, 1, ?)
     ON CONFLICT(lesson_id) DO UPDATE SET
       status = MAX(status, 1),
       last_viewed_at = excluded.last_viewed_at`,
    [lessonId, now],
  );
}

export function toggleLessonBookmark(
  db: QuickSQLiteConnection,
  lessonId: number,
  currentlyBookmarked: boolean,
): void {
  const nextValue = currentlyBookmarked ? 0 : 1;
  db.execute(
    `INSERT INTO lesson_progress (lesson_id, status, bookmarked)
     VALUES (?, 0, ?)
     ON CONFLICT(lesson_id) DO UPDATE SET
       bookmarked = ?`,
    [lessonId, nextValue, nextValue],
  );
}
