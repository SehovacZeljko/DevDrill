import { open } from 'react-native-quick-sqlite';
import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

let database: QuickSQLiteConnection | null = null;

export function openDatabase(): void {
  database = open({ name: 'devdrill.db' });
}

export function getDatabase(): QuickSQLiteConnection {
  if (!database) {
    throw new Error('Database not initialized. Call openDatabase() before accessing the DB.');
  }
  return database;
}
