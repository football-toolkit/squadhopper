# Upgrade to Node 26: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the project from Node 24 to Node 26: the runtime pin, `@types/node`, and the docs that name the version.

**Architecture:** No code changes. `.nvmrc` drives local runs (`nvm use`) and CI (`actions/setup-node` with `node-version-file`). `engines.node` in `package.json` drives Vercel. `@types/node` follows the runtime's major. The docs name the version in three places.

**Tech Stack:** Node 26.13.1, npm 11.20.0, `@types/node` 26.6.6, Next.js 16.4, Vitest 5, Playwright 1.65, Vercel.

**Spec:** [design.md](design.md). Branch: `35-node-26-upgrade`.

## Global Constraints

- `.nvmrc` is `26`. `engines.node` is `26.x`. `@types/node` is exactly `26.6.6` (`.npmrc` has `save-exact=true`).
- No other dependency changes version.
- No CI workflow change, and no change to `.github/dependabot.yml`.
- History stays as it is: no edits to accepted ADRs (ADR 0011 included) or to other changes' `superpowers/` folders.
- No ADR for this change. The PR body says why: it applies the existing rule (pin the newest LTS Vercel offers), and it's cheap to undo.
- Don't set `VERCEL_FETCH_DISABLE_H2`.
- Install nothing on this machine beyond the project dependencies (`npm ci`, `npm install`): no Playwright browsers, no global tools.
- No changes outside: `.nvmrc`, `package.json`, `package-lock.json`, `README.md`, `AGENTS.md`, `docs/how-to/set-up-vercel.md`, and `superpowers/35-node-26-upgrade/`.
- Stage by explicit path only. No personal data.
- Every commit message ends with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, after a blank line. The commit commands below show only the subject, so add the trailer to each.
- After each commit, show the repository owner only `git show --stat`.
- Ask the repository owner before every command that changes GitHub: `git push`, `gh issue edit`, `gh pr create`.

## Review Focus

- **Checks run against another checkout's dependencies:** this worktree has no `node_modules`, so Node finds the main checkout's copy, three folders up, which may not match this branch's lockfile. Every check must use this branch's own install. Task 1, Step 1 runs `npm ci` in the worktree first, and checks that `node_modules/@types/node` exists here.
- **Lockfile churn:** `npm install` could move other packages too. Task 1, Step 5 checks that the `package-lock.json` diff touches only the root `engines`, `@types/node` and the `undici-types` it depends on.
- **CI fails on `npm ci`:** if `package.json` and `package-lock.json` disagree. Task 1, Step 6 runs `npm ci` again, from the committed lockfile.
- **New runtime deprecation warnings:** Node 26 deprecates `module.register()` and some crypto and stream APIs at runtime, and a dependency may call them. Task 3, Step 2 scans the output of the checks for `DeprecationWarning`.
- **Vercel builds on another version:** Task 3's last step has the owner check the preview's build log for Node 26.

---

### Task 1: Pin Node 26 and move `@types/node` to 26

**Files:**

- Modify: `.nvmrc` (`24` → `26`)
- Modify: `package.json` (`engines.node`, `devDependencies["@types/node"]`)
- Modify: `package-lock.json` (by npm only)

**Interfaces:**

- Produces: a branch where `node -v` is v26 and `npm ls @types/node` shows `26.6.6`. Tasks 2 and 3 rely on it.

- [ ] **Step 1: Install this branch's dependencies in the worktree**

Run: `node -v && npm ci && test -d node_modules/@types/node && echo local-install-ok`
Expected: `v26.13.1` (any v26 is fine), then `local-install-ok`.

- [ ] **Step 2: Pin the runtime**

Set `.nvmrc` to `26`, with a trailing newline. In `package.json`, set `"engines": { "node": "26.x" }`.

- [ ] **Step 3: Move `@types/node`**

Run: `npm install --save-dev @types/node@26.6.6`
Expected: `package.json` shows `"@types/node": "26.6.6"` (exact, with no `^`).

- [ ] **Step 4: Check the pins**

Run: `cat .nvmrc && node -p "require('./package.json').engines.node" && npm ls @types/node --depth=0`
Expected: `26`, `26.x`, and `@types/node@26.6.6`.

- [ ] **Step 5: Check the lockfile diff**

Run: `git diff package-lock.json`
Expected: a short diff. The root `engines` reads `"node": "26.x"`. The only package entries that change are `node_modules/@types/node` and any `undici-types` it depends on. If anything else moves, stop and run `git checkout package-lock.json`, then retry Step 3.

- [ ] **Step 6: Reinstall from the lockfile and run the quick checks**

Run: `npm ci && npm run typecheck && npm test`
Expected: the install finishes without an `EBADENGINE` warning, the typecheck has no errors, and all tests pass (188 before this change).

- [ ] **Step 7: Commit**

```bash
git add .nvmrc package.json package-lock.json
git commit -m "chore: pin Node 26 and move @types/node to 26"
```

### Task 2: Name Node 26 in the docs

**Files:**

- Modify: `README.md:10`
- Modify: `AGENTS.md:7`
- Modify: `docs/how-to/set-up-vercel.md:18`

**Interfaces:**

- Consumes: Task 1's pins (`.nvmrc` `26`, `engines.node` `26.x`).

- [ ] **Step 1: Find every mention outside history**

Run: `grep -rnE 'Node(\.js)? 24|24\.x' --include=*.md . | grep -v node_modules | grep -vE '^\./superpowers/|^\./docs/explanation/decisions/'`
Expected: exactly the three lines listed under Files. If there are others, update them too and add them to this task's Files.

- [ ] **Step 2: Update the three lines**

- `README.md`: "The app needs Node.js 24." → "The app needs Node.js 26." Leave the rest of the line as it is.
- `AGENTS.md`: "The app is built with Next.js on Node 24." → "The app is built with Next.js on Node 26."
- `docs/how-to/set-up-vercel.md`, step 7 becomes exactly:

  ```markdown
  7. **Pick the Node.js version.** In Settings → Build and Deployment → Node.js Version, pick 26.x, to match `engines` in `package.json`. If the two differ, `engines` wins, so production runs on Node 26 either way. The setting just keeps the dashboard in line with it.
  ```

- [ ] **Step 3: Check that nothing is left**

Run: Step 1's command again, then `npm run format:check`.
Expected: no output from the search, and the formatting check passes. Don't reformat any Markdown file.

- [ ] **Step 4: Commit**

```bash
git add README.md AGENTS.md docs/how-to/set-up-vercel.md
git commit -m "docs: name Node 26 as the project's runtime"
```

### Task 3: Verify the whole branch on Node 26

**Files:** none changed. The end-to-end tests run in CI on every PR, on Node 26 from `.nvmrc`. Don't install Playwright browsers or any other tool on this machine. Project dependencies installed with `npm ci` are fine.

- [ ] **Step 1: Run the five checks**

Run, with `LOG` set to a file in the session's scratchpad folder: `( npm test && npm run lint && npm run typecheck && npm run format:check && npm run build ) > "$LOG" 2>&1; echo "exit $?"; tail -30 "$LOG"`
Expected: `exit 0`, and the build output names Next.js 16.4.

- [ ] **Step 2: Scan for deprecation warnings**

Run: `grep -n 'DeprecationWarning\|ExperimentalWarning' "$LOG"`
Expected: no output. If something shows up, name the package and the warning code (for example DEP0201) in the PR body. Fix it only if it comes from our own code.

- [ ] **Step 3: Check that the working tree is clean**

Run: `git status --short`
Expected: no output (`.next/` and `node_modules/` are ignored).

- [ ] **Step 4: Hand the Vercel check to the owner**

After the push and the PR (each needs the owner's OK), the owner sets Settings → Build and Deployment → Node.js Version to 26.x and opens the PR's Vercel preview build log. Expected: the log shows Node 26 (for example "Using Node.js 26.x" or `node -v` v26). That ticks the third "Done when" item.

## After the tasks

Follow the repo workflow: tick the "Done when" items that are met (show the lines first), push, and open the PR with `.github/pull_request_template.md`, `Closes #35`, the reason for no ADR, and how each item was checked. Ask the owner once before these GitHub steps.
