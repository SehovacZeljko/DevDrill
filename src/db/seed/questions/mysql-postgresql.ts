import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedMysqlPostgresqlQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['mysql-postgresql']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What are the main differences between MySQL and PostgreSQL?',
      answer: `Both are mature, open-source relational databases, but they have different strengths:

| Feature | MySQL | PostgreSQL |
|---|---|---|
| Compliance | Partial SQL standard | Near-complete SQL standard |
| JSON | JSON column (basic) | JSONB (indexed, advanced) |
| Arrays | No | Native array type |
| Window functions | 8.0+ | Full support |
| CTEs | 8.0+ | Full + writable CTEs |
| Full-text search | MyISAM/InnoDB | Built-in, tsquery/tsvector |
| Extensions | Limited | Rich (PostGIS, pg_vector, etc.) |
| Replication | Master-replica (simple) | Physical + logical streaming |
| Licensing | GPL / commercial | PostgreSQL License (liberal) |

**MySQL** is traditional for web apps (LAMP stack), simpler replication, and where raw read performance matters. **PostgreSQL** is preferred for complex queries, JSON workloads, geospatial data (PostGIS), and applications that need strict SQL compliance. PostgreSQL is generally recommended for new projects.`,
      difficulty: 2,
      tags: 'mysql,postgresql,comparison',
    },
    {
      title: 'How do you read and use an EXPLAIN plan?',
      answer: `\`EXPLAIN\` shows the query execution plan without running the query. \`EXPLAIN ANALYZE\` runs it and shows actual times.

\`\`\`sql
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 10;
\`\`\`

**Key things to look for:**
- **Seq Scan** — full table scan; acceptable for small tables, problematic for large ones
- **Index Scan** / **Bitmap Index Scan** — good, using an index
- **Nested Loop** — efficient for small outer sets; can be slow for large sets
- **Hash Join** — used for larger joins without a useful index
- **Rows** estimated vs actual — large difference means outdated statistics (run \`ANALYZE\`)
- **Cost** — relative units; \`(startup..total)\`
- **Loops** — how many times a node was executed

\`\`\`sql
-- After schema changes or large data loads, update statistics
ANALYZE users;
VACUUM ANALYZE orders; -- also reclaims dead rows
\`\`\`

High row estimates with Seq Scans on frequently queried columns are the most common optimization target — add an index.`,
      difficulty: 3,
      tags: 'explain,query-plan,optimization',
    },
    {
      title: 'What is the difference between InnoDB and MyISAM in MySQL?',
      answer: `InnoDB and MyISAM are MySQL storage engines with fundamentally different design goals:

| Feature | InnoDB | MyISAM |
|---|---|---|
| Transactions | Yes (ACID) | No |
| Foreign keys | Yes | No |
| Row-level locking | Yes | Table-level only |
| Crash recovery | Yes (redo log) | No (manual repair) |
| Full-text search | Yes (5.6+) | Yes |
| Performance | Better for writes/concurrency | Better for read-heavy, no writes |

\`\`\`sql
-- Check/change storage engine
SHOW TABLE STATUS LIKE 'orders';
ALTER TABLE orders ENGINE = InnoDB;

-- Default in MySQL 5.5+
CREATE TABLE logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message TEXT
) ENGINE = InnoDB;
\`\`\`

**Always use InnoDB** for new tables. MyISAM is a legacy engine without transactions or foreign keys — it's a data corruption risk in production. The only remaining reason to consider MyISAM is full-text search in MySQL 5.5 and earlier.`,
      difficulty: 2,
      tags: 'innodb,myisam,storage-engine',
    },
    {
      title: 'What are window functions in PostgreSQL?',
      answer: `Window functions perform calculations across rows related to the current row, without collapsing them into a single output row (unlike aggregate functions with GROUP BY).

\`\`\`sql
-- Rank users by order count
SELECT
  user_id,
  order_count,
  RANK() OVER (ORDER BY order_count DESC) AS rank,
  DENSE_RANK() OVER (ORDER BY order_count DESC) AS dense_rank,
  ROW_NUMBER() OVER (ORDER BY order_count DESC) AS row_num
FROM (
  SELECT user_id, COUNT(*) AS order_count FROM orders GROUP BY user_id
) counts;

-- Running total
SELECT
  created_at,
  amount,
  SUM(amount) OVER (ORDER BY created_at) AS running_total
FROM orders;

-- Partition by: calculate within groups
SELECT
  user_id,
  amount,
  AVG(amount) OVER (PARTITION BY user_id) AS user_avg,
  amount - AVG(amount) OVER (PARTITION BY user_id) AS deviation
FROM orders;

-- Lag/Lead: compare with adjacent rows
SELECT date, revenue,
  LAG(revenue) OVER (ORDER BY date) AS prev_revenue,
  revenue - LAG(revenue) OVER (ORDER BY date) AS day_over_day
FROM daily_stats;
\`\`\``,
      difficulty: 3,
      tags: 'window-functions,rank,postgresql',
    },
    {
      title: 'What is connection pooling and why is it important?',
      answer: `Creating a new database connection is expensive (TCP handshake, authentication, memory allocation). Connection pooling maintains a reusable pool of open connections that are shared across application requests.

**Without pooling:**
- Each request opens a new connection: ~50-100ms overhead
- Too many open connections overwhelm the DB server
- PostgreSQL default max_connections: 100

**With pooling:**
- Connections are pre-created and reused
- Requests wait in a queue if all connections are busy
- Typical pool: 5-20 connections per app instance

\`\`\`js
// Node.js with pg
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,          // max pool size
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 2000, // fail if no connection in 2s
});

// Use pool.query() — borrows a connection, runs query, releases it
const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
\`\`\`

For PostgreSQL at scale, use **PgBouncer** as an external connection pooler — it sits between the app and database and can handle thousands of client connections with a small number of real DB connections.`,
      difficulty: 2,
      tags: 'connection-pooling,performance,pgbouncer',
    },
    {
      title: 'What are Common Table Expressions (CTEs)?',
      answer: `CTEs (\`WITH\` clauses) define named, reusable subqueries within a statement. They improve readability for complex queries and can reference themselves in recursive CTEs.

\`\`\`sql
-- Multiple CTEs chained
WITH
monthly_revenue AS (
  SELECT
    DATE_TRUNC('month', created_at) AS month,
    SUM(amount) AS revenue
  FROM orders
  WHERE status = 'completed'
  GROUP BY 1
),
revenue_growth AS (
  SELECT
    month,
    revenue,
    LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
    ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
      / LAG(revenue) OVER (ORDER BY month), 2) AS growth_pct
  FROM monthly_revenue
)
SELECT * FROM revenue_growth ORDER BY month DESC;

-- Recursive CTE: traverse a tree (e.g., category parent-child)
WITH RECURSIVE category_tree AS (
  SELECT id, name, parent_id, 0 AS depth
  FROM category WHERE parent_id IS NULL -- root nodes

  UNION ALL

  SELECT c.id, c.name, c.parent_id, ct.depth + 1
  FROM category c
  JOIN category_tree ct ON ct.id = c.parent_id
)
SELECT * FROM category_tree ORDER BY depth, name;
\`\`\``,
      difficulty: 2,
      tags: 'cte,recursive,with',
    },
    {
      title: 'What is database replication and what are its use cases?',
      answer: `Replication copies data from a primary (source) database to one or more replicas (targets), either synchronously or asynchronously.

**Use cases:**
- **Read scaling** — route read queries to replicas, write queries to primary
- **High availability** — promote a replica if the primary fails (failover)
- **Disaster recovery** — replica in a different region
- **Analytics** — run heavy reports on a replica without impacting primary

**MySQL replication (binary log-based):**
\`\`\`sql
-- On primary: enable binary logging
[mysqld]
log_bin = mysql-bin
server_id = 1

-- Replica connects to primary and replays events
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST = 'primary.db.internal',
  SOURCE_USER = 'replication_user',
  SOURCE_PASSWORD = 'secret',
  SOURCE_LOG_FILE = 'mysql-bin.000001',
  SOURCE_LOG_POS = 4;
START REPLICA;
SHOW REPLICA STATUS\\G
\`\`\`

**PostgreSQL streaming replication:** physical WAL (write-ahead log) streaming, lower overhead, supports synchronous and asynchronous modes.

**Synchronous replication:** primary waits for replica to confirm write — zero data loss but higher latency. **Asynchronous:** primary doesn't wait — lower latency but possible data loss on failover.`,
      difficulty: 3,
      tags: 'replication,high-availability,mysql',
    },
    {
      title: 'What are stored procedures and when should you use them?',
      answer: `Stored procedures are named, precompiled SQL routines stored in the database. They can accept parameters, perform conditional logic, loops, and transactions.

\`\`\`sql
-- PostgreSQL stored procedure
CREATE OR REPLACE PROCEDURE transfer_funds(
  sender_id INTEGER,
  receiver_id INTEGER,
  amount NUMERIC
)
LANGUAGE plpgsql AS $$
BEGIN
  IF amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  UPDATE accounts SET balance = balance - amount WHERE id = sender_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sender not found';
  END IF;

  UPDATE accounts SET balance = balance + amount WHERE id = receiver_id;

  INSERT INTO audit_log (type, sender_id, receiver_id, amount)
  VALUES ('transfer', sender_id, receiver_id, amount);
END;
$$;

CALL transfer_funds(1, 2, 100.00);
\`\`\`

**When to use:** atomic multi-step operations that need to run close to the data, batch processing, enforcing complex business rules at the DB level.

**When to avoid:** business logic that changes frequently (deployment is harder), complex application logic that's easier to test in application code.`,
      difficulty: 3,
      tags: 'stored-procedures,plpgsql,mysql',
    },
    {
      title: 'What are JSON columns in MySQL and PostgreSQL?',
      answer: `Both databases support storing JSON data natively. PostgreSQL's \`JSONB\` stores binary-format JSON with indexing support.

\`\`\`sql
-- PostgreSQL JSONB
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  type TEXT,
  payload JSONB
);

INSERT INTO events (type, payload)
VALUES ('order.placed', '{"user_id": 42, "items": [{"sku": "A1", "qty": 2}]}');

-- Query JSON fields
SELECT payload->>'user_id' AS user_id,              -- text
       payload->'items'->0->>'sku' AS first_sku      -- text
FROM events WHERE type = 'order.placed';

-- Filter on JSON value
SELECT * FROM events
WHERE payload @> '{"user_id": 42}';  -- containment check

-- Index a JSON field
CREATE INDEX idx_events_user ON events ((payload->>'user_id'));
CREATE INDEX idx_events_payload ON events USING gin(payload); -- full JSONB index

-- MySQL JSON
ALTER TABLE users ADD COLUMN preferences JSON;
SELECT JSON_EXTRACT(preferences, '$.theme') AS theme FROM users;
SELECT * FROM users WHERE JSON_VALUE(preferences, '$.notifications') = 'true';
\`\`\`

**JSONB vs JSON (PostgreSQL):** JSONB stores deduplicated, binary-encoded JSON and supports GIN indexes. Plain JSON stores the input text as-is (faster insert, slower read, no indexing).`,
      difficulty: 2,
      tags: 'json,jsonb,nosql-hybrid',
    },
    {
      title: 'What is the difference between clustered and non-clustered indexes?',
      answer: `**Clustered index:** determines the physical order of data rows on disk. A table can have only one. In MySQL InnoDB, the primary key is always the clustered index. In PostgreSQL, all heap tables are unclustered by default (you can \`CLUSTER\` manually).

**Non-clustered index (secondary index):** a separate B-tree structure that stores the indexed column(s) plus a pointer back to the actual row. A table can have many.

\`\`\`sql
-- MySQL InnoDB
CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- clustered index
  user_id INT NOT NULL,
  status VARCHAR(20),
  created_at DATETIME
);

-- Secondary index — stores (user_id, pointer to PK)
CREATE INDEX idx_user_id ON orders(user_id);

-- Covering index — query only touches the index, never the table
CREATE INDEX idx_covering ON orders(user_id, status, created_at);
SELECT status, created_at FROM orders WHERE user_id = 42; -- index-only scan
\`\`\`

**Implications:**
- Sequential PK inserts are fast with clustered indexes (appends to end)
- Random UUIDs as PK cause page splits and fragmentation — prefer UUIDv7 or \`ULID\`
- Lookups by PK are fastest because data is fetched directly; secondary index lookups require one extra hop`,
      difficulty: 3,
      tags: 'clustered-index,secondary-index,innodb',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
