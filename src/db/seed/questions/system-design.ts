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
    {
      title: 'What is consistent hashing and why is it used in distributed systems?',
      answer: `Consistent hashing is a technique for distributing keys across nodes so that adding or removing a node only remaps a fraction of the keys — not all of them.

**Problem with naive modulo hashing:** if you have 4 nodes and add a 5th, \`hash(key) % n\` changes for nearly every key, causing a massive cache miss storm.

**How consistent hashing works:**
- Map both nodes and keys onto a virtual ring (0 to 2^32)
- Each key is assigned to the first node clockwise from its position
- Adding a node only takes keys from its immediate neighbor on the ring

\`\`\`
Ring (0 → 2^32):
  Node A @ 100 → Node B @ 200 → Node C @ 350 → (wrap)

  key hash 150 → routes to Node B
  key hash 300 → routes to Node C
  key hash 400 → wraps, routes to Node A
\`\`\`

**Virtual nodes (vnodes):** each physical node occupies multiple positions on the ring. Balances load when nodes have uneven capacities and helps rebalance when nodes join/leave.

**Used in:** Amazon DynamoDB, Apache Cassandra, distributed caches (Redis Cluster), CDN cache routing. The key benefit is minimal disruption on topology changes.`,
      difficulty: 3,
      tags: 'consistent-hashing,distributed-systems,caching,scaling',
    },
    {
      title: 'What is a database index and how does a B-tree index work?',
      answer: `An index is a separate data structure that lets the database find rows without scanning the entire table. Without an index, a \`WHERE id = 5\` query does a full sequential scan — O(n).

**B-tree index (default in PostgreSQL, MySQL InnoDB):**
- A balanced tree where leaf nodes contain the indexed values + pointers to rows
- Lookups, range scans, and ORDER BY on indexed columns are O(log n)
- Inserts/updates/deletes must also update the index — write overhead

\`\`\`sql
-- Create a composite index
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);

-- This query uses the index efficiently (leftmost prefix rule)
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;

-- This does NOT use the index (skips user_id)
SELECT * FROM orders WHERE created_at > '2024-01-01';
\`\`\`

**Other index types:**
- **Hash index:** O(1) equality lookups, no range scans (Memory engine, Redis)
- **GIN/GiST:** full-text search, JSONB, array containment (PostgreSQL)
- **LSM tree:** write-optimized, used in Cassandra, RocksDB, LevelDB

**Index design tips:** index columns used in WHERE, JOIN, ORDER BY. Avoid over-indexing — each index slows writes. Use covering indexes (include all selected columns) to avoid table lookups.`,
      difficulty: 2,
      tags: 'database,indexing,b-tree,performance',
    },
    {
      title: 'What is the difference between SQL and NoSQL databases?',
      answer: `SQL (relational) databases store data in tables with a fixed schema and use SQL for queries. NoSQL databases use flexible schemas and various data models optimized for specific access patterns.

**SQL (PostgreSQL, MySQL, SQLite):**
- ACID transactions, joins, foreign key constraints
- Rigid schema — schema changes require migrations
- Best for: financial data, complex relationships, reporting/analytics

**NoSQL types:**
- **Document (MongoDB, Firestore):** JSON documents, flexible schema, good for nested data
- **Key-value (Redis, DynamoDB):** ultra-fast lookups by key, simple queries only
- **Column-family (Cassandra, HBase):** wide rows, excellent for time-series and write-heavy workloads
- **Graph (Neo4j):** optimized for relationship traversal

\`\`\`
SQL:     Users table ←→ Orders table (JOIN)
MongoDB: { _id, name, orders: [{id, total}] }  (embedded)
Redis:   SET user:42 '{"name":"Alice"}'
\`\`\`

**Choose SQL when:** you need ACID guarantees, complex multi-table queries, or strong consistency. **Choose NoSQL when:** you need extreme horizontal scale, flexible or evolving schema, or a specific data model (graph, time-series) that relational tables don't fit naturally.`,
      difficulty: 2,
      tags: 'sql,nosql,database,comparison',
    },
    {
      title: 'What is database replication and what are its types?',
      answer: `Replication copies data from one database node (primary) to one or more replicas, improving read throughput, availability, and geographic distribution.

**Single-leader (master-slave) replication:**
- All writes go to the primary; replicas apply a replication log
- Read replicas absorb read traffic (common for 80/20 read-heavy apps)
- Failover: promote a replica to primary if primary dies

**Multi-leader replication:**
- Multiple nodes accept writes; each replicates to others
- Useful for multi-datacenter deployments
- Requires conflict resolution (last-write-wins, CRDTs, application logic)

**Leaderless replication (Dynamo-style):**
- Any node accepts writes; quorum ensures consistency
- \`W + R > N\` guarantees reading your own writes

\`\`\`
Single-leader:
  Primary (RW) → Replica 1 (R) → Replica 2 (R)

Quorum (N=3, W=2, R=2):
  Write to 2 of 3 nodes ✓
  Read from 2 of 3 nodes ✓ — guaranteed to see the latest write
\`\`\`

**Replication lag:** replicas may be seconds behind the primary (eventual consistency). Design read paths to tolerate stale data, or route reads that require freshness to the primary.`,
      difficulty: 2,
      tags: 'replication,database,high-availability,consistency',
    },
    {
      title: 'What is eventual consistency and how does it differ from strong consistency?',
      answer: `**Strong consistency:** after a write completes, all subsequent reads from any node return the new value. Every observer sees the same total order of operations.

**Eventual consistency:** if no new writes occur, all replicas will *eventually* converge to the same value. In the meantime, different nodes may return different results.

\`\`\`
Strong consistency (PostgreSQL with synchronous replication):
  Write "balance = 100" → all replicas ack → only then return success
  Any read anywhere sees 100 immediately

Eventual consistency (Cassandra default):
  Write "balance = 100" to 1 of 3 nodes
  Read from another node may still return the old value briefly
\`\`\`

**Conflict resolution strategies for eventual consistency:**
- **Last-write-wins (LWW):** use timestamp; simpler but can lose writes
- **Merge functions:** union sets, max counters (e.g., G-Counter CRDT)
- **Application-level:** detect conflicts, present to user (Google Docs revision history)

**Where each fits:**
- Strong consistency: banking, inventory (stock counts), booking systems
- Eventual consistency: social media likes/views, DNS propagation, product recommendations, shopping cart (Amazon's famous example)`,
      difficulty: 2,
      tags: 'consistency,distributed-systems,cap-theorem,replication',
    },
    {
      title: 'How would you design a Twitter-style news feed?',
      answer: `A news feed shows a user's timeline — posts from people they follow, in reverse chronological order.

**Two approaches:**

**1. Fan-out on write (push model):**
- When user A posts, immediately write to all A's followers' feeds
- Read is fast (pre-computed), but write is expensive for users with millions of followers

**2. Fan-out on read (pull model):**
- Store posts in a single table; on timeline request, query all followees
- Write is cheap, but read is slow (N queries merged + sorted)

**Hybrid (used by Twitter/X):**
\`\`\`
Regular users → fan-out on write → Redis timeline cache
Celebrities (>10K followers) → fan-out on read at query time
Timeline merge = precomputed + celebrity posts injected at read
\`\`\`

**Schema:**
\`\`\`sql
posts(id, user_id, content, created_at)
follows(follower_id, followee_id)
feed_cache: Redis sorted set per user — ZADD feed:{userId} timestamp postId
\`\`\`

**Pagination:** cursor-based — client sends last seen post ID, server returns next N posts before that ID. Avoids offset drift as new posts arrive.

**At scale:** Kafka fan-out workers, Redis for hot feeds, CDN for media, separate read and write services.`,
      difficulty: 3,
      tags: 'system-design,news-feed,twitter,fan-out',
    },
    {
      title: 'What is the Saga pattern for distributed transactions?',
      answer: `The Saga pattern manages distributed transactions across multiple services without 2-phase commit. A saga is a sequence of local transactions; each step publishes an event that triggers the next, and each step has a compensating transaction to undo it if a later step fails.

**Choreography-based saga (event-driven):**
\`\`\`
OrderService → publishes OrderCreated
  PaymentService → consumes OrderCreated, charges card → publishes PaymentProcessed
  InventoryService → consumes PaymentProcessed, reserves stock → publishes StockReserved
  ShippingService → consumes StockReserved, creates shipment
\`\`\`

**Orchestration-based saga (central coordinator):**
\`\`\`
SagaOrchestrator:
  1. Call PaymentService.charge() → success
  2. Call InventoryService.reserve() → fails!
  3. Call PaymentService.refund() ← compensating transaction
\`\`\`

**Compensating transactions must be idempotent** — the orchestrator may retry them on failure.

**Choreography vs Orchestration:**
- Choreography: decoupled, but hard to track overall state
- Orchestration: easier to reason about, but orchestrator becomes a coordination bottleneck

Sagas provide **ACD** (Atomicity via compensation, Consistency, Durability) but NOT isolation — intermediate states are visible. Use "semantic locking" or reservations to handle dirty reads.`,
      difficulty: 3,
      tags: 'saga,distributed-transactions,microservices,patterns',
    },
    {
      title: 'What is a circuit breaker pattern and how does it prevent cascading failures?',
      answer: `A circuit breaker wraps calls to an external service and monitors for failures. When failures exceed a threshold, the circuit "opens" and subsequent calls fail immediately without hitting the struggling service.

**States:**
- **Closed (normal):** requests pass through; failures are counted
- **Open (failing):** requests fail immediately; no calls made to downstream
- **Half-open (recovery):** allow a probe request; if it succeeds, close; if it fails, reopen

\`\`\`js
class CircuitBreaker {
  constructor(fn, { threshold = 5, timeout = 60000 } = {}) {
    this.fn = fn;
    this.state = 'CLOSED';
    this.failures = 0;
    this.threshold = threshold;
    this.timeout = timeout;
  }

  async call(...args) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit open — service unavailable');
    }
    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  onSuccess() { this.failures = 0; this.state = 'CLOSED'; }
  onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      setTimeout(() => { this.state = 'HALF_OPEN'; }, this.timeout);
    }
  }
}
\`\`\`

Without circuit breakers, one slow service causes upstream threads to pile up waiting → memory exhaustion → cascading failure across the entire system. Libraries: Resilience4j (Java), opossum (Node.js), Polly (.NET).`,
      difficulty: 3,
      tags: 'circuit-breaker,resilience,microservices,patterns',
    },
    {
      title: 'What is a DNS and how does DNS resolution work?',
      answer: `DNS (Domain Name System) translates human-readable hostnames (example.com) into IP addresses. It's a globally distributed, hierarchical, eventually consistent database.

**Resolution steps:**
\`\`\`
Browser requests example.com
  1. Check local cache / OS hosts file
  2. Query Recursive Resolver (your ISP or 8.8.8.8)
  3. Resolver queries Root nameserver → "ask .com TLD server"
  4. Resolver queries .com TLD nameserver → "ask ns1.example.com"
  5. Resolver queries Authoritative nameserver → "93.184.216.34"
  6. Resolver caches result per TTL, returns to client
\`\`\`

**Record types:**
- **A:** hostname → IPv4
- **AAAA:** hostname → IPv6
- **CNAME:** alias → another hostname
- **MX:** mail server
- **TXT:** arbitrary text (SPF, DKIM, domain verification)
- **NS:** authoritative name servers for the domain

**TTL matters:** low TTL (60s) allows fast failover but increases resolver load. High TTL (86400s) is cached longer but slow to update.

**DNS for load balancing:**
- **Round-robin DNS:** return multiple A records, clients pick one
- **GeoDNS:** return different IPs based on client region
- **DNS failover:** health check integrations (Route 53, Cloudflare)`,
      difficulty: 2,
      tags: 'dns,networking,infrastructure',
    },
    {
      title: 'What is an API gateway and what responsibilities does it own?',
      answer: `An API gateway is the single entry point for all client requests in a microservices architecture. It handles cross-cutting concerns so individual services don't have to.

**Responsibilities:**
- **Authentication & authorization** — validate JWT/API key before forwarding
- **Rate limiting** — prevent abuse per client
- **Request routing** — proxy to correct downstream service based on path/method
- **SSL termination** — decrypt HTTPS once at the edge
- **Request/response transformation** — reshape payloads, add headers
- **Load balancing** — distribute among service instances
- **Circuit breaking** — stop forwarding to failing services
- **Logging & metrics** — centralized access logs, latency histograms

\`\`\`
Client → API Gateway (auth, rate limit, routing)
          ├─ /api/users/* → UserService
          ├─ /api/orders/* → OrderService
          └─ /api/search/* → SearchService
\`\`\`

**BFF (Backend for Frontend) pattern:** create separate gateways tailored to web vs mobile clients — different response shapes, aggregation, and auth flows.

**Popular implementations:** AWS API Gateway, Kong, nginx + Lua, Traefik, Envoy, Apigee. The gateway itself can become a bottleneck — make it stateless and horizontally scalable.`,
      difficulty: 2,
      tags: 'api-gateway,microservices,architecture,security',
    },
    {
      title: 'How would you design a distributed key-value store like Redis?',
      answer: `A distributed key-value store maps string keys to values (strings, lists, hashes, sets) with O(1) average access. At scale it needs partitioning, replication, and failure handling.

**Data model:**
\`\`\`
SET user:42:name "Alice"         → String
LPUSH notifications:42 "msg1"   → List
HSET session:abc token "xyz"    → Hash
ZADD leaderboard 9800 "alice"   → Sorted Set (score + member)
\`\`\`

**Partitioning:** use consistent hashing to assign keys to nodes. Virtual nodes ensure even distribution.

**Replication:** each primary node has N replicas. Writes go to primary, replicated asynchronously. On primary failure, a replica is promoted (Raft/Sentinel for leader election).

**Persistence options:**
- **RDB snapshot:** periodic full dump, fast restore, some data loss on crash
- **AOF (Append-Only File):** log every write command, durable but larger files

**Eviction policies (when memory is full):**
- \`allkeys-lru\` — evict least recently used from all keys
- \`volatile-ttl\` — evict keys with shortest TTL
- \`noeviction\` — return error on new writes (for critical data)

**Redis Cluster:** 16,384 hash slots distributed across nodes. Client libraries map keys to slots, then to nodes. Cross-slot multi-key operations require keys to share a hash tag: \`{user:42}:name\`, \`{user:42}:score\`.`,
      difficulty: 3,
      tags: 'redis,key-value,distributed-systems,caching',
    },
    {
      title: 'What is the two-phase commit (2PC) protocol?',
      answer: `Two-phase commit coordinates a distributed transaction so that all participating nodes either commit or rollback together — ensuring atomicity across services or shards.

**Phase 1 — Prepare:**
\`\`\`
Coordinator → "Can you commit?" → Node A, Node B, Node C
Node A → "Yes (PREPARED)"
Node B → "Yes (PREPARED)"
Node C → "No (ABORT)" ← any single "No" aborts everyone
\`\`\`

**Phase 2 — Commit or Abort:**
\`\`\`
If all voted Yes: Coordinator → "COMMIT" → A, B, C
If any voted No:  Coordinator → "ROLLBACK" → A, B, C
\`\`\`

**Problems with 2PC:**
- **Blocking:** if the coordinator crashes after Phase 1, participants wait indefinitely holding locks
- **Single point of failure:** coordinator failure stalls the entire transaction
- **Latency:** requires two round trips across the network

**Alternatives:**
- **3PC (Three-Phase Commit):** adds a pre-commit phase to reduce blocking, but doesn't handle network partitions
- **Saga pattern:** preferred in microservices — no locking, uses compensating transactions
- **Paxos/Raft:** consensus protocols that handle coordinator failures gracefully

2PC is used in traditional RDBMSs (XA transactions) where you need strict atomicity and are willing to pay the latency and availability cost.`,
      difficulty: 3,
      tags: 'distributed-transactions,2pc,consistency,distributed-systems',
    },
    {
      title: 'What is event sourcing and how does it differ from CRUD?',
      answer: `In traditional CRUD, you store the current state of an entity — updates overwrite previous values. In event sourcing, you store a log of immutable events; the current state is derived by replaying the log.

**CRUD vs Event Sourcing:**
\`\`\`
CRUD:
  UPDATE accounts SET balance = 500 WHERE id = 42   ← previous value gone

Event Sourcing:
  Event log:
    { type: "AccountOpened",  amount: 1000, timestamp: T1 }
    { type: "MoneyWithdrawn", amount: 300,  timestamp: T2 }
    { type: "MoneyDeposited", amount: -200, timestamp: T3 }
  Current balance = replay(events) = 1000 - 300 - 200 = 500
\`\`\`

**Benefits:**
- Full audit log — every state change is recorded with who/when
- Temporal queries — reconstruct state at any point in time
- Event replay — rebuild projections, fix bugs by replaying events
- Natural fit for CQRS — events drive read-model projections

**Challenges:**
- Event schema evolution — must handle old event formats
- Snapshots needed — replaying millions of events is slow; periodically snapshot state
- Eventual consistency — read models (projections) lag behind the write log

**Used in:** financial systems (every transaction is an event), e-commerce (order lifecycle), audit-heavy domains. Apache Kafka is often used as the event log.`,
      difficulty: 3,
      tags: 'event-sourcing,cqrs,architecture,patterns',
    },
    {
      title: 'What is CQRS (Command Query Responsibility Segregation)?',
      answer: `CQRS separates the write model (commands that change state) from the read model (queries that return data). Instead of one model serving both, you have two optimized models.

\`\`\`
Without CQRS:
  Client → same OrderService (reads + writes) → single Orders DB

With CQRS:
  Client writes → CommandHandler → Orders DB (write-optimized)
                               ↓ emits events
               → EventBus → Projector → Read DB (query-optimized)
  Client reads → QueryHandler → Read DB
\`\`\`

**Write model:** normalized relational schema, enforces business rules, ACID transactions.

**Read model:** denormalized, pre-joined views tailored to UI needs. Can be a separate database (Elasticsearch for search, Redis for hot data, MongoDB for flexible queries).

**Benefits:**
- Read and write sides scale independently
- Read models can be rebuilt from the event log
- Query performance optimized without compromising write integrity

**Drawbacks:**
- Eventual consistency — read model lags behind writes
- Operational complexity — two data stores, synchronization logic
- Overkill for simple CRUD applications

CQRS pairs naturally with event sourcing but doesn't require it. Use when read/write load is asymmetric or read models need radically different structures from the write model.`,
      difficulty: 3,
      tags: 'cqrs,architecture,event-sourcing,patterns',
    },
    {
      title: 'How would you design a notification system?',
      answer: `A notification system delivers messages (email, SMS, push, in-app) reliably to users in response to system events.

**High-level architecture:**
\`\`\`
Trigger event → Event Bus (Kafka)
              → Notification Service
                  ├─ Template Engine (personalize content)
                  ├─ Preference Service (check opt-outs)
                  ├─ Deduplication (Redis: "already sent this?")
                  └─ Delivery Adapters:
                        Email → AWS SES / SendGrid
                        SMS   → Twilio
                        Push  → FCM (Android) / APNs (iOS)
                        In-app → WebSocket / SSE
\`\`\`

**Key design decisions:**

**Idempotency:** events may be delivered more than once; use a deduplication key (event_id) to prevent duplicate notifications.

**Priority queues:** urgent alerts (2FA code) must not queue behind bulk newsletters. Separate queues with different consumers.

**Rate limiting per user:** don't send 100 notifications in 10 seconds — aggregate or throttle.

**Retry & dead-letter:** failed deliveries retry with exponential backoff. After N retries, move to a dead-letter queue for investigation.

**Schema:**
\`\`\`sql
notifications(id, user_id, type, channel, content, status, sent_at, created_at)
user_preferences(user_id, channel, type, opted_in)
\`\`\`

Scale the delivery adapters independently — email volume may be 10× SMS.`,
      difficulty: 3,
      tags: 'notifications,system-design,kafka,messaging',
    },
    {
      title: 'What is the difference between synchronous and asynchronous communication in microservices?',
      answer: `**Synchronous:** the caller waits for a response. The callee must be available and responsive.

\`\`\`
OrderService → HTTP POST /charge → PaymentService
             ← 200 OK { transactionId } (caller blocks)
\`\`\`

**Asynchronous:** the caller publishes a message and continues. The callee processes it later.

\`\`\`
OrderService → Kafka: "OrderPlaced" event
PaymentService (independently) consumes event, charges card, publishes "PaymentCompleted"
\`\`\`

**Synchronous pros:** simple request-response, immediate feedback, easy error propagation.
**Synchronous cons:** tight coupling — if PaymentService is slow/down, OrderService waits or fails. Cascading failures.

**Asynchronous pros:** temporal decoupling — services can be down and catch up later. Better resilience, easier scaling (workers scale independently).
**Asynchronous cons:** eventual consistency — order is placed but payment not yet confirmed. Harder to debug (distributed traces). Idempotency required.

**Protocols:**
- Sync: REST (HTTP/JSON), gRPC (HTTP/2 + Protobuf)
- Async: Kafka, RabbitMQ, AWS SQS/SNS, Redis Streams

**Rule of thumb:** use sync for user-facing requests requiring immediate feedback; use async for background work, event-driven pipelines, and anything that can tolerate delay.`,
      difficulty: 2,
      tags: 'microservices,sync,async,messaging,grpc',
    },
    {
      title: 'What is gRPC and how does it compare to REST?',
      answer: `gRPC is a high-performance RPC framework from Google that uses HTTP/2 as transport and Protocol Buffers (Protobuf) as the serialization format.

**REST vs gRPC:**

| Aspect | REST | gRPC |
|---|---|---|
| Protocol | HTTP/1.1 or HTTP/2 | HTTP/2 only |
| Format | JSON (text) | Protobuf (binary) |
| Contract | OpenAPI (optional) | .proto file (required) |
| Streaming | SSE / WebSocket (workarounds) | Native bi-directional streaming |
| Browser support | Native | Requires grpc-web proxy |
| Payload size | Larger (verbose JSON) | Smaller (binary, schema-encoded) |

**gRPC service definition:**
\`\`\`proto
service UserService {
  rpc GetUser (UserRequest) returns (UserResponse);
  rpc StreamEvents (EventFilter) returns (stream Event);
}

message UserRequest { int64 id = 1; }
message UserResponse { int64 id = 1; string name = 2; string email = 3; }
\`\`\`

**Streaming modes:** unary, server-streaming, client-streaming, bidirectional streaming.

**When to use gRPC:** internal service-to-service communication (high throughput, strict contracts), mobile clients (smaller payloads), real-time bidirectional streaming. **Use REST** for public APIs (browser-native, human-readable, easier tooling).`,
      difficulty: 2,
      tags: 'grpc,rest,api,microservices,protobuf',
    },
    {
      title: 'How does a content delivery network (CDN) handle cache invalidation?',
      answer: `CDN cache invalidation ensures edge nodes stop serving stale content after the origin updates a resource. It is one of the hardest problems in CDN design.

**Strategy 1 — TTL expiry:** set \`Cache-Control: max-age=3600\`. Edge serves cached content for 1 hour, then re-fetches. Simple, but stale up to 1 hour.

**Strategy 2 — Versioned URLs (recommended for static assets):**
\`\`\`html
<!-- Old -->
<script src="/app.js"></script>

<!-- New — content hash in filename, immutable TTL -->
<script src="/app.abc123.js"></script>
<script> <!-- Cache-Control: public, max-age=31536000, immutable --> </script>
\`\`\`
The old URL never needs invalidation — just deploy a new filename.

**Strategy 3 — Programmatic purge:** CDNs expose an API to invalidate by URL or cache tag.
\`\`\`bash
# Cloudflare cache purge
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone}/purge_cache" \\
  -H "Authorization: Bearer {token}" \\
  -d '{"files": ["https://example.com/api/products.json"]}'
\`\`\`

**Cache tags (surrogate keys):** tag related resources (e.g., all pages showing product #42). On product update, purge by tag — invalidates all related pages in one call.

**Stale-while-revalidate:** serve stale content immediately, revalidate in background — zero latency on cache miss.`,
      difficulty: 2,
      tags: 'cdn,cache-invalidation,performance,headers',
    },
    {
      title: 'What are WebSockets and when should you use them vs HTTP polling?',
      answer: `WebSockets provide a full-duplex, persistent TCP connection between client and server. After the HTTP upgrade handshake, either side can send messages at any time without a new request.

**HTTP Polling:**
\`\`\`
Client → GET /messages (every 2s)
Server ← 200 [] (empty, nothing new)
Client → GET /messages (2s later)
Server ← 200 [{ id: 1, text: "Hi" }] (finally something)
\`\`\`

**Long Polling:** client sends request; server holds it open until data is available, then responds. Client immediately re-requests. Reduces empty responses.

**WebSocket:**
\`\`\`js
// Client
const ws = new WebSocket('wss://chat.example.com');
ws.onmessage = (event) => console.log(event.data);
ws.send(JSON.stringify({ text: 'Hello' }));

// Server (Node.js + ws library)
wss.on('connection', (socket) => {
  socket.on('message', (data) => broadcast(data));
});
\`\`\`

**SSE (Server-Sent Events):** one-way server → client stream over HTTP. Simpler than WebSockets, auto-reconnects, works over HTTP/2. Good for live dashboards, notifications.

**Use WebSockets for:** chat, multiplayer games, collaborative editing, live trading. **Use SSE for:** one-way streams (live feed, progress updates). **Use polling** only as a last resort — it wastes bandwidth and introduces latency.`,
      difficulty: 2,
      tags: 'websockets,sse,real-time,http',
    },
    {
      title: 'What is service discovery and how does it work in microservices?',
      answer: `In a microservices environment, service instances start and stop dynamically (containers, auto-scaling). Service discovery lets services find each other without hard-coded IPs.

**Client-side discovery:**
- Each service queries a service registry (Consul, Eureka) to get a list of healthy instances
- Client picks an instance (round-robin, least connections) and calls it directly
- Pro: no extra hop; Con: each client needs discovery logic

**Server-side discovery:**
- Client sends request to a load balancer or API gateway
- LB queries the registry and forwards to a healthy instance
- Pro: clients are simple; Con: extra network hop

\`\`\`
Service Registry (Consul):
  PaymentService → [10.0.0.5:8080, 10.0.0.6:8080, 10.0.0.7:8080]

On startup: POST /register { service: "payment", ip, port, health: "/health" }
On shutdown: DELETE /deregister
Health check: Consul polls /health every 10s; removes failed instances
\`\`\`

**Kubernetes DNS-based discovery:** in K8s, each Service gets a stable DNS name (\`payment-service.default.svc.cluster.local\`). Pods come and go; the Service abstraction stays stable. kube-proxy handles load balancing.

**Envoy / service mesh (Istio):** inject a sidecar proxy into every pod. All traffic flows through the mesh — gives you mTLS, tracing, retries, and circuit breaking without code changes.`,
      difficulty: 2,
      tags: 'service-discovery,microservices,kubernetes,consul',
    },
    {
      title: 'What is a Bloom filter and where is it used?',
      answer: `A Bloom filter is a space-efficient probabilistic data structure that tests whether an element is in a set. It can produce **false positives** (says "in set" when it isn't) but never false negatives ("not in set" is always correct).

**How it works:**
- Allocate a bit array of size m, initialized to 0
- Use k independent hash functions
- **Insert:** hash element with each function → set those k bits to 1
- **Query:** hash element → if ANY of the k bits is 0, definitely not in set; if ALL are 1, probably in set

\`\`\`
Array size = 10, k = 3 hash functions

Insert "alice":  hash1("alice")=2, hash2("alice")=5, hash3("alice")=8
  Bits: 0 0 1 0 0 1 0 0 1 0

Query "bob":   hash1("bob")=1, hash2("bob")=5, hash3("bob")=3
  Bit[1]=0 → "bob" is definitely NOT in the set ✓

Query "carol": hash1("carol")=2, hash2("carol")=5, hash3("carol")=8
  All bits set → "carol" MIGHT be in set (false positive possible)
\`\`\`

**Real-world uses:**
- **Databases (Cassandra, RocksDB):** skip disk reads for keys that definitely don't exist
- **Chrome safe browsing:** check URLs against a Bloom filter of malicious URLs locally
- **CDN:** avoid caching one-hit-wonder URLs (cache only if seen twice)
- **Distributed systems:** pre-check before expensive network calls`,
      difficulty: 3,
      tags: 'bloom-filter,data-structures,probabilistic,performance',
    },
    {
      title: 'How would you design a ride-sharing service like Uber?',
      answer: `Uber-style ride sharing requires real-time location tracking, driver-rider matching, routing, and pricing.

**Core services:**
\`\`\`
User App → API Gateway
           ├─ Location Service   (tracks driver GPS every 5s)
           ├─ Matching Service   (find nearby drivers)
           ├─ Trip Service       (trip lifecycle: requested → accepted → ongoing → completed)
           ├─ Pricing Service    (surge pricing based on supply/demand)
           └─ Notification Service (push to driver/rider)
\`\`\`

**Location tracking at scale:**
- Drivers send GPS every 4–5 seconds → ~1M updates/min at scale
- Store in Redis geospatial index: \`GEOADD drivers:active lng lat driverId\`
- \`GEORADIUS drivers:active userLng userLat 2 km\` → nearby driver IDs

**Matching algorithm:**
- Find drivers within radius, filter by availability and heading (driver moving toward rider?)
- Match considering ETA, not just raw distance
- Offer trip to closest driver first; if no accept in 15s, try next

**Surge pricing:**
\`\`\`
surge_multiplier = f(demand / supply)
— Track requests and available drivers per hex cell (H3 geospatial grid)
— Demand > 1.5× supply → surge kicks in
\`\`\`

**Trip state machine:** Requested → Accepted → DriverArrived → InProgress → Completed | Cancelled. Each transition emits an event.

**Consistency:** booking must not double-assign a driver — use distributed lock (Redis SETNX) when assigning.`,
      difficulty: 3,
      tags: 'system-design,uber,geospatial,real-time',
    },
    {
      title: 'What is observability and what are its three pillars?',
      answer: `Observability is the ability to understand the internal state of a system by examining its outputs. A system is observable when you can ask arbitrary questions about its behaviour without deploying new code.

**The three pillars:**

**1. Metrics:** numeric measurements aggregated over time.
\`\`\`
http_requests_total{method="POST", status="200"} 4293
http_request_duration_seconds{p99} 0.45
db_connections_active 18
\`\`\`
Tools: Prometheus (scrape), Grafana (visualize), Datadog, CloudWatch.

**2. Logs:** timestamped text records of discrete events.
\`\`\`json
{ "ts": "2024-01-15T10:23:45Z", "level": "ERROR", "service": "payment",
  "msg": "Charge failed", "userId": 42, "traceId": "abc123", "err": "timeout" }
\`\`\`
Use structured JSON logs. Centralize with ELK (Elasticsearch + Logstash + Kibana) or Loki.

**3. Traces:** records the path of a request through distributed services.
\`\`\`
TraceId: abc123
  [API Gateway 2ms] → [OrderService 15ms]
                              → [PaymentService 210ms ← slow!]
                              → [NotificationService 8ms]
\`\`\`
Tools: Jaeger, Zipkin, Tempo. OpenTelemetry is the standard SDK for instrumenting services.

**SLIs/SLOs/SLAs:** SLI = metric (p99 latency), SLO = target (< 500ms 99.9% of time), SLA = contractual consequence of missing SLO.`,
      difficulty: 2,
      tags: 'observability,monitoring,metrics,logging,tracing',
    },
    {
      title: 'What is the difference between latency and throughput?',
      answer: `**Latency** is the time it takes to complete a single operation — how long a user waits for a response. Measured in milliseconds: p50, p95, p99 percentiles.

**Throughput** is the number of operations completed per unit time — how much work the system can handle. Measured in requests per second (RPS), transactions per second (TPS), or MB/s.

\`\`\`
Low latency, low throughput:   Fast individual ops, but not many of them
High latency, high throughput: Slow for each user, but processes lots of total work
Ideal: low latency + high throughput (hard to achieve simultaneously)
\`\`\`

**The tension:**
- Batching increases throughput but adds latency (wait to collect a batch)
- Parallelism increases throughput, may add latency (coordination overhead)
- Caching reduces latency and increases throughput (fewer expensive ops)

**Little's Law:** \`L = λ × W\`
- L = number of requests in the system
- λ = arrival rate (throughput)
- W = time each request spends (latency)

If latency doubles and arrival rate stays constant, concurrency doubles. This explains why latency spikes cause queue buildup.

**Percentiles over averages:** a p99 of 2s means 1% of users wait 2 seconds. Averages hide tail latency — optimize p99 and p999, not mean.`,
      difficulty: 1,
      tags: 'performance,latency,throughput,metrics',
    },
    {
      title: 'How do you design a search autocomplete system?',
      answer: `Search autocomplete suggests query completions as the user types, typically returning top-N results within ~50ms.

**Data source:** index of popular queries with frequency counts.
\`\`\`sql
query_stats(query TEXT, frequency INT, updated_at TIMESTAMP)
\`\`\`

**Trie-based approach (in-memory):**
- Build a trie where each node stores the top-K completions for that prefix
- O(prefix_length) lookup, but memory-intensive for billions of queries

**Redis sorted set approach:**
\`\`\`
ZADD autocomplete:queries 9800 "javascript tutorial"
ZADD autocomplete:queries 7200 "javascript interview"
ZADD autocomplete:queries 4100 "java spring boot"

-- Prefix search for "java":
ZRANGEBYLEX autocomplete:queries "[java" "[java\xff" LIMIT 0 5
\`\`\`

**Elasticsearch approach:**
- Index queries, use \`completion\` field type or \`edge ngram\` tokenizer
- Handles fuzzy matching, typos, ranking by popularity

**Architecture:**
\`\`\`
User types → Debounced request (200ms)
           → CDN cache (short TTL, high hit rate for common prefixes)
           → Autocomplete Service → Redis / Elasticsearch
           → Return top-5 suggestions
\`\`\`

**Aggregation pipeline:** log all search queries → Kafka → aggregate hourly → update frequency store. Debounce on frontend to avoid a query per keystroke. Scope completions by category/locale for personalization.`,
      difficulty: 3,
      tags: 'autocomplete,search,trie,redis,elasticsearch',
    },
    {
      title: 'What is a write-ahead log (WAL) and why do databases use it?',
      answer: `A Write-Ahead Log (WAL) is a durability mechanism where every change is first written to an append-only log file on disk before modifying the actual data pages. "Write-ahead" means the log entry must be flushed to disk before the change is considered committed.

**Why it matters:**
- If the database crashes mid-write, the WAL enables recovery — replay or roll back incomplete transactions
- Sequential log writes are much faster than random I/O to data pages
- The actual data pages can be updated lazily in a background process

\`\`\`
Without WAL:
  UPDATE users SET balance = 500 WHERE id = 1
  → Write to data page → crash → corrupted state ✗

With WAL:
  1. Append to WAL: "SET users.balance=500 WHERE id=1, txn=42"  ← durable
  2. Acknowledge commit to client
  3. Apply to data page (can do lazily)
  On crash recovery: replay WAL from last checkpoint → consistent state ✓
\`\`\`

**WAL and replication:** PostgreSQL streaming replication ships WAL records to replicas — replicas replay the log to stay in sync. This is the foundation of read replicas and point-in-time recovery (PITR).

**LSM trees** (used by Cassandra, RocksDB) take the WAL idea further — writes go to an in-memory buffer (MemTable) plus a WAL; periodically flushed to immutable SSTable files on disk.`,
      difficulty: 3,
      tags: 'wal,database,durability,replication,lsm',
    },
    {
      title: 'How would you design a distributed task queue like Celery or Bull?',
      answer: `A task queue offloads CPU-intensive or slow operations (email sending, image processing, report generation) from the request/response cycle to background workers.

**Components:**
\`\`\`
Web Server → enqueue task → Broker (Redis / RabbitMQ)
                                      ↓
                           Worker Pool (pulls tasks, executes)
                                      ↓
                           Result Backend (stores return values)
\`\`\`

**Task schema:**
\`\`\`json
{
  "id": "uuid-123",
  "name": "send_welcome_email",
  "args": [{ "userId": 42 }],
  "retries": 0,
  "max_retries": 3,
  "eta": null,
  "queue": "email"
}
\`\`\`

**Worker lifecycle:**
1. BLPOP from Redis queue (blocking pop — sleeps until work arrives)
2. Execute task function
3. On success: write result to result store, ACK message
4. On failure: increment retry counter, re-queue with exponential backoff delay

**Key features to implement:**
- **Priority queues:** separate queues (critical, default, low) with different worker counts
- **Scheduled tasks (eta/countdown):** store in a sorted set by scheduled time; a scheduler process moves ready tasks to the work queue
- **Idempotency:** tasks may be retried — use task ID to deduplicate
- **Dead letter queue:** after max retries, move task to DLQ for human inspection

**Monitoring:** track queue depth, worker utilization, task success/failure rates, p99 execution time.`,
      difficulty: 3,
      tags: 'task-queue,celery,redis,workers,async',
    },
    {
      title: 'What is a reverse proxy and how does it differ from a forward proxy?',
      answer: `**Forward proxy:** sits in front of *clients*, forwarding their requests to the internet on their behalf. The server doesn't know which original client made the request. Used for: corporate web filtering, anonymizing clients, caching outbound traffic.

**Reverse proxy:** sits in front of *servers*, forwarding incoming requests to backend servers. Clients don't know which backend handled their request. Used for: load balancing, SSL termination, caching, DDoS protection.

\`\`\`
Forward Proxy:
  Client A ─┐
  Client B ─┤─ Forward Proxy ─→ Internet (server sees proxy's IP)
  Client C ─┘

Reverse Proxy:
  Internet ─→ Reverse Proxy ─┬─→ Backend Server 1
                              ├─→ Backend Server 2
                              └─→ Backend Server 3
\`\`\`

**Reverse proxy capabilities:**
- **SSL termination:** decrypt HTTPS once at the edge; backends use plain HTTP internally
- **Compression:** gzip responses before sending to clients
- **Caching:** cache responses for identical requests
- **Path routing:** \`/api/*\` → API servers, \`/static/*\` → file servers
- **Rate limiting & WAF:** block malicious traffic before it reaches your app

**Popular tools:** Nginx (most common reverse proxy), HAProxy, Traefik, Caddy, AWS ALB/CloudFront.`,
      difficulty: 1,
      tags: 'reverse-proxy,nginx,networking,load-balancing',
    },
    {
      title: 'What are the SOLID principles in system design?',
      answer: `SOLID is an acronym for five object-oriented design principles that guide writing maintainable, extensible software — applicable at both the class level and service/component level.

**S — Single Responsibility:** a class/module should have one reason to change. Don't combine "process payment" and "send notification" in one service.

**O — Open/Closed:** open for extension, closed for modification. Add new behaviour by adding code, not changing existing code. Use interfaces/abstractions.

**L — Liskov Substitution:** subclasses must be substitutable for their base class without breaking behaviour. If \`Square extends Rectangle\` but breaks \`setWidth\` semantics, it violates LSP.

**I — Interface Segregation:** clients shouldn't depend on methods they don't use. Split fat interfaces into smaller, role-specific ones.
\`\`\`typescript
// Bad: forces all implementors to handle every method
interface Worker { work(): void; eat(): void; sleep(): void; }

// Good: segregated
interface Workable { work(): void; }
interface Feedable  { eat(): void; }
\`\`\`

**D — Dependency Inversion:** depend on abstractions, not concrete implementations. High-level modules shouldn't import low-level modules directly.
\`\`\`typescript
// Bad:
class OrderService { private db = new MySQLDatabase(); }

// Good:
class OrderService { constructor(private db: IDatabase) {} }
\`\`\`

At system level: SOLID maps to microservice design — each service has a single purpose, exposes stable interfaces, and depends on abstractions (events, APIs) not on each other's internals.`,
      difficulty: 2,
      tags: 'solid,design-principles,oop,architecture',
    },
    {
      title: 'What is leader election and how is it implemented in distributed systems?',
      answer: `Leader election ensures that exactly one node in a cluster acts as the coordinator (leader) at any given time — responsible for tasks like scheduling jobs, acquiring distributed locks, or managing partition assignment.

**Why it's hard:** the leader can crash, and remaining nodes must agree on a new one without knowing for certain whether the old leader is dead or just slow (network partition).

**Bully algorithm (simple):**
- Highest-ID node always wins
- When a node detects the leader is missing, it sends "ELECTION" to all higher-ID nodes
- If no response, it declares itself leader and broadcasts "COORDINATOR"

**Raft (production-grade):**
- Nodes are in one of three states: Follower, Candidate, Leader
- Followers time out if no heartbeat from Leader → become Candidate, request votes
- Candidate wins if it gets majority votes → becomes new Leader
- Leader sends heartbeats every few ms to prevent new elections

\`\`\`
Term 1: NodeA is Leader → sends heartbeats
NodeA crashes → NodeB, NodeC time out after 150–300ms
NodeB: "I'm Candidate for Term 2, vote for me"
NodeC: "I vote for NodeB (NodeB's log is at least as current as mine)"
NodeB: majority → becomes Leader for Term 2
\`\`\`

**Practical implementation:** use ZooKeeper ephemeral nodes, etcd leases, or Redis SETNX with TTL for simple leader election without implementing Raft yourself.`,
      difficulty: 3,
      tags: 'leader-election,raft,distributed-systems,consensus',
    },
    {
      title: 'How does Kafka achieve high throughput and fault tolerance?',
      answer: `Apache Kafka is a distributed event streaming platform optimized for high-throughput, ordered, persistent message delivery.

**Core concepts:**
- **Topic:** named stream of records
- **Partition:** a topic is split into partitions; each is an ordered, immutable log. More partitions = more parallelism
- **Offset:** unique sequential ID for each record within a partition
- **Consumer group:** partitions are distributed across consumers in a group; each partition has exactly one consumer

**Why it's fast:**
- **Sequential disk I/O:** appends to the end of a log file — fast even on spinning disks
- **Zero-copy:** uses \`sendfile()\` syscall to transfer data from disk to network without copying to user space
- **Batching:** producers batch records; consumers fetch in batches
- **Page cache:** OS caches hot log segments in RAM; Kafka reads from cache, not disk

**Fault tolerance:**
\`\`\`
Topic "orders", 3 partitions, replication factor 3:
  Partition 0: Leader=Broker1, Replicas=Broker2, Broker3
  Partition 1: Leader=Broker2, Replicas=Broker1, Broker3
  Partition 2: Leader=Broker3, Replicas=Broker1, Broker2

If Broker1 fails:
  Partition 0 leader election → Broker2 becomes leader
  Consumers reconnect to Broker2 and continue from last offset
\`\`\`

**Retention:** messages are kept for a configurable period (e.g., 7 days) or size regardless of consumption — consumers can replay from any offset.`,
      difficulty: 3,
      tags: 'kafka,message-queue,streaming,fault-tolerance',
    },
    {
      title: 'What is idempotency and why is it critical in distributed systems?',
      answer: `An operation is idempotent if performing it multiple times has the same effect as performing it once. In distributed systems, network failures mean requests may be retried — idempotency ensures retries don't cause duplicate side effects.

**Non-idempotent (dangerous):**
\`\`\`
POST /payments { amount: 100 }
→ Network timeout → client retries
→ Two charges of $100 💳💳
\`\`\`

**Making it idempotent:**
\`\`\`
Client generates unique idempotency key (UUID)
POST /payments { amount: 100 }
Headers: Idempotency-Key: f47ac10b-58cc-4372-a567-0e02b2c3d479

Server:
  1. Check if idempotency key exists in store
  2. If yes → return cached response (don't re-execute)
  3. If no → execute payment, store (key → response), return response
\`\`\`

**Database-level idempotency:**
\`\`\`sql
-- Upsert: safe to run multiple times
INSERT INTO payments (idempotency_key, amount, status)
VALUES ('f47ac10b', 100, 'completed')
ON CONFLICT (idempotency_key) DO NOTHING;
\`\`\`

**HTTP methods:** GET, PUT, DELETE are idempotent by definition. POST is not — always use idempotency keys for POST operations that have side effects.

**In event-driven systems:** consumers must be idempotent because at-least-once delivery guarantees duplicates. Track processed event IDs in a deduplication store.`,
      difficulty: 2,
      tags: 'idempotency,distributed-systems,payments,reliability',
    },
    {
      title: 'What is a time-series database and when do you use one?',
      answer: `A time-series database (TSDB) is optimized for storing and querying data indexed by time — metrics, sensor readings, financial tick data, logs.

**Why not use a regular SQL database?**
- Time-series data arrives in massive volume (millions of data points per second)
- Most queries are over time ranges, not individual rows
- Old data is often aggregated or deleted (retention policies)
- SQL databases lack efficient compression for sequential numeric data

**Storage optimizations in TSDBs:**
- **Time-based partitioning:** automatically split data into time buckets (hourly, daily). Old buckets are compressed or dropped
- **Delta encoding:** store differences between consecutive values (e.g., 100, +2, -1, +3) — far more compressible
- **Downsampling:** replace raw data older than 7 days with hourly averages

**InfluxDB query example:**
\`\`\`sql
SELECT mean("cpu_percent") FROM "metrics"
WHERE host = 'web-01' AND time > now() - 1h
GROUP BY time(5m)
\`\`\`

**Popular TSDBs:**
- **InfluxDB:** metrics and events
- **TimescaleDB:** PostgreSQL extension — SQL queries, time-series optimizations
- **Prometheus:** pull-based, short-term storage; scrapes targets every 15s
- **ClickHouse:** columnar OLAP, excellent for analytics over billions of time-stamped rows

**Use cases:** infrastructure metrics, IoT sensor data, stock prices, application APM, user analytics.`,
      difficulty: 2,
      tags: 'time-series,database,metrics,prometheus,influxdb',
    },
    {
      title: 'What is the difference between optimistic and pessimistic locking?',
      answer: `Both handle concurrent access to the same data — they differ in when and how they prevent conflicts.

**Pessimistic locking:** assume conflicts will happen, lock the resource before reading/writing.
\`\`\`sql
BEGIN;
SELECT * FROM inventory WHERE product_id = 1 FOR UPDATE;  -- row locked
UPDATE inventory SET stock = stock - 1 WHERE product_id = 1;
COMMIT;  -- lock released
\`\`\`
- Safe but reduces concurrency — other transactions wait
- Risk of deadlocks if multiple locks are acquired in different orders

**Optimistic locking:** assume conflicts are rare. Read without locking; detect conflict at write time using a version number.
\`\`\`sql
-- Schema has a version column
SELECT id, stock, version FROM inventory WHERE product_id = 1;
-- In application: version = 5, stock = 10

UPDATE inventory SET stock = 9, version = 6
WHERE product_id = 1 AND version = 5;
-- If 0 rows updated → conflict, retry or return error
\`\`\`

**When to use each:**
- **Pessimistic:** high-contention data (bank balances, limited inventory) where conflicts are frequent and retries are expensive
- **Optimistic:** low-contention data (profile updates, document edits) where conflicts are rare and retries are cheap

**Distributed optimistic locking:** compare-and-swap in Redis (\`SET key value NX\`), conditional writes in DynamoDB (\`ConditionExpression\`), ETags in HTTP APIs.`,
      difficulty: 2,
      tags: 'locking,database,concurrency,transactions',
    },
    {
      title: 'What is a monorepo and how does it compare to polyrepo?',
      answer: `**Monorepo:** all projects (frontend, backend, libraries, microservices) live in a single version-controlled repository.

**Polyrepo:** each project or service has its own repository.

\`\`\`
Monorepo:                     Polyrepo:
/                             github.com/org/frontend
  apps/                       github.com/org/api
    frontend/                 github.com/org/auth-service
    api/                      github.com/org/shared-utils
    auth-service/
  packages/
    shared-utils/
    ui-components/
    types/
\`\`\`

**Monorepo benefits:**
- Atomic cross-project changes — refactor an API and update all consumers in one commit
- Shared code is trivially reused without package publishing
- Unified CI/CD — one pipeline, consistent tooling, single source of truth for dependencies
- Easier code review — see the full impact of a change

**Monorepo drawbacks:**
- Build times grow — must use build caching (Nx, Turborepo) and incremental builds
- Repository size — git clone and operations slow with millions of files
- Team autonomy — harder to give teams independent deployment control

**Polyrepo benefits:** complete autonomy, isolated CI/CD, smaller repos, independent tech stacks.

**Polyrepo drawbacks:** dependency synchronization hell, code duplication, cross-repo changes require multiple PRs.

**Tools for monorepos:** Nx, Turborepo (JS/TS), Bazel (polyglot), Pants. Used by Google (all code in one repo), Meta, Airbnb.`,
      difficulty: 2,
      tags: 'monorepo,polyrepo,architecture,devops,tooling',
    },
    {
      title: 'How does OAuth 2.0 work and what are its grant types?',
      answer: `OAuth 2.0 is an authorization framework that allows a third-party application to obtain limited access to a user's resources without exposing the user's credentials.

**Actors:**
- **Resource Owner:** the user
- **Client:** the application requesting access
- **Authorization Server:** issues tokens (e.g., Auth0, Google Identity)
- **Resource Server:** API protected by OAuth

**Authorization Code Flow (most secure — for web apps):**
\`\`\`
1. Client redirects user to Authorization Server:
   GET /authorize?client_id=X&scope=read:profile&redirect_uri=...&response_type=code

2. User logs in and consents

3. Authorization Server redirects back:
   GET /callback?code=abc123

4. Client exchanges code for token (server-to-server):
   POST /token { code: abc123, client_secret: ... }
   ← { access_token, refresh_token, expires_in }

5. Client calls API with token:
   GET /api/me  Authorization: Bearer <access_token>
\`\`\`

**Why use a code instead of token directly?** The code is short-lived and exchanged server-side — the access token is never exposed in the browser URL.

**PKCE (Proof Key for Code Exchange):** required for mobile/SPA clients that can't safely store a client secret. The client creates a code verifier and challenge, preventing code interception attacks.

**Other grant types:**
- **Client Credentials:** machine-to-machine (no user involved)
- **Device Code:** TV/CLI apps without a browser`,
      difficulty: 2,
      tags: 'oauth,security,authentication,authorization,jwt',
    },
    {
      title: 'What is a content moderation system and how would you design one?',
      answer: `Content moderation classifies user-generated content (text, images, video) as safe or violating and takes action (remove, flag, shadow-ban).

**Architecture:**
\`\`\`
User posts content
  → Sync: Real-time classifier (ML model — fast, ~50ms)
      ← Low confidence or policy violation → queue for human review
      ← High confidence violation → auto-remove
      ← High confidence safe → publish immediately

  → Async: Deeper analysis pipeline (Kafka)
      → NSFW image classifier (GPU workers)
      → Spam/duplicate detection
      → Named entity / hate speech NLP model
      → Store verdict in moderation DB
\`\`\`

**Handling scale:**
- Process new posts in near-real-time, re-scan uploaded images in batch
- Use ML models for high-recall detection; human reviewers for high-stakes decisions
- Appeal workflow: users can dispute removals

**Hash-based deduplication (PhotoDNA-style):**
- Compute perceptual hash of images; compare against database of known bad content
- O(1) lookup for known violations without running ML every time

**Key metrics:**
- False positive rate (innocent content removed) — damages user trust
- False negative rate (bad content allowed through) — damages platform reputation
- Reviewer throughput — how many items can humans review per hour

**Shadow banning:** keep content visible to the poster but hide from others — reduces ban evasion attempts. Store a \`visibility\` flag per piece of content.`,
      difficulty: 3,
      tags: 'content-moderation,ml,system-design,trust-safety',
    },
    {
      title: 'What is a gossip protocol and where is it used?',
      answer: `A gossip protocol (epidemic protocol) is a peer-to-peer communication method where nodes periodically exchange state information with a random subset of their peers. Information spreads exponentially — like gossip in a social network.

**How it works:**
\`\`\`
Round 1: NodeA infects NodeB, NodeC
Round 2: NodeB infects NodeD; NodeC infects NodeE
Round 3: NodeD infects NodeF; NodeE infects NodeG, NodeH
→ Entire cluster informed in O(log N) rounds
\`\`\`

**Properties:**
- **Fault-tolerant:** no single point of failure; node failures just slow propagation slightly
- **Scalable:** each node only contacts a constant number of peers per round, regardless of cluster size
- **Eventually consistent:** all nodes converge to the same state given enough rounds
- **Decentralized:** no coordinator needed

**Use cases in real systems:**
- **Cassandra:** uses gossip for cluster membership — nodes learn about new/failed nodes
- **Amazon DynamoDB:** gossip to propagate ring membership changes
- **Redis Cluster:** gossip for node discovery and failure detection
- **Consul:** gossip (via SWIM protocol) for service mesh health tracking

**SWIM protocol:** combines gossip with failure detection — nodes randomly probe peers and report failures to the group. More efficient than pure gossip for membership.

**Limitation:** convergence time increases with cluster size; not suitable for applications requiring immediate global consistency.`,
      difficulty: 3,
      tags: 'gossip-protocol,distributed-systems,peer-to-peer,cassandra',
    },
    {
      title: 'How does Elasticsearch enable full-text search at scale?',
      answer: `Elasticsearch is a distributed search engine built on Apache Lucene. It enables full-text search, structured queries, and analytics over large datasets with near-real-time latency.

**Inverted index:**
\`\`\`
Documents:
  Doc1: "quick brown fox"
  Doc2: "quick blue bird"
  Doc3: "brown bear"

Inverted index:
  "quick" → [Doc1, Doc2]
  "brown" → [Doc1, Doc3]
  "fox"   → [Doc1]

Query "quick brown" → Doc1 (both terms) scored highest
\`\`\`

**Architecture:**
- **Index:** logical namespace (like a database)
- **Shard:** an Elasticsearch index is split into primary shards (each is a Lucene instance)
- **Replica:** copy of a shard for redundancy and read scaling

\`\`\`
Index "products" (3 primary shards, 1 replica each):
  Shard 0 (primary) → Node1    Shard 0 (replica) → Node2
  Shard 1 (primary) → Node2    Shard 1 (replica) → Node3
  Shard 2 (primary) → Node3    Shard 2 (replica) → Node1
\`\`\`

**Query example:**
\`\`\`json
POST /products/_search
{
  "query": {
    "multi_match": {
      "query": "wireless headphones",
      "fields": ["title^3", "description"],
      "fuzziness": "AUTO"
    }
  },
  "sort": [{ "_score": "desc" }, { "popularity": "desc" }]
}
\`\`\`

**Near-real-time:** new documents are available for search within ~1 second (configurable refresh interval). Not instantly, because Lucene segments must be refreshed.`,
      difficulty: 3,
      tags: 'elasticsearch,search,inverted-index,distributed-systems',
    },
    {
      title: 'What is a data pipeline and how do you design one?',
      answer: `A data pipeline moves, transforms, and loads data from source systems to destination systems in a reliable, observable, and scalable way.

**Types:**
- **ETL (Extract, Transform, Load):** transform data before loading (traditional data warehouse approach)
- **ELT (Extract, Load, Transform):** load raw data first, transform in the destination (modern cloud data warehouses like BigQuery, Snowflake)
- **Streaming pipeline:** real-time processing as events arrive (Kafka Streams, Apache Flink, Spark Streaming)
- **Batch pipeline:** process data in scheduled intervals (Apache Airflow, Spark)

**Architecture:**
\`\`\`
Sources:
  App DB (Postgres) → CDC (Debezium) → Kafka
  Mobile events → Kafka producer
  Third-party API → Polling service → Kafka

Processing (Kafka Streams / Flink):
  Enrich, filter, aggregate, join streams

Destinations:
  Data warehouse (BigQuery/Snowflake) → analytics, reporting
  OLTP DB → product features
  Search index (Elasticsearch) → full-text search
\`\`\`

**CDC (Change Data Capture):** reads the database replication log to capture every insert/update/delete without polling. Debezium is the standard open-source tool.

**Key concerns:**
- **Exactly-once semantics:** deduplication, idempotent writes
- **Schema evolution:** handle source schema changes without breaking downstream
- **Backfill:** re-process historical data after a pipeline bug
- **Monitoring:** track lag, record counts, schema errors, SLA breaches`,
      difficulty: 3,
      tags: 'data-pipeline,kafka,etl,streaming,data-engineering',
    },
    {
      title: 'How would you design a global e-commerce platform?',
      answer: `A global e-commerce platform handles product catalog, inventory, cart, checkout, orders, and payments — with high availability and geo-distribution.

**Core services:**
\`\`\`
[Web/App] → CDN → API Gateway
  ├─ Catalog Service    (product data, search)
  ├─ Inventory Service  (stock levels, reservations)
  ├─ Cart Service       (Redis per-user carts)
  ├─ Order Service      (order state machine)
  ├─ Payment Service    (idempotent, PCI-compliant)
  ├─ Notification Service (email/SMS/push)
  └─ Recommendation Service (ML, async)
\`\`\`

**Inventory — the hard part:**
\`\`\`sql
-- Reservation pattern (prevents overselling)
UPDATE inventory SET reserved = reserved + 1
WHERE product_id = 1 AND (stock - reserved) >= 1;
-- If 0 rows updated → out of stock

-- On order complete: stock = stock - 1, reserved = reserved - 1
-- On cart expiry (no purchase): reserved = reserved - 1
\`\`\`

**Cart:** store in Redis (fast, ephemeral). Sync to DB periodically or on checkout. Key: \`cart:{userId}\`.

**Checkout flow:** cart → validate inventory reservation → create order → initiate payment → on payment success → confirm order + send confirmation.

**Multi-region:** serve traffic from the nearest region. Product catalog replicated globally (read-heavy). Orders/payments in a single authoritative region per user home region to avoid distributed transactions.

**Flash sale handling:** pre-warm inventory cache, use Redis atomic DECR, queue overflow requests rather than rejecting them, auto-scale workers.`,
      difficulty: 3,
      tags: 'ecommerce,system-design,inventory,distributed-systems',
    },
    {
      title: 'What is a proxy vs a sidecar proxy in a service mesh?',
      answer: `**Proxy:** an intermediary that forwards requests on behalf of another party. Can be forward (on behalf of clients) or reverse (on behalf of servers).

**Sidecar proxy:** in a service mesh, a proxy container is deployed alongside every service instance — in the same pod (Kubernetes) or on the same host. All traffic in and out of the service flows through the sidecar, not the service directly.

\`\`\`
Without service mesh:
  ServiceA → HTTP → ServiceB (direct)
  Each service handles retries, timeouts, mTLS, tracing itself

With service mesh (Istio / Envoy):
  ServiceA → Envoy sidecar → Network → Envoy sidecar → ServiceB
  Envoy handles: mTLS, retries, circuit breaking, load balancing, tracing
  ServiceA code knows nothing about it
\`\`\`

**What sidecar proxies provide:**
- **mTLS everywhere:** all service-to-service traffic is encrypted and mutually authenticated
- **Observability:** automatic trace propagation, metrics per service pair
- **Traffic management:** canary deployments, A/B testing, fault injection for testing
- **Retries and timeouts:** configured in mesh policy, not in application code
- **Circuit breaking:** stop forwarding to failing services

**Service mesh control plane** (Istio, Linkerd): configures all sidecars centrally. Operators define policies (retry budgets, timeout rules) in YAML; the control plane pushes config to Envoy proxies.

**Cost:** sidecar adds ~1–2ms latency and ~100MB RAM per pod. Operational complexity is high — only worth it for large, complex microservice environments.`,
      difficulty: 3,
      tags: 'service-mesh,sidecar,envoy,istio,microservices',
    },
    {
      title: 'How do you handle distributed rate limiting across multiple servers?',
      answer: `When traffic is served by multiple servers behind a load balancer, a simple in-memory counter on each server won't work — each server only sees a fraction of the total traffic.

**Solution: centralized counter in Redis**

**Fixed window (simple):**
\`\`\`js
// Key = clientId:windowMinute — shared across all servers
async function checkRateLimit(clientId, limitPerMinute) {
  const minute = Math.floor(Date.now() / 60000);
  const key = \`rl:\${clientId}:\${minute}\`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return count <= limitPerMinute;
}
\`\`\`

**Sliding window log (more accurate, more memory):**
- Store request timestamps in a Redis sorted set per client
- Remove entries older than the window; count remaining

**Token bucket in Redis (smooth bursts):**
\`\`\`lua
-- Lua script (atomic execution in Redis)
local tokens = tonumber(redis.call('GET', KEYS[1]) or ARGV[1])
if tokens >= 1 then
  redis.call('SET', KEYS[1], tokens - 1)
  redis.call('EXPIRE', KEYS[1], ARGV[2])
  return 1 -- allowed
else
  return 0 -- denied
end
\`\`\`

**Leaky bucket:** requests are added to a queue that drains at a fixed rate — guarantees smooth output rate regardless of burst.

**At the edge:** push rate limiting to the API gateway (Kong, AWS API Gateway) or CDN (Cloudflare) — cheaper than hitting your origin servers first.`,
      difficulty: 3,
      tags: 'rate-limiting,redis,distributed-systems,api-gateway',
    },
    {
      title: 'What is a fanout service and how does it scale?',
      answer: `A fanout service distributes (fans out) a single event to many downstream targets — for example, delivering a new post to all of a user's followers' feeds.

**The problem:** if a celebrity with 10 million followers posts, you need to update 10 million feed caches.

**Approaches:**

**1. Synchronous fanout (simple, doesn't scale):**
\`\`\`
Post created → for each follower: write to their feed cache
→ 10M Redis writes in a request handler = timeout
\`\`\`

**2. Asynchronous fanout via queue:**
\`\`\`
Post created → Publish event to Kafka
              → Fanout workers (N consumers in parallel) pull from Kafka
              → Each worker handles a batch of followers (e.g., 1000 at a time)
              → Write to Redis feed cache for each follower
\`\`\`

**3. Hybrid (Twitter/X model):**
- Regular users (< 10K followers): fanout on write (pre-compute feed)
- Celebrities (> 10K followers): fanout on read (inject at query time)
- Feed query = merge(precomputed feed, followed celebrity posts ordered by time)

**Sharding fanout workers:**
- Partition followers by user ID range
- Each worker only handles its partition
- Total time = max(worker time) instead of sum(worker time)

**Backpressure:** if feed cache writes back up, workers slow down consuming from Kafka. Kafka retains messages — no data loss, just delayed delivery. Monitor consumer group lag.`,
      difficulty: 3,
      tags: 'fanout,social-network,kafka,feed,scaling',
    },
    {
      title: 'What is the strangler fig pattern for migrating a monolith?',
      answer: `The strangler fig pattern (named after a tropical tree that slowly envelops its host) is a migration strategy where new microservices are built incrementally alongside the monolith, gradually taking over functionality until the monolith can be decommissioned.

**Steps:**
\`\`\`
Phase 1: Route traffic through a facade (reverse proxy)
  Client → Nginx → Monolith (all traffic)

Phase 2: Extract a service, intercept its routes
  Client → Nginx → /api/payments → Payment Microservice (NEW)
                 → everything else → Monolith

Phase 3: Continue extracting services over time
  Client → API Gateway → /api/users → User Service
                       → /api/orders → Order Service
                       → /api/legacy → Monolith (shrinking)

Phase 4: Monolith retired when all functionality migrated
\`\`\`

**Key principles:**
- Never rewrite the whole system at once ("big bang" rewrites almost always fail)
- Each extracted service must be tested thoroughly before traffic is cut over
- Keep the monolith working throughout — it's your safety net
- Use feature flags for gradual traffic migration (1% → 10% → 100%)

**Database strangling:** extract the data too — start with the new service reading from the monolith's DB, then migrate data to a dedicated DB, then cut the shared DB dependency.

**Risk:** dual-write complexity during migration, need to keep two systems in sync temporarily.`,
      difficulty: 2,
      tags: 'strangler-fig,migration,monolith,microservices,patterns',
    },
    {
      title: 'How does a columnar database differ from a row-oriented database?',
      answer: `**Row-oriented (OLTP):** data is stored row by row on disk. Reading one row is fast (all columns together). Writing a new row is fast. Poor for analytics that scan millions of rows but only need a few columns.

**Columnar (OLAP):** data is stored column by column. Reading a single column (e.g., all prices) is extremely fast. Writing a single row requires updating N column files.

\`\`\`
Row store (PostgreSQL):
  [id=1, name="Alice", price=9.99] [id=2, name="Bob", price=14.99] ...

Columnar (ClickHouse, Redshift, Parquet):
  id:    [1, 2, 3, 4, 5, ...]
  name:  ["Alice", "Bob", "Carol", ...]
  price: [9.99, 14.99, 4.99, ...]
\`\`\`

**Why columnar is fast for analytics:**
- Only read the columns you need (projection pushdown) — skip irrelevant data
- Same-type values compress extremely well (run-length encoding, delta encoding)
- SIMD vectorized operations over arrays of the same type

**Query comparison:**
\`\`\`sql
-- On 1B rows: "total revenue by category"
SELECT category, SUM(price) FROM orders GROUP BY category;

Row store: read ALL columns for 1B rows → ~200GB I/O
Columnar:  read only [category, price] columns → ~10GB I/O → 20× faster
\`\`\`

**Use row stores for:** transactional workloads (OLTP) — user lookups, order inserts, account updates.
**Use columnar for:** analytics, reporting, data warehouses (OLAP) — aggregations over billions of rows.`,
      difficulty: 2,
      tags: 'columnar,database,olap,oltp,performance,clickhouse',
    },

    {
      title: 'What is a Merkle tree and how is it used in distributed systems?',
      answer: `A Merkle tree is a binary hash tree where every leaf node contains the hash of a data block, and every non-leaf node contains the hash of its children. The root hash summarizes the entire dataset.

\`\`\`
        RootHash
       /         \\
   Hash(AB)    Hash(CD)
   /    \\       /    \\
Hash(A) Hash(B) Hash(C) Hash(D)
  A       B       C       D
\`\`\`

**Key property:** changing any single data block changes all hashes up to the root. You can verify whether two datasets are identical by comparing root hashes (O(1)), and find exactly which block differs in O(log N) time.

**Uses in distributed systems:**

**Anti-entropy in Cassandra:** when two replicas have inconsistent data, they exchange Merkle trees built over their key ranges. Subtrees with matching root hashes are skipped; only subtrees with differing hashes are synced — minimizing data transfer.

**Bitcoin blockchain:** transactions in a block are hashed into a Merkle tree. The block header stores only the Merkle root. Light clients can verify a transaction is in a block with just a "Merkle proof" — O(log N) hashes without downloading the whole block.

**Git:** commits, trees, and blobs form a content-addressed Merkle DAG. Two repos can compare object graphs by comparing hashes — the foundation of git's efficient sync.

**IPFS:** content addressing — a file's CID (hash) is derived from a Merkle DAG of its chunks.`,
      difficulty: 3,
      tags: 'merkle-tree,distributed-systems,data-integrity,cassandra',
    },
    {
      title: 'How would you design a real-time collaborative editing system like Google Docs?',
      answer: `Real-time collaborative editing lets multiple users edit the same document simultaneously with changes reflected instantly.

**Core challenge:** two users edit at the same position simultaneously — whose change wins, and how do you merge without data loss?

**Operational Transformation (OT) — classic approach:**
\`\`\`
User A (offset 5): Insert "X" → Op: { type: insert, pos: 5, char: "X" }
User B (offset 5): Delete "Y" → Op: { type: delete, pos: 5 }

If A's op arrives first at server:
  Transform B's delete against A's insert → new pos: 6
  Apply transformed op — both changes preserved
\`\`\`

**CRDTs (Conflict-free Replicated Data Types) — modern approach:**
- Each character is assigned a globally unique position ID (e.g., fractional index between neighbors)
- Operations are commutative and associative — apply in any order, result is always the same
- No central server needed for conflict resolution
- Used by Figma, Notion, Liveblocks

**Architecture:**
\`\`\`
Client edits → WebSocket → Collaboration Server
                               ↓
                          Apply + broadcast op to all connected clients
                               ↓
                          Persist op to operation log (Kafka / DB)
                               ↓
                          Periodically snapshot document state
\`\`\`

**Presence & cursors:** broadcast user cursor positions via WebSocket; display colored cursors. Debounce cursor updates (not every keystroke).

**Offline support:** queue operations locally; on reconnect, send queued ops and reconcile.`,
      difficulty: 3,
      tags: 'collaborative-editing,crdt,ot,websockets,real-time',
    },
    {
      title: 'What is connection pooling and why is it critical for database performance?',
      answer: `A database connection is expensive to establish — TCP handshake, authentication, SSL negotiation can take 50–200ms. Connection pooling maintains a warm pool of open connections that are reused across requests.

**Without pooling:**
\`\`\`
Request 1: open connection (150ms) → query (5ms) → close connection
Request 2: open connection (150ms) → query (5ms) → close connection
...
\`\`\`

**With pooling:**
\`\`\`
App start: pre-open 10 connections
Request 1: borrow connection (< 1ms) → query (5ms) → return to pool
Request 2: borrow connection (< 1ms) → query (5ms) → return to pool
\`\`\`

**Pool configuration (Node.js pg example):**
\`\`\`js
const pool = new Pool({
  max: 20,        // max open connections
  min: 5,         // keep at least 5 warm
  idleTimeoutMillis: 30000,   // close idle connections after 30s
  connectionTimeoutMillis: 2000, // fail if no connection available in 2s
});
\`\`\`

**N+1 connection problem:** if you run 100 app servers × 20 connections = 2000 DB connections. PostgreSQL struggles beyond ~500 concurrent connections. Solution: use **PgBouncer** as a connection proxy — all app servers connect to PgBouncer (cheap), which maintains a smaller real pool to PostgreSQL.

**PgBouncer modes:**
- **Session pooling:** connection held for client session lifetime
- **Transaction pooling:** connection returned after each transaction (most efficient)
- **Statement pooling:** returned after each statement (incompatible with multi-statement transactions)`,
      difficulty: 2,
      tags: 'connection-pooling,database,performance,pgbouncer',
    },
    {
      title: 'What is a fanout-on-write vs fanout-on-read for social feeds?',
      answer: `When a user posts, you must eventually show that post in all their followers' feeds. The timing of that distribution is the key trade-off.

**Fanout-on-write (push model):**
- When User A posts, immediately write Post ID into every follower's feed cache
- Read is O(1) — just fetch the pre-built feed list from Redis

\`\`\`
Post created → Worker fans out to 500 followers
  RPUSH feed:user1 postId
  RPUSH feed:user2 postId
  RPUSH feed:user3 postId
  ... (500 writes)
\`\`\`

- **Pro:** feed reads are instant
- **Con:** celebrity with 10M followers → 10M writes per post. Wastes storage if many followers never log in.

**Fanout-on-read (pull model):**
- When User A reads their feed, query all followees' recent posts and merge
- No pre-computation, but each feed load is expensive

\`\`\`sql
SELECT p.* FROM posts p
JOIN follows f ON p.user_id = f.followee_id
WHERE f.follower_id = ? ORDER BY p.created_at DESC LIMIT 20;
\`\`\`

- **Pro:** simple, no storage waste, works for celebrities
- **Con:** slow at read time when following many active users

**Hybrid (Instagram/Twitter):**
- Regular users → fanout-on-write (fast reads)
- Celebrities (> threshold) → fanout-on-read (injected at query time)
- Inactive followers → skip (don't write to feeds of users offline > 7 days)`,
      difficulty: 3,
      tags: 'social-feed,fanout,system-design,redis,architecture',
    },
    {
      title: 'What are database transactions and the ACID properties?',
      answer: `A transaction is a sequence of database operations that are executed as a single unit. ACID guarantees that transactions are processed reliably.

**A — Atomicity:** all operations in a transaction succeed or all are rolled back. No partial commits.
\`\`\`sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; -- both succeed, or ROLLBACK if either fails
\`\`\`

**C — Consistency:** a transaction brings the database from one valid state to another. All constraints (foreign keys, CHECK constraints, triggers) must be satisfied.

**I — Isolation:** concurrent transactions don't see each other's intermediate state. Isolation levels trade off between safety and performance:
- **Read Uncommitted** → dirty reads possible
- **Read Committed** → no dirty reads (PostgreSQL default)
- **Repeatable Read** → no non-repeatable reads
- **Serializable** → full isolation, as if transactions run sequentially (most expensive)

**D — Durability:** once committed, data survives crashes. Achieved via Write-Ahead Log (WAL) — changes written to durable log before applying to data pages.

**Isolation problems:**
- **Dirty read:** read uncommitted data from another transaction
- **Non-repeatable read:** re-reading a row returns different values
- **Phantom read:** re-running a range query returns different rows
- **Lost update:** two transactions read-modify-write the same row, one's change is lost`,
      difficulty: 2,
      tags: 'acid,transactions,database,isolation',
    },
    {
      title: 'How would you design a file storage system like Dropbox?',
      answer: `A file storage system lets users upload, sync, share, and version files across devices.

**Core requirements:** upload/download files, sync across devices, share with others, version history, ~100M users, handle large files (up to 50GB).

**Architecture:**
\`\`\`
Client → API Gateway
  ├─ Metadata Service → PostgreSQL (file paths, versions, permissions)
  ├─ Upload Service → S3 / Blob storage (actual file content)
  └─ Sync Service → WebSocket (real-time change notifications)
\`\`\`

**Chunked upload:**
\`\`\`
1. Client splits file into 4MB chunks
2. Hash each chunk (SHA-256)
3. Upload only chunks not already on server (deduplication)
4. Server reassembles: pointer from metadata to chunk hashes

Benefits: resume interrupted uploads, deduplicate identical files/blocks
\`\`\`

**Schema:**
\`\`\`sql
files(id, user_id, path, size, created_at)
file_versions(id, file_id, version, chunk_hashes TEXT[], created_at)
chunks(hash CHAR(64) PRIMARY KEY, storage_url TEXT, ref_count INT)
\`\`\`

**Sync protocol:**
- Client polls or maintains WebSocket for change events
- On remote change: download only the modified chunks
- Conflict: both versions kept with a conflict copy

**Delta sync:** for large files (e.g., a 10GB video), track which 4MB blocks changed. Only transfer changed blocks on update — not the entire file.

**CDN for downloads:** signed S3 URLs routed through CloudFront for fast regional delivery. Pre-signed URLs expire after 15 minutes to prevent hotlinking.`,
      difficulty: 3,
      tags: 'file-storage,system-design,s3,sync,dropbox',
    },
    {
      title: 'What is a zero-downtime deployment strategy?',
      answer: `Zero-downtime deployment means releasing new code without users experiencing any errors or service interruptions during the transition.

**1. Rolling deployment:**
\`\`\`
[v1 v1 v1 v1] → [v2 v1 v1 v1] → [v2 v2 v1 v1] → [v2 v2 v2 v2]
— Replace one instance at a time
— Load balancer routes to healthy instances only
— Both versions run briefly in parallel
\`\`\`

**2. Blue-Green deployment:**
\`\`\`
Blue (v1): Live — handles 100% traffic
Green (v2): Idle — deploy new version here, run tests

DNS/LB switch: 100% traffic → Green
Blue stays warm → instant rollback if issues
\`\`\`

**3. Canary release:**
\`\`\`
Phase 1: 1% of users → new version (v2)
Phase 2: 10% → v2 (monitor error rate, latency)
Phase 3: 50% → v2
Phase 4: 100% → v2 (decommission v1)
\`\`\`

**4. Feature flags:** deploy code to all servers but gate new behaviour behind a flag. Turn on for internal users first, then gradually wider audiences.

**Database migration concern:** the hardest part of zero-downtime deployment. Approach:
1. Deploy migration that adds a new column (nullable, backward-compatible)
2. Deploy new code that writes to both old and new column
3. Backfill old data
4. Deploy code that reads from new column only
5. Drop old column

Never rename/delete columns in the same deployment as the code that depends on the change.`,
      difficulty: 2,
      tags: 'deployment,blue-green,canary,zero-downtime,devops',
    },
    {
      title: 'What is vector search and how does it enable semantic similarity?',
      answer: `Vector search finds items that are semantically similar by converting content (text, images, audio) into high-dimensional numeric vectors (embeddings) and finding vectors that are close in that space.

**How embeddings work:**
\`\`\`
"dog" → [0.2, -0.5, 0.8, ...]   (768 dimensions)
"cat" → [0.3, -0.4, 0.7, ...]   (nearby in vector space — similar meaning)
"car" → [-0.9, 0.1, -0.2, ...]  (far away — different meaning)
\`\`\`

**Similarity metric — cosine similarity:**
\`\`\`
cosine_similarity(v1, v2) = (v1 · v2) / (|v1| × |v2|)
Range: -1 (opposite) to 1 (identical direction)
\`\`\`

**Approximate Nearest Neighbor (ANN) algorithms:**
- **HNSW (Hierarchical Navigable Small Worlds):** graph-based, fast queries, used by pgvector, Weaviate
- **IVF (Inverted File Index):** cluster vectors, search only nearest clusters
- Exact nearest neighbor is O(N × D) — too slow for billions of vectors

**Architecture for semantic search:**
\`\`\`
Index time:
  Document → Embedding Model (e.g., text-embedding-3-small) → 1536-dim vector
  → Store in vector DB (Pinecone, pgvector, Weaviate, Qdrant)

Query time:
  User query → Embedding Model → query vector
  → ANN search in vector DB → top-K most similar documents
  → Return to user (optionally re-rank with BM25 hybrid)
\`\`\`

**Use cases:** semantic document search, recommendation systems ("users who liked X"), image similarity, RAG (Retrieval-Augmented Generation) for LLMs.`,
      difficulty: 3,
      tags: 'vector-search,embeddings,semantic-search,ml,ann',
    },
    {
      title: 'What is a lock-free data structure and why is it useful?',
      answer: `Lock-free data structures allow multiple threads to operate concurrently without using mutexes. They rely on atomic CPU instructions (compare-and-swap) to coordinate without blocking.

**Compare-and-Swap (CAS):**
\`\`\`
CAS(address, expected, new_value):
  if *address == expected:
    *address = new_value
    return true  (success)
  else:
    return false (retry)
— This happens atomically at the CPU level
\`\`\`

**Lock-free stack (push):**
\`\`\`js
push(value) {
  const newNode = { value, next: null };
  do {
    newNode.next = this.head; // read current head
  } while (!CAS(this.head, newNode.next, newNode)); // retry if head changed
}
\`\`\`

**Why lock-free:**
- No deadlocks — a thread can't hold a lock it never acquires
- No priority inversion — a low-priority thread can't block a high-priority one
- Better throughput under high contention — failed CAS retries are cheaper than OS-level mutex contention

**ABA problem:** CAS checks value but not version — a value can change A→B→A and CAS thinks nothing changed. Fix: tagged pointers (include version counter in the atomic word).

**Real-world use:** Java's \`ConcurrentLinkedQueue\`, \`AtomicInteger\`; Linux kernel RCU (Read-Copy-Update); high-frequency trading systems. Lock-free is complex to implement correctly — prefer battle-tested concurrent libraries over rolling your own.`,
      difficulty: 3,
      tags: 'lock-free,concurrency,cas,data-structures,threading',
    },
    {
      title: 'How would you design a monitoring and alerting system?',
      answer: `A monitoring and alerting system collects system metrics, detects anomalies, and notifies on-call engineers.

**Components:**
\`\`\`
[Services] → Metrics Agent (Prometheus client)
           → Metrics Collector (Prometheus scrapes /metrics every 15s)
           → Time-Series DB (Prometheus, Thanos for long-term)
           → Alerting Engine (Alertmanager)
               → PagerDuty / Slack / OpsGenie
           → Dashboards (Grafana)
\`\`\`

**Metrics types (Prometheus):**
\`\`\`
Counter:   http_requests_total{status="200"} — monotonically increasing
Gauge:     memory_usage_bytes — can go up or down
Histogram: http_request_duration_seconds — bucketed latency distribution
Summary:   pre-computed quantiles (less flexible than histograms)
\`\`\`

**PromQL alert rule:**
\`\`\`yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) /
        rate(http_requests_total[5m]) > 0.05
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Error rate above 5% for 2 minutes"
\`\`\`

**Good alerting principles:**
- Alert on symptoms (high error rate, slow responses) not causes (CPU high)
- Every alert must be actionable — if you can't do anything about it, don't page
- Use \`for: Nm\` to avoid flapping on transient spikes
- Set SLO-based alerts: "error budget burning too fast"

**Anomaly detection:** use rolling baselines — alert when current value deviates > 3σ from the 7-day average for the same hour.`,
      difficulty: 2,
      tags: 'monitoring,alerting,prometheus,grafana,slo',
    },
    {
      title: 'What is a streaming database and how does it differ from batch processing?',
      answer: `**Batch processing:** collect data over a period, then process the entire dataset at once. High throughput, high latency (minutes to hours).

**Stream processing:** process each event as it arrives. Low latency (milliseconds to seconds), lower throughput per node.

\`\`\`
Batch (Spark, Hadoop MapReduce):
  00:00 — 01:00: collect 1 hour of click events → file
  01:05: run Spark job over file → aggregated report
  Total latency: ~65 minutes

Stream (Flink, Kafka Streams):
  Click event arrives → process within 50ms → update dashboard counter
  Total latency: < 1 second
\`\`\`

**When to use each:**
- Batch: nightly reports, ML model training, backfills, complex multi-pass analytics
- Streaming: fraud detection, live dashboards, real-time recommendations, alerting

**Windowing in stream processing:**
- **Tumbling window:** fixed, non-overlapping intervals (e.g., count orders per 1-minute window)
- **Sliding window:** overlapping intervals (e.g., 5-minute window every 1 minute)
- **Session window:** group events by inactivity gap (e.g., user session ends after 30 min idle)

**Apache Flink** example:
\`\`\`java
stream
  .keyBy(event -> event.userId)
  .window(TumblingEventTimeWindows.of(Time.minutes(1)))
  .aggregate(new CountAggregator())
  .addSink(new KafkaSink("output-topic"));
\`\`\`

**Lambda architecture:** run both batch and streaming, merge results. **Kappa architecture:** streaming only, re-process historical data by replaying from Kafka.`,
      difficulty: 3,
      tags: 'streaming,batch,kafka,flink,real-time',
    },
    {
      title: 'What is a quorum in distributed systems?',
      answer: `A quorum is the minimum number of nodes that must agree for an operation to succeed. Quorums prevent split-brain scenarios where two parts of a partitioned cluster both accept writes, diverging the data.

**Formula:** \`W + R > N\`
- N = total replicas
- W = nodes that must acknowledge a write
- R = nodes that must respond to a read
- If W + R > N, at least one node in any read quorum overlaps with every write quorum — guaranteeing you read the latest write

\`\`\`
N=3 replicas, W=2, R=2:
  Write quorum: must write to 2 of 3 nodes
  Read quorum:  must read from 2 of 3 nodes
  Overlap: at least 1 node is in both → always returns latest data ✓

N=5 replicas (Raft):
  Majority quorum = 3 of 5
  Tolerates 2 node failures
\`\`\`

**Tunable consistency (Cassandra):**
- \`W=1, R=1\`: fast but eventually consistent (no quorum overlap guarantee)
- \`W=QUORUM, R=QUORUM\`: strong consistency, tolerates minority failures
- \`W=ALL, R=1\`: maximum durability, any single node can read latest

**Quorum in Raft/Paxos:** leader only commits a log entry after receiving acknowledgment from a majority of nodes. This ensures any future leader will have the latest committed entries.

**Odd numbers of nodes:** 3 nodes tolerates 1 failure, 5 nodes tolerates 2. Even numbers are rarely used because they don't improve fault tolerance (4 nodes still only tolerates 1 failure like 3 nodes).`,
      difficulty: 3,
      tags: 'quorum,distributed-systems,consistency,raft,cassandra',
    },
    {
      title: 'How do you design a job scheduler for distributed systems?',
      answer: `A distributed job scheduler runs tasks on a defined schedule (cron-like) across a cluster, ensuring tasks run exactly once even across multiple scheduler instances.

**Requirements:** run jobs on a schedule, don't double-run, handle failures with retry, track job history, scale to millions of jobs.

**Core components:**
\`\`\`
Scheduler Cluster (3 nodes, one leader via Raft/ZooKeeper)
  → Leader polls jobs due in next 30s from DB
  → Acquires distributed lock per job (Redis SETNX with TTL)
  → Dispatches to Worker Queue (Kafka/SQS)
  → Workers pull and execute tasks
  → Worker reports completion → DB updated
\`\`\`

**Preventing double-execution (the hard part):**
\`\`\`
-- Atomic claim: only one scheduler claims the job
UPDATE jobs
SET status = 'running', locked_by = ?, locked_at = NOW()
WHERE id = ? AND status = 'scheduled' AND next_run_at <= NOW();
-- If 0 rows updated → another scheduler already claimed it
\`\`\`

**Job schema:**
\`\`\`sql
jobs(id, name, cron_expr, last_run_at, next_run_at, status, retry_count, max_retries)
job_runs(id, job_id, status, started_at, finished_at, error_message)
\`\`\`

**Failure handling:** worker timeout → job reverts to scheduled, retry after backoff. After max retries → dead-letter.

**Real systems:** Kubernetes CronJobs, Quartz Scheduler (Java), Sidekiq Enterprise, Airflow for DAG-based workflows, AWS EventBridge Scheduler.`,
      difficulty: 3,
      tags: 'job-scheduler,distributed-systems,cron,idempotency',
    },
    {
      title: 'What is the difference between push and pull architectures in distributed systems?',
      answer: `**Push:** a producer actively sends data to consumers as it's generated. The producer controls the timing.

**Pull:** consumers request data from a source when they're ready to process it. The consumer controls the timing.

\`\`\`
Push (e.g., webhooks, server-sent events):
  Server → POST /webhook → Consumer
  + Low latency — data delivered immediately
  - Consumer must always be available
  - Producer overwhelm if consumer is slow (no backpressure)

Pull (e.g., Kafka consumers, RSS feeds):
  Consumer → GET /messages → Server
  + Consumer processes at its own pace (backpressure handled naturally)
  + Consumer can replay old messages
  - Higher latency — depends on polling interval
\`\`\`

**Kafka is pull-based:** consumers poll the broker for new messages. This means:
- A slow consumer just falls behind (offset lag) — doesn't affect the broker
- Consumer can pause and resume without losing messages
- Multiple consumer groups can read the same data at different speeds

**Webhooks (push):** great for immediate notifications to third parties. Problem: if the receiver is down, you must implement retry logic and an outbox pattern on the sender side.

**Long polling:** client sends a request; server holds it until data is available, then responds. Client immediately re-polls. Approximates push over HTTP without WebSockets.

**Choice:** use push when you need real-time delivery and can guarantee consumer availability; use pull when you need backpressure, replay, or have consumers with variable processing speeds.`,
      difficulty: 2,
      tags: 'push,pull,kafka,webhooks,architecture',
    },
    {
      title: 'What is a distributed lock and how do you implement one?',
      answer: `A distributed lock (also called a mutex) prevents multiple nodes in a distributed system from executing a critical section simultaneously — for example, scheduling a job, purchasing the last item in stock, or sending a notification exactly once.

**Redis SETNX pattern:**
\`\`\`js
async function acquireLock(lockKey, ttlMs, ownerId) {
  // SET key value NX PX ttl — atomic: only sets if key doesn't exist
  const result = await redis.set(lockKey, ownerId, 'NX', 'PX', ttlMs);
  return result === 'OK'; // true = lock acquired
}

async function releaseLock(lockKey, ownerId) {
  // Lua script: only release if we own the lock (atomic)
  const script = \`
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else return 0 end\`;
  await redis.eval(script, 1, lockKey, ownerId);
}

// Usage
const lockId = uuid();
if (await acquireLock('job:send-report', 30000, lockId)) {
  try { await sendReport(); }
  finally { await releaseLock('job:send-report', lockId); }
}
\`\`\`

**TTL prevents deadlock:** if the process crashes while holding the lock, it auto-expires after TTL.

**Redlock (multi-node):** acquire lock on N/2+1 Redis nodes for safety against single-node failure. Controversial — Martin Kleppmann argued it has edge cases; prefer Zookeeper or etcd for critical locks.

**Key pitfalls:** if process pauses (GC, swap) past the TTL and another process acquires the lock, both think they hold it. Use fencing tokens (monotonically increasing) to detect this.`,
      difficulty: 3,
      tags: 'distributed-lock,redis,concurrency,mutex',
    },
    {
      title: 'How does HTTP/2 improve on HTTP/1.1?',
      answer: `HTTP/2 addresses the main performance limitations of HTTP/1.1: head-of-line blocking, verbose headers, and inability to push resources proactively.

**Problems in HTTP/1.1:**
- Browsers open 6 parallel TCP connections per domain to work around sequential request limitations
- Headers are uncompressed plaintext — repeated on every request (Cookies, User-Agent)
- No server push — server can't send resources the browser hasn't asked for yet

**HTTP/2 improvements:**

**Multiplexing:** multiple requests and responses interleaved over a single TCP connection.
\`\`\`
HTTP/1.1: connection 1: GET /app.js → response
           connection 2: GET /style.css → response  (new TCP connection)

HTTP/2:   stream 1: GET /app.js
          stream 3: GET /style.css         ← same connection, interleaved
          stream 5: GET /logo.png
          → All responses arrive without blocking each other
\`\`\`

**HPACK header compression:** compress HTTP headers using a shared dynamic table. Repeated headers (Cookie, Authorization) are sent as a small index reference.

**Server push:** server can proactively send \`/style.css\` and \`/app.js\` alongside the HTML response, before the browser parses the HTML and requests them.

**Binary framing:** requests and responses are binary frames, not text. More efficient to parse, less error-prone.

**HTTP/3 (QUIC):** replaces TCP with UDP-based QUIC. Eliminates TCP-level head-of-line blocking — a dropped UDP packet only blocks its stream, not all streams.`,
      difficulty: 2,
      tags: 'http2,http3,networking,performance,web',
    },
    {
      title: 'What is a shard key and what makes a good one?',
      answer: `A shard key is the column (or set of columns) used to determine which shard a row lives on. The choice of shard key is one of the most critical design decisions in a sharded database — a bad key is nearly impossible to change later without re-sharding all data.

**What makes a good shard key:**
1. **High cardinality:** many distinct values → even distribution across shards. A boolean column is a terrible shard key.
2. **Avoids hot shards:** if one value gets 90% of writes (e.g., a trending hashtag), that shard becomes a bottleneck.
3. **Query locality:** if most queries filter by the shard key, they hit one shard. Cross-shard queries are expensive (scatter-gather).
4. **Monotonically increasing keys are bad:** \`user_id auto-increment\` means new users always go to the last shard — sequential writes, uneven load.

**Common shard key strategies:**
\`\`\`
By userId (random hash):
  shard = murmur3(userId) % numShards
  → Even distribution, but range queries across users hit all shards

By region:
  shard = "us-east" | "eu-west" | "asia"
  → Co-locates data with users for latency, but skewed if regions unequal

By date (bad for writes):
  shard = year-month
  → Hot-spots: current month shard gets all writes
\`\`\`

**Compound shard key:** \`(tenantId, userId)\` — all data for a tenant on the same shard (good for tenant-isolated queries), cardinality from userId prevents hot shards.`,
      difficulty: 3,
      tags: 'sharding,shard-key,database,design',
    },
    {
      title: 'What is a bulkhead pattern in microservices?',
      answer: `The bulkhead pattern isolates resources (thread pools, connection pools) between services so that a failure or overload in one service doesn't exhaust shared resources and bring down the entire system. Named after ship bulkheads that prevent flooding one compartment from sinking the whole vessel.

**Problem without bulkheads:**
\`\`\`
All service calls share one thread pool of 200 threads
PaymentService starts timing out → threads pile up waiting
Thread pool exhausted → UserService, OrderService also start failing
One slow dependency brings down the whole application
\`\`\`

**With bulkheads (separate thread pools):**
\`\`\`java
// Resilience4j BulkheadConfig
Bulkhead paymentBulkhead = Bulkhead.of("payment",
  BulkheadConfig.custom()
    .maxConcurrentCalls(20)  // max 20 threads for payment calls
    .maxWaitDuration(Duration.ofMillis(100))
    .build());

Bulkhead userBulkhead = Bulkhead.of("user",
  BulkheadConfig.custom()
    .maxConcurrentCalls(50)
    .build());
\`\`\`

**If PaymentService is slow:** only 20 threads blocked → UserService still has its 50 threads available → rest of app continues.

**Types:**
- **Thread pool isolation:** separate thread pool per dependency (heavyweight but strong isolation)
- **Semaphore isolation:** limit concurrent calls using a counter (lightweight, same thread)

**Combined with circuit breaker:** bulkhead limits concurrency; circuit breaker stops calls entirely when failure threshold is reached. Use both together.`,
      difficulty: 3,
      tags: 'bulkhead,resilience,microservices,patterns,fault-tolerance',
    },
    {
      title: 'What is a hot spot and how do you mitigate it in a distributed database?',
      answer: `A hot spot is when a disproportionate amount of traffic (reads or writes) lands on a single node or partition, exhausting its resources while others sit idle.

**Common causes:**
- Sequential keys (auto-increment IDs, timestamps) → all writes go to the last partition
- Highly popular items (celebrity tweets, trending products) → one shard handles all reads
- Range-based sharding with uneven key distribution

**Mitigation strategies:**

**1. Random salt for write hot spots (sequential keys):**
\`\`\`js
// Instead of: INSERT ... key = userId
// Add a random prefix to distribute across shards
const saltedKey = \`\${Math.floor(Math.random() * 100)}#\${userId}\`;
// Reads must query all 100 buckets and merge — trade read cost for write balance
\`\`\`

**2. Consistent hashing with virtual nodes:** each physical node owns multiple virtual positions on the ring, reducing the chance that one node owns all the popular keys.

**3. Read hot spots — cache the hot items:**
\`\`\`
Celebrity profile fetched 100K/s → cache in Redis with short TTL
→ 99% of reads never reach the database
\`\`\`

**4. Adaptive replication (DynamoDB):** automatically create additional replicas for frequently accessed partitions. The popular items are served from more physical nodes.

**5. Write splitting:** if one item is written to constantly (like a counter), use a CRDTs or write to N shards and merge on read (Facebook's counter sharding for likes).`,
      difficulty: 3,
      tags: 'hot-spot,sharding,distributed-systems,performance,database',
    },
    {
      title: 'How would you design a video streaming platform like YouTube?',
      answer: `YouTube handles video upload, transcoding, storage, and delivery to hundreds of millions of concurrent viewers.

**Upload pipeline:**
\`\`\`
User uploads raw video → Object Store (S3 / GCS)
  → Transcoding Job Queue (Kafka)
  → Transcoding Workers (GPU/CPU): generate multiple resolutions
      144p, 360p, 720p, 1080p, 4K → separate files per resolution
  → Store segments in CDN-backed object store
  → Update DB: video ready for streaming
\`\`\`

**Adaptive Bitrate Streaming (HLS / MPEG-DASH):**
\`\`\`
Video is split into 2-10s segments per resolution:
  1080p/segment_000.ts, 1080p/segment_001.ts ...
  720p/segment_000.ts, 720p/segment_001.ts ...

Master playlist:
  #EXT-X-STREAM-INF:BANDWIDTH=5000000
  1080p/playlist.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=2000000
  720p/playlist.m3u8

Player switches quality automatically based on current bandwidth
\`\`\`

**CDN delivery:** video segments served from edge PoPs worldwide. Popular videos cached at edge; cold videos pulled from origin on first request.

**Schema:**
\`\`\`sql
videos(id, uploader_id, title, duration, status, created_at)
video_renditions(id, video_id, resolution, bitrate, storage_url)
\`\`\`

**Recommendation:** user watch history → collaborative filtering + deep learning model → candidate generation → ranking. Batch-computed nightly, served from feature store.

**Scale numbers:** 500 hours of video uploaded per minute → transcoding is CPU-bound. Use spot/preemptible instances for transcoding workers.`,
      difficulty: 3,
      tags: 'video-streaming,youtube,transcoding,cdn,hls',
    },
    {
      title: 'What are the differences between TCP and UDP?',
      answer: `TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) are the two core transport-layer protocols. They differ fundamentally in reliability vs performance.

**TCP:**
- **Connection-oriented:** requires 3-way handshake (SYN, SYN-ACK, ACK) before data
- **Reliable:** guarantees delivery — acknowledgments, retransmission of lost packets
- **Ordered:** packets reassembled in sequence regardless of network arrival order
- **Flow control:** sender slows down if receiver's buffer is full
- **Congestion control:** slows down when network is congested

**UDP:**
- **Connectionless:** no handshake, no acknowledgment
- **Unreliable:** packets may be lost, duplicated, or reordered — no retransmission
- **No ordering guarantee:** application handles out-of-order packets if needed
- **No flow/congestion control**
- **Header is 8 bytes** vs TCP's 20+ bytes

\`\`\`
TCP: [SYN] → [SYN-ACK] → [ACK] → data (reliable, ordered)
     3 round trips before first byte of data

UDP: → data (fire and forget, no setup)
\`\`\`

**When to use TCP:** web (HTTP), email, file transfer — any use case where correctness > speed.

**When to use UDP:** DNS lookups (fast, small payloads), video streaming (slight loss tolerable), online gaming (stale data is worse than no data), VoIP, QUIC (implements reliability at application layer on top of UDP).`,
      difficulty: 1,
      tags: 'tcp,udp,networking,protocols',
    },
    {
      title: 'What is an outbox pattern and how does it solve dual-write problems?',
      answer: `The dual-write problem: when you write to a database AND send a message to a queue, either can fail independently, leaving the system in an inconsistent state.

**Problem:**
\`\`\`
BEGIN;
  INSERT INTO orders (id, status) VALUES (1, 'created');
COMMIT; ← DB write succeeds

kafka.publish("order.created", { id: 1 }); ← app crashes here
→ Order is in DB but event never sent → downstream services never notified
\`\`\`

**Outbox pattern solution:**
\`\`\`
BEGIN;
  INSERT INTO orders (id, status) VALUES (1, 'created');
  INSERT INTO outbox (event_type, payload, created_at)
    VALUES ('order.created', '{"id":1}', NOW()); ← same transaction
COMMIT;
— Both writes are atomic: either both succeed or both fail
\`\`\`

**Outbox publisher (separate process):**
\`\`\`
Poll outbox table for unprocessed rows:
  SELECT * FROM outbox WHERE processed = false ORDER BY created_at LIMIT 100;

For each row:
  kafka.publish(row.event_type, row.payload);
  UPDATE outbox SET processed = true WHERE id = row.id;
\`\`\`

**CDC-based outbox:** instead of polling, use Debezium to read the outbox table from the database replication log — zero polling overhead, sub-second latency.

**Idempotency required:** the publisher may re-send if it crashes after publishing but before marking as processed. Consumers must deduplicate using the event ID.`,
      difficulty: 3,
      tags: 'outbox-pattern,distributed-systems,dual-write,kafka,reliability',
    },
    {
      title: 'What is a multi-tenant architecture and how do you design for tenant isolation?',
      answer: `Multi-tenancy means a single application instance serves multiple customers (tenants) while keeping their data and configuration isolated.

**Three isolation models:**

**1. Silo (separate DB per tenant):**
\`\`\`
Tenant A → dedicated DB A
Tenant B → dedicated DB B
\`\`\`
- Maximum isolation, easy compliance (GDPR delete = drop DB)
- Expensive: 1000 tenants = 1000 databases
- Good for large enterprise customers

**2. Pool (shared DB, tenant_id column):**
\`\`\`sql
SELECT * FROM orders WHERE tenant_id = ? AND id = ?
-- Every query MUST include tenant_id — row-level isolation
\`\`\`
- Cost-efficient, easy to scale
- Risk: missing tenant_id filter leaks data
- Use Row-Level Security (PostgreSQL RLS) to enforce at DB level

**3. Bridge (shared DB, separate schema per tenant):**
\`\`\`
PostgreSQL schemas: tenant_a.orders, tenant_b.orders (same tables, separate namespaces)
\`\`\`
- Good middle ground: isolation without separate DBs

**Application-level isolation (all models):**
\`\`\`typescript
// Middleware: extract tenant from subdomain / JWT
app.use((req, res, next) => {
  req.tenantId = extractTenant(req.headers.host);
  next();
});

// Repository: always scope queries
async getOrders(tenantId: string) {
  return db.query('SELECT * FROM orders WHERE tenant_id = $1', [tenantId]);
}
\`\`\`

**Noisy neighbor problem:** one tenant's heavy usage impacts others. Use per-tenant rate limits, separate worker queues for heavy tenants, and monitoring per tenant.`,
      difficulty: 3,
      tags: 'multi-tenancy,saas,isolation,database,architecture',
    },
    {
      title: 'What is eventual consistency and what are the consistency models above it?',
      answer: `The consistency spectrum defines how up-to-date reads are after a write in a distributed system.

**From weakest to strongest:**

**1. Eventual consistency (weakest):** replicas will converge, but a read immediately after a write may return the old value. No timing guarantee.

**2. Monotonic read consistency:** once you read a value, you'll never read an older value. Reads don't go backwards.

**3. Read-your-own-writes:** after you write a value, your subsequent reads always see that write (even if others see the old value for a while).

**4. Causal consistency:** operations that are causally related are seen in the same order by all nodes. If A causes B, every node sees A before B.
\`\`\`
Alice posts: "I'll be at the park"
Bob replies: "See you there!"
— Everyone sees Alice's post before Bob's reply (causal order)
\`\`\`

**5. Sequential consistency:** all nodes see all operations in the same order, but the order need not match wall-clock time.

**6. Linearizability (strongest):** reads and writes appear to happen atomically at some point between their start and end time. The system behaves as a single-machine shared memory. Used by Zookeeper, etcd, FoundationDB.

\`\`\`
Strength:  Eventual < Monotonic < RYOW < Causal < Sequential < Linearizable
Latency:   Low                                                 High
\`\`\`

**Choose based on need:** social feeds tolerate eventual; banking requires linearizability; collaborative editing needs causal.`,
      difficulty: 3,
      tags: 'consistency-models,distributed-systems,linearizability,causal',
    },
    {
      title: 'How does a search engine index and rank web pages?',
      answer: `A web search engine crawls the web, indexes content, and ranks results by relevance.

**Crawling:**
\`\`\`
Seed URLs → URL Frontier (priority queue)
  → Fetcher (respect robots.txt, crawl-delay)
  → Parse HTML: extract text, extract outbound links
  → New URLs → deduplicate → add to URL Frontier
  → Extracted text → Indexer
\`\`\`

**Indexing (inverted index):**
\`\`\`
Tokenize: "The quick brown fox" → ["quick", "brown", "fox"]
Normalize: lowercase, stem ("running" → "run"), remove stop words

Inverted index:
  "quick" → [doc1:pos5, doc42:pos2, ...]
  "brown" → [doc1:pos6, doc99:pos1, ...]
\`\`\`

**Ranking — TF-IDF:**
\`\`\`
TF  (term frequency): how often the term appears in the document
IDF (inverse document frequency): log(N / docs containing term)
  — rare terms are more discriminating

score(doc, query) = Σ TF(term, doc) × IDF(term, corpus)
\`\`\`

**PageRank (link analysis):** pages linked to by many authoritative pages rank higher. Still a component of Google's ranking, alongside hundreds of other signals.

**Modern ranking:** transformer-based neural re-rankers (BERT, MUM) for semantic understanding. Two-stage: fast retrieval from inverted index → expensive neural re-ranking of top-K candidates.

**Scale:** Google processes ~8.5B searches/day. Index is distributed across thousands of shards; query is scatter-gathered in < 200ms, results merged and re-ranked.`,
      difficulty: 3,
      tags: 'search-engine,indexing,ranking,pagerank,information-retrieval',
    },
    {
      title: 'What is database connection multiplexing and how does PgBouncer work?',
      answer: `PostgreSQL creates a new OS process (or heavy thread) for each client connection, consuming ~5–10MB RAM per connection. At 500 connections, that's 2.5–5GB RAM just for connection overhead — before executing any queries.

**PgBouncer** is a lightweight connection pooler that sits between applications and PostgreSQL, maintaining a small pool of real PostgreSQL connections and multiplexing many application connections through them.

\`\`\`
Without PgBouncer:
  500 app servers × 20 connections = 10,000 PostgreSQL connections
  PostgreSQL crashes under the load

With PgBouncer:
  500 app servers × 20 connections → PgBouncer pool
  PgBouncer → 50 real PostgreSQL connections
  PostgreSQL handles 50 connections comfortably
\`\`\`

**How it works:**
1. Application connects to PgBouncer (cheap — just a socket)
2. App sends a query
3. PgBouncer borrows a PostgreSQL connection from the pool
4. Forwards query, returns response to app
5. Returns connection to pool (transaction mode) or keeps it (session mode)

**Pool modes:**
\`\`\`ini
; pgbouncer.ini
pool_mode = transaction    ; best multiplexing — connection returned after each txn
default_pool_size = 50     ; real connections to PostgreSQL
max_client_conn = 5000     ; application connections to PgBouncer
\`\`\`

**Limitation:** session-level features (prepared statements, advisory locks, SET LOCAL) don't work well in transaction mode — PgBouncer may return a different connection for the next statement.`,
      difficulty: 2,
      tags: 'pgbouncer,connection-pooling,postgresql,performance',
    },
    {
      title: 'What is a write amplification problem in LSM trees?',
      answer: `Write amplification is when writing a small amount of data causes much more data to be written to disk due to the storage engine's internal maintenance operations.

**LSM (Log-Structured Merge) tree write path:**
\`\`\`
1. Write goes to WAL (durability) + MemTable (in-memory sorted buffer)
2. MemTable full → flush to disk as SSTable (immutable sorted file)
3. Many small SSTables → background compaction merges them into larger sorted files
4. Compaction reads all input SSTables and writes merged output → amplification!
\`\`\`

**Write amplification factor:** if a 1MB write eventually causes 10MB of disk writes due to compaction, the amplification is 10×.

**Compaction strategies:**

**Size-tiered compaction (Cassandra default):**
- Merge SSTables of similar size
- High write amplification at large tiers, large space overhead (old + new exist simultaneously)
- Good for write-heavy workloads

**Leveled compaction (RocksDB, LevelDB default):**
- Organize files into levels of increasing size
- Each level is 10× larger than the previous
- Lower read amplification (fewer files to check), higher write amplification
- Better for read-heavy workloads

**FIFO compaction:** for time-series data — just delete oldest files when size limit reached.

**Trade-offs in LSM trees:**
- **Write amplification** vs **Read amplification** vs **Space amplification** — you can tune two at the expense of the third. RocksDB exposes these as tunable parameters.`,
      difficulty: 3,
      tags: 'lsm-tree,write-amplification,rocksdb,database,storage',
    },
    {
      title: 'How do you handle schema migrations in a production database safely?',
      answer: `Schema migrations in production must not lock tables, cause downtime, or break running application instances during a rolling deployment where old and new code coexist.

**Dangerous operations (lock the table, block queries):**
- Adding a NOT NULL column without a default (rewrites entire table)
- Adding a unique constraint (full table scan + lock)
- Renaming a column (old code breaks immediately)

**Safe migration patterns:**

**Adding a column (always safe in PostgreSQL/MySQL):**
\`\`\`sql
-- Safe: adds column, no rewrite
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
-- Risky: adding NOT NULL with no default rewrites all rows
ALTER TABLE users ADD COLUMN country VARCHAR(3) NOT NULL DEFAULT 'US'; -- OK in modern PG
\`\`\`

**Rename a column safely (expand-contract pattern):**
\`\`\`
Step 1: Add new column 'email_address', keep old 'email'
Step 2: Deploy code that writes to both 'email' AND 'email_address'
Step 3: Backfill: UPDATE users SET email_address = email WHERE email_address IS NULL
Step 4: Deploy code that reads 'email_address', still writes both
Step 5: Deploy code that only uses 'email_address'
Step 6: Drop 'email' column
\`\`\`

**Adding an index without locking (PostgreSQL):**
\`\`\`sql
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
-- CONCURRENTLY builds index without holding a write lock (takes longer)
\`\`\`

**Tools:** Flyway, Liquibase (version-controlled migrations), gh-ost (GitHub's online schema change for MySQL).`,
      difficulty: 2,
      tags: 'database,migrations,zero-downtime,postgresql,schema',
    },
    {
      title: 'What is chaos engineering and how do you implement it?',
      answer: `Chaos engineering is the practice of deliberately injecting failures into a production (or production-like) system to test resilience and discover weaknesses before they cause real outages.

**Principles (from Netflix's "Principles of Chaos Engineering"):**
1. Define a "steady state" — measurable normal behaviour (error rate, p99 latency)
2. Hypothesize that steady state holds during the experiment
3. Introduce real-world variables: server crashes, network latency, disk full, service timeouts
4. Look for differences between control and experiment groups
5. Minimize blast radius — start with small experiments

**Netflix Chaos Monkey:** randomly terminates EC2 instances in production. Forces teams to build services that tolerate instance failure.

**Types of chaos experiments:**
\`\`\`
Infrastructure:  kill a server, drain an AZ, corrupt a disk
Network:         inject 500ms latency, introduce 5% packet loss, partition services
Application:     return errors for 10% of requests, fill database connection pool
Dependency:      make a third-party service time out or return 500s
Resource:        fill CPU to 95%, exhaust memory, drain connection pool
\`\`\`

**Tools:**
- **Chaos Monkey / Simian Army:** Netflix open-source, AWS-native
- **Gremlin:** managed chaos-as-a-service, fine-grained controls
- **LitmusChaos:** Kubernetes-native chaos experiments via CRDs
- **AWS Fault Injection Simulator (FIS):** managed AWS chaos

**When to run:** during business hours when engineers are available to respond. Not at 2am. Start in staging; graduate to production only after consistent success.`,
      difficulty: 3,
      tags: 'chaos-engineering,resilience,netflix,testing',
    },
    {
      title: 'What is the N+1 query problem and how do you solve it?',
      answer: `The N+1 query problem occurs when an application executes 1 query to fetch N records, then N additional queries — one per record — to fetch related data, resulting in N+1 total database round trips.

**Example (ORM-triggered):**
\`\`\`js
// 1 query: get all posts
const posts = await Post.findAll(); // SELECT * FROM posts → 100 rows

// 100 queries: fetch author for each post
for (const post of posts) {
  const author = await User.findById(post.authorId); // N separate SELECTs
  console.log(post.title, author.name);
}
// Total: 101 queries instead of 1
\`\`\`

**Solutions:**

**1. Eager loading (JOIN):**
\`\`\`sql
SELECT posts.*, users.name AS author_name
FROM posts
JOIN users ON posts.author_id = users.id;
-- 1 query instead of 101
\`\`\`

**2. Batched loading (DataLoader pattern):**
\`\`\`js
// Collect all authorIds, fetch in one IN query
const authorIds = posts.map(p => p.authorId);
const authors = await User.findAll({ where: { id: authorIds } });
// SELECT * FROM users WHERE id IN (1, 2, 3, ...)
const authorMap = Object.fromEntries(authors.map(u => [u.id, u]));
posts.forEach(p => console.log(p.title, authorMap[p.authorId].name));
\`\`\`

**3. GraphQL DataLoader:** automatically batches and deduplicates DB calls within a single GraphQL request, even across nested resolvers.

**Detection:** use query logging (\`EXPLAIN ANALYZE\`, ORMs' built-in logging) to spot repeated queries with different IDs. The pattern is unmistakable.`,
      difficulty: 2,
      tags: 'n-plus-one,database,orm,performance,graphql',
    },
    {
      title: 'What is a Feature Flag system and how would you design one?',
      answer: `A feature flag (feature toggle) system lets you enable or disable features at runtime without deploying new code. Used for: gradual rollouts, A/B testing, kill switches, and dark launches.

**Types:**
- **Release toggle:** deploy code dark, enable when ready
- **Experiment toggle:** A/B test — show feature to X% of users
- **Ops toggle:** kill switch for degraded functionality (disable heavy feature during traffic spike)
- **Permission toggle:** enable for specific users or plans

**Architecture:**
\`\`\`
Config Store (Redis / DB) → Flag Service → SDK (in-app library)
                                         → Admin UI (toggle flags)

Flag rule example:
{
  "name": "new-checkout-flow",
  "enabled": true,
  "rules": [
    { "condition": "userId IN [1,2,3]", "value": true },  // internal users
    { "condition": "rollout_percentage <= 10", "value": true }, // 10% of users
    { "default": false }
  ]
}
\`\`\`

**SDK (application side):**
\`\`\`typescript
// Poll flag config every 30s, cache locally
if (featureFlags.isEnabled('new-checkout-flow', { userId })) {
  return renderNewCheckout();
} else {
  return renderOldCheckout();
}
\`\`\`

**Stale cache handling:** SDK caches flags to avoid a network call on every request. If the flag service is down, use the last cached value.

**Flag cleanup:** flags are technical debt. Each flag should have an owner and expiry date. Delete release toggles after full rollout. Tools: LaunchDarkly, GrowthBook, Unleash (open-source), or a simple Redis + DB implementation.`,
      difficulty: 2,
      tags: 'feature-flags,experimentation,devops,ab-testing',
    },
    {
      title: 'What is the difference between availability and reliability?',
      answer: `**Availability:** the percentage of time a system is operational and able to respond to requests.
\`\`\`
Availability = uptime / (uptime + downtime)
99.9% ("three nines")  = 8.7 hours downtime/year
99.99% ("four nines")  = 52 minutes downtime/year
99.999% ("five nines") = 5 minutes downtime/year
\`\`\`

**Reliability:** the probability that the system performs its intended function correctly for a given period. A system can be available (responding) but unreliable (returning wrong data).

\`\`\`
System A: responds 100% of the time, but 0.1% of responses are incorrect
  → Highly available, low reliability

System B: sometimes times out (99.95% available), but correct when up
  → Lower availability, higher reliability
\`\`\`

**MTTR & MTBF:**
- **MTBF (Mean Time Between Failures):** average time between incidents — higher is better
- **MTTR (Mean Time To Recovery):** average time to recover from an incident — lower is better
- Availability ≈ MTBF / (MTBF + MTTR)

**Improving availability:**
- Redundancy (multiple AZs, replicas)
- Health checks + automatic failover
- Load balancing to exclude unhealthy nodes
- Circuit breakers to fail fast rather than time out slowly

**Improving reliability:**
- Thorough testing (unit, integration, chaos)
- Input validation and idempotency
- Checksums for data integrity
- Read-after-write consistency where correctness is critical`,
      difficulty: 1,
      tags: 'availability,reliability,sla,slo,uptime',
    },
    {
      title: 'How would you design a distributed counter at massive scale?',
      answer: `A distributed counter must handle millions of increments per second (social media likes, page views, ad impressions) without becoming a bottleneck.

**Naive approach — single row:**
\`\`\`sql
UPDATE counters SET value = value + 1 WHERE id = 1;
-- Serialized writes → max ~5K/s on a single DB row
\`\`\`

**Approach 1 — Sharded counters:**
\`\`\`
Shard the counter across N rows (e.g., N=100):
  shard = random(0, 99)
  UPDATE counters SET value = value + 1 WHERE id = 1 AND shard = ?

Read (sum all shards):
  SELECT SUM(value) FROM counters WHERE id = 1
\`\`\`
100× write throughput, but reads now sum 100 rows.

**Approach 2 — Redis INCR:**
\`\`\`
INCR pageviews:article:42  → atomic, ~100K ops/sec per Redis node
\`\`\`
Periodically flush Redis counts to DB in batch. Risk: data loss between flushes.

**Approach 3 — Approximate counters (HyperLogLog):**
\`\`\`
PFADD unique_visitors:today userId
PFCOUNT unique_visitors:today  → ~1% error, 12KB memory regardless of count
\`\`\`
For unique counts (unique visitors, distinct users), HyperLogLog gives a 99% accurate estimate using minimal memory.

**Approach 4 — Kafka + batch aggregation:**
Emit an event per increment to Kafka. A stream processor (Flink) aggregates and writes results to DB every second. Very high throughput, latency ~1s.

**Choice:** Redis INCR for real-time exact counts under ~1M/s. Kafka + streaming for higher throughput or audit trail needs.`,
      difficulty: 3,
      tags: 'distributed-counter,redis,sharding,hyperloglog,performance',
    },
    {
      title: 'What is a service level objective (SLO) and how do you set one?',
      answer: `An SLO (Service Level Objective) is a target level of service quality, expressed as a measurable threshold over a time window. It's the internal contract your team makes about system reliability.

**SLI → SLO → SLA:**
- **SLI (Service Level Indicator):** the metric you measure (e.g., request success rate)
- **SLO:** the target for that metric (e.g., 99.9% of requests succeed over a 30-day window)
- **SLA (Service Level Agreement):** the external contract with consequences if SLO is missed (e.g., customer gets a refund)

**Common SLIs:**
\`\`\`
Availability:  successful_requests / total_requests > 99.9%
Latency:       p99 response time < 500ms for 99.5% of requests
Error rate:    HTTP 5xx responses < 0.1% of requests
Throughput:    process > 1000 events/second
Data freshness: data < 5 minutes stale for 99% of reads
\`\`\`

**Error budget:** the inverse of the SLO — how much downtime/errors you're allowed.
\`\`\`
SLO: 99.9% availability → Error budget: 0.1% = 43.8 minutes/month
If you've used 30 minutes this month, you have 13 minutes remaining.
When error budget is exhausted → freeze new releases, focus on reliability.
\`\`\`

**Setting SLOs:**
1. Measure current baseline — don't set an SLO you already violate
2. Understand user pain threshold — what degradation do users actually notice?
3. Start achievable — 99% is more honest than 99.99% you'll miss
4. Review quarterly — tighten as reliability improves

**Alerting on error budget burn rate:** alert when you're burning budget 14× faster than expected (will exhaust in 2 hours).`,
      difficulty: 2,
      tags: 'slo,sla,sli,reliability,error-budget,monitoring',
    },
    {
      title: 'What is a DAG (Directed Acyclic Graph) in the context of data pipelines?',
      answer: `A DAG (Directed Acyclic Graph) is a graph where edges have direction and there are no cycles. In data engineering, a DAG represents a workflow where nodes are tasks and edges define dependencies between them.

\`\`\`
         extract_users ──┐
                          ├──→ transform_combined ──→ load_warehouse
         extract_orders ──┘
              ↑
         extract_products ──→ transform_products ──→ load_products
\`\`\`

**Why acyclic:** if tasks could form a cycle (A depends on B depends on A), the pipeline would deadlock. The DAG structure guarantees a topological execution order.

**Apache Airflow DAG (Python):**
\`\`\`python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

with DAG('etl_pipeline', start_date=datetime(2024, 1, 1), schedule='@daily') as dag:
    extract = PythonOperator(task_id='extract', python_callable=extract_fn)
    transform = PythonOperator(task_id='transform', python_callable=transform_fn)
    load = PythonOperator(task_id='load', python_callable=load_fn)

    extract >> transform >> load  # define dependency order
\`\`\`

**Key concepts:**
- **Task instances:** each execution of a DAG at a schedule interval
- **Backfill:** re-run historical DAG runs (e.g., after fixing a bug)
- **Retries:** failed tasks retry with configurable backoff
- **SLA miss alerts:** notify if a task doesn't complete within expected time

**Other DAG-based tools:** dbt (SQL transformation DAGs), Prefect, Dagster, Luigi. Git's commit history is also a DAG — commits point to parent commits, never forming cycles.`,
      difficulty: 2,
      tags: 'dag,data-pipeline,airflow,workflow,orchestration',
    },
    {
      title: 'What is the thundering herd problem and how do you prevent it?',
      answer: `The thundering herd problem occurs when many processes simultaneously wake up or make requests to a shared resource — overwhelming it. Common triggers: a cache key expires, a server recovers from downtime, a scheduled job fires.

**Cache stampede (most common form):**
\`\`\`
Scenario:
  1. 10,000 users per second hit the same cached API response
  2. Cache TTL expires
  3. All 10,000 concurrent requests simultaneously find a cache miss
  4. All 10,000 hit the database simultaneously → database overwhelmed
\`\`\`

**Prevention strategies:**

**1. Mutex / request coalescing:**
\`\`\`js
const inFlight = new Map();
async function getCached(key) {
  if (inFlight.has(key)) return inFlight.get(key); // join existing fetch
  const promise = fetchAndCache(key);
  inFlight.set(key, promise);
  promise.finally(() => inFlight.delete(key));
  return promise;
}
// Only 1 DB query fires; all 10K requests await the same promise
\`\`\`

**2. Jittered TTL:** randomize cache expiry times so not all entries expire simultaneously.
\`\`\`js
const ttl = BASE_TTL + Math.random() * JITTER; // e.g., 3600 ± 300 seconds
\`\`\`

**3. Stale-while-revalidate:** serve stale content while refreshing asynchronously in the background — cache is never completely empty.

**4. Probabilistic early refresh (PER):** with small probability, refresh the cache slightly before it expires, so it's refreshed before the stampede.

**5. Pre-warming:** proactively populate the cache before it expires or before traffic arrives.`,
      difficulty: 3,
      tags: 'thundering-herd,cache-stampede,performance,caching',
    },
    {
      title: 'What is a shadow deployment and how does it reduce risk?',
      answer: `Shadow deployment sends a copy of live production traffic to a new ("shadow") version of a service running in parallel — without affecting users. The shadow version processes requests and you observe its behavior (latency, errors, output correctness) without real consequences.

\`\`\`
Production traffic:
  Client → Load Balancer → v1 (live, returns response to user)
                        → v2 (shadow, response discarded — user never sees it)

Both versions receive the same requests simultaneously
\`\`\`

**What to compare:**
- Response correctness: does v2 return the same output as v1?
- Latency: is v2 faster or slower?
- Error rate: does v2 crash on any production inputs?
- Resource usage: CPU/memory comparison under real load

**Implementation:**
\`\`\`nginx
# nginx mirror module
location /api/ {
    proxy_pass http://v1-service;
    mirror /api-shadow/;
    mirror_request_body on;
}
location /api-shadow/ {
    proxy_pass http://v2-service;
}
\`\`\`

**Differences from canary:** canary sends real traffic to the new version and real users see results. Shadow testing sends duplicate traffic — users only interact with the current stable version.

**Use cases:** validating ML model replacements (compare predicted outputs), testing database migration correctness, validating new service implementations before cutover.

**Caution:** shadow requests may cause duplicate side effects (emails sent twice, payments charged). Use shadow mode that stubs out mutating operations.`,
      difficulty: 3,
      tags: 'shadow-deployment,testing,deployment,traffic-mirroring',
    },
    {
      title: 'What is a sparse index and when do you use one?',
      answer: `A sparse index only indexes entries that exist in the indexed field — it skips documents or rows where the field is NULL or absent. A dense index indexes every row regardless.

**Dense index:**
\`\`\`
All 1,000,000 users → index entry for each → 1,000,000 index entries
\`\`\`

**Sparse index (MongoDB example):**
\`\`\`js
// Only index users who have set a phone number
db.users.createIndex({ phone: 1 }, { sparse: true });

// 1,000,000 users, but only 100,000 have phone → 100,000 index entries
// 10× smaller index, faster to build, less RAM needed
\`\`\`

**When to use sparse indexes:**
- The field is optional and only populated for a subset of documents
- You query only for documents where the field exists
- Memory is a concern and most documents lack the field

**Partial indexes (PostgreSQL — more powerful):**
\`\`\`sql
-- Only index active orders, not completed/cancelled
CREATE INDEX idx_orders_active ON orders(user_id, created_at)
WHERE status = 'active';

-- Much smaller index, perfect for queries filtering by status = 'active'
SELECT * FROM orders WHERE user_id = 42 AND status = 'active';
\`\`\`

**Covering index (dense, but includes extra columns):**
\`\`\`sql
CREATE INDEX idx_covering ON orders(user_id) INCLUDE (total, status);
-- Query can be satisfied entirely from the index — no table lookup needed
\`\`\`

Choose sparse/partial indexes when your access pattern consistently filters on the same condition — the smaller index fits in memory and queries run faster.`,
      difficulty: 2,
      tags: 'database,indexing,sparse-index,partial-index,performance',
    },
    {
      title: 'How does a distributed tracing system work?',
      answer: `Distributed tracing tracks a request as it flows through multiple services, showing which service called which, how long each took, and where errors occurred.

**Core concepts:**
- **Trace:** the full journey of one request from start to finish
- **Span:** one unit of work within a trace (e.g., a single service call, a DB query)
- **Trace ID:** shared across all spans of a request (propagated via HTTP headers)
- **Span ID:** unique to each span; parent span ID links spans into a tree

**Context propagation:**
\`\`\`
Client → GET /order/123
  HTTP headers: { X-Trace-Id: "abc", X-Span-Id: "001" }

API Gateway (span 001):
  → calls OrderService: headers { X-Trace-Id: "abc", X-Span-Id: "002", X-Parent-Span: "001" }

OrderService (span 002):
  → queries DB (span 003, parent: 002)
  → calls PaymentService (span 004, parent: 002)

PaymentService (span 004):
  → calls Stripe API (span 005, parent: 004)
\`\`\`

**Reconstructed trace view:**
\`\`\`
Trace abc123:
  [API Gateway       0ms–12ms  ]
    [OrderService    2ms–10ms  ]
      [DB query      2ms–4ms   ]
      [PaymentSvc    5ms–9ms   ] ← this is slow!
        [Stripe API  5ms–8ms   ]
\`\`\`

**OpenTelemetry (OTel):** vendor-neutral SDK for instrumenting services. Exporters send spans to Jaeger, Zipkin, Tempo, or Datadog.

**Sampling:** tracing every request at scale is expensive. Use head-based sampling (sample X% of all traces) or tail-based sampling (always keep traces with errors or high latency).`,
      difficulty: 2,
      tags: 'distributed-tracing,observability,opentelemetry,jaeger',
    },
    {
      title: 'What is a content hash and how is it used for cache busting?',
      answer: `A content hash is a fingerprint of a file's contents — the same content always produces the same hash; any change produces a completely different hash. It's used to give files immutable URLs, enabling aggressive browser caching.

**The problem:** you deploy a new \`app.js\` but users are stuck with the cached old version for hours (or until they hard-refresh).

**Solution — hashed filenames:**
\`\`\`bash
# Build tool generates:
app.js → app.3f4a9b2c.js   (SHA-256 of file contents, first 8 chars)
style.css → style.a1b2c3d4.css

# HTML references hashed filename:
<script src="/static/app.3f4a9b2c.js"></script>
\`\`\`

**Cache headers for hashed files:**
\`\`\`
Cache-Control: public, max-age=31536000, immutable
# Cache for 1 year — content never changes at this URL
# "immutable" tells browser: don't even check for updates
\`\`\`

**Cache busting flow:**
\`\`\`
Deploy new code:
  app.3f4a9b2c.js  → still cached everywhere (unchanged file, same hash)
  app.7e8f9a0b.js  → brand new URL → cache miss → browser fetches latest
  HTML (index.html): Cache-Control: no-cache (always check for updates)
\`\`\`

**ETags** work similarly for dynamic responses: server sends a hash of the response body as an ETag header. Browser sends \`If-None-Match: "hash"\` on re-request; server responds 304 Not Modified if unchanged — saves bandwidth.

Webpack, Vite, Rollup, and most modern build tools generate content-hashed filenames automatically.`,
      difficulty: 1,
      tags: 'caching,cache-busting,content-hash,performance,cdn',
    },
    {
      title: 'What is a read replica and when does it not help?',
      answer: `A read replica is a copy of the primary database that handles read-only queries. It reduces load on the primary and increases total read throughput.

**Setup:**
\`\`\`
Writes: App → Primary DB (read-write)
                  ↓ replication (async/sync)
Reads:  App → Replica 1 (read-only)
        App → Replica 2 (read-only)
        App → Replica 3 (read-only)
\`\`\`

**When read replicas help:**
- Your workload is 80%+ reads
- Reads are reporting queries or analytics that can tolerate slight staleness
- The primary CPU is saturated by read traffic

**When read replicas do NOT help:**

**1. Write-heavy workloads:** replicas don't absorb writes — the primary is still the bottleneck.

**2. Replication lag — freshness requirements:**
\`\`\`
User changes password → write to primary
User immediately logs in → read from replica (lagging 500ms)
→ Password not found on replica → "wrong password" error
\`\`\`
Fix: route reads that require freshness to the primary. Use session-based routing or read-your-writes consistency.

**3. Replication lag compounds under load:** when the primary is busy, the replica falls further behind.

**4. N+1 queries not fixed by replicas:** a query doing 1000 round trips is slow on both primary and replica.

**Alternatives when replicas aren't enough:** caching layer (Redis), read-optimized separate data store (Elasticsearch, Redshift), database sharding for write scaling.`,
      difficulty: 2,
      tags: 'read-replica,database,replication,scaling',
    },
    {
      title: 'What is a service mesh and what problem does it solve at scale?',
      answer: `A service mesh is a dedicated infrastructure layer for managing service-to-service communication in a microservices architecture. It abstracts networking concerns out of application code into a sidecar proxy.

**Problems at scale without a service mesh:**
\`\`\`
100 microservices, each needs:
  - Mutual TLS (mTLS) for encryption
  - Retry logic with backoff
  - Circuit breaking
  - Distributed tracing
  - Load balancing

→ Every service team implements this in their language/framework
→ Inconsistent behaviour, duplicate code, high maintenance cost
\`\`\`

**With a service mesh (Istio + Envoy):**
\`\`\`
Deploy Envoy sidecar alongside each service pod:
  ServiceA code → Envoy sidecar ─── network ─── Envoy sidecar → ServiceB code

Envoy handles:
  ✓ mTLS (zero-trust networking — all traffic encrypted + authenticated)
  ✓ Retries, timeouts, circuit breaking
  ✓ Load balancing (weighted, least request)
  ✓ Automatic trace span propagation
  ✓ Traffic splitting (canary: 5% to v2, 95% to v1)
\`\`\`

**Control plane (Istio):** push configuration to all Envoy sidecars centrally. Define traffic policies in YAML:
\`\`\`yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
spec:
  http:
  - route:
    - destination: { host: payment-service, subset: v1 }
      weight: 90
    - destination: { host: payment-service, subset: v2 }
      weight: 10
\`\`\`

**Cost:** ~50MB RAM + ~1ms latency per pod for the sidecar. Worth it at 50+ services; overkill for small deployments.`,
      difficulty: 3,
      tags: 'service-mesh,istio,envoy,microservices,networking',
    },
    {
      title: 'What are the trade-offs between microservices and a modular monolith?',
      answer: `**Microservices:** independent deployable services, each with its own process and datastore, communicating over the network.

**Modular monolith:** a single deployable unit divided into well-defined modules with clear boundaries — but no network calls between them, just in-process function calls.

\`\`\`
Microservices:                Modular Monolith:
  [OrderService]                [OrderModule]
       ↕ HTTP/gRPC                    ↕ interface call
  [PaymentService]              [PaymentModule]
       ↕ HTTP                         ↕
  [NotificationService]         [NotificationModule]

  3 deployments, 3 DBs          1 deployment, 1 DB
\`\`\`

**Where microservices win:**
- Independent scaling (scale just the checkout service during peak)
- Independent deployment (teams deploy without coordinating)
- Technology diversity (ML service in Python, API in Go)
- Fault isolation (payment outage doesn't take down browsing)

**Where modular monolith wins:**
- Zero network overhead for module calls — in-process is nanoseconds vs milliseconds
- No distributed transaction complexity — ACID across all modules
- Simple deployment, debugging, and testing
- No service discovery, no circuit breakers needed

**The real-world recommendation:** start with a well-structured modular monolith. Extract microservices only when you have clear signals: a specific module needs independent scaling, a team owns it fully, or a deployment conflict is slowing you down.

**Sam Newman's rule:** don't start with microservices. The seams in a monolith become the service boundaries — but you only know the right seams after you understand the domain.`,
      difficulty: 2,
      tags: 'microservices,monolith,architecture,trade-offs',
    },
    {
      title: 'How would you design a leaderboard system at global scale?',
      answer: `A leaderboard ranks users or entities by score, supporting real-time updates and range queries (top 100, user rank, nearby ranks).

**Core data structure — Redis Sorted Set:**
\`\`\`
ZADD leaderboard:global 9800 "alice"
ZADD leaderboard:global 9500 "bob"
ZADD leaderboard:global 9200 "carol"

# Top 10:
ZREVRANGE leaderboard:global 0 9 WITHSCORES

# Alice's rank (0-based):
ZREVRANK leaderboard:global "alice"  → 0 (rank 1)

# Score update (atomic):
ZINCRBY leaderboard:global 100 "alice"  → 9900
\`\`\`

**Challenges at scale:**

**Leaderboard sharding:** a single Redis sorted set supports ~millions of members at sub-millisecond latency. For billions of users, shard by region or score range.

**Score update throughput:** games or social apps may generate millions of score updates per second. Batch updates with a write buffer (accumulate deltas, flush every second) rather than calling ZINCRBY per event.

**Nearby ranks:** show "you're ranked #4821, next rank: 4820 (only 200 points away)."
\`\`\`
ZREVRANK leaderboard:global userId → rank N
ZREVRANGE leaderboard:global (N-3) (N+3) WITHSCORES  → 7 neighbors
\`\`\`

**Time-windowed leaderboards:** daily/weekly boards require separate sorted sets, reset on schedule. Use a cron to RENAME or DELETE and recreate.

**Persistence:** Redis is in-memory. Persist to PostgreSQL asynchronously for the canonical scores; use Redis as the real-time query layer.`,
      difficulty: 2,
      tags: 'leaderboard,redis,sorted-set,gaming,real-time',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
