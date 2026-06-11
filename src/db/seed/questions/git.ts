import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedGitQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['git']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is the difference between git merge and git rebase?',
      answer: `Both integrate changes from one branch into another, but with different history shapes.

**Merge** creates a merge commit that preserves the full history of both branches:
\`\`\`
main:    A─B─C───M  (merge commit)
feature:     D─E─╯
\`\`\`

**Rebase** replays feature commits on top of main, rewriting history for a linear result:
\`\`\`
main:    A─B─C
feature:         D'─E'  (D and E replayed, new hashes)
\`\`\`

\`\`\`bash
# Merge (preserves history)
git checkout main && git merge feature

# Rebase (linear history)
git checkout feature && git rebase main
git checkout main && git merge feature  # now a fast-forward
\`\`\`

**Golden rule of rebasing:** never rebase commits that have been pushed to a shared remote — it rewrites history and forces others to reconcile diverged branches.

**When to use each:**
- **Merge** for shared/public branches — preserves true history
- **Rebase** on feature branches before merging — cleaner log, easier to bisect
- **Interactive rebase** (\`git rebase -i\`) for squashing WIP commits before a PR`,
      difficulty: 2,
      tags: 'merge,rebase,git-history',
    },
    {
      title: 'What is git stash and when should you use it?',
      answer: `\`git stash\` temporarily shelves uncommitted changes so you can work on something else, then reapply the saved work later. It saves your working directory and index changes onto a stack.

\`\`\`bash
# Stash working changes (tracked files)
git stash

# Stash including untracked files
git stash -u

# Stash with a descriptive message
git stash push -m "WIP: half-done authentication"

# List all stashes
git stash list
# stash@{0}: On feature/auth: WIP: half-done authentication
# stash@{1}: WIP on main: f3d2b1c fix typo

# Apply most recent stash (keeps it in the stash list)
git stash apply

# Apply and remove from list (pop)
git stash pop

# Apply a specific stash
git stash apply stash@{1}

# View stash diff
git stash show -p stash@{0}

# Drop a stash
git stash drop stash@{0}
\`\`\`

**Common use cases:**
- Switch to a different branch for a hotfix without committing WIP changes
- Pull latest changes when you have unstaged work
- Save experimental changes you're not ready to commit

If you find yourself stashing frequently, consider committing WIP with \`git commit -m "WIP"\` and amending/squashing later.`,
      difficulty: 1,
      tags: 'stash,workflow,git',
    },
    {
      title: 'What is the difference between git reset and git revert?',
      answer: `Both undo changes, but differ fundamentally in whether they rewrite history.

**\`git reset\`** moves the branch pointer backward, potentially discarding commits. It rewrites history — unsafe on shared branches.

\`\`\`bash
# Modes for git reset HEAD~1 (undo last commit)
git reset --soft HEAD~1   # undo commit, keep changes staged
git reset --mixed HEAD~1  # undo commit, keep changes unstaged (default)
git reset --hard HEAD~1   # undo commit, DISCARD all changes permanently
\`\`\`

**\`git revert\`** creates a new commit that inverts the changes of a specified commit. Safe for shared branches — history is preserved.

\`\`\`bash
# Revert last commit — creates a new "revert" commit
git revert HEAD

# Revert a specific commit
git revert a1b2c3d

# Revert without auto-committing (to edit the message)
git revert --no-commit HEAD
\`\`\`

**Rule of thumb:**
- **Private branch / not yet pushed:** \`git reset\` to clean up history
- **Shared / already pushed:** always \`git revert\` — never rewrite shared history
- Accidentally committed sensitive data: \`git reset --hard\` locally + force push (with team awareness) + rotate the secret immediately`,
      difficulty: 2,
      tags: 'reset,revert,history',
    },
    {
      title: 'What is git cherry-pick?',
      answer: `\`git cherry-pick\` applies the changes from one or more specific commits onto the current branch, creating new commits with new hashes.

\`\`\`bash
# Apply a single commit from another branch
git cherry-pick a1b2c3d

# Apply a range of commits
git cherry-pick a1b2c3d..e5f6g7h  # exclusive start
git cherry-pick a1b2c3d^..e5f6g7h # inclusive start

# Cherry-pick without committing (to edit or combine)
git cherry-pick --no-commit a1b2c3d

# Cherry-pick preserving original author
git cherry-pick -x a1b2c3d  # adds "cherry-picked from commit..." to message
\`\`\`

**Common use cases:**
- Apply a hotfix from main to a release branch without merging all of main
- Pick specific bug fixes across multiple branches
- Rescue commits from a deleted or diverged branch

**Considerations:** cherry-pick duplicates commits (same diff, new hash). If the same commit later gets merged, Git usually handles it cleanly, but it can occasionally produce conflicts. Prefer feature flags + merge over cherry-pick for long-lived divergence.`,
      difficulty: 2,
      tags: 'cherry-pick,commits,workflow',
    },
    {
      title: 'What is git bisect and when is it useful?',
      answer: `\`git bisect\` uses binary search to find the exact commit that introduced a bug. Instead of manually checking commits, it narrows down to the culprit in O(log n) steps.

\`\`\`bash
# Start bisecting
git bisect start

# Mark current HEAD as bad (bug exists here)
git bisect bad

# Mark a known good commit (before the bug)
git bisect good v2.0.0

# Git checks out the midpoint — test it
# If the bug is present:
git bisect bad
# If the bug is absent:
git bisect good
# Repeat until Git identifies the first bad commit

# When done
git bisect reset  # return to original HEAD
\`\`\`

**Automated bisect** — provide a test script that exits 0 (good) or non-zero (bad):
\`\`\`bash
git bisect start HEAD v2.0.0
git bisect run npm test -- --testNamePattern "login flow"
# Git runs the script at each midpoint and bisects automatically
\`\`\`

Bisect is invaluable for regressions found after the fact — especially when the git log between working and broken state spans dozens or hundreds of commits.`,
      difficulty: 2,
      tags: 'bisect,debugging,binary-search',
    },
    {
      title: 'What is the difference between git fetch and git pull?',
      answer: `Both download changes from a remote, but differ in what they do with those changes locally.

**\`git fetch\`** downloads remote changes into your local remote-tracking branches (e.g., \`origin/main\`) but does NOT change your working branch. Safe to run at any time.

\`\`\`bash
git fetch origin          # fetch all branches from origin
git fetch origin main     # fetch specific branch

# See what changed
git log HEAD..origin/main --oneline
git diff HEAD origin/main
\`\`\`

**\`git pull\`** is \`git fetch\` + \`git merge\` (or \`git rebase\` with \`--rebase\` flag):

\`\`\`bash
git pull          # fetch + merge
git pull --rebase # fetch + rebase (cleaner linear history)
\`\`\`

**Best practice:** use \`git fetch\` + inspect + then merge/rebase explicitly. This gives you a chance to see what's coming before integrating. Configure \`git pull --rebase\` as the default to keep a clean history:

\`\`\`bash
git config --global pull.rebase true
\`\`\`

Many teams use \`git fetch\` in CI pipelines and \`git pull --rebase\` in daily development.`,
      difficulty: 1,
      tags: 'fetch,pull,remote',
    },
    {
      title: 'What are Git hooks?',
      answer: `Git hooks are scripts that Git executes automatically before or after specific events (commit, push, merge). They live in \`.git/hooks/\` and can be written in any scripting language.

**Common client-side hooks:**
\`\`\`bash
# .git/hooks/pre-commit (runs before git commit)
#!/bin/sh
npm run lint --silent
if [ $? -ne 0 ]; then
  echo "Lint failed. Commit aborted."
  exit 1
fi

# .git/hooks/commit-msg (validates commit message format)
#!/bin/sh
commit_msg=$(cat "$1")
if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
  echo "Error: Commit message must follow Conventional Commits format"
  exit 1
fi
\`\`\`

**Server-side hooks:** \`pre-receive\`, \`update\`, \`post-receive\` — enforce policies at push time on the remote.

**Sharing hooks with the team:** Git hooks in \`.git/hooks/\` are not committed. Use **Husky** (Node.js) or **pre-commit** (Python) to define hooks in the repo and install them automatically:

\`\`\`json
// package.json with Husky
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint --edit $HUSKY_GIT_PARAMS"
    }
  }
}
\`\`\``,
      difficulty: 2,
      tags: 'hooks,pre-commit,git-automation',
    },
    {
      title: 'What is git reflog?',
      answer: `The reflog (reference log) records every time a branch tip or HEAD changes. It's your safety net — it allows you to recover commits that appear to be lost after a reset, rebase, or accidental branch deletion.

\`\`\`bash
# View HEAD reflog
git reflog

# Output:
# a1b2c3d (HEAD -> main) HEAD@{0}: commit: add login page
# f3e4b2a HEAD@{1}: rebase finished: returning to refs/heads/main
# 9f8e7d6 HEAD@{2}: rebase: squash WIP commits
# 7a6b5c4 HEAD@{3}: reset: moving to HEAD~3  ← dangerous action recorded

# Recover from an accidental hard reset
git reset --hard HEAD@{3}  # restore to before the reset

# Recover a deleted branch
git reflog | grep "feature/my-lost-branch"
git checkout -b feature/my-lost-branch 8c9d0e1

# Recover a specific commit lost after rebase
git cherry-pick 9f8e7d6
\`\`\`

Reflog entries expire after 90 days by default (\`gc.reflogExpire\`). The reflog is local — it's not pushed to remotes. It only exists in \`.git/logs/\`.

The reflog is your first tool when you feel like you've lost work in Git — commit hashes don't disappear until garbage collection runs.`,
      difficulty: 2,
      tags: 'reflog,recovery,git',
    },
    {
      title: 'What are Git branching strategies?',
      answer: `A branching strategy defines how teams create, name, and merge branches. The right choice depends on deployment frequency and team size.

**Git Flow:** dedicated branches for features, releases, and hotfixes. Good for versioned software with release cycles.
\`\`\`
main (production) ─────────────────────────────
hotfix/login-bug ──────────╮               ╭──
develop ──────────────────────────────────────
feature/auth ──────────╯
release/1.2 ──────────────────╮
\`\`\`

**GitHub Flow (simpler, recommended for web apps):**
- Only two types: \`main\` (always deployable) and feature branches
- Open PR → review → merge to main → deploy immediately
\`\`\`bash
git checkout -b feature/add-search
# work, commit
git push origin feature/add-search
# open PR, merge to main, deploy
\`\`\`

**Trunk-based development (CI/CD optimized):**
- Everyone commits to \`main\` frequently (at least daily)
- Short-lived feature branches (< 1 day) or feature flags for incomplete features
- Enables true continuous integration

**Conventional Commits:** semantic commit messages for automated changelogs:
\`\`\`
feat(auth): add OAuth2 login
fix(api): handle null user_id in profile endpoint
docs: update README with setup instructions
\`\`\``,
      difficulty: 2,
      tags: 'branching,git-flow,github-flow',
    },
    {
      title: 'What is a pull request and what makes a good one?',
      answer: `A pull request (PR) / merge request (MR) is a request to merge a branch into another. It provides a space for code review, discussion, and CI checks before integration.

**Anatomy of a good PR:**
1. **Focused scope** — one concern per PR; easier to review, revert, and bisect
2. **Small size** — PRs with fewer than 400 lines of diff get thorough reviews; large ones get skimmed
3. **Clear description** — what changed, why, and how to test it; link to the issue/ticket
4. **Test coverage** — include tests for new behavior; CI must pass
5. **Self-reviewed** — read your own diff before requesting review

**Good PR description template:**
\`\`\`markdown
## What
Adds email verification to the signup flow.

## Why
Required for compliance (ticket #342).

## How
- Added \`/verify-email\` endpoint
- Sends verification email on registration
- Blocks login until verified (with bypass for admins)

## Testing
1. Register a new account
2. Check email for verification link
3. Click link → should now be able to log in
\`\`\`

**Review etiquette:** distinguish blocking vs non-blocking comments ("nit: ..." = non-blocking). Approve only what you'd be comfortable maintaining. Request specific changes rather than vague ones.`,
      difficulty: 1,
      tags: 'pull-request,code-review,workflow',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
