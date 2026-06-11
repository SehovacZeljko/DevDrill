import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedCicdQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['cicd-basics']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is the difference between CI and CD?',
      answer: `**CI (Continuous Integration):** developers merge code changes frequently (multiple times per day) into a shared branch. Each merge triggers an automated build and test suite to detect integration errors early.

**CD (Continuous Delivery):** extends CI so that every build that passes tests is automatically prepared and ready to deploy to production. Deployment still requires a manual approval step.

**CD (Continuous Deployment):** goes further — every passing build is deployed to production automatically, with no manual gate.

\`\`\`
Developer → Push → CI Pipeline → CD Pipeline
                    ↓               ↓
                 Build           Deploy to staging
                 Lint            Run integration tests
                 Unit tests      Deploy to production
                 Security scan   (with approval for Delivery,
                 Docker build     automatic for Deployment)
\`\`\`

**Benefits of CI/CD:**
- Smaller, more frequent releases reduce risk
- Bugs found immediately, in context
- Automated quality gates prevent regressions
- Frees engineers from manual deployment steps
- Enables rapid iteration and feedback loops

The terms are sometimes used interchangeably — clarify what "CD" means in a specific organization.`,
      difficulty: 1,
      tags: 'ci,cd,devops',
    },
    {
      title: 'What is a CI/CD pipeline and what stages does it typically have?',
      answer: `A CI/CD pipeline is a sequence of automated steps that transform code commits into deployed software. Each stage is a quality gate — if a stage fails, the pipeline stops.

**Typical pipeline stages:**

\`\`\`yaml
# GitHub Actions example
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with: { name: build, path: dist/ }

  security:
    needs: build
    steps:
      - run: npm audit --audit-level=high
      - uses: aquasecurity/trivy-action@master

  deploy-staging:
    needs: [build, security]
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - run: docker build -t my-app:\${{ github.sha }} .
      - run: kubectl apply -f k8s/staging/

  deploy-production:
    needs: deploy-staging
    environment:
      name: production
      url: https://app.example.com
    # Manual approval configured via GitHub Environment protection rules
    steps:
      - run: kubectl apply -f k8s/production/
\`\`\`

Common stages: install → lint → test → build → security scan → containerize → deploy staging → smoke test → deploy production.`,
      difficulty: 2,
      tags: 'pipeline,github-actions,stages',
    },
    {
      title: 'What is GitHub Actions and how does a workflow work?',
      answer: `GitHub Actions is a CI/CD platform built into GitHub. Workflows are YAML files in \`.github/workflows/\` that define automated processes triggered by events.

\`\`\`yaml
name: Node.js CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 2am

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18, 20, 22]  # Test on multiple versions

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: \${{ secrets.CODECOV_TOKEN }}
\`\`\`

**Key concepts:**
- **Workflow** — the YAML file defining automation
- **Event** — what triggers the workflow (\`push\`, \`pull_request\`, \`schedule\`, \`workflow_dispatch\`)
- **Job** — a set of steps running on a runner (VM)
- **Step** — individual command or action
- **Action** — reusable unit from the Actions Marketplace
- **Secret** — encrypted environment variable stored in repo settings`,
      difficulty: 2,
      tags: 'github-actions,workflow,yaml',
    },
    {
      title: 'What is infrastructure as code and why does it matter?',
      answer: `Infrastructure as Code (IaC) manages and provisions cloud infrastructure through machine-readable config files rather than manual UI clicks or scripts. Infrastructure is defined, versioned, reviewed, and deployed like application code.

**Benefits:**
- **Reproducibility** — spin up identical environments consistently
- **Version control** — audit who changed what and when
- **Code review** — infrastructure changes go through PR review
- **Automation** — environments created in minutes, not days
- **Disaster recovery** — recreate entire infrastructure from code

**Popular IaC tools:**

**Terraform (declarative):**
\`\`\`hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
    Env  = "production"
  }
}

resource "aws_s3_bucket" "assets" {
  bucket = "my-app-assets-prod"
}
\`\`\`

**AWS CloudFormation / CDK** — native AWS IaC; CDK lets you write TypeScript/Python that compiles to CloudFormation templates.

**Ansible** — procedural, agent-less; great for configuration management and application deployment on existing servers.

**GitOps** (Argo CD, Flux) — applies IaC to Kubernetes, treating the Git repo as the source of truth for cluster state.`,
      difficulty: 2,
      tags: 'iac,terraform,infrastructure',
    },
    {
      title: 'What is a deployment strategy and what options exist?',
      answer: `A deployment strategy defines how new application versions are rolled out to production while minimizing downtime and risk.

**Rolling deployment:** replace instances one at a time. Some instances run the old version while others run the new version.
\`\`\`
v1 v1 v1 v1
v2 v1 v1 v1  ← replace one
v2 v2 v1 v1
v2 v2 v2 v2  ← done
\`\`\`

**Blue-Green deployment:** maintain two identical environments. Switch traffic from Blue (current) to Green (new) instantly. Easy rollback by switching back.
\`\`\`
Blue (v1) ← live traffic     Green (v2) ← deploy here, then switch
\`\`\`

**Canary release:** route a small percentage of traffic to the new version first. Gradually increase if metrics are healthy.
\`\`\`
95% → v1   5% → v2  → monitor → 50/50 → 100% v2
\`\`\`

**Feature flags:** deploy code to production but gate features behind flags. Separate deployment from release. Tools: LaunchDarkly, Unleash.

\`\`\`yaml
# Kubernetes canary with Argo Rollouts
spec:
  strategy:
    canary:
      steps:
        - setWeight: 10  # 10% traffic
        - pause: { duration: 5m }
        - analysis: { templates: [{ templateName: success-rate }] }
        - setWeight: 50
        - pause: { duration: 10m }
\`\`\``,
      difficulty: 2,
      tags: 'deployment,blue-green,canary',
    },
    {
      title: 'What is container orchestration and what does Kubernetes do?',
      answer: `Container orchestration automates deployment, scaling, networking, and management of containerized applications across clusters of machines.

**Kubernetes (K8s)** is the industry-standard orchestrator. Key concepts:

**Pod** — smallest deployable unit; one or more containers that share network/storage.

**Deployment** — manages replica sets of pods with rolling updates and rollback:
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: app
          image: my-app:1.2.3
          ports:
            - containerPort: 3000
          resources:
            requests: { cpu: "100m", memory: "128Mi" }
            limits:   { cpu: "500m", memory: "512Mi" }
\`\`\`

**Service** — stable DNS name + IP for a set of pods (load balancing).

**Ingress** — HTTP/HTTPS routing and TLS termination.

**ConfigMap / Secret** — inject configuration and sensitive data into pods.

**HPA (Horizontal Pod Autoscaler)** — scale pods based on CPU/memory metrics.

**What Kubernetes handles:** scheduling pods onto nodes, self-healing (restart failed containers), rolling updates, service discovery, and resource management.`,
      difficulty: 3,
      tags: 'kubernetes,orchestration,containers',
    },
    {
      title: 'What is environment promotion and why is it important?',
      answer: `Environment promotion is the practice of moving the same artifact (Docker image, build) through a series of environments before reaching production, with each environment providing a higher level of confidence.

**Typical promotion path:**
\`\`\`
Dev → Build CI → Staging → Pre-prod/UAT → Production
       (unit tests) (integration tests) (acceptance tests)
\`\`\`

**Key principle: deploy the same artifact everywhere.** Never rebuild between environments — rebuild = risk of introducing differences. Tag Docker images with the Git SHA and promote the same tag.

\`\`\`bash
# CI builds once
docker build -t my-app:$GIT_SHA .
docker push registry/my-app:$GIT_SHA

# Staging deploy
kubectl set image deployment/app app=registry/my-app:$GIT_SHA -n staging

# After tests pass — same image promoted to production
kubectl set image deployment/app app=registry/my-app:$GIT_SHA -n production
\`\`\`

**What each environment validates:**
- **Dev/CI** — unit tests, linting, type checking
- **Staging** — integration tests, smoke tests, external API mocks
- **Pre-prod** — performance testing, security scanning, UAT
- **Production** — canary or blue-green rollout with live monitoring

Environment promotion makes releases low-risk, auditable, and reversible.`,
      difficulty: 2,
      tags: 'environments,promotion,devops',
    },
    {
      title: 'What is observability and what are its three pillars?',
      answer: `Observability is the ability to understand a system's internal state by examining its external outputs. The three pillars are logs, metrics, and traces.

**1. Logs** — timestamped records of events. Good for debugging specific incidents.
\`\`\`js
logger.info('Order placed', { orderId, userId, amount, duration: '23ms' });
logger.error('Payment failed', { error: err.message, orderId, attempt: 3 });
\`\`\`
Tools: ELK Stack (Elasticsearch + Logstash + Kibana), Loki + Grafana.

**2. Metrics** — numerical measurements over time. Good for dashboards, alerting, and trend analysis.
\`\`\`js
// RED metrics: Rate, Errors, Duration
requestCounter.inc({ method: 'POST', route: '/orders', status: '201' });
responseDuration.observe({ route: '/orders' }, durationMs);
\`\`\`
Tools: Prometheus + Grafana, DataDog, CloudWatch.

**3. Traces** — tracks a request's journey through distributed services. Good for latency analysis and finding bottlenecks.
\`\`\`
Request: [API Gateway 5ms] → [Auth Service 3ms] → [Order Service 12ms]
                                                      ↳ [DB query 8ms]
\`\`\`
Tools: Jaeger, Zipkin, DataDog APM, OpenTelemetry (standard instrumentation layer).

**SLO/SLI/SLA:**
- **SLI (Service Level Indicator):** a metric (e.g., 99.5% of requests < 200ms)
- **SLO (Service Level Objective):** a target for an SLI (e.g., 99.9% uptime)
- **SLA (Service Level Agreement):** a contract with consequences for missing the SLO`,
      difficulty: 2,
      tags: 'observability,logs,metrics,traces',
    },
    {
      title: 'What is a health check and how do you implement one?',
      answer: `Health checks allow load balancers, orchestrators, and monitoring systems to determine if a service is ready to receive traffic or needs to be restarted.

**Two types:**

**Liveness probe:** is the application alive? If this fails, the orchestrator restarts the container.

**Readiness probe:** is the application ready to serve traffic? If this fails, the container is removed from load balancer rotation (but not restarted).

\`\`\`js
// Express health check endpoints
app.get('/healthz', (req, res) => {
  // Liveness: just check the process is running
  res.status(200).json({ status: 'ok' });
});

app.get('/ready', async (req, res) => {
  // Readiness: check all critical dependencies
  try {
    await db.query('SELECT 1');          // DB reachable
    await redis.ping();                   // Cache reachable
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});
\`\`\`

\`\`\`yaml
# Kubernetes probes
livenessProbe:
  httpGet:
    path: /healthz
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
\`\`\`

A startup probe (\`startupProbe\`) gives slow-starting applications time to initialize before liveness checks begin.`,
      difficulty: 2,
      tags: 'health-check,kubernetes,readiness',
    },
    {
      title: 'What is semantic versioning and how is it used in CI/CD?',
      answer: `Semantic versioning (SemVer) is a versioning scheme: **MAJOR.MINOR.PATCH** (e.g., \`2.4.1\`).

- **MAJOR:** breaking changes — existing users must update their code
- **MINOR:** new backward-compatible features
- **PATCH:** backward-compatible bug fixes

**Pre-release:** \`2.4.0-alpha.1\`, \`2.4.0-beta.3\`, \`2.4.0-rc.1\`
**Build metadata:** \`2.4.1+20240115\` (ignored in precedence)

**In CI/CD:**
\`\`\`bash
# Automated versioning with conventional commits
# Commit: "feat: add export feature" → minor bump (2.4.0 → 2.5.0)
# Commit: "fix: handle null user" → patch bump (2.4.0 → 2.4.1)
# Commit: "feat!: redesign API" → major bump (2.4.0 → 3.0.0)

# semantic-release automates this:
npm install -g semantic-release
# Analyzes commits, bumps version, generates CHANGELOG, creates GitHub release, publishes to npm
\`\`\`

**Docker image tagging strategy:**
\`\`\`bash
docker build -t my-app:2.5.0 -t my-app:2.5 -t my-app:2 -t my-app:latest .
# Multiple tags: exact version + rolling major/minor tags
# Never move tagged releases (2.5.0) — create new versions for fixes
\`\`\`

Avoid relying on the \`latest\` tag in production — always pin to an exact version for reproducible deployments.`,
      difficulty: 2,
      tags: 'semver,versioning,releases',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
