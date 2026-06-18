import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'What System Design Interviews Actually Evaluate',
    content: `System design interviews don't have a single "correct" answer — they evaluate how you navigate ambiguity, make tradeoffs explicit, and justify decisions against stated constraints, which is exactly what senior engineers do when scoping real systems before writing any code.

A strong session typically moves through four phases: **clarify requirements** (functional — what must the system do — and non-functional — scale, latency, consistency expectations), **estimate scale** (back-of-envelope numbers for traffic, storage, bandwidth), **propose a high-level design** (boxes and arrows: clients, load balancers, services, datastores, caches), and **iteratively deepen** specific components the interviewer probes (e.g. "how does your database handle this query pattern at 10x scale?").

The most common failure mode isn't picking the "wrong" technology — it's jumping straight to a detailed design without clarifying requirements first, which produces a design that's over-engineered for the actual scale, or missing a core requirement entirely (e.g. designing a read-heavy cache architecture for a system that the interviewer specified is write-heavy).

The interview-relevant habit: treat every design decision as a tradeoff to be stated out loud, not a fact to assert — "I'd use a SQL database here because we need multi-row transactions across orders and inventory; the cost is harder horizontal write scaling, which I'd mitigate with sharding by customer ID if writes become the bottleneck" demonstrates far more seniority than just naming a technology.`,
  },
  {
    title: 'Functional vs. Non-Functional Requirements',
    content: `**Functional requirements** describe *what* the system does — the features and user-facing behavior (e.g. "users can post a tweet," "users can follow other users," "the feed shows posts from followed accounts"). **Non-functional requirements** describe *how well* it does it — qualities like scale, latency, availability, consistency, and durability that shape the architecture far more than the feature list does.

A practical clarifying checklist for non-functional requirements:
- **Scale:** how many users, how many requests per second, read-heavy or write-heavy?
- **Latency:** what response time is acceptable (real-time chat vs. an overnight batch report have wildly different budgets)?
- **Availability vs. consistency:** can the system tolerate showing slightly stale data, or must every read reflect the latest write (covered in depth in the CAP theorem lesson)?
- **Durability:** can any data ever be acceptably lost, or must every accepted write survive a crash?

Two systems with identical functional requirements ("store and retrieve a value by key") can have completely different correct designs depending on non-functional answers — a key-value store backing a shopping cart (must never lose data, moderate scale) looks nothing like one backing ephemeral view counts (occasional loss is fine, must handle massive write volume cheaply).

The interview-relevant discipline: always ask about non-functional requirements explicitly rather than assuming — interviewers deliberately leave them unstated to see whether you ask, and the "right" architecture genuinely depends on the answer.`,
  },
  {
    title: 'Back-of-the-Envelope Estimation',
    content: `Before proposing an architecture, translating vague scale descriptions ("a popular social app") into concrete numbers grounds every later decision — whether you need a single database or a sharded cluster, whether an in-memory cache fits, or whether you need a CDN, all follow from actual numbers rather than intuition.

A standard estimation walks through: **users** (daily active users, e.g. 100 million), **requests per second** (DAU × actions per user per day ÷ 86,400 seconds — e.g. 100M users × 10 reads/day ÷ 86,400 ≈ 11,500 reads/sec average, then multiplied by a peak factor, often 2-5x, for non-uniform traffic), **storage** (rows or objects per day × size per item × retention period), and **bandwidth** (requests/sec × average payload size).

\`\`\`text
Example: 100M DAU, each posts 1 photo/day averaging 200KB
Storage per day  = 100M * 200KB = 20TB/day
Storage per year = 20TB * 365 ≈ 7.3PB/year
Write QPS (avg)  = 100M / 86,400 ≈ 1,160 writes/sec
Write QPS (peak, 3x) ≈ 3,500 writes/sec
\`\`\`

These numbers don't need to be precise — interviewers care that you can reason in orders of magnitude (thousands vs. millions vs. billions) and that the resulting numbers actually inform your design (e.g. "7.3PB/year rules out storing raw photos in a relational database — we need object storage like S3, with the database only holding metadata and a pointer").`,
  },
  {
    title: 'Horizontal vs. Vertical Scaling',
    content: `**Vertical scaling** ("scaling up") means adding more resources — CPU, RAM, faster disks — to a single machine. **Horizontal scaling** ("scaling out") means adding more machines and distributing load across them. Almost every large-scale system design question is ultimately about how to scale horizontally, because vertical scaling has a hard ceiling (there's a maximum CPU/RAM a single machine can have) and a single point of failure (if that one machine goes down, the system is down).

\`\`\`text
Vertical:    [ Small Server ] → [ Bigger Server ] → [ Even Bigger Server ]
Horizontal:  [ Server ] → [ Server ][ Server ] → [ Server ][ Server ][ Server ]...
\`\`\`

Horizontal scaling introduces problems vertical scaling doesn't have: requests need to be **distributed** across machines (load balancing), state that used to live in one process's memory now needs to be shared or replicated (sessions, caches), and data that used to fit on one disk needs to be **partitioned** across many (sharding, covered in its own lesson).

The interview-relevant framing: stateless services (e.g. an API server with no in-memory session data) scale horizontally almost for free — just add more identical instances behind a load balancer. Stateful components (databases, anything holding session or in-memory data) are where horizontal scaling gets genuinely hard, which is why so much system design discussion centers on databases and caching rather than application servers.`,
  },
  {
    title: 'Load Balancing',
    content: `A load balancer sits in front of a fleet of servers and distributes incoming requests across them, which is what makes horizontal scaling of stateless services actually work — clients connect to one address, and the load balancer routes each request to a healthy backend instance.

Common algorithms: **round robin** (cycle through servers in order — simple, assumes equal capacity and request cost), **least connections** (route to whichever server currently has the fewest active connections — better when request duration varies), and **consistent hashing** (route based on a hash of some request attribute, e.g. user ID, so the same user consistently lands on the same server — useful when a server holds per-user cached state).

Load balancers also perform **health checks**, removing unresponsive backend servers from rotation automatically, which is a core piece of how systems achieve high availability — a single server crashing doesn't take down the whole service, traffic just stops being routed there.

There are two layers worth distinguishing in interviews: **Layer 4 (transport)** load balancing routes based on IP/port without inspecting the request content (faster, less flexible), while **Layer 7 (application)** load balancing inspects the actual HTTP request (path, headers, cookies) and can make smarter routing decisions (e.g. route \`/api/video\` traffic to a different fleet than \`/api/checkout\`) at the cost of more processing per request.`,
  },
  {
    title: 'Caching Fundamentals',
    content: `A cache stores a copy of frequently accessed data in a faster-to-access location, trading staleness risk for dramatically reduced latency and reduced load on the underlying source of truth (usually a database). Caching is one of the highest-leverage tools in system design because real-world access patterns are rarely uniform — a small fraction of data (a "hot set") accounts for most reads, so caching that fraction alone yields most of the benefit.

Common cache placements: **client-side** (browser cache), **CDN** (geographically distributed caches for static content, covered in its own lesson), **application-level** (in-process or a shared cache like Redis/Memcached in front of the database), and **database-level** (the database's own internal buffer pool/query cache).

\`\`\`text
Request → App Server → Check Cache → Hit?  → Return cached value
                              ↓ Miss
                         Query Database → Store result in cache → Return value
\`\`\`

The two questions every cache design must answer: **eviction policy** — when the cache is full, what gets removed (LRU — least recently used — is the most common default, evicting whatever hasn't been accessed in the longest time) — and **invalidation strategy** — how does the cache learn that the underlying data changed (TTL expiration, explicit invalidation on write, or accepting some staleness window). Getting cache invalidation wrong is famously one of the hardest problems in distributed systems — "there are only two hard things in Computer Science: cache invalidation and naming things" is a real engineering proverb, not just a joke.`,
  },
  {
    title: 'Content Delivery Networks (CDNs)',
    content: `A CDN is a globally distributed network of edge servers that cache and serve static (and increasingly, dynamic) content from a location physically close to the requesting user, reducing latency that would otherwise be dominated by the speed-of-light round trip to a single origin server far away.

\`\`\`text
User in Tokyo  → Tokyo edge server (cached) → fast response
User in Berlin → Berlin edge server (cached) → fast response
(only on a cache miss does the edge server fetch from the origin and cache it for next time)
\`\`\`

CDNs are the standard solution for serving images, videos, JS/CSS bundles, and other content that's identical for every user and changes infrequently — offloading this traffic to the CDN means the origin servers only handle cache misses and genuinely dynamic requests, often reducing origin load by an order of magnitude for content-heavy applications.

The interview-relevant nuance: CDNs aren't only for static assets anymore — many CDN providers support caching API responses at the edge with short TTLs, and some support edge compute (running small pieces of logic at the edge before a request ever reaches the origin), but the foundational use case to mention first in an interview is still "geographically distribute static content close to users to cut latency and origin load."`,
  },
  {
    title: 'Database Indexing',
    content: `An index is a separate data structure (commonly a B-tree) that lets a database find rows matching a query without scanning the entire table — the same tradeoff as a book's index: a small amount of extra structure that makes lookups dramatically faster at the cost of extra storage and slower writes (every insert/update must also update the index).

\`\`\`sql
CREATE INDEX idx_users_email ON users(email);
-- Without the index: WHERE email = 'x@y.com' scans every row (O(n))
-- With the index:    WHERE email = 'x@y.com' does a B-tree lookup (O(log n))
\`\`\`

Indexes are not free — every additional index slows down writes (insert/update/delete must maintain every index on the table) and consumes additional storage, so the system design tradeoff is choosing indexes that match actual query patterns rather than indexing every column defensively. A **composite index** on multiple columns speeds up queries that filter or sort on that exact combination (and its prefix) but doesn't help queries that only use a later column in isolation.

The interview-relevant point to make explicit: indexing decisions follow directly from the read/write ratio and the actual query patterns established during requirements gathering — a write-heavy system with few distinct query patterns should have far fewer indexes than a read-heavy analytics system with many ad-hoc query shapes.`,
  },
  {
    title: 'Database Replication',
    content: `Replication keeps copies of the same data on multiple database nodes, primarily to improve **availability** (if one node fails, others still serve traffic) and **read scalability** (reads can be spread across replicas instead of all hitting one node).

The dominant pattern is **leader-follower (primary-replica) replication**: all writes go to a single leader node, which then propagates changes to one or more follower nodes; reads can be served from either the leader (always current) or followers (potentially slightly stale, depending on replication lag).

\`\`\`text
Write → Leader DB → replicates async/sync → Follower DB 1
                                           → Follower DB 2  (reads can go here)
\`\`\`

**Synchronous replication** waits for followers to confirm before acknowledging the write (stronger durability guarantee, higher write latency, and a write blocks if a follower is unreachable). **Asynchronous replication** acknowledges the write as soon as the leader has it, propagating to followers in the background (lower write latency, but a leader crash before propagation can lose the most recent writes, and followers briefly serve stale data — replication lag).

The interview-relevant tradeoff to name explicitly: leader-follower replication scales reads well but doesn't help write scalability at all (every write still goes through one leader) — write scalability requires partitioning the data itself, which is sharding, covered next.`,
  },
  {
    title: 'Database Sharding (Horizontal Partitioning)',
    content: `Sharding splits a single logical dataset across multiple physical database nodes, each holding a subset of the rows — unlike replication (every node has all the data), sharding means each node has only *some* of the data, which is what actually scales write throughput and total storage beyond what one machine can hold.

Common sharding strategies: **range-based** (e.g. user IDs 1-1M on shard A, 1M-2M on shard B — simple, but can create hot shards if access isn't uniform across ranges), **hash-based** (hash the shard key and use the result to pick a shard — spreads load more evenly, but range queries across the whole keyspace become expensive since adjacent keys aren't co-located), and **directory-based** (a lookup service maps each key to its shard explicitly — flexible, but the lookup service itself becomes a critical, potentially bottlenecked component).

\`\`\`text
Hash-based: shard = hash(user_id) % number_of_shards
user_id=482 → hash → shard 2
user_id=7   → hash → shard 0
\`\`\`

Choosing a good **shard key** is the central design decision: it must distribute load evenly (avoiding hot shards) and align with the dominant query pattern (queries that need data from a single shard are fast; queries that must fan out across many shards and aggregate results — "cross-shard joins" — are slow and complex). A classic mistake is sharding by a key that seems natural (e.g. signup date) but concentrates all current activity on the most recent shard.`,
  },
  {
    title: 'CAP Theorem',
    content: `The CAP theorem states that a distributed system can provide at most two of three guarantees simultaneously during a network partition: **Consistency** (every read receives the most recent write, or an error), **Availability** (every request receives a non-error response, even if it's not the latest data), and **Partition tolerance** (the system continues operating despite network failures between nodes).

In practice, partition tolerance isn't really optional for any distributed system spanning multiple machines (networks fail; you must design for it), so CAP in practice reduces to a choice between **CP** (consistent but may refuse requests during a partition) and **AP** (available but may serve stale data during a partition).

\`\`\`text
Network partition occurs between Node A and Node B:
CP system: refuses to answer (or answers with an error) rather than risk inconsistency
AP system: both nodes keep answering requests, possibly with different (stale) data
\`\`\`

Concrete examples interviewers expect: a banking ledger balance typically favors **CP** (better to briefly refuse a request than show an incorrect balance), while a social media "like count" or product view counter typically favors **AP** (briefly showing a slightly stale count is harmless, and the system staying responsive matters more). The interview-relevant skill is mapping a specific feature's requirements to this tradeoff explicitly, rather than reciting the theorem abstractly — "this feature needs strong consistency because X" is the actual signal interviewers look for.`,
  },
  {
    title: 'SQL vs. NoSQL: Choosing a Data Model',
    content: `The SQL vs. NoSQL decision in system design interviews is really a decision about **data model fit** and **scaling characteristics**, not a popularity contest — both are correct answers in different contexts, and naming the specific reason matters more than the choice itself.

**Relational (SQL)** databases enforce a fixed schema, support multi-row ACID transactions, and excel at queries involving relationships between entities (joins) — well suited to data with strong consistency needs and structure that doesn't change often (orders, payments, inventory, anything where "this update and that update must both succeed or neither does" matters).

**NoSQL** databases trade some of those guarantees for flexibility or scale: **document stores** (e.g. MongoDB) suit semi-structured, evolving schemas where each record is mostly self-contained; **key-value stores** (e.g. DynamoDB, Redis) suit simple lookups by a single key at very high throughput; **wide-column stores** (e.g. Cassandra) suit massive write volumes distributed across many nodes with eventual consistency; **graph databases** (e.g. Neo4j) suit data that's fundamentally about relationships (social graphs, recommendation engines).

The interview-relevant framing: start from the access pattern and consistency requirement established during requirements gathering, then pick the data model that fits — "users need ACID transactions across orders and payments, so I'd use a relational database for that subsystem, but the activity feed has a simple, high-volume, append-mostly access pattern that fits a wide-column or document store better" demonstrates the kind of per-component reasoning interviewers want, rather than picking one technology for the entire system.`,
  },
  {
    title: 'Message Queues and Asynchronous Processing',
    content: `A message queue decouples the producer of work from the consumer that performs it — instead of a service doing slow or unreliable work synchronously within a request (and making the user wait, or failing the whole request if that work fails), it publishes a message describing the work, and a separate consumer processes it independently, at its own pace.

\`\`\`text
Synchronous:  Client → API → [do slow work: send email, resize image] → Response (slow, fragile)
Asynchronous: Client → API → enqueue message → Response (fast)
                                    ↓
                            Worker consumes message → does slow work later
\`\`\`

This pattern is the standard answer for any "slow or unreliable side effect" in a request flow: sending emails/notifications, resizing uploaded images or transcoding video, generating reports, or any third-party API call whose latency or reliability you don't want to block the user-facing request on. It also smooths out traffic spikes — if 10,000 requests arrive in one second, they can all enqueue instantly even if workers can only process 1,000/second, because the queue absorbs the burst and workers drain it over the next several seconds.

The interview-relevant tradeoff: asynchronous processing improves perceived latency and resilience but introduces eventual consistency (the work hasn't happened yet when the response returns) and operational complexity (you now need to monitor queue depth, handle failed messages/retries, and design for "what does the user see while their request is still being processed").`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'Designing a URL Shortener',
    content: `The URL shortener is a canonical system design warm-up because its core requirement is deceptively simple — map a long URL to a short code and back — yet it surfaces real decisions about ID generation, storage, and read/write scaling.

**Core flow:** \`POST /shorten {longUrl}\` returns a short code (e.g. \`abc123\`); \`GET /abc123\` redirects (HTTP 301/302) to the original long URL. The central design question is **how to generate the short code**: a counter-based approach (an auto-incrementing ID, base62-encoded to keep it short) guarantees uniqueness trivially but requires a centralized counter that becomes a bottleneck or single point of failure at scale; a hash-based approach (hash the long URL, take the first N characters) avoids a centralized counter but must handle collisions (two different URLs hashing to the same prefix) with a retry-with-salt or collision-check step.

\`\`\`text
Write path: long URL → generate code → store {code: longUrl} → return short URL
Read path:  short code → look up longUrl → 301 redirect
\`\`\`

This system is overwhelmingly **read-heavy** (each link is created once but clicked many times), which drives the architecture: aggressive caching of the code → longUrl mapping (a cache miss only costs one database lookup, and hot links — viral content — benefit enormously), and a simple key-value store is sufficient since there's no relational structure to the data (no joins needed). At very large scale, the datastore would be sharded by short code (consistent hashing works well here, since lookups are always by exact code, never by range).`,
  },
  {
    title: 'Designing a Rate Limiter',
    content: `A rate limiter protects a service from being overwhelmed by a single client (intentionally or accidentally) by rejecting requests once a client exceeds an allowed quota within a time window — a foundational building block referenced inside many other system designs (APIs, login endpoints to prevent brute force, third-party integrations).

Common algorithms, in increasing sophistication: **fixed window** (count requests per client in a fixed time bucket, e.g. per minute — simple, but allows a burst of 2x the limit right at a window boundary, since a client can use its full quota at the end of one window and immediately the full quota again at the start of the next); **sliding window** (track requests in a rolling time window rather than a fixed bucket — smooths out the boundary-burst problem at the cost of more bookkeeping); **token bucket** (each client has a bucket that refills with tokens at a steady rate; each request consumes a token, and requests are rejected when the bucket is empty — naturally allows brief bursts up to the bucket size while enforcing a steady-state average rate).

\`\`\`text
Token bucket: bucket holds up to 10 tokens, refills 1 token/sec
Request arrives → bucket has tokens? → consume one, allow
                                     → empty? → reject (HTTP 429)
\`\`\`

The distributed-systems wrinkle: a rate limiter behind a load balancer with multiple API server instances can't track each client's count in local memory (a client's requests might land on different instances) — the counter state must live in a shared, fast store like Redis, and at very high request rates even that shared counter can become a bottleneck, which is why production rate limiters often accept slightly approximate counting (e.g. each server tracks locally and syncs periodically) as a deliberate accuracy-for-throughput tradeoff.`,
  },
  {
    title: 'Designing a News Feed / Social Timeline',
    content: `A social feed (e.g. a Twitter-style timeline showing posts from people you follow) is a classic design because its central tension — fan-out on write vs. fan-out on read — has no universally correct answer and depends entirely on the read/write ratio and the "celebrity user" problem.

**Fan-out on write (push model):** when a user posts, immediately write that post into the precomputed feed of every follower. Reading a feed is then just one fast lookup (the feed is already assembled). This makes reads cheap but makes a single post by a user with millions of followers extremely expensive to write (millions of feed insertions for one post) — the classic **celebrity problem**.

**Fan-out on read (pull model):** store posts once per author; when a user requests their feed, query posts from everyone they follow and merge them on the fly. This makes writes cheap (one insert regardless of follower count) but makes reads expensive, especially for users following many accounts, since every feed load requires fanning out to many authors' post lists and merging.

\`\`\`text
Push:  Post(A) → fan out → Feed(follower1), Feed(follower2), ... Feed(followerN)
Pull:  Post(A) stored once → Feed request → query posts from all followed authors → merge
\`\`\`

The production-grade answer most large systems converge on is a **hybrid**: push for the vast majority of users (cheap reads, manageable write fan-out), but pull (or a special-cased low-fan-out path) for celebrity accounts with extreme follower counts, merging their posts into a requesting user's feed at read time instead of fanning out on every post. Naming this hybrid and explaining *why* the celebrity case breaks the pure push model is the strongest answer interviewers look for.`,
  },
  {
    title: 'Designing a Chat / Messaging System',
    content: `A real-time chat system (e.g. one-on-one and group messaging) is distinguished from most other system design questions by its requirement for **persistent, low-latency, bidirectional connections** rather than typical request-response HTTP.

The standard transport choice is **WebSockets** (a persistent TCP connection allowing the server to push messages to a client without the client polling), with each client maintaining one open connection to a server in the chat service's fleet. Because a connection is **stateful** — the server holding it is the only one that can push to that specific client — this breaks the usual stateless load-balancing assumption, requiring a way to route an incoming message to whichever specific server holds the recipient's connection (often via a connection-routing service backed by a shared store like Redis mapping userId → serverId).

\`\`\`text
User A (connected to Server 1) sends message to User B (connected to Server 3)
Server 1 → looks up "User B is on Server 3" → forwards message → Server 3 → pushes to User B
\`\`\`

Other core decisions: **message persistence** (store every message in a database keyed by conversation, so chat history survives reconnects and works across devices), **delivery guarantees** (at-least-once delivery with client-side deduplication by message ID is the common pragmatic choice, since exactly-once delivery across an unreliable network is notoriously hard), and **online presence** (tracking which users are currently connected, often via a heartbeat/TTL mechanism in a fast key-value store, since presence changes far too frequently to live in the primary database).`,
  },
  {
    title: 'Designing a Distributed Key-Value Store',
    content: `A distributed key-value store (conceptually similar to DynamoDB or Cassandra) is a frequent deep-dive topic because it forces explicit reasoning about partitioning, replication, and consistency simultaneously — the three concepts most other designs only touch individually.

**Partitioning** distributes keys across nodes, typically via **consistent hashing**: nodes and keys are both mapped onto a hash ring, and each key is owned by the next node clockwise on the ring — the key property being that adding or removing a node only reshuffles the keys adjacent to that node on the ring, not the entire keyspace (unlike naive \`hash(key) % numNodes\`, where changing the node count reshuffles almost everything).

\`\`\`text
Hash ring:  Node A (hash 10) -- Node B (hash 90) -- Node C (hash 200) -- (wraps to A)
key with hash 45 → owned by Node B (next node clockwise)
\`\`\`

**Replication** stores each key on multiple nodes (e.g. the N nodes following it on the ring) for fault tolerance. **Consistency** is then a tunable tradeoff via **quorum reads/writes**: a write succeeds once W replicas acknowledge it, and a read queries R replicas and returns the most recent value; choosing W + R > N (the total replica count) guarantees a read sees at least one replica that received the latest write, letting the system tune toward stronger consistency (higher W and R, slower) or higher availability (lower W and R, faster, more staleness risk) per the application's needs — this is the practical, tunable version of the CAP tradeoff discussed abstractly in the fundamentals lesson.`,
  },
  {
    title: 'Consistent Hashing in Depth',
    content: `Consistent hashing solves a specific problem: in a naive partitioning scheme (\`hash(key) % numberOfNodes\`), adding or removing even one node changes the result of that modulo operation for nearly every key, forcing almost all data to be redistributed — catastrophic for a live system that needs to scale its node count without massive data movement.

Consistent hashing instead maps both nodes and keys onto points on a fixed-size hash ring (e.g. hash values from 0 to 2^32-1). Each key is owned by the first node encountered going clockwise from the key's position. When a node is added, it only takes ownership of the portion of the ring between itself and the previous node — only those keys move, leaving the rest of the ring's data placement untouched. When a node is removed, only its keys move, to the next node clockwise.

\`\`\`text
Ring: ... -- NodeA -- [keys here move to NodeA if NodeB removed] -- NodeB -- ...
Adding NodeX between A and B: only keys between A and X move (to X); B's keys stay put
\`\`\`

A practical refinement: a single point per node on the ring can create uneven load if a node happens to own a disproportionately large arc, so production systems typically use **virtual nodes** — each physical node is mapped to many points scattered around the ring — which both smooths out load distribution and means that when a node fails, its load is spread across many other nodes rather than dumped entirely onto whichever single node was its clockwise neighbor.`,
  },
  {
    title: 'Designing a Distributed Cache Layer at Scale',
    content: `Beyond a single Redis instance, caching at large scale introduces its own distributed-systems problems: a cache that doesn't fit on one machine must itself be partitioned, and the cache layer becomes a critical-path dependency whose failure modes need explicit design.

**Cache partitioning** typically uses the same consistent-hashing approach as a key-value store, distributing cache keys across a cluster of cache nodes so no single node needs to hold the entire working set.

**Thundering herd / cache stampede:** when a popular cache entry expires, many concurrent requests can simultaneously miss the cache and hit the database at once, potentially overwhelming it. Mitigations include **request coalescing** (only one of the simultaneous requests actually queries the database; the others wait for and reuse its result) and **staggered/jittered TTLs** (avoid expiring many related keys at the exact same instant).

\`\`\`text
Without coalescing: 1000 concurrent requests → cache miss → 1000 simultaneous DB queries (overload)
With coalescing:     1000 concurrent requests → cache miss → 1 DB query → result shared with all 1000
\`\`\`

**Cache failure handling:** since a cache is meant to be a performance optimization, not a source of truth, a well-designed system should degrade gracefully (fall back to the database, accepting higher latency) rather than fail entirely when the cache layer is unavailable — a system that has a hard dependency on its cache being up has effectively made an optimization into a single point of failure, which is a design smell worth calling out explicitly in an interview.`,
  },
  {
    title: 'Designing a Notification System',
    content: `A notification system (push notifications, SMS, email, in-app alerts) fans out a single triggering event to potentially many delivery channels and recipients, and its design centers on decoupling the trigger from delivery and handling each channel's distinct reliability and rate characteristics.

\`\`\`text
Event (e.g. "comment posted") → Notification Service → enqueue per-channel jobs
                                                       → Push worker  → APNs/FCM
                                                       → Email worker → SES/SendGrid
                                                       → SMS worker   → Twilio
\`\`\`

Using a message queue between the triggering event and the actual delivery (rather than sending notifications synchronously inline with the triggering action) is essential here: third-party push/SMS/email providers have their own latency and occasional outages, and a notification failure should never block or fail the user's original action (e.g. posting a comment should succeed even if the push notification provider is temporarily down).

Key design considerations beyond the basic fan-out: **user preferences** (respecting per-channel opt-outs and do-not-disturb windows before enqueueing), **deduplication** (avoiding sending the same notification twice if an event is processed more than once — idempotency keys per notification are the standard fix), and **retry with backoff** for transient provider failures, paired with a dead-letter queue for notifications that fail repeatedly so they can be inspected rather than silently dropped or retried forever.`,
  },
  {
    title: 'Designing a Search Autocomplete System',
    content: `Autocomplete (suggesting completions as a user types) has an unusually strict latency requirement — suggestions must appear within tens of milliseconds per keystroke to feel responsive — which rules out querying a general-purpose database directly and drives the design toward a specialized, precomputed structure.

The standard data structure is a **trie** (prefix tree), where each path from the root spells out a prefix, and nodes are commonly augmented with the top-K most popular completions for that prefix cached directly at the node, so a query for a given prefix is a simple trie traversal followed by reading a precomputed list — no scoring or sorting at request time.

\`\`\`text
Trie path for "ca": root → c → a → (cached top completions: "cat", "car", "cafe")
\`\`\`

Because popularity/frequency data changes over time (trending terms, new popular queries), the trie is typically rebuilt periodically (e.g. hourly) from aggregated query logs rather than updated synchronously on every search — an explicit freshness-vs-complexity tradeoff: real-time updates would require far more complex incremental-update logic for a benefit (showing brand-new trending terms within seconds rather than within an hour) that's rarely worth the complexity for most products.

At scale, the trie itself may not fit on one machine, requiring partitioning by prefix range across multiple servers, with a routing layer directing each query to the server owning that prefix range — and because autocomplete is read-overwhelmingly-heavy with a small, hot set of common prefixes, an additional cache layer in front of the trie servers captures most traffic before it even reaches them.`,
  },
  {
    title: 'Idempotency and Exactly-Once Semantics',
    content: `In a distributed system, network failures make it fundamentally ambiguous whether a request that didn't return a response actually succeeded on the server — the response could have been lost on the way back even though the operation completed — which means a naive retry can cause the same operation (e.g. "charge this credit card") to execute twice.

**Idempotency** is the property that performing an operation multiple times has the same effect as performing it once, which makes "just retry on failure" a safe default strategy instead of a risk. The standard mechanism is an **idempotency key**: the client generates a unique key per logical operation (not per HTTP attempt) and sends it with the request; the server records which keys it has already processed and, on seeing a repeated key, returns the original result instead of re-executing the operation.

\`\`\`text
Client generates key "order-7f3a" once, retries the same request 3 times with that key
Server: 1st attempt → processes, stores result keyed by "order-7f3a"
        2nd, 3rd attempts → sees key already processed → returns stored result, no re-execution
\`\`\`

The interview-relevant point: true "exactly-once" delivery across an unreliable network is provably very difficult to achieve end-to-end, so production distributed systems instead aim for **at-least-once delivery plus idempotent processing**, which achieves the same practical outcome (an operation's effect happens exactly once) through a different, more tractable mechanism — recognizing and naming this distinction signals real distributed-systems depth in an interview.`,
  },
  {
    title: 'Designing for High Availability and Fault Tolerance',
    content: `High availability means a system continues serving requests despite individual component failures — measured commonly in "nines" (99.9% = ~8.7 hours downtime/year, 99.99% = ~52 minutes/year) — and achieving it is fundamentally about eliminating single points of failure at every layer.

The general pattern repeated at every layer of a system: **redundancy** (run multiple instances of every component — servers, database replicas, even multiple availability zones or regions — so any single failure doesn't take down the whole system), **health checking and automatic failover** (detect a failed instance quickly and redirect traffic away from it without manual intervention), and **graceful degradation** (when a non-critical dependency fails, serve a reduced experience rather than failing the entire request — e.g. if the recommendations service is down, show a page without recommendations rather than an error page).

\`\`\`text
Single point of failure:        Redundant:
Client → 1 Load Balancer        Client → 2+ Load Balancers (active-active or active-passive)
       → 1 App Server                  → many App Servers behind LB
       → 1 Database                    → Primary DB + replicas, automatic failover
\`\`\`

A specific, frequently-tested concept is the **circuit breaker** pattern: when calls to a downstream dependency start failing repeatedly, the circuit breaker "opens" and stops sending requests to that dependency for a cooldown period (failing fast instead, or falling back to a default), preventing a struggling downstream service from being overwhelmed further and preventing the calling service from wasting resources waiting on calls likely to fail — this is the standard answer for "how do you prevent one failing service from cascading failures throughout the system."`,
  },
  {
    title: 'Designing a Distributed Job Scheduler',
    content: `A distributed job scheduler (e.g. running cron-like recurring jobs, or one-off delayed jobs, across a fleet of workers rather than a single machine) must solve a problem that doesn't exist on a single box: ensuring each scheduled job runs on exactly one worker, even though many worker instances are watching the same job queue.

The central mechanism is **distributed locking**: before executing a due job, a worker must acquire an exclusive lock for that specific job (commonly via a shared store like Redis or a database row with a conditional update), ensuring that even if multiple workers simultaneously notice the same due job, only one actually executes it.

\`\`\`text
Worker A: sees job "send-report-daily" is due → tries to acquire lock → succeeds → executes
Worker B: sees same job is due → tries to acquire lock → fails (already held) → skips
\`\`\`

A subtle but critical design detail: locks must have an **expiration/TTL**, because if the worker holding a lock crashes mid-execution without releasing it, a lock with no expiration would block that job from ever running again — but a TTL that's too short risks a second worker acquiring the lock and double-executing a job that's actually still running slowly (not crashed), so the TTL needs to be set well above the expected execution time, sometimes paired with a **heartbeat/lock-renewal** mechanism where the executing worker periodically extends its own lock while still actively working.

Beyond locking, a production scheduler also needs persistent storage of job definitions and next-run times (surviving a restart of the scheduler itself), and a strategy for **missed jobs** (if the entire scheduler fleet was down when a job was due, should it run immediately on recovery, or be skipped until its next scheduled time) — an explicit product decision, not a purely technical one.`,
  },
];

export function seedSystemDesignLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['system-design']);
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
