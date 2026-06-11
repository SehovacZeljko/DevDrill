import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

function insertRoot(
  db: QuickSQLiteConnection,
  name: string,
  slug: string,
  icon: string,
  sortOrder: number,
): number {
  const result = db.execute(
    'INSERT INTO category (name, slug, icon, sort_order) VALUES (?, ?, ?, ?)',
    [name, slug, icon, sortOrder],
  );
  return result.insertId as number;
}

function insertLeaf(
  db: QuickSQLiteConnection,
  parentId: number,
  name: string,
  slug: string,
  icon: string,
  sortOrder: number,
): void {
  db.execute(
    'INSERT INTO category (parent_id, name, slug, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
    [parentId, name, slug, icon, sortOrder],
  );
}

export function seedCategories(db: QuickSQLiteConnection): void {
  const programmingLanguagesId = insertRoot(db, 'Programming Languages', 'programming-languages', 'Code', 0);
  insertLeaf(db, programmingLanguagesId, 'JavaScript', 'javascript', 'Braces', 0);
  insertLeaf(db, programmingLanguagesId, 'TypeScript', 'typescript', 'FileCode', 1);
  insertLeaf(db, programmingLanguagesId, 'PHP', 'php', 'Hash', 2);
  insertLeaf(db, programmingLanguagesId, 'Python', 'python', 'Terminal', 3);
  insertLeaf(db, programmingLanguagesId, 'Java', 'java', 'Coffee', 4);

  const frontendId = insertRoot(db, 'Frontend', 'frontend', 'Monitor', 1);
  insertLeaf(db, frontendId, 'React', 'react', 'Atom', 0);
  insertLeaf(db, frontendId, 'React Native', 'react-native', 'Smartphone', 1);
  insertLeaf(db, frontendId, 'Angular', 'angular', 'Zap', 2);
  insertLeaf(db, frontendId, 'Vue', 'vue', 'Triangle', 3);

  const backendId = insertRoot(db, 'Backend', 'backend', 'Server', 2);
  insertLeaf(db, backendId, 'Node.js / Express', 'nodejs', 'Box', 0);
  insertLeaf(db, backendId, 'Laravel', 'laravel', 'Code2', 1);
  insertLeaf(db, backendId, 'REST API Design', 'rest-api', 'Globe', 2);

  const databasesId = insertRoot(db, 'Databases', 'databases', 'Database', 3);
  insertLeaf(db, databasesId, 'SQL Fundamentals', 'sql-fundamentals', 'Table2', 0);
  insertLeaf(db, databasesId, 'MySQL / PostgreSQL', 'mysql-postgresql', 'HardDrive', 1);
  insertLeaf(db, databasesId, 'NoSQL / MongoDB', 'nosql-mongodb', 'Layers', 2);

  const csFundamentalsId = insertRoot(db, 'CS Fundamentals', 'cs-fundamentals', 'BookOpen', 4);
  insertLeaf(db, csFundamentalsId, 'Data Structures', 'data-structures', 'GitBranch', 0);
  insertLeaf(db, csFundamentalsId, 'Algorithms', 'algorithms', 'Activity', 1);
  insertLeaf(db, csFundamentalsId, 'System Design', 'system-design', 'Layout', 2);

  const devopsId = insertRoot(db, 'DevOps & Tools', 'devops-tools', 'Settings', 5);
  insertLeaf(db, devopsId, 'Git', 'git', 'GitCommit', 0);
  insertLeaf(db, devopsId, 'Docker', 'docker', 'Package', 1);
  insertLeaf(db, devopsId, 'CI/CD Basics', 'cicd-basics', 'Repeat', 2);
}
