# DevDrill — MVP Implementation Plan

8 phases, each ending with a manual verification step. Complete one phase, verify it, then move to the next.

---

## Phase 1 — Package Installation & Native Linking
**Status:** ✅ Done

Packages installed:
- `react-native-quick-sqlite` (SQLite)
- `@react-navigation/native` + `@react-navigation/native-stack`
- `react-native-screens`, `react-native-gesture-handler`
- `react-native-svg`, `lucide-react-native`
- `react-native-markdown-display`

**Verify:** `npx react-native run-ios` — app boots, no crash.

---

## Phase 2 — DB Layer
**Status:** ✅ Done

Files to create:
```
src/types/index.ts
src/utils/colors.ts
src/utils/markdown.ts
src/db/schema.sql
src/db/client.ts
src/db/migrations.ts
src/db/seed/categories.ts
src/db/seed/questions/javascript.ts  (×20 category files)
```

Temporarily update `App.tsx` to show row counts.

**Verify:**
- Screen shows "~26 categories, ~200 questions"
- Relaunch → same counts (no double-seed)

---

## Phase 3 — Navigation Skeleton
**Status:** ⬜ Pending

Files to create:
```
src/navigation/RootNavigator.tsx
src/screens/HomeScreen.tsx      (placeholder)
src/screens/FeedScreen.tsx      (placeholder)
src/screens/BookmarksScreen.tsx (placeholder)
```

Update `App.tsx` to render `<RootNavigator />`.

**Verify:**
- Three placeholder screens navigate between each other
- Back button works

---

## Phase 4 — Components
**Status:** ⬜ Pending

Files to create:
```
src/components/DifficultyBadge.tsx
src/components/CategoryCard.tsx
src/components/QuestionCard.tsx   ← reveal animation (Animated.timing, 300ms fade)
```

**Verify:** Render one `QuestionCard` with hardcoded props in FeedScreen — confirm answer hides, tap reveals with animation.

---

## Phase 5 — Repository Layer & Hooks
**Status:** ⬜ Pending

Files to create:
```
src/db/repositories/questionRepository.ts   (getFeedPage, getBookmarkedQuestions, getCategoriesWithCount)
src/db/repositories/progressRepository.ts   (upsertReveal, toggleBookmark)
src/hooks/useFeed.ts                         (paginated, 20/page)
src/hooks/useProgress.ts                     (upsertReveal, toggleBookmark)
```

**Verify:** Console logs show 20 questions loading; upsert increments `times_revealed`.

---

## Phase 6 — HomeScreen (real data)
**Status:** ⬜ Pending

Update `src/screens/HomeScreen.tsx`:
- 6 root categories with leaf `CategoryCard` rows
- Question count badges
- Header bookmark icon → Bookmarks screen
- Tap leaf → Feed screen

**Verify:** Category grid visible with correct counts and navigation.

---

## Phase 7 — FeedScreen (real data + pagination)
**Status:** ⬜ Pending

Update `src/screens/FeedScreen.tsx`:
- `useFeed(categoryId)` → `FlatList` of `QuestionCard`
- `onEndReached` → load next 20
- Reveal + bookmark wired to `useProgress`

**Verify:** Load 20 → scroll → load 20 more → tap reveals → bookmark persists.

---

## Phase 8 — BookmarksScreen
**Status:** ⬜ Pending

Update `src/screens/BookmarksScreen.tsx`:
- `getBookmarkedQuestions()` on mount
- Same `FlatList` layout
- Empty state: "No bookmarks yet"

**Verify:** Bookmark in Feed → appears here. Unbookmark → disappears.

---

## Final Check

```bash
npx tsc --noEmit        # zero TS errors
npx react-native run-ios  # full smoke test
```
