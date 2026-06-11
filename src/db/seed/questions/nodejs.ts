import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedNodejsQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['nodejs']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'How does the Node.js event loop work?',
      answer: `Node.js uses a single-threaded event loop backed by libuv to handle concurrent I/O without threads. It processes tasks in phases:

**Phases (simplified):**
1. **Timers** — \`setTimeout\`, \`setInterval\` callbacks whose threshold has passed
2. **Pending I/O** — I/O callbacks deferred from the previous loop
3. **Idle/Prepare** — internal use
4. **Poll** — retrieve new I/O events; blocks if nothing queued
5. **Check** — \`setImmediate\` callbacks
6. **Close** — close event callbacks

Between each phase, Node drains the **microtask queues** in order:
1. \`process.nextTick\` (highest priority)
2. Promise \`.then\`/\`.catch\`

\`\`\`js
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));

// Output: nextTick → promise → timeout → immediate
// (timeout vs immediate order can vary when not in I/O callback)
\`\`\`

This model enables high throughput for I/O-bound workloads without the complexity of multi-threading.`,
      difficulty: 3,
      tags: 'event-loop,async,nodejs',
    },
    {
      title: 'What is middleware in Express and how does it work?',
      answer: `Middleware are functions that have access to \`req\`, \`res\`, and \`next\`. They form a chain — each middleware either ends the request/response cycle or calls \`next()\` to pass control to the next function.

\`\`\`js
const express = require('express');
const app = express();

// Application-level middleware
app.use(express.json()); // parse JSON bodies

// Custom middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = verifyToken(token);
    next(); // pass control to next handler
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Router-level middleware
app.get('/profile', authenticate, (req, res) => {
  res.json(req.user);
});

// Error-handling middleware (4 arguments)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});
\`\`\`

Order matters — middleware runs in the order it's registered. Error-handling middleware must be last and have exactly 4 parameters.`,
      difficulty: 2,
      tags: 'middleware,express,request-pipeline',
    },
    {
      title: 'What is the difference between process.nextTick and setImmediate?',
      answer: `Both schedule callbacks to run asynchronously, but at different points in the event loop.

- \`process.nextTick\` fires **before** the event loop moves to the next phase — even before I/O callbacks, before Promises. It drains completely before anything else.
- \`setImmediate\` fires in the **Check phase** — after I/O events but before timers on the next loop tick.

\`\`\`js
setImmediate(() => console.log('setImmediate'));
process.nextTick(() => console.log('nextTick 1'));
process.nextTick(() => console.log('nextTick 2'));
Promise.resolve().then(() => console.log('promise'));

// Output:
// nextTick 1
// nextTick 2
// promise
// setImmediate
\`\`\`

**Caution:** Recursive \`process.nextTick\` calls can starve I/O callbacks since it always fires before the loop continues. Use it only to defer work to "after the current operation but before I/O." For most cases, prefer \`Promise.resolve().then()\` or \`setImmediate\`.`,
      difficulty: 3,
      tags: 'event-loop,nexttick,setimmediate',
    },
    {
      title: 'What are streams in Node.js?',
      answer: `Streams are interfaces for working with sequential data in chunks, rather than loading everything into memory. They are EventEmitter instances that implement read or write interfaces.

**Four stream types:**
- **Readable** — source of data (\`fs.createReadStream\`)
- **Writable** — destination (\`fs.createWriteStream\`, \`res\` in Express)
- **Duplex** — both readable and writable (TCP sockets)
- **Transform** — duplex that modifies data (\`zlib.createGzip\`)

\`\`\`js
const { createReadStream, createWriteStream } = require('fs');
const { createGzip } = require('zlib');

// Pipe: read file → gzip → write compressed file
createReadStream('large-file.txt')
  .pipe(createGzip())
  .pipe(createWriteStream('large-file.txt.gz'))
  .on('finish', () => console.log('Done'));

// Stream in Express response
app.get('/download', (req, res) => {
  res.setHeader('Content-Encoding', 'gzip');
  createReadStream('data.json').pipe(createGzip()).pipe(res);
});
\`\`\`

Streams are essential for processing files larger than available RAM, streaming HTTP responses, and building efficient data pipelines. Node 16+ supports the \`stream/promises\` API and \`pipeline\` for async/await-friendly piping with proper error handling.`,
      difficulty: 3,
      tags: 'streams,pipe,nodejs',
    },
    {
      title: 'What is clustering in Node.js and when should you use it?',
      answer: `Node.js runs on a single CPU core by default. The built-in \`cluster\` module (or \`worker_threads\`) allows you to spawn multiple processes to take advantage of multi-core CPUs.

\`\`\`js
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(\`Primary \${process.pid} running\`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork(); // spawn a worker
  }

  cluster.on('exit', (worker) => {
    console.log(\`Worker \${worker.process.pid} died — restarting\`);
    cluster.fork();
  });
} else {
  // Each worker runs the same code
  http.createServer((req, res) => {
    res.end('Hello from worker ' + process.pid);
  }).listen(3000);
}
\`\`\`

The OS handles load balancing between workers (round-robin on most platforms). Use clustering for CPU-bound request handling or to improve throughput under high concurrency. For production, prefer a process manager like **PM2** (\`pm2 start app.js -i max\`) which handles clustering, restarts, and monitoring automatically.`,
      difficulty: 3,
      tags: 'clustering,cpu,performance',
    },
    {
      title: 'How do you handle CORS in Express?',
      answer: `CORS (Cross-Origin Resource Sharing) is a browser security feature that blocks requests from a different origin. Express doesn't allow cross-origin requests by default — you need to add the appropriate headers.

\`\`\`js
const cors = require('cors');

// Simple: allow all origins (not recommended for production)
app.use(cors());

// Configured: allow specific origin with credentials
app.use(cors({
  origin: ['https://app.example.com', 'https://admin.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // allow cookies
  maxAge: 86400,     // preflight cache: 24h
}));

// Dynamic origin check
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.ALLOWED_ORIGINS?.split(',') ?? [];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
\`\`\`

Preflight requests (HTTP OPTIONS) are automatically handled by the \`cors\` middleware. For APIs that only serve your own frontend, restrict \`origin\` to your specific domain and avoid \`*\`.`,
      difficulty: 2,
      tags: 'cors,express,security',
    },
    {
      title: 'What is JWT and how do you implement token-based authentication?',
      answer: `JWT (JSON Web Token) is a compact, URL-safe format for transmitting claims between parties as a signed JSON payload. It consists of three base64url-encoded parts: header, payload, and signature.

\`\`\`js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

// Issue a token at login
app.post('/login', async (req, res) => {
  const user = await verifyCredentials(req.body);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    SECRET,
    { expiresIn: '15m' }           // short-lived access token
  );
  const refresh = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '7d' });

  res.json({ token, refresh });
});

// Verify middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
\`\`\`

**Security notes:** Store tokens in memory or httpOnly cookies (not localStorage). Use short expiry + refresh token rotation. Never put sensitive data in the payload — it's only signed, not encrypted.`,
      difficulty: 2,
      tags: 'jwt,authentication,security',
    },
    {
      title: 'What is environment configuration and how do you manage it in Node.js?',
      answer: `Environment variables separate configuration from code, allowing the same codebase to behave differently across environments (development, staging, production).

\`\`\`js
// .env file (never commit to git)
DATABASE_URL=postgres://localhost/myapp
JWT_SECRET=supersecret
PORT=3000

// Using dotenv
require('dotenv').config();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Validated config with defaults
const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  dbUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(\`Missing required env var: \${name}\`);
  return value;
}
\`\`\`

**Best practices:**
- Validate all required env vars at startup — fail fast rather than at runtime
- Use a schema validator like \`zod\` or \`envalid\` for typed, validated config
- Never commit secrets — use \`.gitignore\` for \`.env\` and use a secrets manager (Vault, AWS Secrets Manager) in production`,
      difficulty: 1,
      tags: 'environment,configuration,security',
    },
    {
      title: 'What is the difference between CommonJS and ES Modules in Node.js?',
      answer: `**CommonJS (CJS)** was Node's original module system. Modules are loaded synchronously with \`require()\` and export via \`module.exports\`.

**ES Modules (ESM)** are the JavaScript standard (ES2015). Modules are loaded asynchronously, use static \`import\`/\`export\` syntax, and support tree-shaking.

\`\`\`js
// CommonJS
const fs = require('fs');
const { readFile } = require('fs');
module.exports = { myFunction };
exports.myFunction = function() {};

// ES Modules (package.json: "type": "module" or .mjs extension)
import fs from 'fs';
import { readFile } from 'fs';
export function myFunction() {}
export default class MyClass {}
\`\`\`

**Key differences:**
- CJS: synchronous, dynamic (can \`require\` inside conditions), \`__dirname\`/\`__filename\` available
- ESM: static (imports must be top-level), supports top-level \`await\`, \`import.meta.url\` instead of \`__dirname\`
- CJS can \`require\` ESM via dynamic \`import()\`; ESM cannot \`import\` CJS named exports directly

Node 22 supports both. Most new projects should use ESM. Many libraries ship both CJS and ESM builds via the \`exports\` field in \`package.json\`.`,
      difficulty: 2,
      tags: 'commonjs,esm,modules',
    },
    {
      title: 'How do you structure a scalable Express application?',
      answer: `A scalable Express app separates concerns into layers: routing, controllers, services, repositories, and models.

\`\`\`
src/
├── app.ts              # Express setup, middleware registration
├── server.ts           # HTTP server, port binding
├── routes/             # Route definitions (thin — delegate to controllers)
│   └── users.ts
├── controllers/        # Handle req/res, call services
│   └── userController.ts
├── services/           # Business logic (no req/res dependency)
│   └── userService.ts
├── repositories/       # Database access (all SQL/ORM queries)
│   └── userRepository.ts
├── middleware/          # Auth, logging, error handling
├── config/              # Env config validation
└── types/               # Shared TypeScript types
\`\`\`

\`\`\`typescript
// Route: thin
router.post('/users', authenticate, createUser);

// Controller: request/response only
async function createUser(req: Request, res: Response) {
  const user = await userService.create(req.body);
  res.status(201).json(user);
}

// Service: business logic, no req/res
async function create(dto: CreateUserDto): Promise<User> {
  await validateEmail(dto.email);
  return userRepository.insert(dto);
}
\`\`\`

This separation makes services unit-testable without Express. Use dependency injection or module imports — avoid \`require\` cycles.`,
      difficulty: 3,
      tags: 'architecture,express,scalability',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
