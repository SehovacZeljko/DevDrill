import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'What Git Is and Why Distributed Version Control Matters',
    content: `Git is a **distributed** version control system — every developer's clone of a repository contains the entire project history, not just the latest snapshot, unlike older **centralized** systems (e.g. Subversion) where a single central server held the only full history and most operations required network access to that server.

This distribution model is the source of several of Git's defining characteristics: commits, branching, and viewing history all work entirely offline since they only touch your local repository; there's no single point of failure, since every clone is a complete backup of the project's history; and merging is a first-class, cheap operation rather than an occasional, dreaded event, because branches are just lightweight pointers (covered in the branching lesson), not full copies of the codebase.

\`\`\`bash
git init                 # create a new repository
git clone <url>          # copy an existing repository, including its full history
git log                  # view history — works entirely offline, no server needed
\`\`\`

A practical interview-relevant distinction: in a centralized system, "the repository" is one specific server everyone talks to; in Git, every clone *is* a full repository, and "the remote" (often named \`origin\`) is just one other repository that your local one happens to sync with — there's no technical reason a team couldn't sync directly between two developers' machines instead of through a central server, even though in practice almost everyone uses a hosted central remote (GitHub, GitLab) as the agreed-upon source of truth for coordination.`,
  },
  {
    title: 'The Git Object Model: Blobs, Trees, Commits',
    content: `Underneath every Git command, the repository is a content-addressable database of four object types, each identified by the SHA-1 (or SHA-256, in newer Git versions) hash of its own content.

- **Blob:** the raw content of a single file's version — no filename, just bytes
- **Tree:** a directory listing, mapping names to blobs (files) or other trees (subdirectories)
- **Commit:** a snapshot — points to one tree (the project's full state at that point), one or more parent commits, an author, and a message
- **Tag:** a named pointer to a specific commit (covered in its own lesson)

\`\`\`text
commit a1b2c3 ("Add login feature")
  ├── tree (root)
  │     ├── blob: src/login.js
  │     └── tree: src/components
  │            └── blob: src/components/Button.js
  └── parent: commit 9f8e7d ("Initial commit")
\`\`\`

Because objects are identified by the hash of their *content*, two files with identical content anywhere in history share the exact same blob — Git never stores duplicate content twice, and any change to a file's content produces an entirely new hash, which is also why a commit's hash changes if you alter its message, its parent, or any file in its tree: the hash is a fingerprint of everything reachable from that commit.

The interview-relevant payoff of understanding this model: it demystifies almost every other Git concept. A branch is just a movable pointer to a commit hash (not a copy of files). A merge commit is just a commit object with two parents instead of one. Rewriting history (rebase, amend) produces new commit objects with new hashes rather than mutating old ones — old commits aren't edited, they become unreachable and eventually garbage-collected.`,
  },
  {
    title: 'The Three Trees: Working Directory, Staging Area, Repository',
    content: `Git models your project as three distinct areas, and most confusion for newcomers comes from not tracking which area a given change currently lives in.

\`\`\`text
Working Directory  --git add-->  Staging Area (Index)  --git commit-->  Repository (.git)
 (your actual files,              (changes prepared          (permanent, committed
  edited freely)                   for the next commit)        snapshots/history)
\`\`\`

The **working directory** is the actual files on disk that you edit directly. The **staging area** (also called the index) is a holding area where you explicitly choose which changes will be included in the *next* commit — \`git add\` moves changes from the working directory into staging, without yet creating a commit. The **repository** is the permanent, committed history stored in \`.git\`, created by \`git commit\`, which takes a snapshot of whatever is currently staged.

\`\`\`bash
git status              # shows what's modified, staged, or untracked
git add file.js         # stage a specific file's current changes
git add .                # stage everything modified/new in the current directory
git commit -m "message" # commit exactly what's staged
\`\`\`

The interview-relevant value of the staging area, often dismissed as "an extra unnecessary step": it lets you build a commit out of only *some* of your current changes, even when multiple unrelated changes exist simultaneously in the working directory — \`git add -p\` (patch mode) takes this further, letting you stage individual *hunks* within a single file, so one logical change can become a clean, focused commit even if you happened to edit several unrelated things in the same file before committing anything.`,
  },
  {
    title: 'Basic Workflow: add, commit, status, diff',
    content: `The everyday Git loop — check what changed, review it, stage it, commit it — relies on four commands used constantly.

\`\`\`bash
git status    # what's changed: modified, staged, untracked files
git diff      # line-by-line changes in the working directory, not yet staged
git diff --staged  # line-by-line changes that ARE staged, about to be committed
git add <file>     # stage a file's changes
git commit -m "Add user authentication"  # commit staged changes with a message
\`\`\`

\`git status\` is the command to run before almost any other Git operation — it tells you exactly which files are modified-but-unstaged, staged-and-ready-to-commit, or untracked entirely, preventing the most common beginner mistake of committing the wrong set of changes or forgetting to add a new file.

\`git diff\` (no arguments) and \`git diff --staged\` (or \`--cached\`) answer two different questions that are easy to confuse: the former shows changes in the working directory *not yet staged*, the latter shows changes already staged that *will* be included in the next commit — reviewing \`git diff --staged\` immediately before committing is the standard habit for catching an accidentally-included debug \`console.log\` or an unintended file before it becomes part of permanent history.

A well-written commit message is itself an interview-relevant skill: the conventional format is a short (under ~50 character) imperative summary line ("Add user authentication," not "Added" or "Adding"), optionally followed by a blank line and a more detailed explanation of *why* the change was made — future readers (including yourself) benefit far more from the "why" than a restatement of the diff itself, which they can already see.`,
  },
  {
    title: 'Branching Basics',
    content: `A branch in Git is simply a lightweight, movable pointer to a specific commit — creating a branch costs essentially nothing (no copying of files), which is precisely why Git branching is cheap and frequent, unlike the heavier branching model of some older version control systems.

\`\`\`bash
git branch feature/login        # create a new branch, pointing at the current commit
git checkout feature/login      # switch to it (or: git switch feature/login)
git checkout -b feature/login   # create and switch in one step

git branch                      # list local branches, * marks the current one
git branch -d feature/login     # delete a branch (safe — refuses if unmerged)
\`\`\`

\`\`\`text
main:     A---B---C
                    \\
feature:             D---E   (a separate line of commits, diverging from C)
\`\`\`

\`HEAD\` is a special pointer indicating which branch (and therefore which commit) you currently have checked out — committing on a branch advances both the branch pointer and \`HEAD\` together to the new commit, which is the entire mechanism behind "being on a branch."

The interview-relevant mental model correction for newcomers coming from other version control systems: a Git branch is not a copy of the codebase living somewhere — it's one single pointer value (a commit hash) stored in a small file under \`.git/refs/heads/\`. Switching branches doesn't copy files around; it changes which commit's tree is checked out into your working directory, which is exactly why creating, switching, and even deleting branches in Git is near-instant regardless of repository size.`,
  },
  {
    title: 'Merging Branches',
    content: `Merging integrates the changes from one branch into another, creating a new commit that combines both histories. When the branch being merged in has commits the target branch doesn't, and vice versa (the histories have diverged), Git creates a **merge commit** with two parents.

\`\`\`bash
git checkout main
git merge feature/login
\`\`\`

\`\`\`text
Before:                          After:
main:     A---B---C              main:     A---B---C-------M
                    \\                                 \\   /
feature:             D---E        feature:              D---E
\`\`\`

If \`main\` hasn't moved since the branches diverged (no new commits on \`main\` since the feature branch was created), Git performs a **fast-forward merge** instead — it simply moves the \`main\` pointer forward to the feature branch's latest commit, with no merge commit created at all, since there's nothing to actually combine.

\`\`\`text
Fast-forward (main hasn't moved since branching):
main:     A---B
                \\
feature:         C---D            main pointer simply moves to D, no merge commit
\`\`\`

The interview-relevant distinction: a true (non-fast-forward) merge preserves the fact that two lines of development happened in parallel — visible in the history graph as a fork-and-join shape — while a fast-forward merge produces a history indistinguishable from having committed those changes directly onto \`main\` in the first place. Some teams explicitly force a merge commit even when a fast-forward is possible (\`git merge --no-ff\`) specifically to preserve that "this was a feature branch" visual record in the log, which is a deliberate team convention worth being able to discuss the tradeoffs of.`,
  },
  {
    title: 'Merge Conflicts and How to Resolve Them',
    content: `A merge conflict happens when Git can't automatically combine changes — typically because both branches modified the *same lines* of the *same file* differently since they diverged, and Git has no way to know which version (or what combination) is correct without a human deciding.

\`\`\`text
<<<<<<< HEAD
const greeting = 'Hello there';
=======
const greeting = 'Hi!';
>>>>>>> feature/login
\`\`\`

Git inserts these conflict markers directly into the affected file(s), leaving both versions visible, and pauses the merge — \`git status\` lists every file still containing unresolved conflicts. Resolving a conflict means editing the file to the correct final content (which might be one side, the other, a hand-written combination of both, or something different altogether), removing the conflict markers entirely, then staging and committing the result.

\`\`\`bash
# After manually editing the conflicting file(s) to resolve the markers:
git add login.js
git commit              # completes the merge — no -m needed, Git pre-fills a merge message
\`\`\`

\`git merge --abort\` cancels an in-progress conflicted merge entirely, returning to the pre-merge state — useful if a conflict resolution turns out to be more involved than expected and you'd rather start over or investigate further before committing to a resolution.

The interview-relevant practical habit: conflicts are not a sign something went wrong — they're an expected, normal part of collaborative development whenever two people edit the same area of code, and the actual skill being tested is reading the conflicting versions carefully enough to produce a correct merged result, not panicking or reflexively picking "ours" or "theirs" without understanding what each side actually changed and why.`,
  },
  {
    title: 'Remotes: push, pull, fetch',
    content: `A remote is another copy of the repository — typically a centrally hosted one (GitHub, GitLab) that a team treats as the shared source of truth — that your local repository can sync with. \`origin\` is the conventional default name for the remote a repository was cloned from.

\`\`\`bash
git remote -v                 # list configured remotes and their URLs
git fetch origin              # download new commits/branches from origin, WITHOUT merging them in
git pull origin main          # fetch AND merge (or rebase, with --rebase) into the current branch
git push origin feature/login # upload local commits on this branch to the remote
\`\`\`

The interview-relevant distinction most candidates blur together: \`git fetch\` only **downloads** new history from the remote into your local repository's record of it (\`origin/main\`, a remote-tracking branch) — it never touches your own working branches or working directory. \`git pull\` is fetch followed immediately by a merge (or rebase, if configured) of the fetched commits into your current branch — meaning \`pull\` can create a merge commit or, depending on configuration, fail with a conflict, while \`fetch\` alone never can, since it doesn't integrate anything into your work.

\`\`\`text
git fetch:  origin/main updates locally, your "main" branch pointer doesn't move
git pull:   origin/main updates locally, AND your "main" branch is merged/rebased onto it
\`\`\`

A safer habit many experienced developers default to: \`git fetch\` followed by manually reviewing \`git log origin/main\` or \`git diff main origin/main\` before deciding how to integrate, rather than reflexively running \`git pull\` and accepting whatever merge or rebase happens automatically — useful when you want to inspect incoming changes before they touch your working branch at all.`,
  },
  {
    title: 'Cloning and Forking',
    content: `\`git clone\` copies an entire remote repository — full history, all branches, every commit object — to your local machine, automatically setting up the source as the \`origin\` remote so you can fetch/push to it later.

\`\`\`bash
git clone https://github.com/example/project.git
cd project
git remote -v   # origin already configured, pointing at the cloned URL
\`\`\`

A **fork** is a platform-level concept (GitHub, GitLab — not a Git command itself) where you create your own copy of someone else's repository under your own account, typically because you don't have push access to the original. The standard open-source contribution workflow is: fork the repository on the platform, clone *your fork* locally, make changes on a branch, push to your fork, then open a pull/merge request asking the original repository's maintainers to pull your changes in.

\`\`\`bash
git clone https://github.com/your-username/project.git  # your fork, not the original
git remote add upstream https://github.com/original-owner/project.git  # track the original too

git fetch upstream
git merge upstream/main  # keep your fork's main branch up to date with the original
\`\`\`

The interview-relevant distinction: cloning is a Git-level operation that anyone with read access can perform, producing a local copy; forking is a hosting-platform feature that creates a *new, independent remote repository* you have write access to, used specifically to enable contributing to projects where you lack direct push access to the original — the two are often used together (fork on the platform, then clone your fork) but solve different problems.`,
  },
  {
    title: 'Viewing History: log, show, blame',
    content: `\`git log\` is the primary tool for inspecting commit history, with options that reshape its output for different purposes.

\`\`\`bash
git log                          # full history, newest first
git log --oneline                # one compact line per commit
git log --oneline --graph --all  # ASCII graph showing branches/merges visually
git log -p                       # include the full diff for each commit
git log --author="Ada"           # filter by author
git log -- src/login.js          # only commits that touched this specific file
\`\`\`

\`git show <commit>\` displays the full details (message, author, diff) of one specific commit, useful when you already know which commit you care about, often found via \`git log\` first.

\`\`\`bash
git show a1b2c3f
\`\`\`

\`git blame <file>\` shows, line by line, which commit (and author) most recently changed each line of a file — the standard tool for answering "why is this specific line written this way, and who/what change introduced it," tracing a specific piece of code back to the commit (and ideally, its message) that explains the reasoning behind it.

\`\`\`bash
git blame src/login.js
\`\`\`

The interview-relevant practical workflow: \`git blame\` followed by \`git show\` on the commit it points to is the standard two-step process for investigating "why does this confusing line of code exist" — blame finds *which* commit, show reveals the full context (message, surrounding diff) of *why* it was written that way, often surfacing a bug fix, a workaround for a specific issue, or a deliberate tradeoff that isn't obvious from the code alone.`,
  },
  {
    title: 'Undoing Changes: checkout, restore, revert',
    content: `Git provides several distinct ways to "undo" something, and choosing the right one depends on exactly what you're undoing and whether it's already been committed or pushed.

\`\`\`bash
git restore file.js            # discard uncommitted working-directory changes to one file
git restore --staged file.js   # unstage a file (keep the edits, just remove from staging)
git checkout -- file.js        # older equivalent of "git restore file.js"

git revert a1b2c3f             # create a NEW commit that undoes a previous commit's changes
git reset --soft HEAD~1        # move the branch pointer back, keep changes staged
git reset --mixed HEAD~1       # move the branch pointer back, keep changes unstaged (default)
git reset --hard HEAD~1        # move the branch pointer back, DISCARD changes entirely
\`\`\`

The most important distinction for safety: \`git revert\` creates a brand-new commit that reverses a previous one's changes, **preserving history** — the original (now-reverted) commit still exists in the log, just followed by another commit undoing it. \`git reset --hard\` instead **rewrites** the branch to point at an earlier commit and discards everything after it from your working directory entirely — destructive, and dangerous if that branch has already been pushed and others have pulled it, since their history and yours now disagree.

\`\`\`text
revert:  A---B---C---D  ->  A---B---C---D---D'   (D' undoes D's changes, D still visible in history)
reset:   A---B---C---D  ->  A---B---C            (D is gone from this branch entirely)
\`\`\`

The interview-relevant rule of thumb: \`revert\` is the safe choice for undoing something that's already been **shared/pushed** (it doesn't rewrite history other people may have already pulled); \`reset --hard\` is acceptable for undoing local, **not-yet-pushed** commits where rewriting your own unpublished history causes no problems for anyone else.`,
  },
  {
    title: '.gitignore and Tracking Files',
    content: `\`.gitignore\` is a plain text file listing patterns for files and directories Git should never track or show as "untracked" in \`git status\` — build artifacts, dependency folders, local environment files, IDE configuration — anything that's either regenerable, machine-specific, or sensitive, and shouldn't pollute the shared repository history.

\`\`\`text
# .gitignore
node_modules/
*.log
.env
dist/
.DS_Store
\`\`\`

\`.gitignore\` only prevents **untracked** files from being picked up by \`git add .\` or shown in \`git status\` — it has no effect on a file that's already being tracked. A file accidentally committed before being added to \`.gitignore\` will keep showing up in diffs and status until explicitly untracked.

\`\`\`bash
git rm --cached .env      # stop tracking the file, but keep it on disk locally
echo ".env" >> .gitignore # now it's properly ignored going forward
git commit -m "Stop tracking .env"
\`\`\`

A critical interview-relevant security point: \`.gitignore\`-ing a secrets file *after* it's already been committed does **not** remove it from history — every previous commit containing that secret is still fully recoverable by anyone with access to the repository's history (\`git log -p -- .env\`, or just checking out an old commit). If a real secret (API key, password) is accidentally committed and pushed, the only fully correct remediation is rotating/revoking that secret immediately — rewriting history to remove it (\`git filter-repo\`, BFG Repo-Cleaner) is good hygiene for the repository going forward, but doesn't un-leak a secret that may have already been cloned, cached, or scraped by automated bots before the rewrite happened.`,
  },
  {
    title: 'Tags and Releases',
    content: `A tag is a named, typically permanent pointer to a specific commit — most commonly used to mark release points (\`v1.0.0\`, \`v2.3.1\`) so a specific, stable snapshot of the history can be referred to by a memorable name instead of a commit hash.

\`\`\`bash
git tag v1.0.0                                  # lightweight tag, just a name -> commit pointer
git tag -a v1.0.0 -m "First stable release"      # annotated tag — includes message, author, date

git tag                                          # list all tags
git checkout v1.0.0                              # check out the exact state at that tag

git push origin v1.0.0                           # tags are NOT pushed automatically with commits
git push origin --tags                           # push all local tags at once
\`\`\`

The interview-relevant distinction between a tag and a branch: both are named pointers to a commit, but a branch pointer is expected to **move** as new commits are added to it, while a tag is conventionally treated as a permanent, unmoving marker for a specific point in history — tagging \`v1.0.0\` and later adding more commits never moves the \`v1.0.0\` tag forward; a new tag (\`v1.0.1\`) would be created for the next release point instead.

**Annotated** tags (created with \`-a\`) are themselves full Git objects storing a message, tagger name, and date — generally preferred for releases since they carry that extra metadata. **Lightweight** tags are just a plain pointer with no associated object, simpler but with no metadata of their own — adequate for quick, personal, local bookmarks but less suited for a project's official release history. Most release-automation tooling and changelogs are built around annotated tags specifically because of the metadata they carry.`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'Rebasing vs Merging',
    content: `Rebasing and merging both integrate changes from one branch into another, but they produce fundamentally different history shapes. Merging (covered in the fundamentals lessons) preserves both branches' commits exactly as they happened, joined by a merge commit. Rebasing instead **replays** your branch's commits one by one on top of the target branch's latest commit, producing entirely new commit hashes and a linear history with no merge commit at all.

\`\`\`text
Before:
main:     A---B---C
                    \\
feature:             D---E

After merge:                       After rebase (feature onto main):
main:     A---B---C-------M        main:     A---B---C
                    \\   /                                \\
feature:             D---E         feature:                D'---E'  (new commits, replayed on C)
\`\`\`

Rebasing produces a cleaner, linear history that reads as if the feature branch's work happened sequentially after all of \`main\`'s latest commits — easier to follow in \`git log\`, with no merge-commit noise. The cost is that rebasing **rewrites commit hashes**, which is exactly why the cardinal rule of rebasing is: never rebase commits that have already been pushed and that someone else might have based further work on — doing so creates two divergent, conflicting histories for the same logical commits, forcing painful manual reconciliation for anyone who already pulled the original versions.

\`\`\`bash
git checkout feature
git rebase main          # replay feature's commits on top of main's current tip
\`\`\`

The interview-relevant judgment call most teams settle on: rebase freely on your own **local, not-yet-pushed** branch to keep history clean before sharing it; once a branch is pushed and others might be building on it, switch to merging (or, for the final integration into \`main\`, follow whatever convention the team has settled on — many teams use "rebase your feature branch onto main before opening a PR, then merge or squash-merge the PR itself").`,
  },
  {
    title: 'Interactive Rebase and Rewriting History',
    content: `Interactive rebase (\`git rebase -i\`) opens an editable list of commits, letting you reorder, edit, combine, or drop them before they're replayed — the primary tool for cleaning up a messy sequence of local commits into a clear, reviewable history before sharing it.

\`\`\`bash
git rebase -i HEAD~4   # interactively rewrite the last 4 commits
\`\`\`

\`\`\`text
pick a1b2c3 Add login form
squash 9f8e7d Fix typo in login form
pick 3c4d5e Add password validation
reword 7e8f9a Add tests          # will prompt to edit this commit's message
\`\`\`

Each line's leading word is the action: \`pick\` keeps the commit as-is, \`squash\` merges it into the previous commit (combining their changes into one), \`fixup\` does the same as squash but discards the squashed commit's message entirely, \`reword\` keeps the commit's changes but lets you edit its message, and \`drop\` removes the commit entirely. Reordering the lines themselves replays the commits in the new order.

A very common real-world use: a feature branch accumulated several "WIP" and "fix typo" commits during development — before opening a pull request, squashing those into a small number of clean, logically-scoped commits (or one) makes the PR's history far more reviewable and useful to anyone reading the log later, compared to leaving every incremental, messy step visible forever.

The same warning from the rebase-vs-merge lesson applies here even more strongly: interactive rebase rewrites every commit hash from the rebased point onward, so it must only be done on commits that haven't been pushed (or, if already pushed, that you're certain no one else has based work on) — rewriting shared, already-pulled history is one of the most disruptive mistakes possible in a collaborative Git workflow.`,
  },
  {
    title: 'Cherry-Picking Commits',
    content: `\`git cherry-pick\` applies a *specific* commit's changes from one branch onto your current branch, without merging or rebasing the entire branch it came from — useful when you need just one particular fix or feature from elsewhere, not everything else that branch contains.

\`\`\`bash
git checkout main
git cherry-pick a1b2c3f   # apply that one commit's changes onto main, as a new commit
\`\`\`

A common real scenario: a critical bug fix was committed on a feature branch that also contains a lot of unfinished, unrelated work — cherry-picking the specific fix commit onto \`main\` (or a hotfix branch) lets that fix ship immediately without waiting for the entire feature branch to be ready, and without merging in unfinished work alongside it.

Cherry-picking, like rebasing, creates a **new commit** with a new hash, containing the same changes as the original — the two commits are not the same object, even though their diffs are identical, which means Git's history doesn't inherently "know" they're related unless you note it manually (many teams add "(cherry picked from commit a1b2c3f)" to the new commit's message, which \`git cherry-pick -x\` appends automatically).

The interview-relevant caveat: cherry-picking can conflict, exactly like a merge, if the target branch has diverged enough from the commit's original context that the patch doesn't apply cleanly — resolved the same way as any merge conflict (edit, stage, then \`git cherry-pick --continue\`). It's also worth knowing when *not* to reach for it: cherry-picking many commits one by one to simulate "merge most of this branch" is usually a sign a proper merge or rebase of the whole branch is the more appropriate tool, since cherry-picking shines specifically for isolated, individual commits, not bulk integration.`,
  },
  {
    title: 'Git Stash',
    content: `\`git stash\` temporarily shelves uncommitted changes (both staged and unstaged, by default) so you can switch to a different branch or task with a clean working directory, then restore those changes later exactly as they were.

\`\`\`bash
git stash                       # shelve current changes, working directory becomes clean
git stash push -m "WIP: login"  # stash with a descriptive message
git checkout main               # now safe to switch — no uncommitted changes in the way
# ... do something else on main ...
git checkout feature/login
git stash pop                   # reapply the most recent stash AND remove it from the stash list
git stash apply                 # reapply WITHOUT removing it from the stash list (can apply again later)
\`\`\`

\`\`\`bash
git stash list                  # see all stashed entries, most recent first
git stash show -p stash@{1}     # view a specific stash's diff
git stash drop stash@{1}        # discard a stash without applying it
\`\`\`

Stashes are stored as a special kind of commit internally, which is why \`git stash pop\` can produce a merge conflict — if the branch you're on has changed in a way that conflicts with the stashed changes since you stashed them, Git has to do the same kind of three-way merge a regular merge would, and pauses for manual resolution exactly the same way.

The interview-relevant scenario this solves: you're mid-way through an uncommitted change when an urgent, unrelated task interrupts (a production bug needs an immediate hotfix on a different branch) — stashing lets you switch context cleanly without either committing half-finished, broken work just to "save" it, or losing it entirely, and \`git stash pop\` resumes exactly where you left off once the interruption is handled.`,
  },
  {
    title: 'Reflog and Recovering Lost Commits',
    content: `The reflog (reference log) is a local, chronological record of every position \`HEAD\` (and branch pointers) have pointed to — every commit, checkout, reset, rebase, and merge is logged, even ones that later become "lost" (unreachable from any branch or tag) after a destructive operation like \`git reset --hard\` or a botched rebase.

\`\`\`bash
git reflog
# a1b2c3f HEAD@{0}: commit: Add login validation
# 9f8e7d2 HEAD@{1}: reset: moving to HEAD~1     <- accidentally lost a1b2c3f's commit here
# 3c4d5e6 HEAD@{2}: commit: Fix typo
\`\`\`

If a commit becomes unreachable (e.g. an accidental \`git reset --hard\` discarded it), it isn't actually deleted immediately — Git keeps unreachable objects around for a default grace period (commonly 30-90 days) before garbage collection, and the reflog gives you the exact hash needed to get back to it.

\`\`\`bash
git reset --hard a1b2c3f   # using the hash found in the reflog, restore the "lost" commit
# or, to inspect first without committing to restoring it yet:
git show a1b2c3f
git checkout a1b2c3f       # detached HEAD, just to look around
\`\`\`

The interview-relevant safety net this represents: the reflog is the reason "I accidentally ran \`git reset --hard\` and lost work" is almost always recoverable, at least for a while, as long as the commit was actually committed at some point (uncommitted working-directory changes that were never staged/committed are not in the reflog and genuinely cannot be recovered this way). Knowing to immediately check \`git reflog\` rather than panicking is one of the most practically valuable pieces of Git knowledge for working confidently with history-rewriting commands.`,
  },
  {
    title: 'Detached HEAD State',
    content: `Normally, \`HEAD\` points at a branch, which in turn points at a commit — committing while on a branch moves both the branch and \`HEAD\` forward together. Checking out a specific commit hash (or a tag) directly, rather than a branch name, puts you in a **detached HEAD** state: \`HEAD\` points directly at that commit, with no branch attached.

\`\`\`bash
git checkout a1b2c3f    # detached HEAD — you're now AT this commit, not on any branch
git checkout v1.0.0     # tags also produce detached HEAD when checked out directly
\`\`\`

In this state, you can look around freely (inspect files, run the code as it existed at that point) with no risk, but if you make new commits while detached, they exist but aren't referenced by any branch — switching to a different branch afterward leaves those new commits unreachable from anywhere, eligible for eventual garbage collection (recoverable via the reflog for a while, as covered in the previous lesson, but easy to genuinely lose track of).

\`\`\`bash
# If you've made commits in detached HEAD and want to keep them:
git checkout -b new-branch-name   # creates a real branch pointing at your current (detached) commit
\`\`\`

The interview-relevant practical guidance: detached HEAD is completely safe for read-only exploration (checking out an old tag to test a historical build, browsing what a file looked like at a specific point) — the risk only arises if you commit new work while detached and forget to create a branch to anchor it before switching away. Git itself warns about this explicitly in the checkout output ("You are in 'detached HEAD' state... If you want to create a new branch to retain commits you create, you may do so"), which is worth recognizing rather than dismissing as boilerplate noise.`,
  },
  {
    title: 'Bisecting to Find Bugs',
    content: `\`git bisect\` performs a binary search through commit history to find the exact commit that introduced a bug — given a known-good commit and a known-bad commit, it checks out commits in between and asks you to mark each as good or bad, narrowing the range by half each time until the culprit commit is identified.

\`\`\`bash
git bisect start
git bisect bad                  # the current commit exhibits the bug
git bisect good v1.0.0          # this earlier commit/tag is known to NOT have the bug

# Git checks out a commit roughly halfway between good and bad — test it, then:
git bisect good   # if the bug is absent here
git bisect bad    # if the bug is present here
# ... repeat; Git keeps narrowing the range ...

git bisect reset  # when done, return to your original branch/commit
\`\`\`

For a bug that's reliably reproducible by running a script or test, \`git bisect run\` automates the entire process — given a command that exits 0 for "good" and non-zero for "bad," Git checks out each candidate commit, runs the command, and proceeds automatically without any manual good/bad input.

\`\`\`bash
git bisect start HEAD v1.0.0
git bisect run npm test -- --grep "login flow"
\`\`\`

The interview-relevant value: with N commits between a known-good and known-bad point, linear inspection takes up to N checks, while bisect's binary search takes only ~log₂(N) — finding the exact culprit among 1,000 commits in roughly 10 steps instead of potentially checking all 1,000 one by one. This is the same logarithmic search principle as binary search on a sorted array, applied to commit history instead of an array, and it's a frequently underused tool precisely because many developers don't think to reach for it before manually guessing or scrolling through history by eye.`,
  },
  {
    title: 'Submodules and Monorepos',
    content: `A **submodule** embeds one Git repository inside another as a reference to a specific commit — used when a project depends on another repository's code directly (a shared library maintained separately) but you want that dependency's exact source pinned at a specific version inside your own repository's tree.

\`\`\`bash
git submodule add https://github.com/example/shared-lib.git libs/shared-lib
git submodule update --init --recursive   # required after cloning a repo that has submodules
\`\`\`

A submodule's parent repository doesn't store the submodule's actual files — it stores a pointer to a specific commit hash in the submodule's own repository, which is why anyone cloning the parent repository must explicitly initialize and update submodules to actually pull that referenced content down.

A **monorepo** takes the opposite approach: instead of splitting related projects into separate repositories linked by submodules, everything (multiple apps, shared libraries, infrastructure code) lives in one single repository, sharing one unified history and one set of branches.

\`\`\`text
Submodules: repo-A (references commit X of repo-B)  +  repo-B (separate history entirely)
Monorepo:   one repo containing apps/web, apps/mobile, packages/shared-ui — one shared history
\`\`\`

The interview-relevant tradeoff: submodules let independent teams/projects version and release separately, but add real friction (the explicit init/update step, the easy-to-forget "did I commit the submodule's new pointer" step when the submodule itself changes). Monorepos simplify cross-project changes (one atomic commit can update a shared library and every consumer of it together) but require more tooling investment as the repository grows (selective builds/tests, since a naive "build and test everything on every commit" approach doesn't scale to a large monorepo) — large companies (Google, Meta) famously favor monorepos specifically for that atomic cross-project change capability, while many smaller teams find submodules (or simply separate repositories with versioned package dependencies, avoiding submodules' friction entirely) sufficient.`,
  },
  {
    title: 'Git Hooks',
    content: `Hooks are scripts Git runs automatically at specific points in the commit/push lifecycle — stored as executable files in \`.git/hooks/\`, used to enforce checks (linting, tests, commit message format) before an action is allowed to proceed, or to trigger automation after one completes.

\`\`\`bash
# .git/hooks/pre-commit (must be executable: chmod +x)
#!/bin/sh
npm run lint || exit 1   # non-zero exit blocks the commit entirely
\`\`\`

Common hooks: \`pre-commit\` (runs before a commit is finalized — linting, formatting checks), \`commit-msg\` (validates the commit message itself, e.g. enforcing a conventional-commits format), \`pre-push\` (runs before pushing — a final test suite run, blocking a push if tests fail), and \`post-merge\` (runs after a merge completes — e.g. automatically reinstalling dependencies if \`package.json\` changed).

Because \`.git/hooks/\` is **not** tracked by Git itself (it's inside the \`.git\` directory, which is explicitly excluded from version control), hooks written directly there don't get shared with collaborators automatically — every team member would need to manually set up the same hooks, which doesn't scale. The standard real-world solution is a tool like **Husky** (for Node.js projects) that installs hooks via a tracked configuration file and a setup script run during \`npm install\`, so the hooks themselves effectively become part of the versioned project setup.

\`\`\`json
// package.json, using Husky
"scripts": { "prepare": "husky install" },
"husky": { "hooks": { "pre-commit": "npm run lint" } }
\`\`\`

The interview-relevant framing: hooks are a way to enforce quality gates *before* code reaches a shared branch or remote, complementing (not replacing) server-side CI checks — local hooks give instant feedback before a commit/push even happens, while CI is the authoritative, can't-be-bypassed-locally check that runs regardless of whether a given developer has hooks configured correctly on their machine.`,
  },
  {
    title: 'Squashing and Commit Hygiene',
    content: `Squashing combines multiple commits into one, most commonly used to clean up a feature branch's messy, incremental commit history (many small "WIP," "fix typo," "actually fix it this time" commits) into a small number of clean, logically meaningful commits before merging.

\`\`\`bash
git rebase -i HEAD~5   # mark commits 2-5 as "squash" or "fixup", keep the first as "pick"
\`\`\`

Many hosted Git platforms (GitHub, GitLab) offer **squash merge** as a pull-request merge option — it automatically combines every commit in the PR's branch into a single commit on the target branch, regardless of how messy the original branch's history was, without requiring the contributor to manually clean it up via interactive rebase first.

\`\`\`text
Feature branch history (messy):      After squash merge into main:
D1: "WIP"                            main: ...---C---S
D2: "fix typo"                                          (S = one commit, all of D1-D4's changes combined,
D3: "actually fix it"                                    with a single clean message)
D4: "add tests"
\`\`\`

The interview-relevant tradeoff: squash merging produces an extremely clean \`main\` history (one commit per merged PR, easy to scan, easy to revert as a single unit) but discards the granular commit-by-commit history of how that PR's code actually evolved — if you ever needed to bisect or blame into the *individual* steps of a complex change, that detail is gone from \`main\`'s history after a squash merge (though it may still exist on the original feature branch if it hasn't been deleted).

A widely adopted middle-ground convention many teams use: keep messy WIP commits during active development for your own convenience, but clean them into logically-scoped, well-described commits (via interactive rebase) — or just accept the platform's squash-merge default — before or at the point of merging into a shared branch, so the permanent, shared history stays meaningful without requiring perfect commit discipline during the actual messy process of writing the code.`,
  },
  {
    title: 'Force Push and Its Dangers',
    content: `\`git push --force\` overwrites the remote branch's history with your local branch's history, even when they've diverged — normally, Git refuses a push if the remote has commits your local branch doesn't (to avoid silently discarding someone else's work), and \`--force\` explicitly overrides that protection.

\`\`\`bash
git push --force origin feature/login   # overwrites the remote, discarding any commits
                                          # that exist there but not in your local branch
\`\`\`

This is necessary specifically after rewriting already-pushed history — an interactive rebase, an amended commit, or a reset on a branch that was previously pushed all produce new commit hashes that don't share ancestry with what's currently on the remote, so a normal push is rejected, and \`--force\` is the only way to push the rewritten version.

The danger: if a teammate has already pulled the old version of that branch and built additional commits on top of it, a force push doesn't just rewrite the remote — it can silently make the teammate's local history diverge unrecoverably from the new remote state, and *their* next push (or even pull) can produce confusing conflicts or, worse, accidentally resurrect the discarded commits, or vice versa lose their new work if they're not careful.

\`\`\`bash
git push --force-with-lease origin feature/login
\`\`\`

\`--force-with-lease\` is the safer alternative most teams should default to: it still force-pushes, but first checks that the remote branch's current state matches what your local repository last knew about it — if someone else pushed to that branch since you last fetched (meaning your force push could silently discard *their* new work), it refuses instead of blindly overwriting. The interview-relevant rule of thumb: force-pushing your own personal feature branch that nobody else is working on is generally fine; force-pushing any shared branch (especially \`main\`) that others actively pull from is almost never acceptable without explicit team-wide coordination.`,
  },
  {
    title: 'Git Workflows: Git Flow and Trunk-Based Development',
    content: `Beyond the basic mechanics of branching and merging, teams adopt explicit **workflows** — conventions for how branches are structured and how work flows from development into production — and the choice has real consequences for release cadence and merge friction.

**Git Flow** uses several long-lived branch types with defined roles: \`main\` (production-ready releases only), \`develop\` (integration branch for completed features), \`feature/*\` branches (branched from \`develop\`, merged back into it when done), and \`release/*\`/\`hotfix/*\` branches for stabilizing a release or patching production urgently.

\`\`\`text
main:     ----------------v1.0------v1.1---
                          /         /
release:           -----/----release/1.1---
develop:    --A---B---C-----D---E-----------
                  \\         /
feature:           ---F----
\`\`\`

**Trunk-based development** takes the opposite approach: nearly everyone commits directly to a single shared branch (\`main\`/\`trunk\`) frequently, with short-lived feature branches (often living hours, not weeks) merged back quickly — relying heavily on feature flags to hide incomplete work in production rather than long-lived branches to isolate it, and on strong CI/automated testing to keep \`main\` always deployable.

The interview-relevant tradeoff: Git Flow's structure suits teams shipping discrete, versioned releases (desktop software, libraries with semantic versioning) where stabilizing a specific release branch independently from ongoing \`develop\` work has real value, but it adds merge overhead and the long-lived \`develop\`/\`feature\` branches can drift significantly before merging, increasing conflict risk. Trunk-based development minimizes merge conflict risk (branches are short-lived, integrating constantly) and fits continuous-deployment web services well, but requires more investment in feature flagging and a CI pipeline trustworthy enough that committing directly to \`main\` frequently doesn't feel risky — neither workflow is universally "correct," and a strong answer names the team/product context that makes each one the better fit.`,
  },
];

export function seedGitLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['git']);
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
