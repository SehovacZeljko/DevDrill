import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedSystemDesignQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['system-design']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is the difference between horizontal and vertical scaling?',
      answer: `**Vertical scaling (scaling up):** add more resources (CPU, RAM, disk) to the existing machine. Simple — no code changes, no distribution complexity. Limited by the maximum hardware specs and creates a single point of failure.

**Horizontal scaling (scaling out):** add more machines and distribute the load across them. Enables near-infinite scale, better fault tolerance, but requires stateless application design and a load balancer.

\`\`\`
Vertical:   [Server 4GB RAM] → [Server 32GB RAM] → [Server 128GB RAM]
Horizontal: [Server 4GB] × 2 → × 4 → × 10 → × 100
\`\`\`

**Stateless vs stateful:** horizontal scaling requires that any server can handle any request. Stateful components (sessions, in-memory cache) must be externalized — use Redis for sessions, a shared database for state.

**In practice:** start with vertical scaling (simpler), switch to horizontal when you hit vertical limits or need high availability. Databases are typically hardest to scale horizontally — consider read replicas, connection pooling (PgBouncer), and database sharding as complexity increases.`,
      difficulty: 1,
      tags: 'scaling,horizontal,vertical',
    },
    {
      title: 'What is a load balancer and what algorithms does it use?',
      answer: `A load balancer distributes incoming traffic across multiple servers to prevent any single server from being overwhelmed. It sits between clients and the server pool and provides a single entry point.

**Load balancing algorithms:**

1. **Round Robin** — requests go to servers in sequence: S1, S2, S3, S1, S2...
2. **Weighted Round Robin** — servers with more capacity get proportionally more traffic
3. **Least Connections** — send to the server with the fewest active connections
4. **IP Hash** — hash the client IP to always route to the same server (session affinity/sticky sessions)
5. **Random** — pick a random server (works surprisingly well at scale)

**Layer 4 vs Layer 7:**
- **L4 (transport layer):** routes based on IP/TCP; faster; doesn't inspect content
- **L7 (application layer):** routes based on HTTP headers, URL, cookies; enables content-based routing

\`\`\`
Client → L7 Load Balancer → /api/* → API servers
                          → /static/* → CDN / file servers
                          → /ws/* → WebSocket servers
\`\`\`

**Health checks:** load balancers periodically ping servers; remove unhealthy ones automatically. Examples: AWS ALB/NLB, nginx, HAProxy, Cloudflare.`,
      difficulty: 2,
      tags: 'load-balancer,algorithms,high-availability',
    },
    {
      title: 'What is caching and what strategies are commonly used?',
      answer: `Caching stores frequently accessed data in fast storage (memory) to reduce latency and database load.

**Cache placement strategies:**

1. **Cache-aside (lazy loading):** application reads cache first; on miss, fetches from DB, stores in cache
\`\`\`js
async function getUser(id) {
  const cached = await redis.get(\`user:\${id}\`);
  if (cached) return JSON.parse(cached);
  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(user));
  return user;
}
\`\`\`

2. **Write-through:** write to cache and DB simultaneously — cache always up to date, higher write latency
3. **Write-behind (write-back):** write to cache first, sync to DB asynchronously — lower write latency, risk of data loss
4. **Read-through:** cache sits in front of DB; miss triggers cache to fetch and store automatically

**Cache invalidation strategies:**
- **TTL (time-to-live):** expire after fixed duration
- **Event-based:** invalidate when data changes (cache tag/key deletion)
- **LRU eviction:** least recently used entries removed when memory is full

**Where to cache:** CDN (static assets), application layer (Redis/Memcached), database query cache, browser cache. Cache only data that's read far more than written.`,
      difficulty: 2,
      tags: 'caching,redis,cache-invalidation',
    },
    {
      title: 'What is a CDN and when should you use one?',
      answer: `A CDN (Content Delivery Network) is a geographically distributed network of servers (edge nodes/PoPs) that cache and serve content from the location closest to the user, reducing latency.

**How it works:**
1. User requests \`https://assets.example.com/app.js\`
2. DNS resolves to the nearest CDN edge node
3. Edge has the file cached → serve immediately (cache hit)
4. Edge doesn't have it → fetch from origin server, cache it, serve user (cache miss)

**Use CDN for:**
- Static assets: JS, CSS, images, fonts
- Video and audio streaming (chunked via HLS/DASH)
- Large file downloads
- API responses that don't change frequently
- DDoS protection (edge absorbs traffic)

\`\`\`
Without CDN: User (Tokyo) → Origin (US) → ~180ms
With CDN:    User (Tokyo) → Edge (Tokyo) → ~5ms
\`\`\`

**Cache control headers:**
\`\`\`
Cache-Control: public, max-age=31536000, immutable  ← versioned assets
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
\`\`\`

Popular CDNs: Cloudflare, AWS CloudFront, Fastly, Akamai.`,
      difficulty: 1,
      tags: 'cdn,edge,performance',
    },
    {
      title: 'What is the CAP theorem?',
      answer: `The CAP theorem states that a distributed system can guarantee at most two of three properties simultaneously:

- **Consistency (C):** every read receives the most recent write or an error
- **Availability (A):** every request receives a response (not necessarily the most recent)
- **Partition tolerance (P):** the system continues operating despite network partition (messages lost between nodes)

Since network partitions are inevitable in distributed systems, you must choose between CP and AP during a partition:

**CP systems (consistent + partition tolerant):** return an error or timeout if they can't guarantee consistency. HBase, MongoDB (with write concern), Zookeeper, Redis Cluster (in some modes).

**AP systems (available + partition tolerant):** return the best available (possibly stale) data during a partition. Cassandra, DynamoDB, CouchDB.

\`\`\`
Bank transfer: needs CP — you can't have two nodes showing different balances

Social media likes: AP is fine — a slightly stale count is acceptable
\`\`\`

**PACELC** extends CAP: even without partitions, there's a tradeoff between latency (L) and consistency (C). Lower latency often means weaker consistency (eventual vs strong).`,
      difficulty: 3,
      tags: 'cap-theorem,distributed-systems,consistency',
    },
    {
      title: 'What is a message queue and when do you use one?',
      answer: `A message queue is an asynchronous communication buffer between producers and consumers. Producers send messages without waiting for consumers to process them. The queue holds messages until consumers are ready.

**Use cases:**
- Decouple services (order service → payment service)
- Smooth traffic spikes (queue absorbs bursts; consumers process steadily)
- Distribute work across multiple consumers (parallel processing)
- Retry failed operations (dead-letter queues)
- Event streaming and audit logs

\`\`\`
Without queue: Order API → PaymentService (synchronous)
               → TimeoutError if payment service is slow/down

With queue:    Order API → Queue → PaymentService (async)
               → Order API responds immediately, payment processed later
\`\`\`

**Key concepts:**
- **At-most-once:** fire and forget, messages may be lost
- **At-least-once:** messages delivered but may be duplicated (design consumers to be idempotent)
- **Exactly-once:** strong guarantee, more expensive (Kafka transactions)

Popular systems: **RabbitMQ** (AMQP, routing), **Apache Kafka** (high-throughput event streaming, retention), **AWS SQS** (managed, simple), **Redis Streams** (lightweight).`,
      difficulty: 2,
      tags: 'message-queue,async,kafka,rabbitmq',
    },
    {
      title: 'What is a microservices architecture?',
      answer: `Microservices is an architectural style where an application is decomposed into small, independently deployable services, each owning its data and communicating over APIs.

**vs Monolith:**
\`\`\`
Monolith:       [Web + API + Auth + Orders + Payments + Notifications]
                All in one process, shared database

Microservices:  [Web]──[API Gateway]──[Auth Service]──[User DB]
                                    ├─[Order Service]─[Order DB]
                                    ├─[Payment Service]─[Payment DB]
                                    └─[Notification Service]─[Queue]
\`\`\`

**Benefits:** independent deployment, independent scaling, technology diversity, fault isolation, small focused teams.

**Costs:** distributed system complexity — network failures, eventual consistency, distributed tracing, service discovery, more infrastructure to operate.

**Key patterns:**
- **API Gateway:** single entry point, handles auth, rate limiting, routing
- **Service discovery:** Consul, Kubernetes DNS
- **Circuit breaker:** stop cascading failures (Resilience4j, Hystrix)
- **Saga pattern:** distributed transactions without 2PC
- **Event sourcing / CQRS:** separate read and write models

**When to use:** multiple teams, components with different scaling needs, components requiring independent deployment cadence. Start monolith-first; extract services when you have clear boundaries.`,
      difficulty: 3,
      tags: 'microservices,architecture,distributed-systems',
    },
    {
      title: 'How would you design a URL shortener?',
      answer: `A URL shortener (like bit.ly) converts long URLs to short codes and redirects visitors.

**Requirements:**
- Shorten: POST /shorten → returns short URL
- Redirect: GET /{code} → 301/302 redirect to original URL
- ~100M URLs created/day, 10B redirections/day (read-heavy)

**Core design:**

\`\`\`
Client → GET /abc123
       → Load Balancer
       → Cache (Redis): key=abc123, check first
       → DB (PostgreSQL): SELECT original_url WHERE code = 'abc123'
       → 301 Redirect
\`\`\`

**Short code generation:**
\`\`\`js
// Base62 encoding of auto-increment ID
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
function encode(id) {
  let code = '';
  while (id > 0) { code = chars[id % 62] + code; id = Math.floor(id / 62); }
  return code.padStart(6, '0'); // 62^6 = ~56B unique codes
}
\`\`\`

**Schema:**
\`\`\`sql
CREATE TABLE urls (
  id BIGSERIAL PRIMARY KEY,
  code CHAR(6) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
CREATE INDEX idx_code ON urls(code);
\`\`\`

**Scaling:** cache hot codes in Redis (LRU). For 10B reads/day: Redis handles 100K+ ops/sec, DB read replicas for cache misses. Use 301 (permanent) for better caching; 302 if you need analytics.`,
      difficulty: 3,
      tags: 'system-design,url-shortener,interview',
    },
    {
      title: 'What is database sharding and when do you need it?',
      answer: `Sharding horizontally partitions data across multiple database servers (shards). Each shard holds a subset of rows, and together they hold the complete dataset.

**When to shard:** when a single database can't handle the write throughput, data volume exceeds a single server's storage, or read replicas alone aren't enough.

**Sharding strategies:**

**1. Range-based:** partition by value range (e.g., users A-M on shard 1, N-Z on shard 2). Simple but can create hot shards.

**2. Hash-based:** \`shard = hash(shardKey) % numShards\`. Even distribution but range queries hit all shards.

**3. Directory-based:** a lookup service maps each record to a shard. Flexible but the directory becomes a bottleneck.

\`\`\`js
// Application-level sharding
function getShard(userId, totalShards) {
  return userId % totalShards; // consistent hash is better for resharding
}

const shardPool = [db1, db2, db3, db4];
const shard = shardPool[getShard(userId, shardPool.length)];
const user = await shard.query('SELECT * FROM users WHERE id = $1', [userId]);
\`\`\`

**Challenges:** cross-shard joins are expensive, transactions across shards require distributed protocols (2PC or sagas), re-sharding is complex. Use consistent hashing to minimize data movement when adding shards.`,
      difficulty: 3,
      tags: 'sharding,database,scaling',
    },
    {
      title: 'How do you implement rate limiting at scale?',
      answer: `Rate limiting restricts how many requests a client can make in a time window. At scale, the implementation must be distributed across multiple servers.

**Token bucket (recommended):**

\`\`\`js
// Using Redis atomic operations
async function isAllowed(clientId, limit, windowSeconds) {
  const key = \`rate:\${clientId}\`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Sliding window log using sorted set
  const pipeline = redis.multi();
  pipeline.zremrangebyscore(key, 0, windowStart); // remove old entries
  pipeline.zadd(key, now, now.toString());        // add current request
  pipeline.zcount(key, windowStart, '+inf');       // count in window
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();
  const requestCount = results[2][1];

  return requestCount <= limit;
}
\`\`\`

**Fixed window counter (simpler, slight burst at boundaries):**
\`\`\`js
async function isAllowed(clientId, limit) {
  const key = \`rate:\${clientId}:\${Math.floor(Date.now() / 60000)}\`; // per minute
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return count <= limit;
}
\`\`\`

**Response headers:** always include \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, \`X-RateLimit-Reset\`, and \`Retry-After\` on 429.

**At API gateway level:** Kong, AWS API Gateway, and nginx-based solutions apply rate limiting before requests reach your app.`,
      difficulty: 3,
      tags: 'rate-limiting,redis,distributed-systems',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
