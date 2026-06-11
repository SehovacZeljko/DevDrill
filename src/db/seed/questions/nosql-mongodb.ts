import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedNoSqlMongodbQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['nosql-mongodb']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is the difference between SQL and NoSQL databases?',
      answer: `**SQL (relational):** data stored in tables with a fixed schema; relationships via foreign keys; ACID transactions; query with SQL.

**NoSQL:** a broad category — document, key-value, column-family, and graph stores. Flexible or schema-less, designed for horizontal scalability and specific access patterns.

| | SQL | NoSQL (Document) |
|---|---|---|
| Data model | Rows/tables | JSON documents/collections |
| Schema | Fixed, enforced | Flexible (schemaless) |
| Relationships | JOINs | Embedding or references |
| Transactions | Full ACID | Limited (multi-doc: MongoDB 4+) |
| Scaling | Vertical (mostly) | Horizontal (sharding) |
| Query language | SQL | MongoDB Query Language, etc. |

**Choose SQL when:** data is highly relational, complex queries, strong consistency requirements, reporting.

**Choose NoSQL when:** document-oriented data (user profiles, catalogs), high write throughput, horizontal scale, flexible/evolving schema, hierarchical data that maps naturally to documents.

Many modern apps use both (polyglot persistence) — PostgreSQL for transactional data, Redis for caching, MongoDB for flexible content.`,
      difficulty: 1,
      tags: 'nosql,sql,comparison',
    },
    {
      title: 'What is a MongoDB document and how is it structured?',
      answer: `A MongoDB document is a JSON-like structure (stored as BSON — Binary JSON) that can contain nested objects and arrays. Documents in a collection can have different fields (schemaless).

\`\`\`js
// A single document in the 'users' collection
{
  "_id": ObjectId("65a7b3c4d5e6f7a8b9c0d1e2"),
  "email": "alice@example.com",
  "name": "Alice Smith",
  "profile": {              // embedded document
    "bio": "Software engineer",
    "avatar": "https://...",
    "joinedAt": ISODate("2024-01-15")
  },
  "tags": ["javascript", "react"],  // array
  "settings": {
    "theme": "dark",
    "notifications": true
  },
  "orderCount": 12
}
\`\`\`

**Key types:** String, Number, Boolean, Date, ObjectId, Array, Embedded document, Null, Binary.

**\`_id\`** is the primary key — auto-generated as an ObjectId (12-byte timestamp + machine + random) if not provided. ObjectIds are sortable by creation time. You can use any unique value as \`_id\` (string, number, custom object).

Documents within a collection can have different shapes — useful for versioned schemas or polymorphic data.`,
      difficulty: 1,
      tags: 'documents,bson,mongodb',
    },
    {
      title: 'What are the main MongoDB aggregation pipeline stages?',
      answer: `The aggregation pipeline processes documents through a sequence of stages, each transforming the data stream.

\`\`\`js
db.orders.aggregate([
  // Stage 1: filter
  { $match: { status: 'completed', createdAt: { $gte: new Date('2024-01-01') } } },

  // Stage 2: join another collection
  { $lookup: {
    from: 'users',
    localField: 'userId',
    foreignField: '_id',
    as: 'user'
  }},

  // Stage 3: unwind array to individual documents
  { $unwind: '$user' },

  // Stage 4: group and aggregate
  { $group: {
    _id: '$user.country',
    totalRevenue: { $sum: '$amount' },
    orderCount: { $count: {} },
    avgOrder: { $avg: '$amount' }
  }},

  // Stage 5: sort
  { $sort: { totalRevenue: -1 } },

  // Stage 6: limit
  { $limit: 10 },

  // Stage 7: reshape output
  { $project: {
    country: '$_id',
    totalRevenue: 1,
    orderCount: 1,
    _id: 0
  }}
]);
\`\`\`

Key stages: \`$match\`, \`$group\`, \`$project\`, \`$lookup\`, \`$unwind\`, \`$sort\`, \`$limit\`, \`$skip\`, \`$addFields\`, \`$facet\` (multiple pipelines in parallel).`,
      difficulty: 3,
      tags: 'aggregation,pipeline,mongodb',
    },
    {
      title: 'What is the difference between embedding and referencing in MongoDB?',
      answer: `**Embedding** stores related data within the same document. **Referencing** stores an ID that points to a document in another collection (like a foreign key).

\`\`\`js
// Embedding — one query gets everything
{
  "_id": "order_123",
  "userId": "user_42",
  "items": [                       // embedded array
    { "sku": "ABC", "qty": 2, "price": 29.99 },
    { "sku": "XYZ", "qty": 1, "price": 49.99 }
  ]
}

// Referencing — separate collections, requires $lookup
// orders collection
{ "_id": "order_123", "userId": ObjectId("user_42"), "itemIds": ["item_1", "item_2"] }

// items collection
{ "_id": "item_1", "sku": "ABC", "qty": 2, "price": 29.99 }
\`\`\`

**Embed when:**
- The data is accessed together (read together, write together)
- The embedded data is not shared by many documents
- The embedded array is bounded in size (<1000 items)

**Reference when:**
- Data is shared across many documents (e.g., a product catalog referenced by many orders)
- The related data grows without bound
- You need to query related data independently

MongoDB's document model makes embedding natural for one-to-few relationships.`,
      difficulty: 2,
      tags: 'embedding,referencing,schema-design',
    },
    {
      title: 'What are indexes in MongoDB and how do you create them?',
      answer: `MongoDB indexes are B-tree structures that support fast lookups on specific fields. Without indexes, every query performs a collection scan.

\`\`\`js
// Single field index
db.users.createIndex({ email: 1 });  // 1=ascending, -1=descending
db.users.createIndex({ email: 1 }, { unique: true });

// Compound index — order matters for query coverage
db.orders.createIndex({ userId: 1, status: 1, createdAt: -1 });
// Covers: { userId }, { userId, status }, { userId, status, createdAt }
// Does NOT cover: { status } alone

// Text index for full-text search
db.articles.createIndex({ title: 'text', body: 'text' });
db.articles.find({ $text: { $search: 'mongodb index' } });

// Partial index — index only a subset of documents
db.orders.createIndex(
  { userId: 1 },
  { partialFilterExpression: { status: 'pending' } }
);

// TTL index — automatically delete documents after a time
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// Check query plans
db.orders.find({ userId: 'u1' }).explain('executionStats');
\`\`\`

Always check \`explain()\` to confirm an index is being used. Avoid over-indexing — each index increases write overhead.`,
      difficulty: 2,
      tags: 'indexes,performance,mongodb',
    },
    {
      title: 'What is a replica set in MongoDB?',
      answer: `A replica set is a group of MongoDB instances that maintain the same dataset. It provides redundancy and high availability. One member is the **primary** (accepts writes); the others are **secondaries** (replicate from primary).

\`\`\`js
// Initiate a 3-member replica set
rs.initiate({
  _id: "myReplicaSet",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" },
  ]
});

rs.status(); // view replica set health

// Connect via connection string with replica set name
mongoose.connect(
  'mongodb://mongo1:27017,mongo2:27017,mongo3:27017/mydb?replicaSet=myReplicaSet'
);
\`\`\`

**Automatic failover:** if the primary becomes unavailable, secondaries hold an election and a new primary is selected in seconds. An odd number of members (3, 5) prevents split-brain. An **arbiter** can participate in elections without storing data.

Read preferences allow routing reads to secondaries (\`readPreference: 'secondary'\`) for load distribution. Secondaries may be slightly behind primary — avoid for reads that require latest data.`,
      difficulty: 3,
      tags: 'replica-set,high-availability,mongodb',
    },
    {
      title: 'What is sharding in MongoDB?',
      answer: `Sharding is horizontal partitioning that distributes data across multiple servers (shards), enabling MongoDB to scale beyond the capacity of a single machine.

**Components:**
- **Shards** — each shard is a replica set holding a subset of data
- **mongos** — query router that directs clients to the right shard(s)
- **Config servers** — store cluster metadata and shard key mappings

\`\`\`js
// Enable sharding on a database
sh.enableSharding("ecommerce");

// Shard a collection by a key
sh.shardCollection("ecommerce.orders", { userId: "hashed" });
// Hashed sharding: even distribution, no range queries across shards

// Range sharding: good for range queries, risk of hot spots
sh.shardCollection("ecommerce.events", { createdAt: 1 });

// Check shard distribution
db.orders.getShardDistribution();
\`\`\`

**Choosing a shard key:**
- High cardinality — many distinct values
- Low frequency — no single value creates a "hot shard"
- Matches query patterns — queries that include the shard key route to one shard; without it, they fan out to all shards

Sharding adds operational complexity. Consider vertical scaling and read replicas before sharding.`,
      difficulty: 3,
      tags: 'sharding,horizontal-scaling,mongodb',
    },
    {
      title: 'When would you choose MongoDB over PostgreSQL?',
      answer: `**Choose MongoDB when:**

1. **Flexible or evolving schema** — products with many optional attributes, user-generated content, or schemas that change rapidly during development
2. **Hierarchical data** — documents that naturally nest (user with addresses, order with line items) — embedding avoids joins
3. **High write throughput** — time-series, event logging, activity feeds at massive scale
4. **Horizontal scalability from day one** — sharding is built-in; PostgreSQL scaling is harder
5. **Rapid prototyping** — schema-less development is faster when requirements are unclear

**Choose PostgreSQL when:**

1. **Complex relationships** — data that's highly normalized with many join patterns
2. **Strong consistency** — financial transactions, inventory management
3. **Complex queries** — window functions, CTEs, advanced analytics, JOINs
4. **Geospatial** — PostGIS is far more mature than MongoDB's geo
5. **Compliance** — ACID transactions across multiple tables are essential

**In practice:** Many teams default to PostgreSQL and use MongoDB only where a document model genuinely simplifies the data structure. The "flexible schema" argument is often outweighed by the benefits of schema enforcement. When in doubt, start with PostgreSQL — it's easier to add a document column (\`JSONB\`) than to retrofit relational structure into MongoDB.`,
      difficulty: 2,
      tags: 'mongodb,postgresql,when-to-use',
    },
    {
      title: 'How do you model a many-to-many relationship in MongoDB?',
      answer: `Unlike SQL, MongoDB doesn't have a native join table. You model many-to-many either by embedding arrays of IDs or by using an intermediate document (like a junction collection).

**Array of references (lightweight):**
\`\`\`js
// Students can take many courses; courses have many students
// students collection
{ _id: "s1", name: "Alice", courseIds: ["c1", "c2", "c3"] }

// courses collection
{ _id: "c1", title: "MongoDB 101", studentIds: ["s1", "s2"] }

// Query: find all courses for a student
db.courses.find({ studentIds: "s1" });

// Index both sides
db.students.createIndex({ courseIds: 1 });
db.courses.createIndex({ studentIds: 1 });
\`\`\`

**Intermediate collection (for relationship metadata):**
\`\`\`js
// enrollments collection — like a SQL junction table
{
  _id: "e1",
  studentId: ObjectId("s1"),
  courseId: ObjectId("c1"),
  enrolledAt: ISODate("2024-01-15"),
  grade: null
}

db.enrollments.createIndex({ studentId: 1 });
db.enrollments.createIndex({ courseId: 1 });

// Find all courses for a student with grades
const enrollments = await db.collection('enrollments')
  .aggregate([
    { $match: { studentId: ObjectId("s1") } },
    { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } },
    { $unwind: '$course' }
  ]).toArray();
\`\`\`

Use intermediate collection when the relationship itself has attributes (grade, role, date).`,
      difficulty: 2,
      tags: 'many-to-many,schema-design,mongodb',
    },
    {
      title: 'What is the difference between findOne and find in MongoDB?',
      answer: `**\`findOne\`** returns a single document (or \`null\` if not found). It adds \`LIMIT 1\` to the query and returns the document directly, not a cursor.

**\`find\`** returns a cursor — an iterable that lazily fetches documents from the server in batches. You iterate it with \`.toArray()\`, \`.forEach()\`, or async iteration.

\`\`\`js
// findOne — returns document or null
const user = await db.collection('users').findOne({ email: 'alice@example.com' });
if (!user) { /* not found */ }

// find — returns cursor
const cursor = db.collection('orders').find({ status: 'pending' });
const orders = await cursor.toArray();

// With chaining (cursor methods)
const recentOrders = await db.collection('orders')
  .find({ userId: ObjectId('abc') })
  .sort({ createdAt: -1 })
  .limit(20)
  .skip(0)
  .project({ total: 1, status: 1, createdAt: 1 })
  .toArray();

// Streaming large result sets (don't load all into memory)
const cursor = db.collection('events').find({});
for await (const doc of cursor) {
  await processEvent(doc);
}
\`\`\`

Prefer \`findOne\` when you expect exactly one result. Use \`find\` with \`.limit()\` and pagination for lists.`,
      difficulty: 1,
      tags: 'findone,find,cursor,mongodb',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
