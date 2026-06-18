import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'What Docker Is and Why Containers Matter',
    content: `Docker packages an application together with everything it needs to run — code, runtime, system libraries, configuration — into a single, portable unit called a **container**, solving the perennial "it works on my machine" problem by making the runtime environment itself part of what gets shipped, rather than something the deployment target must happen to already have configured correctly.

A container is not a virtual machine: it doesn't boot its own operating system kernel. Instead, containers share the host machine's kernel and use OS-level isolation features (namespaces and cgroups, covered in the next lesson) to appear isolated from each other and from the host, which makes containers dramatically lighter and faster to start than VMs — milliseconds to seconds, versus the minute-plus boot time of a full VM.

\`\`\`text
VM:        [App A][Bins/Libs][Guest OS]  [App B][Bins/Libs][Guest OS]
                    Hypervisor                    Hypervisor
                              Host OS / Hardware

Container: [App A][Bins/Libs]   [App B][Bins/Libs]
                    Docker Engine
                    Host OS Kernel (shared) / Hardware
\`\`\`

The interview-relevant framing: Docker's core value isn't "smaller VMs" — it's **environment consistency** (the same image runs identically on a developer's laptop, a CI runner, and production) and **density** (many containers can run on one host since they don't each carry a full guest OS), which is exactly what makes container orchestration platforms like Kubernetes viable at scale.`,
  },
  {
    title: 'Images vs. Containers',
    content: `A **Docker image** is a read-only template — a packaged filesystem snapshot plus metadata (default command, exposed ports, environment variables) that defines what a container made from it will look like. A **container** is a running (or stopped) instance created from an image, with its own writable layer on top of the image's read-only layers.

The relationship mirrors a class and an object in object-oriented programming: one image can be instantiated into many independent running containers, each with its own state, network identity, and lifecycle, but all sharing the same underlying read-only image layers (saving disk space — multiple containers from the same image don't duplicate that image's data).

\`\`\`bash
docker build -t my-app:1.0 .      # build an image from a Dockerfile
docker run my-app:1.0             # create and start a new container from that image
docker run my-app:1.0             # create a second, independent container from the same image
docker ps                         # list running containers
docker images                     # list available images
\`\`\`

Images are built from **layers**, each corresponding to an instruction in the Dockerfile, and layers are cached and reused — if you change only the last instruction in a Dockerfile and rebuild, Docker reuses every cached layer above it unchanged, which is the foundation of fast iterative builds and is exactly why Dockerfile instruction *order* matters (covered in the layer caching lesson).`,
  },
  {
    title: 'Writing a Dockerfile',
    content: `A Dockerfile is a plain-text script of instructions describing how to build an image, executed top to bottom, with each instruction producing a new layer on top of the previous one.

\`\`\`dockerfile
FROM node:20-alpine          # base image to start from
WORKDIR /app                 # set working directory for subsequent instructions
COPY package*.json ./        # copy dependency manifests first
RUN npm ci                   # install dependencies (own layer, cached if manifests unchanged)
COPY . .                     # copy the rest of the application source
EXPOSE 3000                  # document the port the app listens on
CMD ["node", "server.js"]    # default command when a container starts
\`\`\`

Key instructions to know: \`FROM\` sets the base image (almost every Dockerfile starts from one, rather than from scratch); \`WORKDIR\` sets the directory subsequent instructions and the running container's shell operate in; \`COPY\`/\`ADD\` bring files from the build context into the image (\`ADD\` additionally supports remote URLs and auto-extracting archives, but \`COPY\` is preferred when those extras aren't needed, since its behavior is more predictable); \`RUN\` executes a command *at build time* and commits its result as a new layer; \`CMD\` specifies the default command executed *at container start time* (overridable by \`docker run\` arguments), while \`ENTRYPOINT\` defines a command that always runs, with \`CMD\`'s value passed to it as default arguments.

The interview-relevant distinction between \`RUN\` and \`CMD\`/\`ENTRYPOINT\`: \`RUN\` instructions execute during \`docker build\` and bake their result into the image (e.g. installing dependencies), while \`CMD\`/\`ENTRYPOINT\` only execute when a container is started from the finished image (e.g. launching the application process) — confusing the two is a very common beginner mistake.`,
  },
  {
    title: 'Layer Caching and Build Optimization',
    content: `Docker caches each layer of an image build, and on a rebuild, reuses a cached layer as long as the instruction that produced it and every instruction before it are unchanged — the moment one instruction's input changes, that layer and every layer after it must be rebuilt from scratch, even if those later instructions themselves didn't change.

This makes **instruction order** a real performance lever: instructions that change rarely (installing OS packages, installing dependencies from a manifest) should come before instructions that change on every build (copying application source code), so that an everyday code change only invalidates the few layers after the source copy, not the expensive dependency-installation layers.

\`\`\`dockerfile
# Good: dependencies cached separately from source code
COPY package*.json ./
RUN npm ci                # only re-runs if package*.json changed
COPY . .                  # changes on every code edit, but doesn't invalidate the npm ci layer above

# Bad: any source change invalidates the npm ci cache too
COPY . .
RUN npm ci                 # re-runs on every single code change, even unrelated ones
\`\`\`

A \`.dockerignore\` file (analogous to \`.gitignore\`) excludes files from the build context sent to the Docker daemon — excluding \`node_modules\`, \`.git\`, and build artifacts both speeds up the build (less data to transfer and hash for cache comparison) and avoids accidentally baking unwanted local files into the image. The interview-relevant takeaway: build caching isn't automatic optimization you get for free regardless of Dockerfile structure — writing a Dockerfile with cache-friendly instruction ordering is a deliberate skill that materially affects build times in a CI pipeline run dozens of times a day.`,
  },
  {
    title: 'Multi-Stage Builds',
    content: `A multi-stage build uses multiple \`FROM\` instructions in a single Dockerfile, where later stages can selectively copy artifacts from earlier stages — solving the problem of needing heavy build tooling (compilers, full SDKs, dev dependencies) to *produce* an artifact, without shipping all that tooling in the final production image.

\`\`\`dockerfile
# Stage 1: build (includes full Node toolchain and dev dependencies)
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build              # produces compiled output in /app/dist

# Stage 2: run (only the lightweight runtime, none of the build tooling)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
CMD ["node", "dist/server.js"]
\`\`\`

The final image only contains what's copied via \`COPY --from=builder\` plus whatever is added in the final stage — none of the \`builder\` stage's intermediate layers (full source, dev dependencies, build cache) end up in the shipped image, which typically produces a dramatically smaller final image (often an order of magnitude smaller for compiled languages) and a smaller attack surface (no compilers or build tools present in production).

This pattern is the standard, expected answer to "how do you keep production Docker images small while still using a full toolchain to build the application" — interviewers consider it a baseline best practice for any compiled or bundled application, not an advanced edge case.`,
  },
  {
    title: 'Container Networking Basics',
    content: `By default, Docker containers run in an isolated network namespace and communicate with the outside world (and each other) through Docker's networking layer, not by sharing the host's network stack directly.

The most common network driver, **bridge**, creates a private virtual network on the host; containers attached to the same bridge network can reach each other by container name (Docker provides automatic DNS resolution between containers on a user-defined bridge network) without needing to know IP addresses, while reaching the container from the host machine or outside world requires explicit **port publishing**.

\`\`\`bash
docker run -p 8080:80 my-web-app
# host port 8080 → forwarded to → container port 80
\`\`\`

\`EXPOSE\` in a Dockerfile only *documents* which ports the container listens on — it does not by itself make that port reachable from outside the container; \`-p hostPort:containerPort\` (or \`-P\` to auto-publish all exposed ports to random host ports) is what actually opens the connection from the host into the container.

For multi-container applications (e.g. an app server and a database), creating a dedicated user-defined bridge network and attaching both containers to it is the standard pattern — they can then reach each other by container name (e.g. an app server connecting to \`postgres:5432\` rather than a hardcoded IP), which is exactly the mechanism Docker Compose sets up automatically for services defined in the same compose file.`,
  },
  {
    title: 'Volumes and Persistent Data',
    content: `A container's writable layer is **ephemeral** by default — any data written inside a container (e.g. a database's data files) is lost when that container is removed, because the writable layer is deleted along with the container. Volumes solve this by storing data outside the container's own filesystem, in a location that survives container removal and recreation.

**Named volumes** are managed by Docker itself (stored in a Docker-managed location on the host, typically \`/var/lib/docker/volumes\`) and are the recommended default for persistent application data like database files — they survive \`docker rm\`, can be backed up/inspected via Docker's own tooling, and are portable across container recreations.

\`\`\`bash
docker run -v my-db-data:/var/lib/postgresql/data postgres
# named volume "my-db-data" persists postgres data even if the container is removed and recreated
\`\`\`

**Bind mounts** map a specific path on the host filesystem directly into the container — commonly used in local development to mount source code into a container so edits on the host are immediately visible inside the running container without rebuilding the image, but generally avoided for production data persistence since they couple the container to a specific host filesystem layout.

\`\`\`bash
docker run -v $(pwd)/src:/app/src my-dev-app
# host's ./src directory is mirrored live inside the container at /app/src
\`\`\`

The interview-relevant rule of thumb: use named volumes for data that must persist and be portable (databases, uploaded files), and bind mounts primarily for local development convenience — conflating the two, or assuming a container's internal filesystem is durable storage by default, is a common and costly mistake.`,
  },
  {
    title: 'Environment Variables and Configuration',
    content: `Containerized applications should be configured through environment variables rather than baked-in config files, so the same image can run unmodified across different environments (development, staging, production) by simply varying what's injected at runtime — this is one of the core tenets of the widely-cited "twelve-factor app" methodology.

\`\`\`bash
docker run -e DATABASE_URL=postgres://prod-host/db -e LOG_LEVEL=info my-app
docker run --env-file .env.production my-app    # load many variables from a file at once
\`\`\`

Inside a Dockerfile, \`ENV\` sets a default value baked into the image (useful for sensible defaults), while values passed via \`-e\`/\`--env-file\` at \`docker run\` time override those defaults — meaning the *image* should generally avoid hardcoding environment-specific values (a specific database hostname, a production API key) and instead rely on the deployer to supply them at runtime.

A critical security practice: secrets (API keys, database passwords) should never be baked into an image via \`ENV\` in the Dockerfile or hardcoded in application code, because anyone who can pull or inspect the image can extract them (image layers are inspectable even after the container is gone) — secrets belong in runtime-injected environment variables, a dedicated secrets manager, or an orchestrator's secrets mechanism (e.g. Kubernetes Secrets, Docker Swarm secrets), never committed into the image itself.`,
  },
  {
    title: 'Docker Compose for Multi-Container Applications',
    content: `Docker Compose lets you define and run a multi-container application (e.g. an API server, a database, a cache) from a single declarative YAML file, rather than manually running and networking multiple \`docker run\` commands — the standard tool for local development environments that mirror a production system's multiple services.

\`\`\`yaml
version: "3.9"
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://db:5432/myapp
    depends_on:
      - db
  db:
    image: postgres:16
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  db-data:
\`\`\`

\`\`\`bash
docker compose up        # build (if needed) and start all services
docker compose down      # stop and remove all containers, networks (volumes persist by default)
\`\`\`

Compose automatically creates a shared network for all services defined in the file, letting them reach each other by service name (the \`api\` service connects to \`db:5432\`, exactly as Docker's bridge networking DNS resolution works for any user-defined network) — there's no manual network setup required, which is a large part of why Compose is the standard local-development tool even for teams that deploy to Kubernetes in production, since the underlying networking concepts transfer directly.

\`depends_on\` controls *startup order* but, in its basic form, does not wait for the dependency to be actually *ready* (e.g. Postgres accepting connections) — only that its container has started — which is why applications connecting to a dependency at startup should implement their own retry/backoff logic rather than assuming \`depends_on\` guarantees readiness.`,
  },
  {
    title: 'Image Tagging and Versioning',
    content: `An image reference has the form \`[registry/]repository:tag\` (e.g. \`docker.io/library/node:20-alpine\`), where the **tag** identifies a specific version or variant of an image within a repository — omitting a tag implicitly uses \`:latest\`, which is a name, not a guarantee of recency, and is widely considered a bad practice for anything beyond local experimentation.

\`\`\`bash
docker build -t my-app:1.4.2 .       # explicit semantic version
docker build -t my-app:1.4 .         # minor version alias
docker tag my-app:1.4.2 my-app:latest # additional tag pointing at the same image
docker push my-registry.com/my-app:1.4.2
\`\`\`

The core problem with relying on \`:latest\` in production: it's mutable — the image that \`:latest\` points to today can be a completely different image tomorrow, which breaks reproducibility (you can't be certain what's actually running, or roll back reliably, if every deployment just says "run \`:latest\`") and makes rollbacks ambiguous (rolling back to "the previous \`:latest\`" requires remembering or recording what that was, since the tag itself doesn't preserve history).

The interview-relevant best practice: use immutable, specific tags in production deployments (a semantic version, or even better, a content-addressable digest like \`my-app@sha256:abc123...\`, which is guaranteed to reference the exact same image bytes forever), reserving \`:latest\` for convenience in local development where reproducibility matters less.`,
  },
  {
    title: 'Choosing Base Images and Reducing Image Size',
    content: `The base image chosen in a Dockerfile's \`FROM\` instruction has an outsized effect on the final image's size, security surface, and build time, since every layer in the base image is included in every image built from it.

Common base image tiers, from largest to smallest: a full OS image (e.g. \`ubuntu\`, several hundred MB, includes a complete package manager and userland — useful when you need broad OS tooling), a slimmed variant (e.g. \`node:20-slim\`, strips many non-essential packages while keeping a usable Debian base), an Alpine-based variant (e.g. \`node:20-alpine\`, built on musl libc and BusyBox instead of glibc/full coreutils — often 5-10x smaller, but occasionally surfaces subtle compatibility issues with native dependencies compiled against glibc), and **distroless** images (contain only the application and its runtime dependencies — no shell, no package manager at all — minimizing attack surface at the cost of being harder to debug interactively, since you can't \`docker exec\` into a shell that doesn't exist).

\`\`\`text
ubuntu:22.04        ~ 77MB
node:20-slim        ~ 200MB (includes Node runtime)
node:20-alpine       ~ 50MB (includes Node runtime)
gcr.io/distroless/nodejs20  ~ 40MB, no shell at all
\`\`\`

The interview-relevant tradeoff to name explicitly: smaller images reduce pull time (faster deployments, faster autoscaling), reduce attack surface (fewer installed packages means fewer potential vulnerabilities), and reduce storage/bandwidth costs at scale — but the smallest images (Alpine, distroless) sacrifice debuggability and occasionally compatibility, so the right choice depends on whether the team values minimal footprint or operational convenience more for a given service.`,
  },
  {
    title: 'Container Lifecycle and Process Management',
    content: `A container's lifecycle is tied directly to its main process (PID 1 inside the container): when that process exits, the container stops, regardless of whether other background processes the main process spawned are still running — this is a frequent source of confusion for engineers used to thinking of containers like lightweight VMs that keep running independently of any one process.

\`\`\`bash
docker run my-app          # container runs as long as the main process (CMD/ENTRYPOINT) is alive
docker stop my-container   # sends SIGTERM, waits a grace period, then SIGKILL if still running
docker logs my-container   # view stdout/stderr of the main process
docker exec -it my-container sh   # open an interactive shell inside a running container
\`\`\`

Because the container's main process plays the role of PID 1, it inherits responsibilities a normal init system would otherwise handle — notably, **reaping zombie child processes** and correctly handling signals like \`SIGTERM\` sent by \`docker stop\` for graceful shutdown. An application that doesn't explicitly handle \`SIGTERM\` may not shut down gracefully (e.g. finishing in-flight requests, closing database connections) and instead gets forcibly killed once Docker's grace period elapses, which can cause dropped requests or data corruption during routine deployments.

A common production fix for processes that don't handle PID 1 responsibilities well is using a minimal init wrapper (e.g. \`tini\`, which Docker can enable directly via the \`--init\` flag) as the actual PID 1, which correctly forwards signals to the application and reaps zombie processes on its behalf — worth mentioning when an interviewer probes "what happens when you send SIGTERM to a container that doesn't handle it."`,
  },
  {
    title: 'Health Checks and Restart Policies',
    content: `Docker can monitor whether a container is genuinely healthy — not just "the process hasn't crashed" but "the application is actually able to serve requests" — via a \`HEALTHCHECK\` instruction that periodically runs a command inside the container and considers the container unhealthy if it fails.

\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1
\`\`\`

This distinction matters because a process can technically still be running (so the container appears "up" from the outside) while being completely unable to serve traffic — e.g. deadlocked, out of database connections, or stuck waiting on an unresponsive dependency — and a basic "is the process alive" check would never catch that, while an application-level health endpoint can.

**Restart policies** control what Docker does when a container exits: \`no\` (default, never restart automatically), \`on-failure\` (restart only if it exits with a non-zero code, optionally up to a max retry count), \`always\` (always restart regardless of exit code, including after a manual stop followed by a daemon restart), and \`unless-stopped\` (always restart except when explicitly stopped by the user).

\`\`\`bash
docker run --restart unless-stopped my-app
\`\`\`

The interview-relevant combination: health checks feed into orchestrator-level decisions (e.g. a load balancer or orchestrator removing an unhealthy container from rotation, or a restart policy bringing a crashed container back automatically) — together, they're the foundation of self-healing infrastructure that doesn't require a human to notice and manually restart a failed service.`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'Linux Namespaces and Cgroups: How Container Isolation Actually Works',
    content: `Docker containers achieve isolation using two Linux kernel features directly, with no virtualization layer involved: **namespaces** (isolate what a process can *see*) and **cgroups** (control groups, limit what a process can *use*).

Each namespace type isolates a different kind of resource: the **PID namespace** gives a container its own process ID numbering (the container's main process appears as PID 1 inside the container, even though it has a different, ordinary PID on the host); the **network namespace** gives a container its own network interfaces, IP addresses, and routing table, isolated from the host's; the **mount namespace** gives a container its own filesystem view (so a container sees its own root filesystem, not the host's); and the **UTS namespace** isolates hostname and domain name.

\`\`\`text
Host sees:       PID 4821 (actually the container's "PID 1")
Inside container: PID 1   (the same process, viewed through the PID namespace)
\`\`\`

**Cgroups** (control groups) impose resource *limits and accounting* — how much CPU, memory, disk I/O, or network bandwidth a process (and its children) may consume — which is how \`docker run --memory=512m --cpus=1\` actually enforces those limits at the kernel level, and is also how a misbehaving container can be prevented from starving the rest of the host's workloads of resources.

The interview-relevant synthesis: a container is not a separate, sandboxed mini-operating-system — it's an ordinary Linux process, given a restricted *view* of the system via namespaces and a *resource budget* via cgroups, all enforced directly by the host kernel that the container transparently shares. This is also precisely why containers can't run a different kernel than the host (e.g. you cannot run a Windows container on a Linux host's kernel directly) — whereas a VM, with its own full kernel, can.`,
  },
  {
    title: 'Container Security: Attack Surface and Hardening',
    content: `Because containers share the host kernel, a container security vulnerability has a more direct path to host compromise than a VM escape does — there's no second kernel boundary to break through — which makes deliberate hardening practices more consequential than they might first appear.

Key hardening practices: **run as a non-root user** inside the container (the default is root unless explicitly changed, and a process running as root inside the container that escapes container isolation, e.g. via a kernel vulnerability, would have root privileges on the host too) —

\`\`\`dockerfile
RUN adduser --disabled-password appuser
USER appuser
\`\`\`

— **minimize the attack surface** by using minimal base images (Alpine, distroless — fewer installed packages means fewer potential CVEs to patch and exploit), **scan images for known vulnerabilities** (tools like Trivy or Docker Scout check installed packages against CVE databases as part of a CI pipeline, failing the build if critical vulnerabilities are found), and **drop unnecessary Linux capabilities** (a container by default has a reduced but still non-trivial set of Linux capabilities; \`--cap-drop=ALL --cap-add=NET_BIND_SERVICE\` explicitly grants back only what's actually needed, following the principle of least privilege).

\`\`\`bash
docker run --cap-drop=ALL --read-only --user 1000:1000 my-app
\`\`\`

\`--read-only\` mounts the container's root filesystem as read-only, so even a compromised process inside the container can't persist malicious changes to the container's own filesystem (any directory genuinely needing write access, like a temp directory, must be explicitly mounted as a writable volume on top) — the interview-relevant theme across all these practices is the same principle of least privilege applied at every layer: user, filesystem, and kernel capabilities.`,
  },
  {
    title: 'Container Orchestration: Why Kubernetes Exists',
    content: `Running a handful of containers manually with \`docker run\` works fine on one machine, but production systems typically need many containers spread across many machines, with automatic recovery from failures, rolling updates without downtime, and dynamic scaling — problems that Docker alone doesn't solve, which is the gap **orchestrators** like Kubernetes fill.

Core orchestration responsibilities: **scheduling** (deciding which machine in a cluster runs which container, based on available resources), **self-healing** (automatically restarting or rescheduling containers that crash or whose host machine fails — without a human noticing and manually intervening), **service discovery and load balancing** (giving a group of identical container replicas a stable network identity that other services can reliably reach, even as individual replicas are created and destroyed), **rolling updates and rollbacks** (replacing old container versions with new ones gradually, with automatic rollback if the new version's health checks fail), and **scaling** (adding or removing container replicas in response to load, manually or automatically).

\`\`\`text
Docker alone:  you run/stop containers on individual machines manually
Kubernetes:    you declare "I want 5 replicas of this container, with these resource limits"
               → Kubernetes continuously works to make reality match that declaration
\`\`\`

Kubernetes' fundamental model is **declarative**: rather than issuing imperative commands ("start this container"), you describe the desired end state (a YAML manifest saying "5 replicas of this image should be running"), and a continuously running control loop compares actual cluster state to desired state and takes corrective action whenever they diverge — including when a node crashes and its containers need rescheduling elsewhere, entirely without manual intervention. The interview-relevant framing: Docker solves "how do I package and run one container reliably"; Kubernetes solves "how do I run many containers reliably across many machines," and the two operate at genuinely different layers of the stack.`,
  },
  {
    title: 'Container Registries and Image Distribution',
    content: `A **container registry** stores and distributes images — Docker Hub is the best-known public registry, but most production teams run or use a private registry (AWS ECR, Google Artifact Registry, GitHub Container Registry, or a self-hosted registry) to control access to proprietary images and avoid public registry rate limits.

\`\`\`bash
docker login my-registry.com
docker tag my-app:1.0 my-registry.com/team/my-app:1.0
docker push my-registry.com/team/my-app:1.0
docker pull my-registry.com/team/my-app:1.0
\`\`\`

Images are pulled and pushed in **layers**: when pulling an image, Docker only downloads layers it doesn't already have cached locally (matched by content hash), which is why pulling a new version of an image that shares most layers with a version you already have is typically much faster than the full image size would suggest — this is the same caching mechanism that makes multi-stage and well-ordered Dockerfiles fast to build, applied to distribution instead of building.

A production-relevant security practice is **image signing and verification** (e.g. via Docker Content Trust or Sigstore/cosign) — cryptographically signing an image when it's pushed and verifying that signature before allowing it to be pulled or deployed, which prevents a compromised or tampered registry (or a man-in-the-middle during transfer) from silently substituting a malicious image for the legitimate one a deployment pipeline expects to run.`,
  },
  {
    title: 'Networking Drivers Beyond the Default Bridge',
    content: `Beyond the default bridge network covered in the fundamentals, Docker supports several other network drivers, each suited to a different deployment scenario.

**Host networking** (\`--network host\`) removes network isolation entirely — the container shares the host's network namespace directly, so a process listening on port 3000 inside the container is listening on port 3000 on the host itself, with no port-mapping translation layer. This eliminates the small overhead of Docker's network address translation, which occasionally matters for latency-sensitive or high-throughput workloads, but sacrifices network isolation and means two containers using host networking can't both bind the same port.

**Overlay networks** extend a virtual network across multiple physical Docker hosts (used by Docker Swarm and conceptually similar to what Kubernetes' pod networking provides) — letting containers on different machines communicate as if they were on the same local network, which is essential for any multi-host container deployment, since the default bridge network is confined to a single host.

\`\`\`text
Bridge:   isolated virtual network on one host, with NAT to/from the host
Host:     no isolation — container shares the host's actual network stack
Overlay:  virtual network spanning multiple hosts, so cross-host containers can reach each other directly
None:     no networking at all — fully isolated, used for batch jobs with no network requirement
\`\`\`

The interview-relevant takeaway: the choice of network driver is a real architectural decision, not a default to leave unexamined — bridge networking (the default) suits most single-host development and simple deployments, while multi-host production deployments require either an overlay network (Swarm) or an orchestrator-provided pod network (Kubernetes) to let containers across different physical machines communicate.`,
  },
  {
    title: 'Resource Limits and the Noisy Neighbor Problem',
    content: `Without explicit resource limits, a single misbehaving or simply unexpectedly busy container can consume most of a host's CPU or memory, starving every other container sharing that host — the classic **noisy neighbor problem** that resource limits (enforced via cgroups, as covered in the kernel internals lesson) exist specifically to prevent.

\`\`\`bash
docker run --memory=512m --memory-swap=512m --cpus=1.5 my-app
\`\`\`

**Memory limits** are enforced strictly: if a container exceeds its memory limit, the kernel's out-of-memory killer terminates a process inside that container (commonly surfaced as exit code 137, "OOMKilled") rather than letting it consume host memory beyond its budget — which means memory limits set too low for an application's actual peak usage cause mysterious crashes under load, a frequent real-world debugging scenario worth recognizing by the telltale exit code.

**CPU limits** work differently — they don't kill anything, but throttle: a container limited to \`--cpus=1.5\` can use up to 1.5 CPU cores' worth of time, and if it tries to use more, the kernel scheduler simply gives it less CPU time relative to other processes, causing the application to slow down rather than crash.

The interview-relevant point for any multi-tenant or shared-infrastructure design question: setting resource **requests** (a guaranteed minimum, used for scheduling decisions) separately from resource **limits** (a hard ceiling) — the model Kubernetes uses explicitly — lets an orchestrator both guarantee a baseline of resources to every workload and prevent any single workload from monopolizing a shared host, addressing the noisy neighbor problem at the scheduling level, not just the enforcement level.`,
  },
  {
    title: 'Logging and Observability for Containerized Applications',
    content: `Docker's logging model assumes applications write logs to **stdout/stderr** rather than to files inside the container — \`docker logs\` simply surfaces whatever the container's main process wrote to those streams — which aligns with twelve-factor app principles and matters because a container's filesystem is ephemeral (logs written to a file inside the container are lost when the container is removed, unless explicitly persisted to a volume).

\`\`\`bash
docker logs -f my-container         # follow stdout/stderr in real time
docker logs --since 10m my-container # logs from the last 10 minutes
\`\`\`

At production scale, relying on \`docker logs\` per-container doesn't work — with potentially hundreds of ephemeral, frequently-recreated containers, logs need to be **aggregated centrally**. The standard pattern is a log driver or sidecar agent (e.g. Fluentd, Logstash, or a cloud provider's logging agent) that ships each container's stdout/stderr to a centralized log store (e.g. Elasticsearch, CloudWatch Logs, Datadog) as it's produced, so logs survive container removal and can be searched/correlated across the whole fleet rather than one container at a time.

Beyond logs, full observability for containerized systems also requires **metrics** (CPU/memory/request-rate time series, often scraped via Prometheus from an endpoint the application exposes) and **distributed tracing** (following a single request's path across multiple containerized services, since a single user request in a microservices architecture often touches many containers) — the interview-relevant point being that container ephemerality specifically breaks the assumption that you can SSH into "the machine" later to inspect what happened, making proactive, centralized observability a requirement rather than a nice-to-have.`,
  },
  {
    title: 'Container Image Vulnerability Scanning in CI',
    content: `Embedding automated vulnerability scanning into the build pipeline catches known-vulnerable dependencies (in OS packages or application dependencies baked into an image) before that image is ever deployed, rather than discovering the vulnerability after the fact via a security audit or, worse, an actual exploit.

\`\`\`yaml
# Example CI step (tool-agnostic pattern)
- name: Scan image for vulnerabilities
  run: trivy image --severity HIGH,CRITICAL --exit-code 1 my-app:\${{ github.sha }}
\`\`\`

These scanners compare every installed package's version against continuously updated CVE (Common Vulnerabilities and Exposures) databases, flagging known-vulnerable versions — \`--exit-code 1\` (or equivalent) causes the scan step itself to fail the build when vulnerabilities at or above a configured severity threshold are found, which is what actually blocks a vulnerable image from progressing further in the pipeline rather than merely reporting the issue for someone to notice later.

A practical operational nuance: vulnerability databases update continuously, so an image considered "clean" at build time can later be found vulnerable as new CVEs are disclosed against packages it contains — which is why production systems typically also run **periodic re-scans of already-deployed images**, not just at build time, and why minimizing the base image and installed package count (covered in the base image lesson) directly reduces the number of things that can later be found vulnerable.`,
  },
  {
    title: 'Stateful Containers and Database Workloads',
    content: `Running a database inside a container is common in development and even production, but it surfaces sharper versions of problems that don't matter as much for stateless application containers — because the entire value of a database is the durability and consistency of its data, and containers were originally designed around ephemeral, stateless processes.

The core requirement is **persistent storage that outlives the container**: a database container must always be run with its data directory mounted to a named volume (or, in an orchestrated environment, a persistent volume backed by durable network storage), never relying on the container's own writable layer — losing that volume means losing the data, full stop, which is a fundamentally different risk profile than losing a stateless API server container (which can simply be recreated with no data loss).

\`\`\`bash
docker run -v pg-data:/var/lib/postgresql/data postgres:16
# pg-data volume must be backed up independently — it IS the durable state
\`\`\`

Scaling a stateful container also doesn't work like scaling a stateless one: you can't simply run three identical replicas of a single-writer database container behind a load balancer the way you would an API server, because each replica would have its own independent, diverging data directory — true database scaling requires the database's own replication mechanism (leader-follower, as covered in the system design replication lesson) or a purpose-built distributed database, not container orchestration primitives alone.

In Kubernetes specifically, this distinction is formalized: stateless workloads use a **Deployment** (replicas are interchangeable, any can be killed and replaced freely), while stateful workloads like databases use a **StatefulSet** (each replica gets a stable, persistent identity and its own dedicated persistent volume that follows it across rescheduling) — recognizing why a database needs the latter, not the former, is a strong signal of genuine container orchestration understanding.`,
  },
  {
    title: 'Building Minimal, Production-Grade Images: A Worked Example',
    content: `Pulling together layer caching, multi-stage builds, base image selection, and non-root users into a single realistic example clarifies how these practices compose in a production Dockerfile, rather than being independent isolated techniques.

\`\`\`dockerfile
# Stage 1: install dependencies and build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                          # cached unless package*.json changes
COPY . .
RUN npm run build                   # produces /app/dist

# Stage 2: production runtime, minimal and non-root
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
\`\`\`

Walking through why each piece is there: the **builder stage** uses the full toolchain needed to install dev dependencies and compile, but none of that ships in the final image; **\`npm ci\` instead of \`npm install\`** is used deliberately in CI/build contexts because it installs exact versions from the lockfile and fails if the lockfile is out of sync, rather than potentially resolving slightly different versions; **a dedicated non-root user** is created and switched to before the application runs; **\`npm cache clean --force\`** removes npm's download cache from the final layer, since it provides no runtime value and only adds image size; and the **\`HEALTHCHECK\`** gives the orchestrator a real signal of application health, not just process liveness.

The interview-relevant takeaway: a "production-grade" Dockerfile isn't one exotic technique — it's the deliberate, simultaneous application of several individually simple practices (multi-stage builds, cache-aware layer ordering, minimal base image, non-root user, health checks), each addressing a distinct concern (size, security, build speed, observability), composed together.`,
  },
  {
    title: 'Docker Storage Drivers and Layer Internals',
    content: `Docker stores image layers using a **union filesystem** (commonly \`overlay2\` on Linux today) that lets multiple read-only layers be stacked and presented to a container as a single, merged filesystem view, with a thin writable layer on top capturing any changes the container makes — this is the actual mechanism behind "images are layers, containers add one writable layer," not just a conceptual simplification.

\`\`\`text
Container's writable layer  (changes made while running — lost when the container is removed)
Image layer N (e.g. COPY . .)
Image layer 2 (e.g. RUN npm ci)
Image layer 1 (e.g. FROM node:20-alpine)
\`\`\`

\`overlay2\` works via **copy-on-write**: reading a file that exists in a lower (read-only) layer is served directly from that layer with no duplication, but writing to a file that exists in a lower layer first copies it up into the container's writable layer, then modifies the copy — the original lower-layer file is untouched, which is also exactly why deleting a file inside a running container doesn't shrink the image's lower layers; it just adds a "whiteout" marker in the writable layer hiding that file from the merged view.

The interview-relevant consequence of copy-on-write: write-heavy workloads inside a container that constantly rewrite large files (e.g. a database doing heavy disk I/O directly inside the container's writable layer rather than a mounted volume) incur real performance overhead from this copy-up mechanism — which is yet another concrete reason (beyond durability) that database data directories should be mounted as volumes rather than left on the container's own writable layer: volumes bypass the union filesystem entirely and write straight to the host filesystem.`,
  },
  {
    title: 'Comparing Docker to Alternative Container Runtimes',
    content: `"Docker" is often used as shorthand for containerization generally, but the actual container runtime ecosystem has multiple distinct layers, and understanding the split clarifies why tools like Podman or containerd exist alongside Docker rather than merely competing with it.

At the lowest level, the **Open Container Initiative (OCI)** defines standard specifications for container images and runtimes, so that an image built by one tool can be run by any OCI-compliant runtime — **containerd** and **CRI-O** are low-level runtimes implementing this spec, actually responsible for pulling images and starting/stopping containers, and notably, **Docker itself uses containerd internally** as its runtime layer rather than implementing low-level container execution from scratch.

\`\`\`text
Docker CLI/daemon  →  containerd  →  runc  →  Linux kernel (namespaces/cgroups)
Kubernetes          →  containerd or CRI-O  →  runc  →  Linux kernel
\`\`\`

**Podman** is a daemonless alternative to the Docker CLI/daemon that can run OCI-compliant images built by Docker without modification (since they share the same OCI image spec) — its main distinguishing features are not requiring a long-running root daemon (Docker's daemon traditionally runs as root, a security consideration) and natively supporting **rootless containers** (running containers without root privileges at all, reducing the impact of a container escape).

The interview-relevant takeaway: "Docker" the company popularized containers and still provides the most common developer-facing tooling, but the actual runtime internals are standardized (OCI) and shared across the ecosystem — Kubernetes, for instance, doesn't depend on the Docker daemon specifically, it depends on any OCI/CRI-compliant runtime, which is why Kubernetes deprecating direct Docker-daemon support in favor of containerd had little practical effect on most users: the images and workflows remained compatible.`,
  },
];

export function seedDockerLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['docker']);
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
