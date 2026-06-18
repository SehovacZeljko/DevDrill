import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'What CI/CD Is and Why It Exists',
    content: `**Continuous Integration (CI)** is the practice of frequently merging code changes into a shared branch and automatically building and testing them on every change, catching integration problems within minutes of being introduced rather than days or weeks later when many changes have piled up and the cause of a failure is far harder to isolate. **Continuous Delivery/Deployment (CD)** extends that automation to actually getting validated code into the hands of users — delivery means it's automatically packaged and ready to release with a manual approval step, deployment means it goes live automatically with no human gate at all.

Before CI/CD, the common pattern was long-lived feature branches merged infrequently, followed by a manual, often dreaded "integration phase" where conflicting changes from many developers had to be reconciled all at once — a problem that scales badly as team size grows, since the number of potential pairwise conflicts grows with the number of contributors and the length of time changes diverge before merging.

\`\`\`text
Without CI:  many developers code in isolation for weeks → big-bang merge → integration hell
With CI:     every developer merges small changes often → automated build+test on each merge
                                                          → problems caught within minutes
\`\`\`

The interview-relevant framing: CI/CD isn't fundamentally a tooling choice (GitHub Actions vs. Jenkins vs. CircleCI) — it's a discipline of small, frequent, automatically-validated changes. The tooling exists to make that discipline practical at scale, but naming the underlying problem it solves (slow feedback on integration problems, risky infrequent releases) demonstrates more understanding than naming a specific product.`,
  },
  {
    title: 'The Pipeline Stages: Build, Test, Deploy',
    content: `A CI/CD pipeline is a sequence of automated stages that a code change passes through, each stage gating progress to the next — a failure at any stage stops the pipeline there, preventing a broken change from reaching later, more consequential stages.

\`\`\`text
Commit/PR → Build → Unit Tests → Integration Tests → Package/Build Artifact
          → Deploy to Staging → Smoke Tests → (Manual Approval) → Deploy to Production
\`\`\`

**Build** compiles or bundles the application (and for compiled languages, fails fast on syntax/type errors before any tests even run — the cheapest, fastest stage, so it should run first). **Test** runs automated test suites, often layered (fast unit tests first, slower integration/end-to-end tests after, since unit tests catch the most common bugs at the lowest cost — covered in depth in the testing-in-CI lesson). **Package** produces the deployable artifact (a compiled binary, a container image, a deployable bundle) exactly once, so the same artifact that passed every test is the one actually deployed, rather than rebuilding (and risking subtly different output) at deploy time. **Deploy** ships that artifact to an environment — typically staging first, then production, often gated by automated smoke tests or manual approval.

The interview-relevant principle: stages should be ordered from fastest/cheapest to slowest/most expensive, so a change that's obviously broken fails in seconds (a build error) rather than minutes (after a full test suite) or hours (after a slow deployment) — this ordering is what makes CI feedback genuinely fast rather than just "automated but still slow."`,
  },
  {
    title: 'Continuous Integration in Practice',
    content: `Practicing CI well requires more than just having a pipeline configuration file — it requires team habits that keep the shared branch's automated checks meaningful and trustworthy.

Core CI habits: **commit and merge small changes frequently** (large, infrequent merges reintroduce the integration-hell problem CI is meant to solve, just shifted to whenever the big merge happens); **run the full automated check suite on every change**, typically triggered automatically on every pull request and on every merge to the main branch, not just occasionally or manually; and **fix a broken build immediately** — a red (failing) build on the shared branch should be treated as the team's top priority, because every additional commit layered on top of a known-broken state makes it progressively harder to identify which change actually caused the failure.

\`\`\`text
PR opened → CI triggers automatically → build + test run → pass/fail status shown on the PR
                                                            → merge blocked if status is failing
\`\`\`

A common team policy enforcing this is a **branch protection rule**: configuring the repository so a pull request cannot be merged until its CI checks pass, removing the option to merge a known-broken change "just this once" under deadline pressure — which matters because that exception, taken repeatedly, is exactly how teams drift into not trusting their CI status at all.

The interview-relevant signal: CI's value depends entirely on the team actually treating a red build as urgent and actually keeping the main branch deployable at all times — a pipeline that exists but is routinely ignored or worked around provides little of CI's actual benefit, regardless of how sophisticated the pipeline configuration itself is.`,
  },
  {
    title: 'Automated Testing in the Pipeline',
    content: `Automated tests are what give a CI pipeline the confidence to merge and deploy changes without a human manually re-verifying behavior each time — without trustworthy automated tests, "continuous" integration and deployment would either be reckless or would require so much manual verification that the "continuous" part breaks down in practice.

A pipeline typically layers test types by speed and scope, running faster/narrower tests before slower/broader ones (mirroring the testing pyramid concept): **unit tests** (fast, isolated, test a single function/component — should be the large majority of tests and run first, in seconds), **integration tests** (verify multiple components work together correctly, e.g. an API endpoint actually hitting a real or test database — slower, fewer of them), and **end-to-end tests** (drive the full application as a user would, e.g. via a browser automation tool — slowest and most brittle, so typically the fewest, often reserved for critical user flows only).

\`\`\`yaml
# Example pipeline test stage ordering
- run: npm run test:unit          # seconds
- run: npm run test:integration   # tens of seconds to a few minutes
- run: npm run test:e2e           # minutes, often only on a subset of critical flows
\`\`\`

A pipeline should also enforce a **minimum coverage threshold** or otherwise fail the build if critical test categories are skipped, but coverage percentage alone is a weak signal of test quality (100% coverage of trivial assertions is far less valuable than 70% coverage of meaningful behavior) — the interview-relevant point being that the goal of tests in a pipeline isn't a coverage number, it's confidence that a passing pipeline genuinely means the change is safe to ship.`,
  },
  {
    title: 'Build Artifacts and Immutable Releases',
    content: `A **build artifact** is the packaged, deployable output produced once by the pipeline's build stage — a compiled binary, a container image, a bundled archive — that then flows unchanged through every subsequent stage (staging deployment, production deployment), rather than being rebuilt separately for each environment.

\`\`\`text
Build once:  source code → build → artifact (e.g. my-app:abc123)
Deploy many: artifact my-app:abc123 → staging
             artifact my-app:abc123 → production (same exact artifact, not rebuilt)
\`\`\`

This "build once, deploy the same artifact everywhere" principle matters because rebuilding separately for each environment introduces the risk that the artifact actually deployed to production differs subtly from the one validated in staging — a different dependency version resolved at a slightly later moment, a flaky build step that happened to behave differently the second time — defeating the purpose of staging validation in the first place. Tagging or naming each artifact with a unique, traceable identifier (a commit hash, a build number) makes it possible to know exactly which artifact is running in any environment and to reference it precisely for rollback.

**Immutability** matters for the same reason a database write being durable matters: once an artifact is built and tagged, it should never be modified in place — if a bug is found, a *new* artifact is built and deployed, rather than patching the existing one, because a mutable artifact tag undermines the basic guarantee that "what's deployed in production right now" is a known, fixed, previously-validated thing rather than something that could have silently changed underneath you.`,
  },
  {
    title: 'Environments: Development, Staging, Production',
    content: `Most pipelines deploy through a sequence of environments of increasing fidelity and consequence, each serving a distinct purpose in catching different categories of problems before they reach real users.

**Development** environments (often a developer's own machine, or an ephemeral per-branch preview environment) are for fast iteration — quick feedback, not necessarily representative of production scale or configuration. **Staging** (sometimes called pre-production) aims to mirror production as closely as practical — similar infrastructure, similar configuration, sometimes a sanitized copy of production-like data — so that issues specific to production-scale or production-configuration problems surface here rather than in front of real users. **Production** is the live environment actually serving real users, where the cost of a bug is highest (real user impact, potential data corruption, reputational cost) and where changes should arrive only after passing every earlier gate.

\`\`\`text
Dev (fast, low-fidelity) → Staging (production-like, automated smoke tests) → Production (real users)
\`\`\`

A staging environment that meaningfully diverges from production (different database version, different scale, missing a third-party integration that's stubbed out) provides a weaker guarantee — bugs that only manifest under production-specific conditions won't be caught there, which is why teams investing seriously in CD also invest in keeping staging's configuration and infrastructure topology close to production's, even though the actual traffic/data scale typically can't fully match it. The interview-relevant point: each environment exists to catch a progressively narrower, more production-specific category of problem — and the value of the whole pipeline depends on each stage actually being meaningfully different from (and stricter than) the one before it, not just a relabeled copy.`,
  },
  {
    title: 'Deployment Strategies: Rolling, Blue-Green, Canary',
    content: `How a new version actually replaces the old one in production is a distinct decision from *whether* to deploy it, and different strategies trade off deployment speed, resource cost, and blast radius if something goes wrong.

**Rolling deployment** replaces old instances with new ones gradually, a few at a time, so the service stays available throughout (some requests hit old instances, some hit new, during the transition) — simple and resource-efficient (no need to run two full fleets simultaneously), but a problem in the new version is discovered only after it's already serving some fraction of real traffic.

**Blue-green deployment** runs two complete, identical environments ("blue" = current production, "green" = new version) simultaneously; once the green environment is fully deployed and verified, traffic is switched over all at once (e.g. by repointing a load balancer), and the old blue environment is kept briefly as an instant rollback target — fast, low-risk rollback (just switch traffic back), but requires double the infrastructure during the transition.

**Canary deployment** routes a small percentage of real traffic (e.g. 5%) to the new version while the rest continues hitting the old version, monitoring error rates/latency on that small slice before gradually increasing the new version's traffic share to 100% — limits the blast radius of a bad release to a small fraction of users, at the cost of more operational complexity (traffic splitting, careful automated monitoring to decide whether to proceed or roll back).

\`\`\`text
Rolling:    [old][old][old] → [new][old][old] → [new][new][old] → [new][new][new]
Blue-Green: Blue (live) ----------- switch -----------> Green (live), Blue idle as rollback
Canary:     95% old / 5% new → monitor → 50% old / 50% new → monitor → 100% new
\`\`\`

The interview-relevant tradeoff to name: rolling is the simplest default and resource-cheapest; blue-green gives the fastest, cleanest rollback at double the infrastructure cost; canary gives the smallest blast radius for risky changes but needs real monitoring/automation investment to be safe — choosing between them depends on the team's risk tolerance, infrastructure budget, and how much automated monitoring is already in place.`,
  },
  {
    title: 'Rollback Strategies',
    content: `A rollback reverts a problematic deployment back to a known-good previous state, and how fast and reliably that can happen is often more important to overall system reliability than how fast deployments go out in the first place — fast, frequent deployment without a fast, reliable rollback path is a significant risk, not a pure win.

The fastest rollback path is simply **redeploying the previous immutable artifact** (covered in the build artifacts lesson) — since artifacts are immutable and uniquely tagged, rolling back is just "deploy artifact \`v1.4.1\` instead of \`v1.4.2\`," with no rebuild step and no ambiguity about what's actually being deployed.

\`\`\`bash
# Rollback is just redeploying a previously-built, known-good artifact
deploy my-app:v1.4.1   # instead of the problematic v1.4.2
\`\`\`

Database migrations complicate rollbacks significantly: rolling back application code is straightforward, but a schema migration that's already been applied (especially one that drops a column or changes a data type) may not be safely reversible without data loss — which is why production teams favor **backward-compatible migrations** (e.g. adding a new column without removing the old one yet, deploying code that can work with either, and only removing the old column in a later, separate migration once the new code is fully rolled out and verified) over migrations that make the old code version incompatible with the new schema.

**Feature flags** offer an even faster rollback path for risky logic: wrapping new behavior in a flag that can be toggled off instantly (without any redeployment at all) separates "is the new code present" from "is the new code active," letting a team disable a problematic feature in seconds rather than waiting for a full redeploy — at the cost of added code complexity (conditional logic, eventually needing cleanup once a flag is no longer needed) which is a deliberate, ongoing maintenance tradeoff.`,
  },
  {
    title: 'Infrastructure as Code',
    content: `Infrastructure as Code (IaC) means defining infrastructure (servers, networks, databases, load balancers) in version-controlled configuration files rather than provisioning it through manual, one-off actions in a cloud console — applying the same discipline (review, version history, repeatability) to infrastructure that source control already applies to application code.

\`\`\`hcl
# Example: Terraform (tool-agnostic concept)
resource "aws_instance" "web_server" {
  ami           = "ami-0123456789"
  instance_type = "t3.medium"
  tags = { Name = "web-server" }
}
\`\`\`

The core problem IaC solves is **configuration drift** and **non-reproducibility**: infrastructure provisioned by hand through a console, over time and across multiple people making ad-hoc changes, tends to diverge from any documented description of it — nobody can confidently say exactly what's running or why, and recreating an equivalent environment (for disaster recovery, or simply a new staging environment) becomes guesswork. With IaC, the configuration file *is* the documentation, is reviewed via the same pull-request process as application code, and recreating an environment is as simple as applying the same configuration again.

IaC tools are commonly run as a step within a CI/CD pipeline itself — a pull request changing infrastructure configuration triggers a "plan" step showing exactly what would change before anything is applied, and merging triggers the actual "apply" — extending the same build/test/deploy discipline used for application code to the infrastructure that code runs on, which is the interview-relevant connection between IaC and CI/CD specifically (rather than treating IaC as an unrelated, separate topic).`,
  },
  {
    title: 'Secrets Management in Pipelines',
    content: `A CI/CD pipeline frequently needs credentials — cloud provider API keys, database passwords, third-party service tokens — to actually deploy or test against real services, and how those secrets are handled is a frequent, consequential security concern distinct from how application code itself handles secrets at runtime.

The foundational rule: **secrets must never be committed to source control**, even in a private repository — repository history is effectively permanent (a secret committed and later "removed" in a subsequent commit is still recoverable from history unless the entire history is rewritten and force-pushed, which is itself disruptive and easy to get wrong), and a leaked secret in a public or later-made-public repository can be scraped by automated bots within minutes.

\`\`\`yaml
# Secrets injected at pipeline runtime, never hardcoded in the pipeline config itself
env:
  DATABASE_PASSWORD: \${{ secrets.DATABASE_PASSWORD }}
\`\`\`

Most CI/CD platforms provide a built-in encrypted secrets store (e.g. GitHub Actions secrets, GitLab CI/CD variables) that injects secret values as environment variables at pipeline run time without ever exposing the underlying value in logs or configuration files — pipeline systems typically also automatically redact known secret values from log output, specifically to prevent a secret from being accidentally printed (e.g. via a debug \`echo\` statement) and persisted in viewable build logs.

For larger or more sensitive deployments, a **dedicated secrets manager** (e.g. HashiCorp Vault, AWS Secrets Manager) is often used instead of the CI platform's built-in store, since it provides finer-grained access control, automatic secret rotation, and an audit log of exactly which pipeline run accessed which secret and when — the interview-relevant principle across all of these is the same: secrets should be injected at the point of use, from a system designed to store them securely, never embedded directly in version-controlled files.`,
  },
  {
    title: 'Branching Strategies and Their Effect on CI/CD',
    content: `How a team structures its branches directly shapes what a CI/CD pipeline needs to do and how often deployments happen — branching strategy and deployment strategy are tightly coupled decisions, not independent ones.

**Trunk-based development** (covered in depth in the Git lessons) has most work merged directly and frequently into a single main branch, with CI running on every merge and CD potentially deploying every merge straight to production (or close to it) — this requires the most mature, trustworthy automated test suite, since there's little room for a human to catch a problem before it reaches users, but enables the fastest possible feedback and deployment cadence.

**Feature-branch workflows** (e.g. GitHub Flow: a feature branch per change, merged via pull request after CI passes and review is approved) run the full pipeline on the pull request before merge, giving an explicit human review gate in addition to automated checks, at the cost of features waiting in a branch (however briefly) before reaching the shared branch.

\`\`\`text
Trunk-based:     commit → main → CI/CD → production (fast, requires high test trust)
Feature-branch:  branch → PR (CI runs here) → review → merge to main → CI/CD → production
\`\`\`

The interview-relevant connection: a pipeline's structure (when does CI run, what triggers a deployment, is there a manual approval gate) should be designed around the team's actual branching strategy and risk tolerance — a team practicing trunk-based development with frequent direct-to-production deployment needs a different (typically more automated, more test-reliant) pipeline than a team using long-lived feature branches with manual QA sign-off before each release, and naming this dependency explicitly is a stronger answer than describing either in isolation.`,
  },
  {
    title: 'Pipeline Speed and Developer Feedback Loops',
    content: `The value of CI is directly tied to how fast it gives feedback — a pipeline that takes 45 minutes to report a failing test provides far less practical value than one reporting the same failure in 3 minutes, because developers context-switch away during a long wait and the cost of returning to a failed build (re-loading context on what they were doing) is real and recurring.

Common techniques for speeding up pipelines: **parallelization** (splitting a test suite across multiple machines/workers running concurrently, rather than one machine running every test sequentially), **caching dependencies** (avoiding a full reinstall of dependencies on every run when the dependency manifest hasn't changed — directly analogous to Docker's layer caching), **only running affected tests** (in a large monorepo, determining which tests are actually relevant to a given change rather than running the entire test suite for every change, though this requires reliable dependency-graph tooling to do safely), and **fast-failing early** (ordering pipeline stages so the cheapest, most likely to fail checks — like linting and type-checking — run before slower ones, so an obviously broken change fails in seconds rather than after a slow test suite finishes).

\`\`\`yaml
# Example: running independent test suites in parallel
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps: [...]
  lint:
    runs-on: ubuntu-latest
    steps: [...]
  # both jobs run concurrently, total pipeline time ≈ max(unit-tests, lint), not their sum
\`\`\`

The interview-relevant framing: pipeline speed isn't a vanity metric — it's a direct lever on how often developers actually commit and integrate small changes (the entire premise of CI), since a slow, painful pipeline pushes developers back toward batching up larger, less-frequent changes to avoid waiting on it repeatedly, undermining the practice CI is meant to enable in the first place.`,
  },
  {
    title: 'Monitoring and Alerting After Deployment',
    content: `Deployment isn't the end of the CI/CD story — a pipeline that successfully ships a change still needs a way to know quickly whether that change is actually behaving correctly once it's live, since automated tests, however thorough, can't catch every production-specific problem (real traffic patterns, real data shapes, real third-party service behavior).

**Smoke tests** run immediately after a deployment completes, checking that the most critical functionality works at all in the newly deployed environment (e.g. "can a user log in," "does the homepage return 200") — fast, narrow checks meant to catch a deployment that's fundamentally broken before declaring the deployment successful, distinct from the deeper test suites that already ran earlier in the pipeline.

\`\`\`text
Deploy completes → run smoke tests against the live environment
                  → pass → deployment marked successful
                  → fail → automatically roll back to the previous version
\`\`\`

Beyond smoke tests, ongoing **monitoring** (error rates, latency percentiles, resource usage) and **alerting** (paging an on-call engineer when a metric crosses a threshold) provide the longer-running signal that a deployment is healthy well after the immediate post-deploy window — many teams correlate a spike in error rate or latency with recent deployment timestamps specifically, since "did this start right after the last deploy" is often the fastest way to identify the likely cause of a new production issue.

The interview-relevant point connecting this back to deployment strategy: canary deployments (covered earlier) are valuable specifically *because* they pair a gradual traffic rollout with active monitoring of that small slice of traffic — the deployment strategy and the monitoring strategy aren't separate concerns, the former is only as safe as the latter is fast and reliable at catching a problem before it reaches 100% of traffic.`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'Designing a Pipeline as Code',
    content: `Modern CI/CD platforms (GitHub Actions, GitLab CI, CircleCI) define pipelines declaratively in version-controlled YAML rather than configuring build steps through a server's web UI — pipeline-as-code, applying the same review/history/reproducibility benefits to the pipeline definition itself that IaC applies to infrastructure.

\`\`\`yaml
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm test
\`\`\`

Because the pipeline definition lives in the same repository as the code it builds and tests, changes to the pipeline go through the same pull-request review process as any other code change, and different branches can even use different pipeline definitions (e.g. a long-lived release branch testing against an older dependency set) — something far harder to express safely with a centrally-configured build server.

The interview-relevant point: treating the pipeline itself as a reviewable, versioned artifact (rather than an opaque, UI-configured black box only a few people know how to modify) is what makes pipelines maintainable as a codebase scales — a pipeline that's hard to understand or change safely becomes a bottleneck exactly when the team most needs it to evolve (e.g. adding a new test stage, splitting a slow job for parallelism).`,
  },
  {
    title: 'Matrix Builds and Cross-Environment Testing',
    content: `A matrix build runs the same pipeline job multiple times with different parameter combinations (e.g. multiple language versions, multiple operating systems, multiple database versions) in parallel, catching environment-specific bugs that a single fixed test environment would never surface.

\`\`\`yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
    os: [ubuntu-latest, windows-latest]
# runs 6 parallel jobs: every combination of node-version × os
\`\`\`

This is essential for any library or application that must support multiple runtime versions or platforms — a change that works fine on Node 22 but breaks on Node 18 (e.g. using a newer language feature unavailable in the older runtime) would otherwise only be discovered when a user on the older version reports a bug in production, far later and far more expensively than catching it in a 5-minute matrix job.

The interview-relevant tradeoff: matrix builds multiply total compute cost and total pipeline time isn't reduced (though wall-clock time can stay similar if jobs run in parallel and the CI platform has enough available workers) — so the matrix dimensions chosen should reflect combinations actually relevant to real users (e.g. it's worth testing the Node versions your supported users actually run, not testing every theoretically possible version going back a decade), not exhaustively testing every combination regardless of its practical value.`,
  },
  {
    title: 'Dependency Caching Strategies in CI',
    content: `Reinstalling all dependencies from scratch on every pipeline run is one of the most common sources of unnecessarily slow pipelines, since most runs change only application code, not the dependency manifest — caching previously-resolved dependencies and reusing them when the manifest is unchanged is the standard fix.

\`\`\`yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-\${{ hashFiles('package-lock.json') }}
    restore-keys: npm-
\`\`\`

The cache key is typically derived from a hash of the lockfile — when the lockfile is unchanged, the hash matches a previous cache entry and dependencies are restored from cache instead of re-downloaded and re-resolved; when the lockfile changes, the hash changes, producing a cache miss and a fresh install (which then gets cached under the new key for future runs) — this is conceptually identical to Docker's layer caching, just applied at the CI-runner level instead of the image-build level.

A subtle correctness concern: caching must be scoped narrowly enough that a cache from one context (e.g. one OS, one language version in a matrix build) is never restored into an incompatible context — caching compiled native dependencies built for Linux and restoring them on a Windows runner would silently produce a broken environment, which is why cache keys typically include the OS and runtime version as part of the key, not just the lockfile hash.`,
  },
  {
    title: 'Self-Hosted vs. Cloud-Hosted Runners',
    content: `CI jobs execute on **runners** — machines that actually pull the pipeline configuration and run its steps — and most CI platforms offer both **cloud-hosted runners** (managed entirely by the CI provider, spun up fresh per job and torn down afterward) and **self-hosted runners** (machines the team provisions and maintains itself, registered with the CI platform).

Cloud-hosted runners require no infrastructure maintenance and provide strong isolation between runs (a fresh environment every time means no risk of state leaking between unrelated job runs), but offer less control over hardware (can't easily get specialized GPUs, very high memory, or custom OS images beyond what the provider offers) and usage-based costs that scale directly with pipeline minutes consumed.

Self-hosted runners give full control over hardware and environment (useful for specialized build requirements, or to access internal network resources a cloud runner couldn't reach, like a private internal artifact repository) and can be cheaper at high, sustained volume (paying for owned/reserved infrastructure rather than per-minute), but require the team to maintain the runner machines themselves (security patching, scaling them up under load, ensuring environment consistency between runs since a self-hosted runner's state can persist between jobs unless explicitly cleaned).

\`\`\`text
Cloud-hosted: zero maintenance, strong isolation, less hardware control, pay-per-minute
Self-hosted:  full hardware control, can reach private networks, requires ops investment
\`\`\`

The interview-relevant decision criterion: cloud-hosted runners are the right default for most teams; self-hosted runners become worth the operational investment specifically when a team has specialized hardware needs, needs to reach internal-only network resources from CI, or runs pipelines at a volume where the cost difference becomes significant.`,
  },
  {
    title: 'Database Migrations in a CD Pipeline',
    content: `Running schema migrations as part of an automated deployment pipeline is one of the riskiest steps in CD, because a migration that fails partway through, or that's incompatible with the application version currently running, can cause an outage that's harder to recover from than a typical bad application deployment — data, not just code, is now in an inconsistent state.

The standard safe pattern is the **expand-contract** migration approach (already touched on in the rollback lesson): split a schema change into multiple, individually backward-compatible deployment steps rather than one atomic, breaking change.

\`\`\`text
Step 1 (expand):    add new column "email_address", keep old "email" column, old code still works
Step 2 (migrate):   deploy code that writes to both columns; backfill existing rows
Step 3 (cutover):   deploy code that reads/writes only the new column
Step 4 (contract):  drop the old "email" column, once confident no code path depends on it
\`\`\`

Each step is independently deployable and rollback-safe — rolling back the application code at any point doesn't leave the database in a state the old code can't handle, because the old column hasn't been removed until step 4, well after the new code is already fully proven in production. This is the practical reason migrations are usually run as a *separate, ordered step before* the application deployment in a pipeline (so the schema is ready before code that depends on it starts running), and why "irreversible" migration steps (dropping a column, a non-nullable constraint with no default) are deliberately sequenced last, only after the team is confident the change is fully validated.`,
  },
  {
    title: 'Feature Flags as a Deployment Decoupling Mechanism',
    content: `Feature flags decouple **code deployment** from **feature release** — new code can be deployed to production (merged, built, shipped) while remaining inactive behind a flag, and then activated independently, instantly, and often for a controlled subset of users, without requiring a new deployment at all.

\`\`\`text
Deploy:  ship code with \`if (flags.newCheckoutFlow) { ... }\` — flag defaults to off
Release: flip the flag to on for 10% of users → monitor → ramp to 100%, all without redeploying
\`\`\`

This decoupling is what makes trunk-based development practical for larger or riskier features: instead of keeping a long-lived feature branch until a feature is fully complete (reintroducing the integration-risk problem CI is meant to avoid), the incomplete feature's code can be merged and deployed continuously, safely inert behind a flag, and only activated when ready — sidestepping the tension between "merge frequently" and "don't release half-finished features to users."

Feature flags also provide the fastest possible rollback for a specific feature (toggle off in seconds, no redeploy, covered in the rollback lesson) and enable controlled experimentation (e.g. A/B tests, gradually ramping a risky change to an increasing percentage of users while watching metrics) — but they're not free: each active flag is conditional logic that must be tested in multiple states, and flags left in code long after a feature has fully shipped accumulate as a real form of technical debt, which is why disciplined teams treat "remove the now-permanent flag and its dead branch" as a required, tracked follow-up task, not an optional cleanup.`,
  },
  {
    title: 'Pipeline Security: Supply Chain Risks',
    content: `A CI/CD pipeline is itself a high-value attack target — it has broad permissions (often including secrets, deployment credentials, and write access to production infrastructure) and automatically executes whatever logic a merged change or a third-party dependency tells it to, making it a uniquely dangerous place for malicious code to run undetected.

A pipeline that automatically runs on pull requests from external contributors (e.g. an open-source project) must be careful that PR-triggered workflows don't have access to repository secrets by default — otherwise, a malicious pull request could include a workflow change or build step that exfiltrates secrets simply by being run by the automated pipeline, before any human reviews the change's actual content. Most CI platforms address this by restricting secret access on pull-request-triggered runs from forks, requiring explicit approval for first-time external contributors.

Third-party **build-time dependencies** (npm packages, GitHub Actions sourced from the marketplace, base Docker images) are another supply-chain vector — a compromised or malicious dependency executes its code during your build with your pipeline's permissions, which is why pinning dependencies to specific versions or commit hashes (rather than a mutable tag like \`@latest\` or \`@v4\`, which a compromised maintainer account could silently repoint to malicious code) and running dependency vulnerability scans (covered in the Docker lessons for image dependencies, equally applicable to build-time tooling) are standard supply-chain hardening practices.

\`\`\`yaml
# Less safe: a mutable tag that could be repointed
- uses: some-action@v4
# Safer: pinned to an exact, immutable commit
- uses: some-action@a1b2c3d4e5f6...
\`\`\`

The interview-relevant framing: pipeline security isn't just "protect the secrets" — it's recognizing that the pipeline itself is a powerful, automatically-executing system that inherits trust from every dependency and every triggering event it processes, and hardening it means restricting that trust to only what's actually necessary at each point.`,
  },
  {
    title: 'Observability of the Pipeline Itself',
    content: `Beyond monitoring the deployed application, mature CI/CD practice also monitors the pipeline's own health and performance — pipeline failure rate, average build duration, flaky test frequency — since a degrading pipeline silently undermines the team's development velocity well before anyone notices a specific incident.

**Flaky tests** (tests that intermittently fail without any actual code regression, often due to timing assumptions, shared test state, or external service dependencies) are a particularly corrosive pipeline health problem: once a team learns that a failing test might just be flaky rather than a real problem, the natural response — re-running the pipeline and ignoring the failure — erodes the entire premise that a red build means something is actually wrong, eventually leading to real regressions being dismissed as "probably just flaky" too.

\`\`\`text
Healthy pipeline:  red build → trusted signal of a real problem → fixed immediately
Degraded pipeline: red build → "probably flaky, rerun it" → real regressions slip through
\`\`\`

Tracking metrics like pipeline success rate over time, median and p95 build duration, and a leaderboard of the most frequently-flaky tests turns "our CI feels slow/unreliable lately" from a vague impression into something concrete a team can prioritize fixing — the interview-relevant point being that a pipeline isn't a one-time setup task that's "done" once it exists; it's a piece of infrastructure that degrades without active maintenance (tests get added without attention to runtime, external dependencies the test suite relies on become flaky, the dependency cache strategy stops matching the project's actual structure) and needs the same observability discipline applied to it that's applied to the production systems it deploys.`,
  },
  {
    title: 'Continuous Deployment vs. Continuous Delivery: The Manual Gate',
    content: `Though often used interchangeably, **continuous delivery** and **continuous deployment** differ in exactly one consequential way: continuous delivery means every change that passes the pipeline is automatically packaged and *ready* to release, with a human deciding *when* to actually trigger that release (often a one-click action); continuous deployment removes that human gate entirely — every change that passes the pipeline goes live automatically, with no manual approval step at all.

\`\`\`text
Continuous Delivery:  pipeline passes → artifact ready → [human clicks "deploy"] → production
Continuous Deployment: pipeline passes → automatically deployed → production (no human gate)
\`\`\`

Whether continuous deployment is appropriate depends heavily on context: a team with an extremely mature, trusted automated test suite, strong monitoring, and fast rollback mechanisms can reasonably deploy every passing change straight to production with confidence; a team in a heavily regulated industry (e.g. finance, healthcare) may be required by compliance policy to have an explicit human approval recorded before any production release, regardless of how trustworthy the automated pipeline is, making continuous delivery (with its manual gate) the appropriate stopping point rather than full continuous deployment.

The interview-relevant distinction to make explicit when asked "what's the difference": it's not a difference in pipeline sophistication or tooling — both can use the exact same pipeline — it's a difference in whether a human decision is the final gate before production, which is as much an organizational/risk-tolerance decision as a technical one.`,
  },
  {
    title: 'Handling Long-Running and Flaky External Dependencies in Tests',
    content: `Tests that depend on real external services (a third-party payment API, an external email provider) are a recurring source of pipeline unreliability — the external service's own downtime, rate limits, or network flakiness becomes the pipeline's flakiness, even though the code being tested didn't actually regress.

The standard mitigation is **mocking or stubbing external dependencies** in automated tests below the end-to-end layer — unit and integration tests substitute a fake, fast, deterministic stand-in for the real external service, so the pipeline's reliability doesn't depend on a third party's uptime for the vast majority of test runs.

\`\`\`text
Unit/Integration tests:  mock the payment API → deterministic, fast, no external dependency
End-to-end tests (few):  hit a sandboxed version of the real payment API → realistic, slower, fewer of them
\`\`\`

This doesn't mean *never* testing against the real (or a sandboxed/test-mode) external service — some end-to-end tests genuinely should, since mocks can drift from the real API's actual behavior over time — but those tests should be a deliberately small subset, isolated so their occasional flakiness (a real characteristic of depending on any external system) doesn't block the much larger and more frequent set of unit/integration test runs that don't need that dependency at all.

The interview-relevant principle, connecting back to the testing pyramid: pushing dependence on slow, flaky, external systems as far up the test pyramid as possible (fewest tests, narrowest scope) while keeping the broad base of fast, deterministic tests fully isolated from them is what keeps a pipeline's reliability mostly within the team's own control, rather than at the mercy of every third-party service's uptime.`,
  },
  {
    title: 'GitOps: Driving Deployment from a Git Repository',
    content: `GitOps extends infrastructure-as-code one step further: rather than a CI pipeline directly pushing changes out to infrastructure (a "push" model), a GitOps operator continuously running inside the target environment watches a Git repository and pulls/applies whatever configuration it finds there (a "pull" model), making the Git repository the single, auditable source of truth for what *should* be running.

\`\`\`text
Push model:  CI pipeline → kubectl apply / terraform apply → directly mutates the cluster
Pull model:  Operator (inside cluster) → watches Git repo → reconciles cluster state to match it
\`\`\`

In a typical GitOps setup (e.g. using Argo CD or Flux for Kubernetes), a deployment is performed not by running a deploy command at all, but by merging a pull request that changes a manifest in the Git repository (e.g. bumping an image tag) — the operator detects the drift between the repository's declared state and the cluster's actual state, and reconciles them automatically, continuously, not just at the moment of a single deploy action.

This has two notable benefits: the Git repository's commit history becomes a complete, naturally-auditable log of every change ever made to the environment (who changed what, when, and why, via ordinary commit messages and PR review — no separate deployment audit system needed), and **drift correction** happens automatically — if someone manually changes something in the live environment outside of Git (e.g. via \`kubectl edit\` directly against the cluster), the operator detects the resulting mismatch and reverts it back to match Git on its next reconciliation pass, which strongly discourages undocumented manual changes from persisting silently.

The interview-relevant distinction from ordinary CI/CD: GitOps isn't a different set of pipeline stages, it's a different *direction* of control — an operator pulling and reconciling from inside the target environment, rather than a pipeline pushing changes into it from outside, which also means the credentials needed to mutate the live environment never need to leave that environment or be held by the CI system at all.`,
  },
  {
    title: 'Multi-Environment Promotion and Configuration Management',
    content: `A pipeline that deploys the same immutable build artifact across multiple environments (covered in the build artifacts lesson) still needs each environment to run with *different configuration* — different database connection strings, different feature flag defaults, different scaling parameters — without that meaning a different artifact is built per environment, which would undermine the "build once, deploy everywhere" guarantee.

The standard separation is: the **artifact** contains the application code, fixed and identical across every environment; **configuration** is supplied externally per environment, typically via environment variables, mounted config files, or a dedicated configuration service, injected at deploy or runtime rather than baked into the build.

\`\`\`text
Same artifact: my-app:v2.3.1
Staging config:    DATABASE_URL=staging-db, LOG_LEVEL=debug, FEATURE_X=on
Production config: DATABASE_URL=prod-db,    LOG_LEVEL=info,  FEATURE_X=off
\`\`\`

**Promotion** is the act of moving a specific, already-built and already-validated artifact from one environment to the next (e.g. staging → production) rather than building a fresh artifact for the later environment — this is what makes "the thing we tested in staging" and "the thing now running in production" provably the same bytes, not just hopefully equivalent.

A common pitfall worth naming explicitly: configuration drift between environments that's *unintentional* (e.g. staging quietly accumulating manual tweaks over time that production never received) erodes exactly the guarantee staging exists to provide — that passing in staging predicts success in production — which is why managing configuration itself as version-controlled, environment-specific files (rather than ad-hoc manual settings per environment) is treated as seriously as managing the application code and infrastructure definitions themselves.`,
  },
];

export function seedCicdBasicsLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['cicd-basics']);
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
