import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'What SQL Is and Relational Database Basics',
    content: `SQL (Structured Query Language) is the standard language for defining, querying, and manipulating data in a **relational database** — one organized as tables of rows and columns, with relationships between tables expressed through shared key values rather than nested documents or objects.

A relational database stores each distinct kind of entity in its own table: a \`users\` table, a \`posts\` table, an \`orders\` table. Relationships between them (a post belongs to a user, an order belongs to a user) are expressed by storing the related row's key as a column — a **foreign key** — rather than embedding one entity inside another.

\`\`\`sql
CREATE TABLE users (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE posts (
  id      INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title   TEXT NOT NULL
);
\`\`\`

SQL itself splits into a few sub-languages worth knowing by name: **DDL** (Data Definition Language — \`CREATE\`, \`ALTER\`, \`DROP\`, defining structure), **DML** (Data Manipulation Language — \`SELECT\`, \`INSERT\`, \`UPDATE\`, \`DELETE\`, working with data), and **DCL** (Data Control Language — \`GRANT\`, \`REVOKE\`, permissions).

A strong interview answer frames SQL's core value proposition: a declarative way to ask "what data do I want" without writing the procedural code to fetch and join it row by row — the database's query planner figures out *how* to retrieve it efficiently.`,
  },
  {
    title: 'SELECT, WHERE, and Filtering Data',
    content: `\`SELECT\` retrieves rows from one or more tables, and \`WHERE\` filters which rows are returned, evaluated against each row before it's included in the result set.

\`\`\`sql
SELECT id, title, created_at
FROM posts
WHERE published = true
  AND created_at >= '2024-01-01';
\`\`\`

\`WHERE\` supports the standard comparison operators (\`=\`, \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\`), logical combination (\`AND\`, \`OR\`, \`NOT\`), pattern matching (\`LIKE '%term%'\` for substring matches, with \`%\` as a wildcard for any sequence of characters and \`_\` for exactly one character), set membership (\`IN (1, 2, 3)\`), and range checks (\`BETWEEN 10 AND 20\`).

\`\`\`sql
SELECT * FROM products
WHERE category IN ('electronics', 'books')
  AND price BETWEEN 10 AND 100
  AND name LIKE '%wireless%';
\`\`\`

A frequently asked interview distinction is \`SELECT *\` versus naming explicit columns: \`SELECT *\` is convenient for ad-hoc exploration but considered poor practice in application code — it pulls more data than usually needed, breaks silently if columns are added/reordered/removed later, and prevents certain index-based query optimizations (a "covering index" can satisfy a query entirely from the index itself only when the exact columns needed are known ahead of time).`,
  },
  {
    title: 'Sorting and Limiting Results',
    content: `\`ORDER BY\` sorts the result set by one or more columns, ascending (\`ASC\`, the default) or descending (\`DESC\`). \`LIMIT\` (or \`OFFSET\`/\`FETCH\` in some databases) caps how many rows are returned — essential for pagination and for avoiding pulling an entire large table into memory when only a page of results is needed.

\`\`\`sql
SELECT title, created_at
FROM posts
WHERE published = true
ORDER BY created_at DESC
LIMIT 20 OFFSET 40; -- page 3, 20 rows per page
\`\`\`

Sorting by multiple columns resolves ties using the second column, then the third, and so on:

\`\`\`sql
SELECT * FROM employees
ORDER BY department ASC, salary DESC;
\`\`\`

A practical interview point about \`LIMIT\`/\`OFFSET\` pagination: it has a real performance cost on large tables — \`OFFSET 100000\` still requires the database to scan and discard the first 100,000 matching rows before returning the next page, getting progressively slower deeper into the result set. **Keyset pagination** (also called cursor-based pagination) avoids this by filtering on the last-seen row's sort value instead (\`WHERE created_at < :lastSeenTimestamp ORDER BY created_at DESC LIMIT 20\`), which lets an index satisfy the query directly regardless of how deep the page is, a detail senior-level interviews specifically probe for.`,
  },
  {
    title: 'Joins: INNER, LEFT, RIGHT, and FULL',
    content: `A join combines rows from two or more tables based on a related column, most commonly a foreign key matching a primary key. The join type determines what happens to rows on either side that *don't* have a match.

\`\`\`sql
-- INNER JOIN: only rows with a match in both tables
SELECT u.name, p.title
FROM users u
INNER JOIN posts p ON p.user_id = u.id;

-- LEFT JOIN: all rows from users, matching posts if any exist (NULL columns if not)
SELECT u.name, p.title
FROM users u
LEFT JOIN posts p ON p.user_id = u.id;
\`\`\`

\`INNER JOIN\` excludes users with zero posts entirely from the result. \`LEFT JOIN\` (also written \`LEFT OUTER JOIN\`) keeps every user row regardless of whether they have any posts, filling in \`NULL\` for the post columns when there's no match — the standard way to answer "show me every user, and their posts if they have any."

\`RIGHT JOIN\` is the mirror image of \`LEFT JOIN\` (keeps every row from the right-hand table); \`FULL [OUTER] JOIN\` keeps unmatched rows from *both* sides. In practice, \`RIGHT JOIN\` is rarely used since you can always rewrite it as a \`LEFT JOIN\` by swapping the table order — most style guides prefer \`LEFT JOIN\` consistently for readability.

A common interview trap: putting a filter on the right-hand table's column in the \`WHERE\` clause of a \`LEFT JOIN\` (\`WHERE p.published = true\`) silently turns it back into something behaving like an \`INNER JOIN\` for unmatched rows, since \`NULL = true\` is never true — the filter belongs in the \`ON\` clause instead if you want to keep unmatched left-side rows while still filtering the joined data.`,
  },
  {
    title: 'Aggregate Functions and GROUP BY',
    content: `Aggregate functions compute a single value from a set of rows — \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`. Used alone, they summarize the entire result set; combined with \`GROUP BY\`, they compute one summary value **per group**.

\`\`\`sql
-- One row per category, with the count and average price in that category
SELECT category, COUNT(*) AS product_count, AVG(price) AS avg_price
FROM products
GROUP BY category;
\`\`\`

Every column in the \`SELECT\` list of a grouped query must either appear in \`GROUP BY\` or be wrapped in an aggregate function — this is enforced by most databases (PostgreSQL, MySQL in strict mode) because a non-aggregated, non-grouped column would have multiple possible values per group with no defined rule for which one to show.

\`\`\`sql
-- Multiple group-by columns: one row per (category, in_stock) combination
SELECT category, in_stock, COUNT(*) AS count
FROM products
GROUP BY category, in_stock;
\`\`\`

A frequent interview gotcha is \`COUNT(*)\` versus \`COUNT(column_name)\` — \`COUNT(*)\` counts every row regardless of \`NULL\` values, while \`COUNT(column_name)\` only counts rows where that specific column is **not** \`NULL\`. Forgetting this distinction produces silently wrong counts whenever the counted column is nullable.`,
  },
  {
    title: 'HAVING vs WHERE',
    content: `\`WHERE\` filters individual rows **before** grouping/aggregation happens; \`HAVING\` filters **groups** after aggregation has already been computed — this ordering is the entire reason both clauses exist instead of one.

\`\`\`sql
SELECT category, COUNT(*) AS product_count
FROM products
WHERE in_stock = true          -- filters rows before grouping
GROUP BY category
HAVING COUNT(*) > 10;          -- filters groups after counting
\`\`\`

You cannot reference an aggregate function's result in a \`WHERE\` clause (\`WHERE COUNT(*) > 10\` is invalid) because \`WHERE\` runs before the aggregation that produces \`COUNT(*)\` even exists yet — at the point \`WHERE\` is evaluated, the database is still looking at individual rows, not yet-computed group summaries. \`HAVING\` exists specifically to filter on those summary values once they're available.

The conceptual SQL execution order worth memorizing for interviews (logical order, not necessarily the literal execution order a query planner uses): \`FROM\` → \`WHERE\` → \`GROUP BY\` → \`HAVING\` → \`SELECT\` → \`ORDER BY\` → \`LIMIT\`. Knowing this order explains several otherwise-confusing rules at once: why you can't reference a \`SELECT\`-aliased column in \`WHERE\` (the alias doesn't exist yet at that stage) but you generally can in \`ORDER BY\` (which runs after \`SELECT\`).`,
  },
  {
    title: 'Primary Keys and Foreign Keys',
    content: `A **primary key** uniquely identifies each row in a table — no two rows can share the same primary key value, and it cannot be \`NULL\`. Most tables use an auto-incrementing integer or a UUID as a synthetic primary key, rather than a "natural" key like an email address that could theoretically change.

\`\`\`sql
CREATE TABLE orders (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
\`\`\`

A **foreign key** is a column whose values must match an existing primary key value in another (or occasionally the same) table — \`orders.user_id\` must reference an \`id\` that actually exists in \`users\`. The database enforces this constraint automatically, rejecting any \`INSERT\`/\`UPDATE\` that would create an order pointing at a nonexistent user, and by default rejecting deletion of a user who still has orders referencing them.

\`\`\`sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
\`\`\`

\`ON DELETE CASCADE\` changes that default behavior — deleting a user automatically deletes their orders too, rather than blocking the deletion. Other options include \`ON DELETE SET NULL\` (clear the foreign key instead of deleting the dependent row) and \`ON DELETE RESTRICT\` (the default-like behavior, block the deletion). Choosing the right cascade behavior per relationship is a real design decision interviewers probe — cascading deletes are convenient but can silently destroy more data than intended if applied carelessly to the wrong relationship.`,
  },
  {
    title: 'INSERT, UPDATE, and DELETE',
    content: `These three statements are SQL's core data-mutation operations, alongside \`SELECT\` for reading.

\`\`\`sql
INSERT INTO users (name, email) VALUES ('Ada Lovelace', 'ada@example.com');

UPDATE users
SET email = 'ada.lovelace@example.com'
WHERE id = 1;

DELETE FROM users
WHERE id = 1;
\`\`\`

The single most important habit interviewers look for is **always including a \`WHERE\` clause** on \`UPDATE\`/\`DELETE\` unless you genuinely intend to affect every row in the table — omitting it on \`UPDATE\` silently rewrites every row's value, and omitting it on \`DELETE\` empties the entire table, both with no warning from the database itself.

\`\`\`sql
-- Inserting multiple rows in one statement is more efficient than separate INSERTs
INSERT INTO users (name, email) VALUES
  ('Grace Hopper', 'grace@example.com'),
  ('Alan Turing', 'alan@example.com');

-- "Upsert": insert, or update if the row already exists (PostgreSQL syntax)
INSERT INTO inventory (product_id, quantity)
VALUES (1, 10)
ON CONFLICT (product_id) DO UPDATE SET quantity = inventory.quantity + 10;
\`\`\`

A common interview question distinguishes \`DELETE FROM table\` (row-by-row, can be filtered with \`WHERE\`, triggers fire, fully transactional and reversible until commit) from \`TRUNCATE TABLE\` (deallocates the whole table's storage at once, can't be filtered, typically faster for clearing an entire large table, and in some databases can't be rolled back inside a transaction) — \`TRUNCATE\` is a DDL-adjacent operation, not a row-level \`DELETE\`.`,
  },
  {
    title: 'NULL Handling',
    content: `\`NULL\` represents the absence of a value — not zero, not an empty string, and critically, not equal to anything, including itself. \`NULL = NULL\` evaluates to \`NULL\` (neither true nor false), which is why comparing against \`NULL\` requires dedicated syntax.

\`\`\`sql
SELECT * FROM users WHERE phone IS NULL;       -- correct
SELECT * FROM users WHERE phone = NULL;        -- always returns zero rows, silently wrong

SELECT * FROM users WHERE phone IS NOT NULL;
\`\`\`

\`NULL\` propagates through most expressions — \`5 + NULL\` is \`NULL\`, \`'a' || NULL\` (string concatenation) is \`NULL\` — so any computation touching a \`NULL\` value typically produces \`NULL\` rather than an error or a default, which is a frequent source of unexpected query results when a column is nullable and that's not accounted for.

\`\`\`sql
SELECT COALESCE(nickname, name) AS display_name FROM users;  -- first non-NULL value
SELECT name, COALESCE(phone, 'N/A') AS phone FROM users;
\`\`\`

\`COALESCE\` returns the first non-\`NULL\` argument from a list, the standard tool for providing a fallback/default display value. A subtler interview-relevant detail: aggregate functions generally **ignore** \`NULL\` values rather than propagating them — \`AVG(price)\` over a column with some \`NULL\` prices averages only the non-\`NULL\` rows, it doesn't make the whole average \`NULL\`, which can itself be surprising if you expected \`NULL\` to "poison" the aggregate the way it does in scalar arithmetic.`,
  },
  {
    title: 'Subqueries',
    content: `A subquery is a \`SELECT\` statement nested inside another query, used where a single value, a list of values, or a derived table is needed. They appear in several positions: inside \`WHERE\`, as a derived table in \`FROM\`, or as a computed column in \`SELECT\`.

\`\`\`sql
-- Subquery in WHERE: filter using a computed set of values
SELECT name FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total_cents > 10000);

-- Subquery in FROM: treat a query's result as a table to query further
SELECT category, avg_price FROM (
  SELECT category, AVG(price) AS avg_price FROM products GROUP BY category
) AS category_averages
WHERE avg_price > 50;

-- Correlated subquery: references the outer query's row, re-evaluated per row
SELECT name FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.total_cents > 10000
);
\`\`\`

The interview-relevant distinction is **correlated** versus **non-correlated** subqueries. A non-correlated subquery (the first two examples) runs once, independently of the outer query. A correlated subquery references a column from the outer query and conceptually re-runs once per outer row — which can be much slower on large tables if the query planner can't rewrite it into an equivalent join internally, making "rewrite this correlated subquery as a join" a common senior-level optimization interview question, since most correlated subqueries using \`EXISTS\`/\`IN\` have an equivalent, often faster, join-based formulation.`,
  },
  {
    title: 'Data Types and Schema Design Basics',
    content: `Choosing the right column type affects storage size, query performance, and what invalid data the database itself can reject before it ever reaches application code. Common categories: integers (\`INT\`, \`BIGINT\`), exact decimals (\`DECIMAL(10,2)\` for money — never floating point, which introduces rounding errors), text (\`VARCHAR(n)\` bounded, \`TEXT\` unbounded), dates/times, booleans, and JSON (supported natively in PostgreSQL/MySQL for semi-structured data within an otherwise relational schema).

\`\`\`sql
CREATE TABLE orders (
  id            BIGINT PRIMARY KEY,
  total_cents   INTEGER NOT NULL,        -- store money as integer cents, not float dollars
  status        VARCHAR(20) NOT NULL DEFAULT 'pending',
  placed_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata      JSON
);
\`\`\`

\`NOT NULL\` and \`DEFAULT\` constraints are schema-level guarantees — declaring \`status NOT NULL DEFAULT 'pending'\` means the database itself rejects an attempt to insert an order with no status, and automatically fills in \`'pending'\` if the application doesn't specify one, rather than relying on application code to remember to validate or default it every time.

A practical interview point is the money-as-integer-cents pattern shown above: floating-point types (\`FLOAT\`, \`DOUBLE\`) cannot represent most decimal fractions exactly in binary, so repeated arithmetic on monetary floats accumulates rounding errors — storing whole cents as an integer (or using a fixed-point \`DECIMAL\` type) avoids this entirely, and is the standard recommendation any time exact decimal arithmetic matters.`,
  },
  {
    title: 'Indexes: What They Are and Why They Matter',
    content: `An index is a separate, ordered data structure (typically a B-tree) that the database maintains alongside a table specifically to make lookups on a particular column fast — without one, finding rows matching a condition requires scanning every row in the table (a "full table scan").

\`\`\`sql
CREATE INDEX idx_users_email ON users(email);

-- Now this lookup can use the index instead of scanning every row
SELECT * FROM users WHERE email = 'ada@example.com';
\`\`\`

Indexes aren't free: every \`INSERT\`/\`UPDATE\`/\`DELETE\` on an indexed column must also update the index's data structure, so adding indexes trades write performance and storage space for read performance — the right tradeoff for columns frequently filtered/joined on, the wrong one for columns rarely queried or written to extremely often.

Primary keys are indexed automatically by virtually every database; foreign key columns generally are **not** indexed automatically (a frequent real-world performance bug: a foreign key with no index makes every join on that relationship a full scan on the referencing table).

A precise interview answer explains *why* a B-tree specifically: it keeps data sorted and supports efficient equality lookups, range scans (\`WHERE price BETWEEN 10 AND 50\`), and ordered traversal (useful for \`ORDER BY\`) all with logarithmic-time lookups — versus a hash index, which is faster for pure equality lookups but can't support range queries or sorted traversal at all.`,
  },
  {
    title: 'Normalization Basics (1NF, 2NF, 3NF)',
    content: `Normalization is the process of structuring tables to minimize data duplication and the inconsistencies that duplication causes — splitting data into multiple related tables instead of one wide table holding everything.

**First Normal Form (1NF):** every column holds a single, atomic value — no comma-separated lists or repeating groups crammed into one column.

\`\`\`sql
-- Violates 1NF: a column holding multiple values
-- tags: "javascript,react,frontend"

-- 1NF-compliant: a separate table, one tag per row
CREATE TABLE post_tags (post_id INTEGER, tag TEXT);
\`\`\`

**Second Normal Form (2NF):** every non-key column depends on the *entire* primary key, not just part of it (only relevant for tables with a composite primary key) — eliminating partial dependencies.

**Third Normal Form (3NF):** every non-key column depends only on the primary key, not on another non-key column (eliminating transitive dependencies) — for example, storing a \`city\` and a \`zip_code\` together in an \`orders\` table is a 3NF violation if \`city\` is fully determined by \`zip_code\`; that relationship belongs in its own lookup table.

The interview-relevant practical takeaway: normalization eliminates **update anomalies** — if a customer's city is duplicated across a thousand orders, fixing a typo means updating a thousand rows instead of one, and any row missed leaves the data inconsistent. Normalization isn't an end in itself, though — it's a tool to evaluate against the tradeoffs covered later in denormalization, where some duplication is deliberately reintroduced for read performance.`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'Window Functions',
    content: `Window functions compute a value across a **set of related rows** (a "window") without collapsing those rows into a single output row the way \`GROUP BY\` aggregation does — each input row keeps its own row in the result, augmented with a computed value relative to its window.

\`\`\`sql
SELECT
  name,
  department,
  salary,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
  AVG(salary) OVER (PARTITION BY department) AS dept_avg_salary
FROM employees;
\`\`\`

\`PARTITION BY\` divides rows into groups (like \`GROUP BY\`, but without collapsing them); \`ORDER BY\` inside the \`OVER\` clause determines the order rows are processed in within each partition, which matters for ranking and running-total functions. Common window functions: \`ROW_NUMBER()\` (sequential, no ties), \`RANK()\` (ties share a rank, gaps follow), \`DENSE_RANK()\` (ties share a rank, no gaps), \`LAG()\`/\`LEAD()\` (read a value from a previous/next row in the same partition), and ordinary aggregates (\`SUM\`, \`AVG\`) used as window functions instead of grouped aggregates.

\`\`\`sql
-- Month-over-month change using LAG
SELECT month, revenue, revenue - LAG(revenue) OVER (ORDER BY month) AS change
FROM monthly_revenue;
\`\`\`

The interview-relevant distinction from \`GROUP BY\`: a grouped query answers "one summary row per group"; a window function answers "every original row, plus a value computed relative to its group" — exactly the difference between "what's the average department salary" (\`GROUP BY\`) and "show me every employee alongside their department's average salary" (window function), which can't be expressed with \`GROUP BY\` alone without a self-join.`,
  },
  {
    title: 'Common Table Expressions (CTEs) and Recursive Queries',
    content: `A CTE, defined with \`WITH\`, names a subquery's result so it can be referenced like a table within the rest of the query — primarily for readability, breaking a complex query into named, sequential steps instead of deeply nested subqueries.

\`\`\`sql
WITH high_value_orders AS (
  SELECT user_id, SUM(total_cents) AS total_spent
  FROM orders
  GROUP BY user_id
  HAVING SUM(total_cents) > 100000
)
SELECT u.name, h.total_spent
FROM high_value_orders h
JOIN users u ON u.id = h.user_id
ORDER BY h.total_spent DESC;
\`\`\`

A **recursive** CTE references itself, used for traversing hierarchical or graph-like data that a fixed number of joins can't handle — an organization chart of arbitrary depth, a category tree, or a "find all ancestors/descendants" query.

\`\`\`sql
WITH RECURSIVE org_chart AS (
  SELECT id, name, manager_id, 1 AS depth
  FROM employees WHERE manager_id IS NULL  -- base case: the top of the org

  UNION ALL

  SELECT e.id, e.name, e.manager_id, oc.depth + 1
  FROM employees e
  JOIN org_chart oc ON e.manager_id = oc.id  -- recursive case: walk down a level
)
SELECT * FROM org_chart ORDER BY depth;
\`\`\`

The interview-relevant structure: a recursive CTE always has a **base case** (the anchor, run once) and a **recursive case** (joined back to the CTE's own name, run repeatedly until it produces no more new rows), combined with \`UNION ALL\` — this is the SQL equivalent of recursion in a general-purpose language, with the same need for a termination condition to avoid an infinite loop (most databases also enforce a recursion depth limit as a safety net).`,
  },
  {
    title: 'Transactions and ACID Properties',
    content: `A transaction groups multiple statements so they either all succeed together or all fail together — essential whenever an operation needs to change more than one row/table atomically, like transferring money between two accounts.

\`\`\`sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT; -- or ROLLBACK to undo both statements if something went wrong
\`\`\`

Without a transaction wrapping both updates, a crash or error between the two statements could leave money deducted from one account but never credited to the other — a corrupted, inconsistent state that a transaction's all-or-nothing guarantee prevents.

**ACID** describes the guarantees a transactional database provides: **Atomicity** (all statements in a transaction succeed or none do), **Consistency** (a transaction can't leave the database violating its own constraints — foreign keys, unique constraints, check constraints), **Isolation** (concurrent transactions don't see each other's uncommitted changes, to a degree controlled by the isolation level), and **Durability** (once committed, the change survives a crash — it's been written to durable storage, not just memory).

A frequently asked interview question is naming a real scenario each letter prevents: Atomicity prevents the half-completed bank transfer above; Durability prevents a committed order from disappearing after a server crash; Isolation prevents one transaction from reading another's in-progress, not-yet-committed changes (a "dirty read"); Consistency prevents a transaction from, say, inserting an order for a user that doesn't exist, if a foreign key constraint is in place.`,
  },
  {
    title: 'Isolation Levels and Locking',
    content: `Isolation levels control exactly how much one transaction can see of another transaction's in-progress changes — a tradeoff between consistency guarantees and concurrency (stricter isolation generally means more blocking/locking and lower throughput under concurrent load).

The standard levels, from weakest to strongest: **Read Uncommitted** (can see other transactions' uncommitted changes — "dirty reads," rarely used), **Read Committed** (the common default in PostgreSQL/SQL Server — only ever sees committed data, but a value can change between two reads within the same transaction), **Repeatable Read** (the same row read twice within one transaction always returns the same value, even if another transaction commits a change in between — MySQL's default), and **Serializable** (the strictest — transactions behave as if executed one at a time in some serial order, preventing all the anomalies the weaker levels allow, at the highest cost to concurrency).

\`\`\`sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT balance FROM accounts WHERE id = 1;
-- ... business logic ...
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;
\`\`\`

A **deadlock** occurs when two transactions each hold a lock the other one needs, and neither can proceed — the database detects this and forcibly rolls back one of the transactions (raising an error the application must be prepared to retry), since neither transaction can otherwise ever complete.

The interview-relevant judgment: defaulting to the strictest isolation level "to be safe" isn't free — it increases lock contention and the chance of deadlocks/retries under real concurrent load, so the right choice depends on which specific anomaly (dirty read, non-repeatable read, phantom read) a given piece of business logic actually needs to be protected against, not blanket maximum strictness everywhere.`,
  },
  {
    title: 'Query Execution Plans and Optimization',
    content: `An execution plan shows exactly how the database intends to run a given query — which indexes (if any) it will use, the join algorithm chosen, and the estimated cost/row count at each step. \`EXPLAIN\` (or \`EXPLAIN ANALYZE\` to actually run the query and show real timings) is the primary tool for diagnosing a slow query.

\`\`\`sql
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = 42 AND status = 'pending';
\`\`\`

A plan reporting a **sequential scan** (reading every row in the table) on a large table where you expected an index lookup is the most common thing to look for — it usually means either no index exists on the filtered column, the query planner decided a scan was cheaper anyway (plausible if the filter matches a large fraction of the table, where an index lookup plus row fetches would actually cost more than just scanning), or the query is structured in a way that prevents the index from being used at all (e.g. wrapping the indexed column in a function: \`WHERE LOWER(email) = 'x'\` typically can't use a plain index on \`email\`).

The interview-relevant debugging sequence: identify the slow query (via logs or a slow-query log), run \`EXPLAIN ANALYZE\` to see the actual plan and timings, look for unexpected sequential scans or expensive nested-loop joins on large tables, and only then decide whether the fix is adding an index, rewriting the query, or restructuring the schema — optimization driven by what the plan actually shows, not by guessing.`,
  },
  {
    title: 'Composite and Covering Indexes',
    content: `A **composite index** spans multiple columns, and column order within it matters enormously — an index on \`(user_id, created_at)\` can efficiently serve queries filtering on \`user_id\` alone, or on \`user_id\` and \`created_at\` together, but generally **cannot** efficiently serve a query filtering on \`created_at\` alone, since the index is sorted by \`user_id\` first.

\`\`\`sql
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);

-- Can use the index efficiently:
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC;

-- Cannot use this index efficiently (created_at isn't the leading column):
SELECT * FROM orders WHERE created_at > '2024-01-01';
\`\`\`

A **covering index** includes every column a query needs (in the index itself, via \`INCLUDE\` in some databases, or simply by being a composite index over exactly the right columns), letting the database satisfy the entire query from the index alone without a second lookup into the actual table rows — a meaningful speedup for read-heavy queries on wide tables.

\`\`\`sql
CREATE INDEX idx_orders_covering ON orders(user_id, created_at) INCLUDE (status, total_cents);
\`\`\`

The interview-relevant skill is column-order reasoning: when designing a composite index, the leading column should generally be whatever's used in equality filters most often across your actual query patterns, with subsequent columns ordered by how the rest of the queries filter or sort — getting this order wrong means the index exists but silently doesn't help the queries it was built for.`,
  },
  {
    title: 'Set Operations: UNION, INTERSECT, and EXCEPT',
    content: `Set operations combine the results of two separate \`SELECT\` queries — each query must return the same number of columns, with compatible types, but they can come from entirely unrelated tables.

\`\`\`sql
-- UNION: rows from either query, duplicates removed by default
SELECT email FROM newsletter_subscribers
UNION
SELECT email FROM customers;

-- UNION ALL: same as UNION, but keeps duplicates — and is faster, since
-- it skips the deduplication pass UNION performs
SELECT email FROM newsletter_subscribers
UNION ALL
SELECT email FROM customers;

-- INTERSECT: only rows present in BOTH queries
SELECT user_id FROM orders WHERE status = 'completed'
INTERSECT
SELECT user_id FROM reviews;

-- EXCEPT (or MINUS in some databases): rows in the first query, not the second
SELECT user_id FROM customers
EXCEPT
SELECT user_id FROM orders;
\`\`\`

The interview-relevant detail most candidates miss is the cost difference between \`UNION\` and \`UNION ALL\` — \`UNION\` has to sort and de-duplicate the combined result set, which has a real performance cost on large result sets, while \`UNION ALL\` simply concatenates them. If you already know the two queries can't produce overlapping rows (e.g. they're filtered by mutually exclusive conditions), \`UNION ALL\` produces the identical result faster, with no reason to pay for deduplication that wouldn't remove anything anyway.`,
  },
  {
    title: 'Views and Materialized Views',
    content: `A **view** is a saved, named query that behaves like a virtual table — querying it re-runs the underlying query every time, with no separate storage of its own; it's purely a convenience and abstraction layer over a more complex query.

\`\`\`sql
CREATE VIEW active_high_value_customers AS
SELECT u.id, u.name, SUM(o.total_cents) AS lifetime_spend
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.active = true
GROUP BY u.id, u.name
HAVING SUM(o.total_cents) > 100000;

SELECT * FROM active_high_value_customers WHERE name LIKE 'A%';
\`\`\`

A **materialized view** is the same idea but with the result actually computed and stored on disk at creation time, then explicitly refreshed on a schedule or trigger — trading staleness (the data is only as current as the last refresh) for read speed, since querying it reads pre-computed results instead of re-running potentially expensive joins and aggregations on every query.

\`\`\`sql
CREATE MATERIALIZED VIEW daily_sales_summary AS
SELECT DATE(created_at) AS day, SUM(total_cents) AS revenue
FROM orders
GROUP BY DATE(created_at);

REFRESH MATERIALIZED VIEW daily_sales_summary; -- run on a schedule
\`\`\`

The interview-relevant tradeoff mirrors application-level caching exactly: a plain view never goes stale but pays the full query cost every time; a materialized view is fast to read but can serve outdated data until the next refresh — the right choice depends on how expensive the underlying query is and how fresh the data genuinely needs to be for the use case (a dashboard refreshed hourly is usually fine with a materialized view; a live account balance is not).`,
  },
  {
    title: 'Stored Procedures, Functions, and Triggers',
    content: `Stored procedures and functions let you store reusable, parameterized SQL/procedural logic inside the database itself, callable from application code or other SQL — useful for logic that needs to run close to the data, atomically, or be shared across multiple applications hitting the same database.

\`\`\`sql
CREATE FUNCTION calculate_discount(price NUMERIC, percent NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN price - (price * percent / 100);
END;
$$ LANGUAGE plpgsql;

SELECT calculate_discount(100, 20); -- 80
\`\`\`

A **trigger** automatically runs a function in response to a table event (\`INSERT\`, \`UPDATE\`, \`DELETE\`) — useful for enforcing invariants or maintaining derived data without relying on every piece of application code to remember to do it consistently.

\`\`\`sql
CREATE TRIGGER update_modified_timestamp
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at(); -- sets NEW.updated_at = now()
\`\`\`

The interview-relevant tradeoff: stored procedures/triggers guarantee logic runs consistently regardless of which application or script touches the database, but they push business logic out of application code and into the database itself, where it's typically harder to version control, test, and review alongside the rest of the codebase, and can surprise developers who don't expect a simple \`UPDATE\` to trigger side effects. Most teams reserve them for narrow, genuinely data-layer concerns (timestamps, audit logging, hard data-integrity invariants) rather than general business logic.`,
  },
  {
    title: 'Denormalization and Performance Tradeoffs',
    content: `Denormalization deliberately reintroduces some data duplication that normalization would eliminate, trading update complexity for read performance — the opposite direction of the normalization process covered earlier, applied selectively where read speed matters more than write simplicity.

\`\`\`sql
-- Normalized: post_count must be computed with a JOIN + COUNT every time
SELECT u.name, COUNT(p.id) AS post_count
FROM users u LEFT JOIN posts p ON p.user_id = u.id
GROUP BY u.id, u.name;

-- Denormalized: a maintained counter column, read directly with no join
SELECT name, post_count FROM users;
\`\`\`

Maintaining a denormalized \`post_count\` column requires updating it (via application code or a trigger) every time a post is created or deleted — extra write-side complexity in exchange for turning an expensive aggregate join into a single-column read.

The interview-relevant framing: this is the same fundamental tradeoff as caching — duplicated/precomputed data is fast to read but can drift out of sync with its source of truth if the update logic has a bug or is bypassed (a bulk import that doesn't go through the usual code path, for instance). The right level of denormalization depends on actual measured read/write ratios and how costly staleness or inconsistency would be for that specific piece of data — a senior-level answer avoids treating "normalize everything" or "denormalize everything" as a universal rule, and instead frames it as a query-pattern-driven decision made per table/column.`,
  },
  {
    title: 'Handling Concurrency: Deadlocks and Optimistic Locking',
    content: `When multiple transactions modify the same rows concurrently, two broad strategies exist for preventing one transaction's changes from silently clobbering another's: **pessimistic locking** (acquire a lock before reading, blocking other transactions from touching that row until you're done) and **optimistic locking** (don't lock anything upfront; instead, detect at write time whether the row changed since you read it, and reject the write if so).

\`\`\`sql
-- Pessimistic: SELECT ... FOR UPDATE locks the row until the transaction ends
BEGIN;
SELECT * FROM inventory WHERE product_id = 1 FOR UPDATE;
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 1;
COMMIT;
\`\`\`

\`\`\`sql
-- Optimistic: a version column, checked and incremented atomically
UPDATE inventory
SET quantity = quantity - 1, version = version + 1
WHERE product_id = 1 AND version = :versionReadEarlier;
-- If 0 rows were affected, someone else updated this row first — retry the whole operation
\`\`\`

Optimistic locking scales better under high read-to-write ratios and low actual contention, since it avoids holding locks at all in the common case where no conflict happens — the cost is paid (a retry) only when a real conflict occurs. Pessimistic locking is simpler to reason about and avoids wasted retry work, but can create contention and **deadlocks** when transactions acquire locks on multiple rows in inconsistent orders (transaction A locks row 1 then waits for row 2, while transaction B locks row 2 then waits for row 1 — neither can proceed).

A practical interview answer for "how would you handle two users decrementing the same inventory count simultaneously" should name both strategies and the tradeoff explicitly, rather than reaching for just one as a reflexive default.`,
  },
  {
    title: 'Database Sharding and Partitioning',
    content: `**Partitioning** splits one logical table into multiple physical pieces *within the same database instance*, typically by a range or list of values (date ranges, region) — the database still presents it as one table for queries, but storage and certain operations happen per-partition, which can dramatically speed up queries that only touch one partition and make maintenance (like deleting old data) much cheaper.

\`\`\`sql
CREATE TABLE orders (
  id INTEGER, created_at DATE, total_cents INTEGER
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
\`\`\`

**Sharding** goes further, splitting data across *multiple separate database instances/servers* entirely, usually by a shard key (often a hash of a user or tenant id) — necessary when a single database server's storage or throughput limits are exceeded, since partitioning alone doesn't add more hardware capacity, only organizes data better within one machine.

The interview-relevant tradeoff is what sharding gives up: queries that need data from multiple shards (a global \`COUNT(*)\` across all users, a join between two entities that happen to live on different shards) become significantly harder — either requiring application-level fan-out and merging, or being avoided by careful shard-key design that keeps related data co-located on the same shard. A senior-level answer treats sharding as a last resort reached only after vertical scaling, read replicas, caching, and indexing/query optimization have been exhausted — not a default architecture choice made preemptively before there's a demonstrated need for it.`,
  },
];

export function seedSqlFundamentalsLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['sql-fundamentals']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  FUNDAMENTALS_LESSONS.forEach((lesson, index) => {
    db.execute(
      'INSERT INTO lesson (category_id, level, title, content_markdown, sort_order, created_at) VALUES (?, 1, ?, ?, ?, ?)',
      [categoryId, lesson.title, lesson.content, index, CREATED_AT],
    );
  });

  ADVANCED_LESSONS.forEach((lesson, index) => {
    db.execute(
      'INSERT INTO lesson (category_id, level, title, content_markdown, sort_order, created_at) VALUES (?, 2, ?, ?, ?, ?)',
      [categoryId, lesson.title, lesson.content, index, CREATED_AT],
    );
  });
}
