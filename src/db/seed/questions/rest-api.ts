import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedRestApiQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['rest-api']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What are the HTTP methods and when do you use each?',
      answer: `HTTP methods indicate the desired action for a resource:

| Method | Idempotent | Safe | Use case |
|---|---|---|---|
| GET | Yes | Yes | Retrieve resource |
| POST | No | No | Create resource or trigger action |
| PUT | Yes | No | Full replacement of resource |
| PATCH | No | No | Partial update |
| DELETE | Yes | No | Remove resource |
| HEAD | Yes | Yes | GET without body (check existence/headers) |
| OPTIONS | Yes | Yes | Discover allowed methods (CORS preflight) |

\`\`\`
GET    /users         → list users
GET    /users/42      → get user 42
POST   /users         → create a new user
PUT    /users/42      → replace user 42 entirely
PATCH  /users/42      → update specific fields of user 42
DELETE /users/42      → delete user 42
\`\`\`

**Idempotent** means repeating the same request has the same effect as making it once. **Safe** means the request doesn't alter server state. These properties matter for retrying failed requests.`,
      difficulty: 1,
      tags: 'http-methods,rest,verbs',
    },
    {
      title: 'What are the constraints of a RESTful API?',
      answer: `REST (Representational State Transfer) is an architectural style defined by 6 constraints:

1. **Client-Server** — UI and data storage are separated. The client doesn't know how data is stored; the server doesn't know how data is displayed.

2. **Stateless** — each request contains all information needed to process it. No session state is stored on the server. Authentication tokens are sent with every request.

3. **Cacheable** — responses must define themselves as cacheable or non-cacheable. Proper use of \`Cache-Control\`, \`ETag\`, and \`Last-Modified\` headers.

4. **Uniform Interface** — resources are identified by URIs; representations are decoupled from resources; self-descriptive messages; HATEOAS.

5. **Layered System** — the client cannot tell whether it's connected directly to the server or through an intermediary (proxy, load balancer, CDN).

6. **Code on Demand (optional)** — servers can extend client functionality by transferring executable code (JavaScript).

Most "REST APIs" in practice are actually **HTTP APIs** or **REST-like** — they satisfy some but not all constraints (especially HATEOAS).`,
      difficulty: 2,
      tags: 'rest,constraints,architecture',
    },
    {
      title: 'What is the difference between PUT and PATCH?',
      answer: `**PUT** replaces the entire resource with the provided representation. Fields not included in the request are set to their defaults or nulled. It must be idempotent.

**PATCH** applies a partial modification. Only the fields included in the request are updated. It is not required to be idempotent (though it often is in practice).

\`\`\`
// Resource: { "id": 1, "name": "Alice", "email": "alice@example.com", "role": "user" }

// PUT /users/1 — replaces entirely
{ "name": "Alice Smith", "email": "alice@example.com" }
// Result: { "id": 1, "name": "Alice Smith", "email": "alice@example.com", "role": null }
// role is wiped because it wasn't included

// PATCH /users/1 — partial update
{ "name": "Alice Smith" }
// Result: { "id": 1, "name": "Alice Smith", "email": "alice@example.com", "role": "user" }
// role is preserved
\`\`\`

In practice, many APIs use PATCH for partial updates (the common case) and reserve PUT for scenarios where the client sends a complete resource representation. Always document which behavior your API implements.`,
      difficulty: 1,
      tags: 'put,patch,idempotent',
    },
    {
      title: 'What are HTTP status codes and what does each range mean?',
      answer: `HTTP status codes communicate the result of a request. They're grouped by the first digit:

**2xx — Success**
- \`200 OK\` — standard success
- \`201 Created\` — resource created (include \`Location\` header)
- \`204 No Content\` — success with no body (DELETE, some PUTs)

**3xx — Redirection**
- \`301 Moved Permanently\` — resource moved; update bookmarks
- \`302 Found\` — temporary redirect
- \`304 Not Modified\` — cached version is valid (conditional GET)

**4xx — Client Errors**
- \`400 Bad Request\` — malformed request or invalid input
- \`401 Unauthorized\` — missing/invalid authentication
- \`403 Forbidden\` — authenticated but not authorized
- \`404 Not Found\` — resource doesn't exist
- \`409 Conflict\` — conflict with current state (duplicate email)
- \`422 Unprocessable Entity\` — validation errors
- \`429 Too Many Requests\` — rate limit exceeded

**5xx — Server Errors**
- \`500 Internal Server Error\` — generic server failure
- \`502 Bad Gateway\` — upstream service returned invalid response
- \`503 Service Unavailable\` — server is down/overloaded
- \`504 Gateway Timeout\` — upstream service timed out`,
      difficulty: 1,
      tags: 'status-codes,http,responses',
    },
    {
      title: 'What is idempotency and why does it matter in API design?',
      answer: `An operation is **idempotent** if performing it multiple times produces the same result as performing it once. This matters for safe retries — network failures may cause clients to resend requests, and idempotent operations can be retried safely without side effects.

**Idempotent methods:** GET, HEAD, PUT, DELETE, OPTIONS
**Non-idempotent:** POST, PATCH (technically)

\`\`\`
DELETE /orders/123
→ First call: deletes order, returns 200
→ Second call: order already gone, returns 404 or 200
(Same final state: order is deleted)

POST /orders
→ Each call creates a new order (not idempotent)
\`\`\`

**Idempotency keys for POST:** Stripe, Braintree, and payment APIs support this pattern — the client generates a unique key per request and includes it in a header. The server stores completed operations and returns the cached result on duplicate keys, making POST safe to retry.

\`\`\`
POST /payments
Idempotency-Key: a1b2c3d4-unique-key
{ "amount": 5000, "currency": "usd" }
\`\`\``,
      difficulty: 2,
      tags: 'idempotency,reliability,design',
    },
    {
      title: 'How do you version a REST API?',
      answer: `API versioning prevents breaking existing clients when the API evolves. Common strategies:

**1. URI versioning** — most common and explicit:
\`\`\`
GET /v1/users
GET /v2/users
\`\`\`

**2. Header versioning** — cleaner URIs, less discoverable:
\`\`\`
GET /users
Accept: application/vnd.myapi.v2+json
API-Version: 2
\`\`\`

**3. Query parameter:**
\`\`\`
GET /users?version=2
\`\`\`

**Best practices:**
- Maintain at least N-1 versions concurrently
- Announce deprecation timelines clearly in docs and headers (\`Sunset\`, \`Deprecation\` headers)
- Breaking changes require a new major version: removing fields, changing types, renaming endpoints
- Non-breaking changes don't: adding new optional fields, new endpoints, new optional parameters
- Version the whole API, not individual endpoints, to reduce cognitive overhead

URI versioning is recommended for public APIs because it's easy to use in browsers, curl, and logs.`,
      difficulty: 2,
      tags: 'versioning,api-design,breaking-changes',
    },
    {
      title: 'What is rate limiting and how do you implement it?',
      answer: `Rate limiting restricts how many requests a client can make in a given time window. It protects APIs from abuse, prevents DDoS attacks, and ensures fair usage.

**Common algorithms:**
- **Fixed window** — count requests in fixed intervals (simple but allows burst at window boundary)
- **Sliding window** — smoother, prevents boundary bursts
- **Token bucket** — allows bursts up to bucket size, refills at a constant rate
- **Leaky bucket** — processes requests at a constant rate, queuing excess

**Implementation (Express + Redis):**
\`\`\`js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return X-RateLimit-* headers
  legacyHeaders: false,
  store: new RedisStore({ client: redisClient }),
  keyGenerator: (req) => req.user?.id ?? req.ip, // per-user or per-IP
});

app.use('/api/', limiter);
\`\`\`

**Response headers to include:** \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, \`X-RateLimit-Reset\`, \`Retry-After\` (on 429).`,
      difficulty: 2,
      tags: 'rate-limiting,security,performance',
    },
    {
      title: 'What is the difference between authentication and authorization?',
      answer: `**Authentication** (AuthN) verifies *who you are* — proving your identity (username/password, token, certificate).

**Authorization** (AuthZ) verifies *what you're allowed to do* — checking permissions after identity is confirmed.

\`\`\`
Authentication: "Are you Alice?" → Yes, here's your token
Authorization: "Can Alice delete post 42?" → No, she's not the author
\`\`\`

**Common authentication mechanisms:**
- Session cookies (stateful — server stores session)
- JWT (stateless — token contains claims, server validates signature)
- OAuth 2.0 + OIDC (federated — delegate to a provider like Google)
- API keys (for machine-to-machine)

**Authorization patterns:**
- **RBAC (Role-Based)** — permissions based on roles (admin, editor, viewer)
- **ABAC (Attribute-Based)** — permissions based on user/resource attributes
- **ACL (Access Control Lists)** — explicit per-resource permission entries

\`\`\`js
// Middleware chain: authenticate first, then authorize
app.delete('/posts/:id',
  authenticate,        // 401 if not logged in
  authorize('posts:delete'), // 403 if no permission
  deletePostHandler
);
\`\`\``,
      difficulty: 1,
      tags: 'authentication,authorization,security',
    },
    {
      title: 'What is HATEOAS?',
      answer: `HATEOAS (Hypermedia as the Engine of Application State) is a REST constraint where API responses include links to related actions, allowing clients to navigate the API without hardcoded URLs.

\`\`\`json
{
  "id": 42,
  "status": "pending",
  "amount": 150.00,
  "_links": {
    "self":    { "href": "/orders/42",        "method": "GET" },
    "pay":     { "href": "/orders/42/payment","method": "POST" },
    "cancel":  { "href": "/orders/42",        "method": "DELETE" },
    "customer":{ "href": "/users/7",          "method": "GET" }
  }
}
\`\`\`

The available \`_links\` change based on the resource's state — a "shipped" order won't have a "pay" link. The client follows links rather than constructing URLs, decoupling it from the URL structure.

**In practice:** Most APIs don't implement full HATEOAS because it requires significant server-side investment and client-side link-following logic. JSON:API and HAL (Hypertext Application Language) are standardized formats for hypermedia APIs. The main benefit is discoverability — useful for public APIs with many third-party clients.`,
      difficulty: 3,
      tags: 'hateoas,hypermedia,rest',
    },
    {
      title: 'What are webhooks and how do they differ from polling?',
      answer: `**Polling:** The client repeatedly requests the server at intervals to check for new data. Simple to implement but wastes resources when there's nothing new.

**Webhooks:** The server pushes data to the client by making an HTTP POST to a client-provided URL when an event occurs. Event-driven, efficient, but requires the client to expose a public endpoint.

\`\`\`
Polling:
Client → GET /payment/status every 5s
Server → "pending" × 10, then "succeeded"

Webhooks:
Client registers: POST /register { url: "https://myapp.com/hooks/stripe" }
Stripe → POST https://myapp.com/hooks/stripe { event: "payment.succeeded", ... }
\`\`\`

**Receiving webhooks securely:**
\`\`\`js
app.post('/hooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }
  // Process event idempotently
  res.sendStatus(200);
});
\`\`\`

Always validate webhook signatures to prevent spoofed events.`,
      difficulty: 2,
      tags: 'webhooks,polling,events',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
