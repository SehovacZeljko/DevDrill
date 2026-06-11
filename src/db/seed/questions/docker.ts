import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedDockerQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['docker']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is Docker and why is it used?',
      answer: `Docker is a platform for building, shipping, and running applications in **containers**. A container packages the application, its runtime, libraries, and configuration into an isolated unit that runs consistently across environments.

**Problems Docker solves:**
- "It works on my machine" — containers include all dependencies
- Environment parity — dev, staging, and production run the same image
- Dependency isolation — multiple apps with conflicting dependencies coexist
- Fast startup — containers start in milliseconds vs minutes for VMs

**Docker vs Virtual Machines:**
\`\`\`
VM:        [App] [App]
           [Guest OS] [Guest OS]
           [Hypervisor]
           [Host OS + Hardware]

Docker:    [App] [App] [App]
           [Container Runtime]
           [Host OS + Hardware]  ← shares host kernel
\`\`\`

Containers are lighter (MBs vs GBs), start faster, and use less memory than VMs because they share the host OS kernel. VMs provide stronger isolation (separate kernel).

**Core Docker objects:** Image (read-only template), Container (running instance of an image), Volume (persistent storage), Network (container communication).`,
      difficulty: 1,
      tags: 'docker,containers,basics',
    },
    {
      title: 'What is the difference between a Docker image and a container?',
      answer: `**Image:** a read-only, layered template built from a Dockerfile. It's like a class definition — static, immutable, shareable.

**Container:** a running instance of an image. It's like an object instantiated from a class — stateful, ephemeral, isolated. Multiple containers can run from the same image simultaneously.

\`\`\`bash
# Pull an image from Docker Hub
docker pull node:20-alpine

# List local images
docker images

# Run a container from an image
docker run -d -p 3000:3000 --name my-app node:20-alpine

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Execute a command in a running container
docker exec -it my-app sh

# Stop a container (SIGTERM → SIGKILL after grace period)
docker stop my-app

# Remove a stopped container
docker rm my-app

# Remove an image
docker rmi node:20-alpine
\`\`\`

**Key distinction:** stopping a container doesn't delete it. The container's filesystem changes persist until you \`docker rm\`. For truly persistent data (databases), use volumes — they survive container removal.`,
      difficulty: 1,
      tags: 'image,container,difference',
    },
    {
      title: 'What is a Dockerfile and what are its key instructions?',
      answer: `A Dockerfile is a text file containing instructions to build a Docker image. Each instruction creates a new layer in the image.

\`\`\`dockerfile
# Base image
FROM node:20-alpine AS base

# Set working directory inside container
WORKDIR /app

# Copy dependency files first (cache optimization)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Environment variable with default
ENV PORT=3000

# Document that the container listens on this port
EXPOSE 3000

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Command to run the application
CMD ["node", "server.js"]
\`\`\`

**Key instructions:**
- \`FROM\` — base image (always first)
- \`WORKDIR\` — set working directory
- \`COPY\` / \`ADD\` — copy files into image
- \`RUN\` — execute command during build (creates a layer)
- \`ENV\` — set environment variable
- \`EXPOSE\` — documentation; doesn't actually publish the port
- \`CMD\` — default command (overridable at runtime)
- \`ENTRYPOINT\` — fixed command; \`CMD\` becomes its arguments
- \`ARG\` — build-time variable (not available at runtime)

**Layer caching:** Docker reuses cached layers if nothing above has changed. Copy \`package.json\` before source code to cache \`npm install\`.`,
      difficulty: 1,
      tags: 'dockerfile,build,instructions',
    },
    {
      title: 'What is Docker Compose and when do you use it?',
      answer: `Docker Compose defines and runs multi-container applications using a YAML file. It's ideal for local development environments with multiple services.

\`\`\`yaml
# docker-compose.yml
version: '3.9'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/myapp
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    volumes:
      - .:/app          # bind mount for live reload in dev
      - /app/node_modules

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
\`\`\`

\`\`\`bash
docker compose up -d          # start all services in background
docker compose logs -f app    # tail app logs
docker compose down -v        # stop and remove containers + volumes
docker compose exec app sh    # shell into running container
\`\`\``,
      difficulty: 2,
      tags: 'docker-compose,multi-container,development',
    },
    {
      title: 'What are Docker volumes and how do they differ from bind mounts?',
      answer: `Volumes and bind mounts both persist data outside a container's writable layer, but they differ in where data is managed.

**Volumes** — managed by Docker in \`/var/lib/docker/volumes/\`:
\`\`\`bash
# Create a named volume
docker volume create pgdata

# Use in run command
docker run -v pgdata:/var/lib/postgresql/data postgres

# In docker-compose (preferred)
volumes:
  pgdata:  # Docker manages location
\`\`\`

**Bind mounts** — map a host filesystem path directly into the container:
\`\`\`bash
docker run -v /host/path:/container/path my-image
# or
docker run -v $(pwd)/src:/app/src my-image  # live code reload
\`\`\`

| | Named Volume | Bind Mount |
|---|---|---|
| Managed by | Docker | Host OS |
| Portability | Yes | No (host path) |
| Performance | Better on Docker Desktop | Better on Linux |
| Use case | Databases, persistent data | Development code sharing |

**tmpfs mounts** — data in memory, not persisted (useful for secrets or temp files):
\`\`\`bash
docker run --tmpfs /tmp my-image
\`\`\`

Use named volumes for production data persistence and bind mounts for development hot-reload.`,
      difficulty: 2,
      tags: 'volumes,bind-mounts,persistence',
    },
    {
      title: 'What is the difference between COPY and ADD in a Dockerfile?',
      answer: `Both copy files from the build context into the image, but \`ADD\` has extra behavior that makes it unpredictable.

**\`COPY\`** — simply copies files or directories. Preferred for most use cases.
\`\`\`dockerfile
COPY package*.json ./
COPY src/ ./src/
COPY --chown=node:node . .  # copy with ownership
\`\`\`

**\`ADD\`** — does everything \`COPY\` does, plus:
- Automatically extracts local tar archives (\`.tar.gz\`, \`.tar.bz2\`)
- Can fetch files from a URL (but no checksum verification — security risk)

\`\`\`dockerfile
# COPY is equivalent and safer
COPY archive.tar.gz .   # does NOT extract — copies as-is

# ADD automatically extracts
ADD archive.tar.gz .    # extracts to current directory
\`\`\`

**Best practice:** always use \`COPY\` unless you specifically need tar extraction. The implicit behavior of \`ADD\` is surprising and can cause unintended file placement. For fetching remote files, use \`RUN curl\` with explicit checksum verification instead of \`ADD\`.

This is one of Docker's historical design quirks — the Docker team themselves recommends \`COPY\` over \`ADD\` in most documentation.`,
      difficulty: 1,
      tags: 'copy,add,dockerfile',
    },
    {
      title: 'What are Docker networks?',
      answer: `Docker networks control how containers communicate with each other and the outside world.

**Default network drivers:**

**bridge (default):** containers on the same bridge network can communicate by container name. Isolated from the host.
\`\`\`bash
docker network create my-network
docker run --network my-network --name api my-api-image
docker run --network my-network --name db postgres
# 'api' container can reach postgres at hostname 'db'
\`\`\`

**host:** container uses the host's network stack directly — no network isolation. Highest performance, lowest security.
\`\`\`bash
docker run --network host my-image
# App on port 3000 is accessible at host's port 3000 directly
\`\`\`

**none:** container has no network access.

**overlay:** multi-host networking for Docker Swarm.

\`\`\`yaml
# docker-compose automatically creates a default bridge network
# All services can reach each other by service name
services:
  app:
    networks:
      - backend
      - frontend
  db:
    networks:
      - backend  # db not accessible from frontend network

networks:
  backend:
  frontend:
\`\`\`

Network segmentation is a security best practice — only connect services that need to communicate directly.`,
      difficulty: 2,
      tags: 'networks,bridge,docker',
    },
    {
      title: 'What are multi-stage builds in Docker?',
      answer: `Multi-stage builds allow you to use multiple \`FROM\` instructions in a single Dockerfile. Each stage can copy artifacts from previous stages. This keeps the final image lean by excluding build tools, source code, and intermediate dependencies.

\`\`\`dockerfile
# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build  # generates /build/dist

# Stage 2: production image
FROM node:20-alpine AS production
WORKDIR /app

# Copy only the compiled output from the builder stage
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules

ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
\`\`\`

**Result:**
- Builder image: ~500MB (includes dev deps, TypeScript, source maps)
- Production image: ~80MB (just the compiled output + production deps)

\`\`\`bash
# Build only a specific stage (useful for testing)
docker build --target builder -t my-app:builder .

# Build production image
docker build -t my-app:latest .
\`\`\`

Multi-stage builds are essential for compiled languages (Go, Rust, TypeScript) and any project where the build toolchain is much larger than the runtime.`,
      difficulty: 2,
      tags: 'multi-stage,build,optimization',
    },
    {
      title: 'What is the difference between CMD and ENTRYPOINT?',
      answer: `Both specify what command runs when a container starts, but they interact differently with runtime overrides.

**CMD** — default command; completely replaced if you pass arguments to \`docker run\`:
\`\`\`dockerfile
CMD ["node", "server.js"]
\`\`\`
\`\`\`bash
docker run my-image               # runs: node server.js
docker run my-image npm test      # runs: npm test (CMD replaced)
\`\`\`

**ENTRYPOINT** — fixed command; \`docker run\` arguments are appended as arguments to the entrypoint:
\`\`\`dockerfile
ENTRYPOINT ["node"]
CMD ["server.js"]          # default argument
\`\`\`
\`\`\`bash
docker run my-image           # runs: node server.js
docker run my-image index.js  # runs: node index.js (CMD replaced, ENTRYPOINT fixed)
\`\`\`

**Shell vs exec form:**
\`\`\`dockerfile
# Shell form — runs in sh -c; PID 1 is sh (signals not forwarded)
CMD node server.js

# Exec form — runs directly; PID 1 is node (handles SIGTERM properly)
CMD ["node", "server.js"]
\`\`\`

**Best practice:** use exec form (\`["...","..."]\`) for proper signal handling. Use \`ENTRYPOINT\` for the executable and \`CMD\` for default arguments — makes the container act like a command-line tool.`,
      difficulty: 2,
      tags: 'cmd,entrypoint,signals',
    },
    {
      title: 'What are Docker security best practices?',
      answer: `**1. Run as non-root:**
\`\`\`dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser  # never run as root in production
\`\`\`

**2. Use minimal base images:**
\`\`\`dockerfile
# Avoid: FROM ubuntu (1.2GB, many attack surfaces)
# Prefer: FROM node:20-alpine (180MB)
# Better: FROM gcr.io/distroless/nodejs20 (no shell, no package manager)
\`\`\`

**3. Scan images for vulnerabilities:**
\`\`\`bash
docker scout cves my-image:latest
trivy image my-image:latest
\`\`\`

**4. Never store secrets in images:**
\`\`\`dockerfile
# Wrong — baked into image layer
ENV DB_PASSWORD=supersecret

# Correct — inject at runtime
docker run -e DB_PASSWORD=$DB_PASSWORD my-image
# Or use Docker secrets (Swarm) / Kubernetes secrets
\`\`\`

**5. Use read-only filesystem:**
\`\`\`bash
docker run --read-only --tmpfs /tmp my-image
\`\`\`

**6. Limit capabilities and resources:**
\`\`\`bash
docker run \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  --memory 512m \
  --cpus 0.5 \
  --security-opt no-new-privileges \
  my-image
\`\`\`

**7. Use \`.dockerignore\`** to exclude sensitive files (\`.env\`, \`node_modules\`, \`.git\`) from the build context.`,
      difficulty: 2,
      tags: 'security,best-practices,docker',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
