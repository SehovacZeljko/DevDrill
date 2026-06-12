import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

export function upsertReveal(db: QuickSQLiteConnection, questionId: number): void {
  const now = Math.floor(Date.now() / 1000);
  db.execute(
    `INSERT INTO user_progress (question_id, status, times_seen, times_revealed, last_seen_at)
     VALUES (?, 1, 1, 1, ?)
     ON CONFLICT(question_id) DO UPDATE SET
       status = MAX(status, 1),
       times_seen = times_seen + 1,
       times_revealed = times_revealed + 1,
       last_seen_at = excluded.last_seen_at`,
    [questionId, now],
  );
}

export function toggleBookmark(
  db: QuickSQLiteConnection,
  questionId: number,
  currentlyBookmarked: boolean,
): void {
  const now = Math.floor(Date.now() / 1000);
  const nextValue = currentlyBookmarked ? 0 : 1;
  db.execute(
    `INSERT INTO user_progress (question_id, status, times_seen, times_revealed, last_seen_at, bookmarked)
     VALUES (?, 0, 0, 0, ?, ?)
     ON CONFLICT(question_id) DO UPDATE SET
       bookmarked = ?`,
    [questionId, now, nextValue, nextValue],
  );
}
