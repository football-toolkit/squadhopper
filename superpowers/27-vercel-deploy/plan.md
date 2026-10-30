# Deploy to Vercel: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record the owner's Vercel setup in the repo: a how-to guide with setup and rollback, ADR 0011 "Host the app on Vercel" with the observed results, and a preview-review step for PRs that change the app.

**Architecture:** Docs only. Push the design and plan commit first so Vercel builds this branch's preview, read the result, then write the ADR, the guide and the workflow changes, one commit each.

**Tech Stack:** Markdown (MADR for the ADR, Diátaxis for the docs), the gh CLI, curl, Vercel Hobby.

**Spec:** [design.md](design.md). Branch: `27-vercel-deploy`.

## Global Constraints

- ADR file: `docs/explanation/decisions/0011-host-the-app-on-vercel.md`, `status: accepted`, `date: 2026-10-30`, `decision-makers: repository owner`, title `# 0011: Host the app on Vercel`.
- ADR index row, in the "Stack and architecture" table: `| [0011](0011-host-the-app-on-vercel.md) | Host the app on Vercel |`.
- Guide file: `docs/how-to/set-up-vercel.md`, title `# How to set up Vercel`.
- `AGENTS.md` gets exactly one new bullet, right after "Merge only after CI is green and the PR checklist is complete.": "When a PR changes what the app shows or does, the repository owner reviews its Vercel preview before merging."
- The preview review is scoped to app changes everywhere it appears: `AGENTS.md`, the how-to step, the flowchart label.
- Sources stay separate: Vercel's docs, Vercel staff on the community forum (with the thread link), and what we observed, each attributed to its source.
- Observed results are facts with their commit or PR: `e44796f` (import, carries the `Co-authored-by: Claude …` trailer), Dependabot PRs #32 (`08c194b`) and #34 (`f1ba75b`), authored by `dependabot[bot]`, both deployed to production. No guessing at why.
- No `vercel.app` URLs, no project name, no organization or team name, no personal data in any committed file.
- Accepted ADRs (0001–0010) are not edited.
- No changes outside: `superpowers/27-vercel-deploy/`, the new ADR, `docs/explanation/decisions/README.md`, the new guide, `docs/how-to/README.md`, `docs/README.md`, `docs/how-to/development-workflow.md`, `AGENTS.md`.
- Stage by explicit path only. Every commit message ends with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. The commit commands below show only the subject.
- After each commit, show the repository owner only `git show --stat`.
- The owner approved one push before Task 1 (the design and plan commit). Any other push, `gh issue edit` or `gh pr create` needs the owner's go-ahead first.

## Review Focus

- **A reader who rolls back, then merges a fix:** the fix builds but doesn't go live until Undo Rollback. Task 2 checks that the guide's rollback section has this warning as a blockquote and names **Undo Rollback**.
- **An agent following AGENTS.md on a docs-only PR:** it must not wait for, or claim, a preview review. Task 3 checks that the bullet, the step and the flowchart all carry the "if the app changed" scope.
- **A reader taking the forum's word for Vercel's:** the private-organization-repo claim must point to the forum thread, not the docs. Task 1 greps the ADR for the thread link next to "Vercel staff".
- **A preview that fails or is blocked:** stop before writing the ADR and tell the owner. Task 0 Step 5 is the gate.
- **Someone copying the guide for another project:** no names or URLs of ours. Task 4 greps every changed file.

---

### Task 0: Commit and push the design and plan, then read the preview result

**Files:**
- Create: `superpowers/27-vercel-deploy/design.md`, `superpowers/27-vercel-deploy/plan.md` (both exist already)

**Interfaces:**
- Produces: the preview result (built or failed, needs a login or not), which Task 1 writes into the ADR as the third observation.

- [ ] **Step 1:** Run `git status --short`. Expected: only `superpowers/27-vercel-deploy/` is listed.
- [ ] **Step 2:** Commit:

```bash
git add superpowers/27-vercel-deploy/design.md superpowers/27-vercel-deploy/plan.md
git commit -m "docs: design and plan the Vercel deploy"
```

- [ ] **Step 3:** Push (approved by the owner): `git push -u origin 27-vercel-deploy`.
- [ ] **Step 4:** Wait for Vercel's commit status to leave `pending`, using Monitor with an until-loop on:

```bash
gh api "repos/{owner}/{repo}/commits/$(git rev-parse HEAD)/statuses" --jq '[.[] | select(.context=="Vercel")][0].state'
```

  Expected: `success`, with description "Deployment has completed".
- [ ] **Step 5 (gate):** If the state is `failure` or `error`, or no Vercel status appears within 10 minutes, stop. Tell the owner the state, its description, and any Vercel bot comment on the commit. Don't start Task 1.
- [ ] **Step 6:** Check that the preview needs a login. Build the branch URL in the shell only, from the team and project in the status's `target_url` (`https://vercel.com/<team>/<project>/<id>`): `https://<project>-git-27-vercel-deploy-<team>.vercel.app`. Run `curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' <url>`. Expected, either counts as "needs a login": `401`, or a `3xx` code whose redirect URL is a `vercel.com` login URL. In both cases `curl -s <url> | grep -c 'Coming soon'` prints `0`. If the host doesn't resolve, ask the owner for the preview URL from the dashboard. Never write the URL into a file.
- [ ] **Step 7:** Note for the PR body: the commit SHA, the status, and the HTTP code.

### Task 1: ADR 0011 and the ADR index

**Files:**
- Create: `docs/explanation/decisions/0011-host-the-app-on-vercel.md`
- Modify: `docs/explanation/decisions/README.md` ("Stack and architecture" table)

**Interfaces:**
- Consumes: the preview result from Task 0.
- Produces: the ADR path, which Task 2's guide and Task 3's workflow page link to as `../explanation/decisions/0011-host-the-app-on-vercel.md`.

- [ ] **Step 1:** Write the ADR from `docs/explanation/decisions/templates/adr.md`, with the content in design.md's "ADR 0011" section. Sections in this order: Context and problem statement, Decision drivers, Considered options (Vercel in bold), Decision outcome with the accepted-limits list, an "Observed on Hobby" subsection with three bullets (import, Dependabot, this branch's preview from Task 0), Consequences, Confirmation, Pros and cons of the options (Cloudflare Workers, a long-running Node server), More information. Follow ADR 0010's style: relative links to other ADRs, short bullets.
- [ ] **Step 2:** Add the index row from Global Constraints after the 0009 row.
- [ ] **Step 3:** Verify:

```bash
grep -n 'Vercel staff' docs/explanation/decisions/0011-host-the-app-on-vercel.md
grep -c 'community.vercel.com/t/unable-to-deploy-from-organizational-private-repository/16334' docs/explanation/decisions/0011-host-the-app-on-vercel.md
grep -n -E 'e44796f|08c194b|f1ba75b|#32|#34' docs/explanation/decisions/0011-host-the-app-on-vercel.md
grep -n '0011' docs/explanation/decisions/README.md
```

  Expected: the "Vercel staff" line and the thread link (count ≥ 1) are in the same bullet; all three SHAs and both PR numbers appear; the index row matches Global Constraints.
- [ ] **Step 4:** Commit:

```bash
git add docs/explanation/decisions/0011-host-the-app-on-vercel.md docs/explanation/decisions/README.md
git commit -m "docs: decide to host the app on Vercel"
```

### Task 2: The Vercel setup guide and the indexes

**Files:**
- Create: `docs/how-to/set-up-vercel.md`
- Modify: `docs/how-to/README.md` (Contents table), `docs/README.md` (Contents table, How-to row)

**Interfaces:**
- Consumes: the ADR path from Task 1.
- Produces: the guide path, which Task 3 links to as `set-up-vercel.md`.

- [ ] **Step 1:** Write the guide with the content in design.md's "`docs/how-to/set-up-vercel.md`" section: intro, then the sections "Before you start", "Steps" (six numbered steps, dashboard labels as in the design), "Check it works", "What deploys", "Roll back production" (the after-rollback warning as a `>` blockquote that names **Undo Rollback**), "Where next" (ADR 0011, development workflow, `README.md` of how-to, docs home). Match `development-workflow.md`'s tone and "Where next" emoji style.
- [ ] **Step 2:** Add the how-to index row: `| [Set up Vercel](set-up-vercel.md) | How to deploy the app to Vercel, and how to roll back |`.
- [ ] **Step 3:** In `docs/README.md`, change the How-to row's text to "The development workflow, from idea to merge, and the Vercel setup".
- [ ] **Step 4:** Verify:

```bash
grep -n -E '^## ' docs/how-to/set-up-vercel.md
grep -n -A3 'Undo Rollback' docs/how-to/set-up-vercel.md
grep -n -E 'NEXT_TELEMETRY_DISABLED|24\.x|#35|Standard Protection|Vercel Authentication|Config' docs/how-to/set-up-vercel.md
```

  Expected: the six section headings in order; the warning is on `>` lines; every step's key value appears.
- [ ] **Step 5:** Commit:

```bash
git add docs/how-to/set-up-vercel.md docs/how-to/README.md docs/README.md
git commit -m "docs: add a guide to set up Vercel"
```

### Task 3: Review the preview for app changes

**Files:**
- Modify: `docs/how-to/development-workflow.md` (flowchart, steps 8–9, "Where next"), `AGENTS.md` (Workflow section)

**Interfaces:**
- Consumes: the guide path from Task 2.

- [ ] **Step 1:** In the flowchart, change `H -->|"CI green"| I` to `H -->|"CI green, preview reviewed if the app changed"| I`.
- [ ] **Step 2:** Insert step 8, **Review the preview, if the app changed.**, and renumber the squash-merge step to 9, with the wording in design.md's "`docs/how-to/development-workflow.md`" section. Step 8 says docs-only and workflow PRs skip it, that the owner does it because only the owner can log in on Hobby, and links `set-up-vercel.md`. Step 9 adds that merging deploys `main` to production.
- [ ] **Step 3:** Add `- 🛠️ Set up Vercel: [set-up-vercel.md](set-up-vercel.md)`-style line to "Where next", matching that list's existing format.
- [ ] **Step 4:** Add the `AGENTS.md` bullet from Global Constraints.
- [ ] **Step 5:** Verify:

```bash
grep -n 'preview reviewed if the app changed' docs/how-to/development-workflow.md
grep -n -E '^[0-9]+\. \*\*' docs/how-to/development-workflow.md
grep -n 'reviews its Vercel preview before merging' AGENTS.md
```

  Expected: the flowchart label; steps numbered 1–9 with no gap or repeat; the AGENTS.md bullet, directly after the "Merge only after" bullet.
- [ ] **Step 6:** Commit:

```bash
git add docs/how-to/development-workflow.md AGENTS.md
git commit -m "docs: review the PR preview before merging"
```

### Task 4: Check the whole branch

**Files:** none changed, unless a check fails.

- [ ] **Step 1:** Run the five checks: `npm test && npm run lint && npm run typecheck && npm run format:check && npm run build`. Expected: all pass, working tree clean.
- [ ] **Step 2:** Check relative links in the changed Markdown files:

```bash
for f in $(git diff --name-only main...HEAD -- '*.md'); do
  grep -o -E '\]\([^)#]+' "$f" | sed 's/^](//' | grep -v -E '^(https?:|mailto:)' | while read -r l; do
    [ -e "$(dirname "$f")/$l" ] || echo "BROKEN: $f -> $l"
  done
done
```

  Expected: no output.
- [ ] **Step 3:** Grep every changed file, the design and plan included, for our names and URLs: the repository and organization names, and the Vercel team slug and project name from the Vercel status's `target_url` (`https://vercel.com/<team>/<project>/<id>`, as in Task 0, Step 6). The pattern is built at run time, so this plan doesn't contain the names either. The status comes from the branch's first commit (Task 0's), the only one pushed so far:

```bash
names=$(gh repo view --json name,owner --jq '.name + "|" + .owner.login')
vercel=$(gh api "repos/{owner}/{repo}/commits/$(git rev-list --reverse main..HEAD | head -1)/statuses" \
  --jq '[.[] | select(.context=="Vercel")][0].target_url' | awk -F/ '{print $4 "|" $5}')
git diff --name-only main...HEAD | xargs grep -n -i -E "$names|$vercel"
git diff --name-only main...HEAD | grep -v '^superpowers/' | xargs grep -n 'vercel\.app'
```

  Expected: no output from either. (The design and plan mention `vercel.app` only as the rule and as a placeholder, so the second grep skips them.)
- [ ] **Step 4:** Run `git diff --stat main...HEAD`. Expected: only the paths in Global Constraints.
- [ ] **Step 5:** Hand back to the owner: ask once whether to tick "Done when" items 1–6 in issue #27 (how each was checked is in design.md's "Ticking the 'Done when' items"), push, and open the PR with `.github/pull_request_template.md`, `Closes #27`, and assignee `spanciuc`. The PR body notes the Task 0 preview result and why no unit tests changed.
