# Check every PR with CI: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run the five project checks on every PR into `main` in one `checks` job, keep dependencies and pinned actions current with Dependabot, and record the Dependabot exemption as ADR 0010.

**Architecture:** One GitHub Actions workflow with one job that calls the same `npm run …` scripts people run locally. One Dependabot config for npm and GitHub Actions. Docs changes in `AGENTS.md`, the how-to guide and a new ADR. The owner adds the required-check rule by hand once the PR's CI run is green.

**Tech Stack:** GitHub Actions (`actions/checkout` v7.0.1, `actions/setup-node` v7.1.0), Dependabot version updates, repository rulesets, Node 24, npm.

**Spec:** [design.md](design.md). Branch: `26-ci-checks`.

## Global Constraints

- Actions: only `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1` and `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0`. No other `uses:`.
- Workflow: `name: CI`, trigger `pull_request` with `branches: [main]` only, `permissions: contents: read`, `env: NEXT_TELEMETRY_DISABLED: 1`, job id `checks` with no `name:`, `runs-on: ubuntu-latest`, `timeout-minutes: 10`.
- Dependabot: `version: 2`, `weekly`, `commit-message.prefix: chore` on both entries, `directory: "/"`.
- ADR file: `docs/explanation/decisions/0010-merge-dependabot-prs-without-an-issue.md`, `status: accepted`, `date: 2026-10-28`, `decision-makers: repository owner`.
- Accepted ADRs (0001–0009) are not edited.
- No changes outside: `.github/workflows/ci.yml`, `.github/dependabot.yml`, `AGENTS.md`, `docs/how-to/development-workflow.md`, `docs/explanation/decisions/README.md`, the new ADR, and `superpowers/26-ci-checks/`.
- Stage by explicit path only. No personal data.
- Every commit message ends with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, after a blank line. The commit commands below show only the subject, so add the trailer to each.
- After each commit, show the repository owner only `git show --stat`.
- Ask the repository owner before every command that changes GitHub: `gh issue edit`, `git push`, `gh pr create`.

## Review Focus

- **A PR from Dependabot:** the workflow must run with no secrets and a read-only token. Task 1 checks that the file has no `secrets.` reference and no `permissions` wider than `contents: read`.
- **A second push to the same PR:** the old run is cancelled, not left to finish. Task 1 checks the `concurrency` block: group keyed on the PR number, `cancel-in-progress: true`.
- **Someone renaming the job:** the required check breaks without warning. Task 1 checks that a comment above `checks:` says the ruleset matches this name.
- **A major `@types/node` update:** no PR, because its major has to match Node 24. Task 2 checks the `ignore` entry.
- **A reader following the how-to after a bot PR fails CI:** they close it and open a Task, and never push to the Dependabot branch. Task 3 greps for this in `AGENTS.md` and the how-to.

---

### Task 0: Commit the design and the plan

**Files:**
- Create: `superpowers/26-ci-checks/design.md`, `superpowers/26-ci-checks/plan.md` (both exist already)

- [ ] **Step 1:** Run `git status --short` and confirm the only paths listed are under `superpowers/26-ci-checks/`.
- [ ] **Step 2:** Commit:

```bash
git add superpowers/26-ci-checks/design.md superpowers/26-ci-checks/plan.md
git commit -m "docs: design and plan the CI checks"
```

### Task 1: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: a check run named `checks` on every PR into `main`. The ruleset (Task 4) and the docs (Task 3) refer to this exact name.

- [ ] **Step 1: Write `.github/workflows/ci.yml`** with the values in Global Constraints, plus:
  - `concurrency: { group: ${{ github.workflow }}-${{ github.event.pull_request.number }}, cancel-in-progress: true }`
  - a comment above `checks:` saying the `main` ruleset requires this job by name, so renaming it breaks the required check
  - steps in this order: checkout (`with: persist-credentials: false`), setup-node (`with: node-version-file: .nvmrc, cache: npm`), then `npm ci`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npm run build`, each its own step with a `name:`
- [ ] **Step 2: Check it**

```bash
python3 -c "import yaml,sys; d=yaml.safe_load(open('.github/workflows/ci.yml')); j=d['jobs']; assert list(j)==['checks'] and 'name' not in j['checks']; assert d[True]=={'pull_request':{'branches':['main']}}; assert d['permissions']=={'contents':'read'}; assert str(d['env']['NEXT_TELEMETRY_DISABLED'])=='1'; assert j['checks']['timeout-minutes']==10; print('ok')"
grep -E '^\s*-?\s*uses:' .github/workflows/ci.yml | grep -vE 'uses: actions/(checkout|setup-node)@[0-9a-f]{40} # v[0-9.]+$' && echo BAD || echo pinned-ok
grep -n 'secrets\.' .github/workflows/ci.yml && echo BAD || echo no-secrets
```

Expected: `ok`, `pinned-ok`, `no-secrets`. (PyYAML reads the `on:` key as `True`.)

- [ ] **Step 3:** Run `npm ci && npm run typecheck && npm run lint && npm run format:check && npm test && NEXT_TELEMETRY_DISABLED=1 npm run build`, as the workflow will. Expected: all pass, and `git status --short` shows only `.github/workflows/ci.yml` as new.
- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: check every pull request"
```

### Task 2: Dependabot

**Files:**
- Create: `.github/dependabot.yml`

- [ ] **Step 1: Write `.github/dependabot.yml`** with two `updates` entries:
  - `package-ecosystem: npm`: group `npm-minor-patch` (`patterns: ["*"]`, `update-types: [minor, patch]`), and `ignore: [{ dependency-name: "@types/node", update-types: ["version-update:semver-major"] }]`
  - `package-ecosystem: github-actions`: group `github-actions` (`patterns: ["*"]`)
  - both: `directory: "/"`, `schedule: { interval: weekly }`, `commit-message: { prefix: chore }`
- [ ] **Step 2: Check it**

```bash
python3 -c "import yaml; d=yaml.safe_load(open('.github/dependabot.yml')); u={x['package-ecosystem']:x for x in d['updates']}; assert d['version']==2 and set(u)=={'npm','github-actions'}; assert all(x['directory']=='/' and x['schedule']['interval']=='weekly' and x['commit-message']['prefix']=='chore' for x in u.values()); assert u['npm']['groups']['npm-minor-patch']['update-types']==['minor','patch']; assert u['npm']['ignore']==[{'dependency-name':'@types/node','update-types':['version-update:semver-major']}]; assert u['github-actions']['groups']['github-actions']['patterns']==['*']; print('ok')"
```

Expected: `ok`.

- [ ] **Step 3: Commit**

```bash
git add .github/dependabot.yml
git commit -m "chore: keep dependencies current with Dependabot"
```

### Task 3: ADR 0010 and the docs

**Files:**
- Create: `docs/explanation/decisions/0010-merge-dependabot-prs-without-an-issue.md`
- Modify: `docs/explanation/decisions/README.md` (the "How we work" table)
- Modify: `AGENTS.md` (Workflow section)
- Modify: `docs/how-to/development-workflow.md` (steps 7 and 8, a new "Dependency updates" section before "Big work", "Where next")

- [ ] **Step 1: Write ADR 0010** from `docs/explanation/decisions/templates/adr.md`. Title: `# 0010: Merge Dependabot PRs without an issue`. Follow the design's "ADR 0010" section. Considered options are listed together as 1–3, then Decision outcome with option 2 and its "Scope of the exemption" bullet, then Consequences, Confirmation, "Pros and cons of the options" (options 1 and 3), and "More information" linking 0004, 0005 and 0006. Decision drivers: little manual work per update; every code change we write is still traced to an issue; security fixes land quickly.
- [ ] **Step 2:** Add `| [0010](0010-merge-dependabot-prs-without-an-issue.md) | Merge Dependabot PRs without an issue |` as the last row of the "How we work" table in `docs/explanation/decisions/README.md`.
- [ ] **Step 3:** Make the three `AGENTS.md` Workflow edits quoted in the design's "`AGENTS.md`" section, word for word.
- [ ] **Step 4:** Make the how-to edits in the design's "`docs/how-to/development-workflow.md`" section. Add `- 💡 Why Dependabot PRs skip the issue: [ADR 0010](../explanation/decisions/0010-merge-dependabot-prs-without-an-issue.md)` after the ADR 0007 line in "Where next".
- [ ] **Step 5: Check it**

```bash
grep -c 'version updates and security updates' AGENTS.md docs/how-to/development-workflow.md docs/explanation/decisions/0010-*.md
grep -n 'Never push to a Dependabot branch' AGENTS.md
grep -n 'closes it and opens a Task' docs/how-to/development-workflow.md
grep -n 'Once CI exists' docs/how-to/development-workflow.md && echo BAD || echo step7-ok
grep -n 'CI is green' AGENTS.md docs/how-to/development-workflow.md
git diff --stat -- docs/explanation/decisions/000*.md
```

Expected: at least one hit in each of the three files for the first grep. The `Never push`, `closes it and opens a Task` and `CI is green` greps each find their line. `step7-ok`. The last command prints nothing, because no accepted ADR changed.

- [ ] **Step 6:** Run all five checks: `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`. All must pass.
- [ ] **Step 7: Commit**

```bash
git add docs/explanation/decisions/0010-merge-dependabot-prs-without-an-issue.md docs/explanation/decisions/README.md AGENTS.md docs/how-to/development-workflow.md
git commit -m "docs: exempt Dependabot PRs from the issue workflow"
```

### Task 4: PR, CI run, ruleset, ticks

- [ ] **Step 1:** Run `git status --short` (clean) and `git log --oneline main..` (four commits, from Tasks 0–3).
- [ ] **Step 2:** Ask the owner, then tick the issue's Dependabot item, the pinning, token and timeout item, and the ADR and docs item with `gh issue edit 26 --body-file <file>`. Fetch the body fresh just before editing, edit only the checkboxes, and diff old against new before running the command.
- [ ] **Step 3:** Ask the owner, then `git push` and open the PR with `.github/pull_request_template.md`. Title: `ci: check every pull request`. Body: `Closes #26`, how each "Done when" item was checked, why ADR 0010 was added, and the exact ruleset steps from the design's "Ruleset on `main`" section. Assignee: `spanciuc`.
- [ ] **Step 4:** Wait for the PR's CI run. Confirm with `gh pr checks <number>` that it shows one job, `checks`, passing. Then ask the owner and tick the CI-job item.
- [ ] **Step 5:** Ask the owner to add the rule (design's "Ruleset on `main`"). After they say it's done, check it with `gh api repos/football-toolkit/squadhopper/rulesets/25302417`. Expected: a `required_status_checks` rule with `strict_required_status_checks_policy: true` and context `checks` with the GitHub Actions `integration_id` (15368); the existing `pull_request` rule unchanged; `bypass_actors: []`. Then ask the owner and tick the ruleset item.
- [ ] **Step 6:** The owner merges. After the merge, check that the repo's Dependabot tab (Insights → Dependency graph → Dependabot) lists both ecosystems with no config errors, and report the result. This is a follow-up, not a "Done when" item.
