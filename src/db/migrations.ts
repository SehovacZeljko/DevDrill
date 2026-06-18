import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';
import { seedCategories } from './seed/categories';
import { seedJavaScriptQuestions } from './seed/questions/javascript';
import { seedTypeScriptQuestions } from './seed/questions/typescript';
import { seedPhpQuestions } from './seed/questions/php';
import { seedPythonQuestions } from './seed/questions/python';
import { seedJavaQuestions } from './seed/questions/java';
import { seedReactQuestions } from './seed/questions/react';
import { seedReactNativeQuestions } from './seed/questions/react-native';
import { seedAngularQuestions } from './seed/questions/angular';
import { seedVueQuestions } from './seed/questions/vue';
import { seedNodejsQuestions } from './seed/questions/nodejs';
import { seedLaravelQuestions } from './seed/questions/laravel';
import { seedRestApiQuestions } from './seed/questions/rest-api';
import { seedSqlFundamentalsQuestions } from './seed/questions/sql-fundamentals';
import { seedMysqlPostgresqlQuestions } from './seed/questions/mysql-postgresql';
import { seedNoSqlMongodbQuestions } from './seed/questions/nosql-mongodb';
import { seedDataStructuresQuestions } from './seed/questions/data-structures';
import { seedAlgorithmsQuestions } from './seed/questions/algorithms';
import { seedSystemDesignQuestions } from './seed/questions/system-design';
import { seedGitQuestions } from './seed/questions/git';
import { seedDockerQuestions } from './seed/questions/docker';
import { seedCicdQuestions } from './seed/questions/cicd';
import { seedLaravelLessons } from './seed/lessons/laravel';
import { seedReactLessons } from './seed/lessons/react';
import { seedAngularLessons } from './seed/lessons/angular';
import { seedSqlFundamentalsLessons } from './seed/lessons/sql-fundamentals';
import { seedDataStructuresLessons } from './seed/lessons/data-structures';
import { seedGitLessons } from './seed/lessons/git';
import { seedAlgorithmsLessons } from './seed/lessons/algorithms';
import { seedReactNativeLessons } from './seed/lessons/react-native';

const SCHEMA_DDL = `
  CREATE TABLE IF NOT EXISTS category (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id   INTEGER REFERENCES category(id),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    icon        TEXT,
    sort_order  INTEGER DEFAULT 0,
    is_active   INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS question (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id     INTEGER NOT NULL REFERENCES category(id),
    title           TEXT NOT NULL,
    answer_markdown TEXT NOT NULL,
    difficulty      INTEGER DEFAULT 1,
    tags            TEXT,
    sort_order      INTEGER DEFAULT 0,
    is_active       INTEGER DEFAULT 1,
    created_at      INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id     INTEGER NOT NULL UNIQUE REFERENCES question(id),
    status          INTEGER DEFAULT 0,
    times_seen      INTEGER DEFAULT 0,
    times_revealed  INTEGER DEFAULT 0,
    last_seen_at    INTEGER,
    bookmarked      INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_session (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id       INTEGER REFERENCES category(id),
    started_at        INTEGER NOT NULL,
    ended_at          INTEGER,
    questions_seen    INTEGER DEFAULT 0,
    answers_revealed  INTEGER DEFAULT 0
  );
`;

const LESSON_SCHEMA_DDL = `
  CREATE TABLE IF NOT EXISTS lesson (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id       INTEGER NOT NULL REFERENCES category(id),
    level             INTEGER NOT NULL,
    title             TEXT NOT NULL,
    content_markdown  TEXT NOT NULL,
    sort_order        INTEGER DEFAULT 0,
    is_active         INTEGER DEFAULT 1,
    created_at        INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lesson_progress (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id       INTEGER NOT NULL UNIQUE REFERENCES lesson(id),
    status          INTEGER DEFAULT 0,
    bookmarked      INTEGER DEFAULT 0,
    last_viewed_at  INTEGER
  );
`;

function runSchemaAndSeed(db: QuickSQLiteConnection): void {
  SCHEMA_DDL.trim().split(';').forEach(statement => {
    const trimmed = statement.trim();
    if (trimmed) {
      db.execute(trimmed);
    }
  });

  seedCategories(db);

  seedJavaScriptQuestions(db);
  seedTypeScriptQuestions(db);
  seedPhpQuestions(db);
  seedPythonQuestions(db);
  seedJavaQuestions(db);
  seedReactQuestions(db);
  seedReactNativeQuestions(db);
  seedAngularQuestions(db);
  seedVueQuestions(db);
  seedNodejsQuestions(db);
  seedLaravelQuestions(db);
  seedRestApiQuestions(db);
  seedSqlFundamentalsQuestions(db);
  seedMysqlPostgresqlQuestions(db);
  seedNoSqlMongodbQuestions(db);
  seedDataStructuresQuestions(db);
  seedAlgorithmsQuestions(db);
  seedSystemDesignQuestions(db);
  seedGitQuestions(db);
  seedDockerQuestions(db);
  seedCicdQuestions(db);
}

function runLessonSchemaAndSeed(db: QuickSQLiteConnection): void {
  LESSON_SCHEMA_DDL.trim().split(';').forEach(statement => {
    const trimmed = statement.trim();
    if (trimmed) {
      db.execute(trimmed);
    }
  });

  seedLaravelLessons(db);
}

export function runMigrations(db: QuickSQLiteConnection): void {
  const versionResult = db.execute('PRAGMA user_version');
  const currentVersion = (versionResult.rows?._array[0]?.user_version as number) ?? 0;

  if (currentVersion === 0) {
    runSchemaAndSeed(db);
    db.execute('PRAGMA user_version = 1');
  }

  if (currentVersion <= 1) {
    runLessonSchemaAndSeed(db);
    db.execute('PRAGMA user_version = 2');
  }

  if (currentVersion <= 2) {
    seedReactLessons(db);
    db.execute('PRAGMA user_version = 3');
  }

  if (currentVersion <= 3) {
    seedAngularLessons(db);
    db.execute('PRAGMA user_version = 4');
  }

  if (currentVersion <= 4) {
    seedSqlFundamentalsLessons(db);
    db.execute('PRAGMA user_version = 5');
  }

  if (currentVersion <= 5) {
    seedDataStructuresLessons(db);
    db.execute('PRAGMA user_version = 6');
  }

  if (currentVersion <= 6) {
    seedGitLessons(db);
    db.execute('PRAGMA user_version = 7');
  }

  if (currentVersion <= 7) {
    seedAlgorithmsLessons(db);
    db.execute('PRAGMA user_version = 8');
  }

  if (currentVersion <= 8) {
    seedReactNativeLessons(db);
    db.execute('PRAGMA user_version = 9');
  }
}
