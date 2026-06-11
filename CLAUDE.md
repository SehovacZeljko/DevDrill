# CLAUDE.md — DevDrill (Interview Prep App)

## Project overview

A bare React Native app (no Expo) that acts as a social-network-style feed for studying programming interview questions. No backend, no authentication. All state lives in a local SQLite database on the device.

The user picks a category (e.g. JavaScript, React, Laravel, SQL), then scrolls a vertical feed of question cards. Answers are hidden by default and revealed on tap — like flashcards in a social feed format.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Bare React Native (not Expo) |
| Navigation | `@react-navigation/native` ^7.2.4, `@react-navigation/native-stack` ^7.15.1 |
| Database | `react-native-quick-sqlite` (preferred) or `op-sqlite` |
| State management | SQLite is the source of truth; React local state for UI only |
| Styling | StyleSheet API — no third-party UI libraries |
| Language | TypeScript |
| Minimum targets | iOS 15+, Android API 26+ |

---

## Database schema

The SQLite database is initialized on first launch via a seed script. Schema lives in `src/db/schema.sql`, migration logic in `src/db/migrations.ts`.

### Tables

```sql
-- Two-level category tree (parent_id null = root category)
CREATE TABLE IF NOT EXISTS category (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id   INTEGER REFERENCES category(id),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,                  -- icon name string for UI
  sort_order  INTEGER DEFAULT 0,
  is_active   INTEGER DEFAULT 1      -- 0 | 1 boolean
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
```

### Key query patterns

```ts
// Paginated feed for a category (join progress for UI state)
SELECT q.*, up.status, up.bookmarked, up.times_revealed
FROM question q
LEFT JOIN user_progress up ON up.question_id = q.id
WHERE q.category_id = ? AND q.is_active = 1
ORDER BY q.sort_order ASC
LIMIT 20 OFFSET ?;

// Upsert progress on reveal
INSERT INTO user_progress (question_id, status, times_seen, times_revealed, last_seen_at)
VALUES (?, 1, 1, 1, ?)
ON CONFLICT(question_id) DO UPDATE SET
  status = MAX(status, 1),
  times_seen = times_seen + 1,
  times_revealed = times_revealed + 1,
  last_seen_at = excluded.last_seen_at;
```

---

## Project structure

```
/
├── src/
│   ├── db/
│   │   ├── client.ts          # open/init DB singleton
│   │   ├── migrations.ts      # versioned migration runner
│   │   ├── schema.sql         # canonical schema (documentation)
│   │   └── seed/
│   │       ├── categories.ts
│   │       └── questions/
│   │           ├── javascript.ts
│   │           ├── react.ts
│   │           ├── php.ts
│   │           └── ...        # one file per leaf category
│   ├── screens/
│   │   ├── HomeScreen.tsx     # category grid
│   │   ├── FeedScreen.tsx     # scrollable question feed
│   │   └── BookmarksScreen.tsx
│   ├── components/
│   │   ├── QuestionCard.tsx   # card with hidden/revealed answer
│   │   ├── CategoryCard.tsx
│   │   └── DifficultyBadge.tsx
│   ├── hooks/
│   │   ├── useFeed.ts         # paginated question loader
│   │   └── useProgress.ts     # read/write user_progress
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   ├── types/
│   │   └── index.ts           # shared TS interfaces
│   └── utils/
│       └── markdown.ts        # answer rendering helpers
├── android/
├── ios/
├── CLAUDE.md                  # this file
└── package.json
```

---

## Category taxonomy (initial seed)

```
Programming Languages
  ├── JavaScript
  ├── TypeScript
  ├── PHP
  ├── Python
  └── Java

Frontend
  ├── React
  ├── React Native
  ├── Angular
  └── Vue

Backend
  ├── Node.js / Express
  ├── Laravel
  └── REST API design

Databases
  ├── SQL fundamentals
  ├── MySQL / PostgreSQL
  └── NoSQL / MongoDB

CS Fundamentals
  ├── Data structures
  ├── Algorithms
  └── System design

DevOps & Tools
  ├── Git
  ├── Docker
  └── CI/CD basics
```

---

## Core UI flows

### 1. Home screen (`HomeScreen`)
- Flat grid or list of root categories
- Tapping a root category expands or navigates to sub-categories
- Show question count badge per category (query: `COUNT(*) WHERE category_id = ?`)

### 2. Feed screen (`FeedScreen`)
- Receives `categoryId` as a nav param
- Renders a `FlatList` of `QuestionCard` components
- Infinite scroll: load 20 items, fetch next page on `onEndReached`
- Each card shows:
  - Question title (always visible)
  - Difficulty badge
  - Blurred / hidden answer area with a "Tap to reveal" prompt
  - On tap: answer slides in / opacity animates to visible; `user_progress` upserted

### 3. Bookmarks screen (`BookmarksScreen`)
- Same feed layout, filtered to `bookmarked = 1`

---

## State management rules

- **No Redux, no Zustand, no Context for data** — SQLite is the single source of truth
- React `useState` is only for ephemeral UI state (e.g. `isRevealed` on a card)
- After any DB write, re-query and update local component state — do not optimistically mutate
- The DB client (`src/db/client.ts`) exports a singleton; always use that, never open a new connection

---

## Icons

Use [`lucide-react-native`](https://lucide.dev) (depends on `react-native-svg`).

- Standard size: **28px** on landing-level cards
- Color: `colors.onPrimary` for active, `colors.onDisabled` for disabled
- Icons already in use: `Nfc`, `Bluetooth`, `Type`, `Image`

---

## Naming Conventions

**Do not use abbreviations, acronyms, or magic numbers in names.** Every identifier should be readable without domain knowledge. Specifically:

- No hardware acronyms as folder or file names (e.g. not `epd/`, `nfc/` alone as a catch-all).
- No abbreviated constant names (e.g. not `EPD_W`, `EPD_H`, `SSD`, `BW`, `BWR` as raw identifiers — spell them out: `DISPLAY_WIDTH`, `blackWhite`, `blackWhiteRed`).
- No magic numeric suffixes that aren't self-explanatory (e.g. not `INIT_213` without a comment — use `PANEL_INIT` and document the panel model in a comment).
- No cryptic function names derived from chip or protocol jargon (e.g. not `encodeSSD`, `connectIsoDep`, `refreshBW` — use `encodePixels`, `connectNfcTag`, `refreshDisplay`).
- Variable names in React components and hooks must be full words (e.g. `colorMode` not `epdColor`).

---

## Coding conventions

- TypeScript strict mode on — no `any`
- Functional components only, hooks for all logic
- One component per file
- Named exports everywhere (no default exports except screens)
- All DB calls go through typed repository functions in `src/db/` — screens never write raw SQL
- Answer content is markdown; render with a lightweight RN markdown renderer (e.g. `react-native-markdown-display`)
- Seed data questions should be accurate, practical, and written as a senior developer would answer them in an interview

---

## DB initialization flow

```
App launch
  → src/db/client.ts opens DB
  → migrations.ts runs pending migrations (version stored in PRAGMA user_version)
  → if user_version === 0: run full schema + seed
  → app renders
```

---

## What to build next (ordered backlog)

1. DB client + migration runner
2. Schema + seed (categories first, then 10 sample questions per leaf)
3. Navigation skeleton (Home → Feed)
4. `QuestionCard` component with reveal animation
5. `useFeed` hook with pagination
6. `useProgress` hook (upsert on reveal, bookmark toggle)
7. Home screen category grid
8. Feed screen wired to real data
9. Bookmarks screen
10. Difficulty filter in feed
11. Search across questions (SQLite FTS5 virtual table)
12. Streak / session stats on Home screen

---

## Notes for Claude Code

- Always read this file at the start of each session before making changes
- When adding seed questions, match the tone: concise, technically accurate, interview-appropriate
- Do not install Expo packages — this is bare React Native
- Prefer `react-native-quick-sqlite` for its synchronous API; avoid async DB wrappers where possible
- When generating question content, aim for 3–8 sentence answers in markdown, including a code example where relevant
- The app has no network calls — if you find yourself adding `fetch` or axios anywhere, stop and reconsider
