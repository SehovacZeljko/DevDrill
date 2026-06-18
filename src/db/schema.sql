-- DevDrill SQLite schema (documentation only — actual DDL is in migrations.ts)

-- Two-level category tree (parent_id null = root category)
CREATE TABLE IF NOT EXISTS category (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id   INTEGER REFERENCES category(id),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   INTEGER DEFAULT 1
);

-- Core content table
CREATE TABLE IF NOT EXISTS question (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id     INTEGER NOT NULL REFERENCES category(id),
  title           TEXT NOT NULL,
  answer_markdown TEXT NOT NULL,
  difficulty      INTEGER DEFAULT 1, -- 1 easy | 2 medium | 3 hard
  tags            TEXT,              -- comma-separated string
  sort_order      INTEGER DEFAULT 0,
  is_active       INTEGER DEFAULT 1,
  created_at      INTEGER NOT NULL   -- unix timestamp
);

-- Per-question user progress (created lazily on first interaction)
CREATE TABLE IF NOT EXISTS user_progress (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id     INTEGER NOT NULL UNIQUE REFERENCES question(id),
  status          INTEGER DEFAULT 0, -- 0 unseen | 1 seen | 2 known | 3 needs_review
  times_seen      INTEGER DEFAULT 0,
  times_revealed  INTEGER DEFAULT 0,
  last_seen_at    INTEGER,           -- unix timestamp
  bookmarked      INTEGER DEFAULT 0  -- 0 | 1 boolean
);

-- Feed session tracking (analytics / streak support)
CREATE TABLE IF NOT EXISTS user_session (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id       INTEGER REFERENCES category(id),
  started_at        INTEGER NOT NULL,
  ended_at          INTEGER,
  questions_seen    INTEGER DEFAULT 0,
  answers_revealed  INTEGER DEFAULT 0
);

-- Structured, read-through lesson content (fundamentals/advanced per field)
CREATE TABLE IF NOT EXISTS lesson (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id       INTEGER NOT NULL REFERENCES category(id),
  level             INTEGER NOT NULL,        -- 1 fundamentals | 2 advanced
  title             TEXT NOT NULL,
  content_markdown  TEXT NOT NULL,
  sort_order        INTEGER DEFAULT 0,
  is_active         INTEGER DEFAULT 1,
  created_at        INTEGER NOT NULL         -- unix timestamp
);

-- Per-lesson user progress (created lazily on first view)
CREATE TABLE IF NOT EXISTS lesson_progress (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id       INTEGER NOT NULL UNIQUE REFERENCES lesson(id),
  status          INTEGER DEFAULT 0,         -- 0 unread | 1 read
  bookmarked      INTEGER DEFAULT 0,         -- 0 | 1 boolean
  last_viewed_at  INTEGER                    -- unix timestamp
);
