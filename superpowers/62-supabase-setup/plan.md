# Set up Supabase: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pin the app's functions to Frankfurt with `vercel.json`, and record the owner's Supabase setup in the repo: a how-to guide, ADR 0016 "Use Supabase for authentication", ADR 0017 "Run in the EU, in Frankfurt", and one "Amended by" line in ADR 0011.

**Architecture:** One config file and docs. No app code. Commits in this order: design and plan, the Frankfurt region, the Supabase ADR, the Supabase guide, then whole-branch checks. Nothing is pushed until the end. The `fra1` check runs on the PR's preview, after the owner's go-ahead to push.

**Tech Stack:** Vercel `vercel.json`, Prettier, Markdown (MADR for ADRs, Diátaxis for docs).

**Spec:** [design.md](design.md). Branch: `62-supabase-setup`.

## Global Constraints

- ADR files, each with `status: accepted`, `date: 2026-11-16` and `decision-makers: repository owner`:
  - `docs/explanation/decisions/0016-use-supabase-for-authentication.md`, title `# 0016: Use Supabase for authentication`
  - `docs/explanation/decisions/0017-run-in-the-eu-in-frankfurt.md`, title `# 0017: Run in the EU, in Frankfurt`
- ADR index rows, at the end of the "Stack and architecture" table:
  - `| [0016](0016-use-supabase-for-authentication.md) | Use Supabase for authentication |`
  - `| [0017](0017-run-in-the-eu-in-frankfurt.md) | Run in the EU, in Frankfurt |`
- ADR 0011 gets exactly one new line, a paragraph directly under its `# 0011: …` title: ``Amended by [0017](0017-run-in-the-eu-in-frankfurt.md): adds `vercel.json` for the function region.`` Nothing else in 0011 changes, including its "No `vercel.json` in the repo." line. No other accepted ADR is edited.
- Guide file: `docs/how-to/set-up-supabase.md`, title `# How to set up Supabase`.
- Exact copy for the guide's warning box (a `>` blockquote, starting with a bold line): keep the names exactly `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Supabase's Next.js snippet uses `NEXT_PUBLIC_` names, and Vercel warns about them. "Don't add the `NEXT_PUBLIC_` prefix, and don't click **Change to Config**." The reason, as Vercel's warning gives it: Config keeps the `NEXT_PUBLIC_` name, so the value would still be built into the browser code, and we keep both values on the server. Don't describe what the button does internally.
- Redeploy rule in the guide: if the values are added or changed after the code that reads them is live, redeploy production, because a change only applies to new deployments. This time the merge deploys anyway.
- Data API reason, the same in the guide and in ADR 0016: "off, because nothing uses it yet; a later Feature turns it on if it needs it".
- Rate-limit citation in ADR 0016: link `https://supabase.com/docs/guides/auth/rate-limits` and quote "Publishable API keys and legacy `anon`/`service_role` API keys are not supported." (said of `Sb-Forwarded-For` forwarding).
- Automatic RLS citation: `https://supabase.com/blog/supabase-security-2025-retro`, credited as a blog post, not as the docs.
- **Owner-supplied facts, still missing.** Ask the owner before Task 4. Never guess them:
  - the dashboard menu path for **Allow new users to sign up**
  - the dashboard menu path for the minimum password length
  - the type the two Vercel variables show (the owner left the default)
- No project URL, project ID, key value, project name, team name or personal data in any committed file. Placeholders only: `https://<project-id>.supabase.co`, `sb_publishable_…`.
- No changes outside: `superpowers/62-supabase-setup/`, `vercel.json`, `package.json` (the `format` and `format:check` scripts only), the two new ADRs, `docs/explanation/decisions/0011-host-the-app-on-vercel.md` (the one line), `docs/explanation/decisions/README.md`, `docs/how-to/set-up-supabase.md`, `docs/how-to/set-up-vercel.md`, `docs/how-to/README.md`, `docs/README.md`.
- Stage by explicit path only. Every commit message ends with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. The commit commands below show only the subject.
- After each commit, show the repository owner only `git show --stat`.
- Any `git push`, `gh issue edit` or `gh pr create` needs the owner's go-ahead first.

## Review Focus

- **The owner pastes Supabase's Next.js snippet into Vercel:** the guide must stop the `NEXT_PUBLIC_` names before they're saved. Task 4 greps for the blockquote's exact sentence.
- **A reader picks "Europe" under General regions:** the project may land in London or Zurich, and the region can't be changed later. Task 4 checks that the guide names "Specific regions", "London or Zurich" and `eu-central-1`.
- **A reader whose project already exists with the Data API on:** the guide must say where to switch it off. Task 4 greps for "Integrations → Data API".
- **A reader who changes a value later and expects it live:** the guide's redeploy rule covers it. Task 4 greps for "redeploy".
- **Someone copying the guide or ADRs for another project:** no names, URLs or keys of ours. Task 5 greps every changed file.

---

### Task 1: Commit the design and plan

**Files:**
- Create: `superpowers/62-supabase-setup/design.md`, `superpowers/62-supabase-setup/plan.md` (both exist already)

- [ ] **Step 1:** Run `git status --short`. Expected: only `superpowers/62-supabase-setup/` is listed.
- [ ] **Step 2:** Commit:

```bash
git add superpowers/62-supabase-setup/design.md superpowers/62-supabase-setup/plan.md
git commit -m "docs: design and plan the Supabase setup"
```

### Task 2: Run the functions in Frankfurt

**Files:**
- Create: `vercel.json`, `docs/explanation/decisions/0017-run-in-the-eu-in-frankfurt.md`
- Modify: `package.json` (`format`, `format:check`), `docs/explanation/decisions/0011-host-the-app-on-vercel.md` (one line), `docs/explanation/decisions/README.md`, `docs/how-to/set-up-vercel.md` (step 3)

**Interfaces:**
- Produces: the ADR 0017 path, which Tasks 3 and 4 link to.

- [ ] **Step 1:** Create `vercel.json` with the exact content in design.md's "`vercel.json` (new)" section.
- [ ] **Step 2:** In `package.json`, add `vercel.json` to the end of the file list in both `format` and `format:check`, after `.prettierrc.json`.
- [ ] **Step 3:** Run `npm run format:check`. Expected: passes, and the file list includes `vercel.json`. If it fails on `vercel.json`, run `npm run format` and check again.
- [ ] **Step 4:** Check the region options against the current region lists, [Supabase regions](https://supabase.com/docs/guides/platform/regions) and [Vercel regions](https://vercel.com/docs/regions). Note which EU cities both offer (for the "another EU region" option), and Vercel's default function region (for the third option).
- [ ] **Step 5:** Write ADR 0017 from the template and design.md's "ADR 0017" section:
  - Considered options: 1. Frankfurt for both; 2. another EU region both offer, naming them from Step 4; 3. Vercel's default function region with the database in the EU.
  - Decision outcome: say it changes ADR 0011's "No `vercel.json` in the repo" point, and why: a dashboard setting isn't reviewed or versioned, and `vercel.json` overrides it (quote [vercel.json docs](https://vercel.com/docs/project-configuration/vercel-json): "This value overrides the Vercel Function Region in Project Settings."). Hobby allows a single region.
  - Confirmation: `vercel.json`; Project Settings → General shows `eu-central-1`; the PR preview's functions show `fra1`.
  - More information: links to both setup guides and to 0011.
- [ ] **Step 6:** Add the 0011 line and the 0017 index row from Global Constraints.
- [ ] **Step 7:** In `set-up-vercel.md` step 3, replace "Keep the default settings, and don't add a `vercel.json`." with ``Keep the default settings. The repo's `vercel.json` runs the functions in Frankfurt (`fra1`), as decided in [ADR 0017](../explanation/decisions/0017-run-in-the-eu-in-frankfurt.md).``
- [ ] **Step 8:** Verify:

```bash
git diff main -- docs/explanation/decisions/0011-host-the-app-on-vercel.md | grep -E '^[+-][^+-]'
grep -n "vercel.json" docs/how-to/set-up-vercel.md
grep -c "No \`vercel.json\` in the repo." docs/explanation/decisions/0011-host-the-app-on-vercel.md
```

  Expected: one `+` line in 0011 and no `-` line; step 3 no longer says "don't add"; the count is `1`.
- [ ] **Step 9:** Commit:

```bash
git add vercel.json package.json docs/explanation/decisions/0017-run-in-the-eu-in-frankfurt.md docs/explanation/decisions/0011-host-the-app-on-vercel.md docs/explanation/decisions/README.md docs/how-to/set-up-vercel.md
git commit -m "chore: run the functions in Frankfurt, next to the database"
```

### Task 3: ADR 0016, Use Supabase for authentication

**Files:**
- Create: `docs/explanation/decisions/0016-use-supabase-for-authentication.md`
- Modify: `docs/explanation/decisions/README.md`

**Interfaces:**
- Consumes: the ADR 0017 path from Task 2.
- Produces: the ADR 0016 path, which Task 4 links to.

- [ ] **Step 1:** Check the rejected options against current sources, with a link for each point: Auth.js (who maintains it now; what we'd run ourselves: the database, password hashing, the user admin) and Clerk (free tier limits, where user data is stored, EU option).
- [ ] **Step 2:** Write ADR 0016 from the template and design.md's "ADR 0016" section:
  - Decision outcome: the project settings, each with its reason, as listed in the design, using the Data API reason and the RLS citation from Global Constraints.
  - Accepted limits: pausing ([free-project pausing](https://supabase.com/docs/guides/platform/free-project-pausing), decided later); the rate-limit point with the exact citation from Global Constraints; leaked password protection is Pro-only ([password security](https://supabase.com/docs/guides/auth/password-security)).
  - Confirmation: the settings in `set-up-supabase.md`; the two variables in Vercel, Production only.
  - Pros and cons: the facts from Step 1.
  - More information: link the guide (`../../how-to/set-up-supabase.md`, created in Task 4), 0011 and 0017.
- [ ] **Step 3:** Add the 0016 index row from Global Constraints, above 0017.
- [ ] **Step 4:** Verify:

```bash
grep -n -F 'Publishable API keys and legacy `anon`/`service_role` API keys are not supported.' docs/explanation/decisions/0016-use-supabase-for-authentication.md
grep -n -F "off, because nothing uses it yet; a later Feature turns it on if it needs it" docs/explanation/decisions/0016-use-supabase-for-authentication.md
grep -n "supabase-security-2025-retro\|auth/rate-limits\|free-project-pausing" docs/explanation/decisions/0016-use-supabase-for-authentication.md
```

  Expected: each line found.
- [ ] **Step 5:** Commit:

```bash
git add docs/explanation/decisions/0016-use-supabase-for-authentication.md docs/explanation/decisions/README.md
git commit -m "docs: decide to use Supabase for authentication"
```

### Task 4: The Supabase setup guide

**Gate:** the three owner-supplied facts in Global Constraints. Don't start this task without them.

**Files:**
- Create: `docs/how-to/set-up-supabase.md`
- Modify: `docs/how-to/README.md`, `docs/README.md` (How-to row), `docs/how-to/set-up-vercel.md` ("Where next")

**Interfaces:**
- Consumes: the ADR 0016 and 0017 paths.

- [ ] **Step 1:** Look up in [Vercel's docs](https://vercel.com/docs/functions/configuring-functions/region) where a deployment shows its functions' region, for "Check it works". If the docs don't say, write only what the owner can confirm on the preview, and mark it for the owner to check.
- [ ] **Step 2:** Write the guide from design.md's "`docs/how-to/set-up-supabase.md` (new)" section: intro; "Before you start"; "Steps" (four numbered steps); "Check it works"; "Where next" (ADR 0016, ADR 0017, Set up Vercel, how-to index, docs home), in the Vercel guide's style. Use the owner's menu paths and variable type exactly as given. The warning box and the redeploy rule are as in Global Constraints.
- [ ] **Step 3:** Add the how-to index row: `| [Set up Supabase](set-up-supabase.md) | How to set up the Supabase project the login uses, and the two values Vercel needs |`.
- [ ] **Step 4:** In `docs/README.md`, change the How-to row's text to "The development workflow, from idea to merge, and the Vercel and Supabase setup".
- [ ] **Step 5:** In `set-up-vercel.md`'s "Where next", add `- 🛠️ Set up Supabase: [Set up Supabase](set-up-supabase.md)` after the development workflow line.
- [ ] **Step 6:** Verify:

```bash
f=docs/how-to/set-up-supabase.md
grep -n -E '^## ' $f
grep -n -F "Don't add the \`NEXT_PUBLIC_\` prefix, and don't click **Change to Config**." $f
grep -n -E 'Specific regions|London or Zurich|eu-central-1|Integrations → Data API|OrioleDB|API Keys|Production|redeploy' $f
grep -n -F "off, because nothing uses it yet; a later Feature turns it on if it needs it" $f
```

  Expected: the sections in order; the warning sentence is on a `>` line; every pattern is found.
- [ ] **Step 7:** Commit:

```bash
git add docs/how-to/set-up-supabase.md docs/how-to/README.md docs/README.md docs/how-to/set-up-vercel.md
git commit -m "docs: add a guide to set up Supabase"
```

### Task 5: Check the whole branch

**Files:** none changed, unless a check fails.

- [ ] **Step 1:** Run `npm test && npm run lint && npm run typecheck && npm run format:check && npm run build`. Expected: all pass, and the working tree is clean.
- [ ] **Step 2:** Check the relative links in the changed Markdown files:

```bash
for f in $(git diff --name-only main...HEAD -- '*.md'); do
  grep -o -E '\]\([^)#]+' "$f" | sed 's/^](//' | grep -v -E '^(https?:|mailto:)' | while read -r l; do
    [ -e "$(dirname "$f")/$l" ] || echo "BROKEN: $f -> $l"
  done
done
```

  Expected: no output.
- [ ] **Step 3:** Grep every changed file outside `superpowers/` for our names (the plan's Finish section names the PR assignee), and every changed file for real keys or project URLs. The name pattern is built at run time:

```bash
names=$(gh repo view --json name,owner --jq '.name + "|" + .owner.login')
git diff --name-only main...HEAD -- . ':(exclude)superpowers/' | xargs grep -n -i -E "$names"
git diff --name-only main...HEAD | xargs grep -n -E 'sb_(publishable|secret)_[A-Za-z0-9]|https://[a-z0-9]{10,}\.supabase\.co'
```

  Expected: no output from either.
- [ ] **Step 4:** Run `git diff --stat main...HEAD`. Expected: only the files listed in Global Constraints.

### Finish

Ask the owner once, as in the repo workflow:
- whether to push
- whether to tick the "Done when" items the branch meets with `gh issue edit 62`
- whether to open the PR, using `.github/pull_request_template.md`, with `Closes #62`, assignee `spanciuc`, and the body saying how each item was checked

The owner then checks the preview's functions in `fra1`, and that item is ticked once confirmed.
