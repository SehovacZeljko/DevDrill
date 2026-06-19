import { marked } from 'marked';
import { LessonWithProgress } from '../types';

const PDF_DOCUMENT_STYLE = `
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a1a1a; line-height: 1.6; padding: 24px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  h2 { font-size: 18px; }
  h3 { font-size: 16px; }
  code, pre { font-family: Menlo, monospace; background: #f0f0f0; border-radius: 4px; }
  code { padding: 2px 4px; }
  pre { padding: 12px; overflow-x: auto; }
  blockquote { border-left: 3px solid #4c9eff; margin-left: 0; padding-left: 12px; color: #444; }
  .lesson { page-break-after: always; }
  .lesson:last-child { page-break-after: avoid; }
`;

export function generateLessonsPdfHtml(lessons: LessonWithProgress[]): string {
  const lessonSections = lessons
    .map(lesson => {
      const contentHtml = marked.parse(lesson.content_markdown);
      return `<div class="lesson"><h1>${escapeHtml(lesson.title)}</h1>${contentHtml}</div>`;
    })
    .join('\n');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>${PDF_DOCUMENT_STYLE}</style>
      </head>
      <body>${lessonSections}</body>
    </html>
  `;
}

export function getLessonsPdfFileName(categoryName: string, timestamp: number = Date.now()): string {
  const normalizedCategoryName = categoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `lessons-${normalizedCategoryName}-${timestamp}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
