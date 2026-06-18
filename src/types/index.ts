export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  is_active: number;
}

export interface Question {
  id: number;
  category_id: number;
  title: string;
  answer_markdown: string;
  difficulty: number;
  tags: string | null;
  sort_order: number;
  is_active: number;
  created_at: number;
}

export interface UserProgress {
  id: number;
  question_id: number;
  status: number;
  times_seen: number;
  times_revealed: number;
  last_seen_at: number | null;
  bookmarked: number;
}

export interface QuestionWithProgress extends Question {
  status: number | null;
  bookmarked: number | null;
  times_revealed: number | null;
}

export interface CategoryWithCount extends Category {
  question_count: number;
  children?: CategoryWithCount[];
}

export interface Lesson {
  id: number;
  category_id: number;
  level: number;
  title: string;
  content_markdown: string;
  sort_order: number;
  is_active: number;
  created_at: number;
}

export interface LessonProgress {
  id: number;
  lesson_id: number;
  status: number;
  bookmarked: number;
  last_viewed_at: number | null;
}

export interface LessonWithProgress extends Lesson {
  status: number | null;
  bookmarked: number | null;
  last_viewed_at: number | null;
}

export interface CategoryWithLessonCount extends Category {
  lesson_count: number;
}

export type RootStackParamList = {
  ModeSelect: undefined;
  Home: undefined;
  Feed: { categoryId: number; categoryName: string };
  Bookmarks: undefined;
  LessonField: undefined;
  LessonLevel: { categoryId: number; categoryName: string };
  LessonList: { categoryId: number; categoryName: string; level: number; levelLabel: string };
  LessonDetail: { lessonId: number; lessonTitle: string };
};
