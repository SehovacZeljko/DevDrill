import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedSqlFundamentalsQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['sql-fundamentals']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN?',
      answer: `Joins combine rows from two or more tables based on a related column.

\`\`\`sql
-- INNER JOIN: only rows with matches in BOTH tables
SELECT o.id, u.name
FROM orders o
INNER JOIN users u ON u.id = o.user_id;
-- Excludes orders with no user, and users with no orders

-- LEFT JOIN: all rows from the LEFT table + matching rows from right
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;
-- Includes users with zero orders (order_count = 0)

-- RIGHT JOIN: all rows from the RIGHT table + matching from left
-- Less common; most developers flip table order and use LEFT JOIN instead

-- FULL OUTER JOIN: all rows from both tables (NULL where no match)
SELECT u.name, o.id
FROM users u
FULL OUTER JOIN orders o ON o.user_id = u.id;
\`\`\`

**Mental model:** INNER = intersection. LEFT = left circle of Venn diagram. RIGHT = right circle. FULL OUTER = union.`,
      difficulty: 1,
      tags: 'joins,inner,left,sql',
    },
    {
      title: 'What are database indexes and how do they work?',
      answer: `An index is a separate data structure (usually a B-tree) that the database maintains to allow fast lookups on specific columns, trading write speed and storage for read speed.

Without an index, a query scans every row (O(n) — full table scan). With a B-tree index, lookups are O(log n).

\`\`\`sql
-- Create index
CREATE INDEX idx_users_email ON users(email);

-- Composite index — useful for queries filtering on both columns
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Covering index — query can be answered entirely from the index
CREATE INDEX idx_orders_covering ON orders(user_id, status, created_at);

-- EXPLAIN shows whether an index is used
EXPLAIN SELECT * FROM users WHERE email = 'alice@example.com';
\`\`\`

**When indexes help:** equality filters, range queries, ORDER BY, JOIN conditions.
**When to be cautious:** high-write tables (each write updates all indexes), low-cardinality columns (boolean columns rarely benefit), over-indexing slows writes and uses disk space.

Unique indexes enforce uniqueness and are automatically created for PRIMARY KEY and UNIQUE constraints.`,
      difficulty: 2,
      tags: 'indexes,performance,b-tree',
    },
    {
      title: 'What is the difference between a primary key and a foreign key?',
      answer: `A **primary key** uniquely identifies each row in a table. It must be unique and NOT NULL. A table can have only one primary key.

A **foreign key** is a column (or set of columns) in one table that references the primary key of another table. It enforces referential integrity — the referenced row must exist.

\`\`\`sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,  -- primary key
  email      TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL
);

CREATE TABLE posts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE, -- foreign key
  title      TEXT NOT NULL
);

-- ON DELETE options:
-- CASCADE    — delete posts when user is deleted
-- SET NULL   — set user_id to NULL when user is deleted
-- RESTRICT   — prevent user deletion if posts exist (default)
-- SET DEFAULT — set to column default value
\`\`\`

The combination of foreign keys and ON DELETE behavior defines the cascading rules for data integrity. Always index foreign key columns — they're frequently used in JOIN conditions.`,
      difficulty: 1,
      tags: 'primary-key,foreign-key,constraints',
    },
    {
      title: 'What is database normalization?',
      answer: `Normalization is the process of organizing a database schema to reduce data redundancy and improve data integrity. It's achieved through a series of "normal forms."

**1NF (First Normal Form):** Each cell contains atomic (indivisible) values; no repeating groups.

**2NF:** 1NF + every non-key attribute is fully dependent on the whole primary key (no partial dependencies — applies to composite keys).

**3NF:** 2NF + no transitive dependencies (non-key columns don't depend on other non-key columns).

\`\`\`sql
-- Denormalized (violates 2NF)
orders(order_id, product_id, product_name, quantity, customer_name)
-- product_name depends only on product_id, not the full key

-- Normalized
products(product_id PK, product_name)
orders(order_id PK, customer_id FK, created_at)
order_items(order_id FK, product_id FK, quantity)
\`\`\`

**BCNF (Boyce-Codd NF):** stronger version of 3NF.

In practice, some **denormalization** is accepted for read-heavy systems to reduce JOINs. Always start normalized, then denormalize only with measured evidence.`,
      difficulty: 2,
      tags: 'normalization,schema-design,1nf,3nf',
    },
    {
      title: 'What is a transaction and what does ACID mean?',
      answer: `A transaction is a sequence of SQL operations treated as a single unit of work. Either all operations succeed (commit) or all are rolled back.

**ACID properties:**

- **Atomicity** — all operations succeed or none do. No partial updates.
- **Consistency** — the database moves from one valid state to another. Constraints, rules, and triggers are upheld.
- **Isolation** — concurrent transactions don't interfere with each other. Each transaction sees a consistent snapshot.
- **Durability** — once committed, data survives crashes. Achieved via write-ahead logging (WAL).

\`\`\`sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- If anything fails here, ROLLBACK undoes both updates
COMMIT;
\`\`\`

**Isolation levels** (weakest to strongest): READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE. Higher isolation prevents anomalies (dirty reads, non-repeatable reads, phantom reads) but increases lock contention.`,
      difficulty: 2,
      tags: 'acid,transactions,isolation',
    },
    {
      title: 'What is the difference between WHERE and HAVING?',
      answer: `**WHERE** filters rows *before* grouping and aggregation. It operates on individual rows.

**HAVING** filters groups *after* \`GROUP BY\` and aggregation. It operates on aggregate results.

\`\`\`sql
-- WHERE: filter rows before grouping
SELECT department, AVG(salary) AS avg_salary
FROM employees
WHERE active = true          -- exclude inactive employees first
GROUP BY department
HAVING AVG(salary) > 60000;  -- only departments with high avg salary

-- You can use both in the same query
SELECT category_id, COUNT(*) AS question_count
FROM question
WHERE is_active = 1          -- only active questions
GROUP BY category_id
HAVING COUNT(*) >= 5         -- only categories with 5+ questions
ORDER BY question_count DESC;
\`\`\`

**Common mistake:** using HAVING when WHERE is sufficient (HAVING is evaluated after grouping — more expensive). Use WHERE to filter as early as possible to reduce the data the GROUP BY has to process.`,
      difficulty: 1,
      tags: 'where,having,group-by',
    },
    {
      title: 'What are subqueries and when should you use CTEs instead?',
      answer: `A **subquery** is a query nested inside another query. It can appear in SELECT, FROM, or WHERE clauses.

\`\`\`sql
-- Correlated subquery (runs once per outer row — can be slow)
SELECT name
FROM users u
WHERE (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) > 5;

-- Better with JOIN
SELECT u.name
FROM users u
JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5;
\`\`\`

**CTEs (Common Table Expressions)** — defined with \`WITH\`, they're named subqueries you can reference multiple times. They improve readability and are easier to debug:

\`\`\`sql
WITH high_value_customers AS (
  SELECT user_id, SUM(amount) AS total_spent
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
  HAVING SUM(amount) > 1000
),
recent_orders AS (
  SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '30 days'
)
SELECT u.name, hvc.total_spent
FROM users u
JOIN high_value_customers hvc ON hvc.user_id = u.id
JOIN recent_orders ro ON ro.user_id = u.id;
\`\`\`

CTEs are not always materialized (PostgreSQL may inline them). Use \`WITH MATERIALIZED\` to force caching.`,
      difficulty: 2,
      tags: 'subquery,cte,with',
    },
    {
      title: 'What are aggregate functions in SQL?',
      answer: `Aggregate functions compute a single result from a set of rows. They are always used with GROUP BY (or applied to the whole table without it).

\`\`\`sql
SELECT
  category_id,
  COUNT(*)              AS total_questions,
  COUNT(DISTINCT tags)  AS unique_tags,
  AVG(difficulty)       AS avg_difficulty,
  MIN(created_at)       AS oldest,
  MAX(created_at)       AS newest,
  SUM(times_revealed)   AS total_reveals
FROM question
WHERE is_active = 1
GROUP BY category_id;

-- NULL handling: COUNT(*) counts rows; COUNT(column) excludes NULLs
SELECT COUNT(*), COUNT(email), COUNT(DISTINCT email) FROM users;

-- Conditional aggregation
SELECT
  COUNT(*) FILTER (WHERE difficulty = 1) AS easy_count,
  COUNT(*) FILTER (WHERE difficulty = 2) AS medium_count,
  COUNT(*) FILTER (WHERE difficulty = 3) AS hard_count
FROM question;
-- Alternative: SUM(CASE WHEN difficulty = 1 THEN 1 ELSE 0 END)
\`\`\`

\`GROUP BY\` must include all non-aggregated SELECT columns. PostgreSQL's \`FILTER\` clause is cleaner than \`CASE WHEN\` for conditional aggregation.`,
      difficulty: 1,
      tags: 'aggregate,count,sum,group-by',
    },
    {
      title: 'What is the difference between DELETE, TRUNCATE, and DROP?',
      answer: `All three remove data or tables but differ significantly in scope and behavior:

| | DELETE | TRUNCATE | DROP |
|---|---|---|---|
| Removes | Specific rows | All rows | Entire table |
| WHERE clause | Yes | No | No |
| Transactional | Yes | Usually | No (DDL) |
| Triggers | Fires row-level | No | No |
| Auto-increment reset | No | Yes (MySQL) | N/A |
| Speed | Slow (logged per row) | Fast | Fast |

\`\`\`sql
-- DELETE: remove specific rows, can be rolled back
DELETE FROM sessions WHERE expired_at < NOW();

-- TRUNCATE: remove all rows, very fast, can't use WHERE
TRUNCATE TABLE audit_log;             -- MySQL
TRUNCATE TABLE audit_log RESTART IDENTITY; -- PostgreSQL (resets sequences)

-- DROP: removes the table completely from the schema
DROP TABLE IF EXISTS temp_imports;
\`\`\`

**Safe practice:** Always use \`IF EXISTS\` with DROP to prevent errors. Wrap destructive operations in transactions when possible. Test DELETE with a matching SELECT first.`,
      difficulty: 1,
      tags: 'delete,truncate,drop,ddl',
    },
    {
      title: 'What is a database view?',
      answer: `A view is a named, stored SELECT query. It acts like a virtual table — you can query it like a table, but it doesn't store data (unless materialized).

\`\`\`sql
-- Create view
CREATE VIEW active_questions_with_progress AS
SELECT
  q.id,
  q.title,
  q.difficulty,
  q.category_id,
  COALESCE(up.status, 0)        AS status,
  COALESCE(up.bookmarked, 0)    AS bookmarked,
  COALESCE(up.times_revealed, 0) AS times_revealed
FROM question q
LEFT JOIN user_progress up ON up.question_id = q.id
WHERE q.is_active = 1;

-- Query the view like a table
SELECT * FROM active_questions_with_progress
WHERE category_id = 3
ORDER BY difficulty ASC;
\`\`\`

**Benefits:** simplify complex queries, enforce column-level security (users see view, not base table), abstract schema changes.

**Limitations of regular views:** no storage, re-executed each time. **Materialized views** (PostgreSQL, Oracle) store results and must be refreshed manually (\`REFRESH MATERIALIZED VIEW\`) — useful for expensive aggregations.`,
      difficulty: 2,
      tags: 'views,materialized,virtual-table',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
