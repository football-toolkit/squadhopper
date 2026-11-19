# Replace PR screenshots with an owner review checkbox: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the PR screenshot rule and add an owner review checkbox to the PR template, recorded in a new ADR that amends ADR 0013.

**Architecture:** Docs and template only. No app code changes.

**Tech Stack:** Markdown, GitHub PR template.

**Spec:** `superpowers/68-owner-review-checkbox/design.md`

## Global Constraints

- Checkbox text, verbatim: `- [ ] The repository owner reviewed this PR, and its Vercel preview at phone (390 px) and desktop (1280 px) widths if it changes what the app shows or does`
- Only the repository owner ticks it, on GitHub. An agent never ticks it, including on this PR.
- New ADR: `docs/explanation/decisions/0021-record-the-owners-review-with-a-checkbox.md`, `status: accepted`, `date: 2026-11-19`, title `# 0021: Record the owner's preview review with a checkbox, not screenshots`.
- 0013's new line, verbatim, directly under its title: `Amended by [0021](0021-record-the-owners-review-with-a-checkbox.md): replaces the screenshot record with the owner's review checkbox.`
- Never edit an accepted ADR beyond that line (0013, 0014 and the rest stay as they are).
- Stage by explicit path. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

- A leftover screenshot mention anywhere in `AGENTS.md` or the how-to: Task 1's grep catches it.
- Broken links: the how-to's step 4 still points at step 8, and no link targets a removed heading or paragraph. Task 1's check confirms this.
- The checkbox reads as on every PR, with the preview part conditional, in all three places (template, `AGENTS.md`, how-to).
- The ADR index entry sits under "How we work", in number order.

---

### Task 0: Commit the design and plan

- [ ] **Step 1:** `git add superpowers/68-owner-review-checkbox/design.md superpowers/68-owner-review-checkbox/plan.md`, then commit `docs: add design and plan for the owner review checkbox`.

### Task 1: Replace the screenshot rule with the checkbox

**Files:**
- Modify: `.github/pull_request_template.md` (end of Checklist)
- Modify: `AGENTS.md` (Workflow bullets; Screen design **Record** bullet)
- Modify: `docs/how-to/development-workflow.md` (steps 7, 8, 9; Screen design step 5, table, the paragraphs after it)

- [ ] **Step 1:** Template: append the checkbox (Global Constraints) as the last Checklist line.
- [ ] **Step 2:** `AGENTS.md`: delete the **Record** bullet. After the preview bullet in Workflow, add: `- Every PR ends with the owner's review checkbox in the PR template. Only the repository owner ticks it, on GitHub, after reviewing the PR. An agent never ticks it.`
- [ ] **Step 3:** How-to step 7: delete the sentence "For a Feature that adds or changes screens, attach the first screenshots…".
- [ ] **Step 4:** How-to step 8: say the owner checks the preview at phone (390 px) and desktop (1280 px) widths. Add: once the owner has reviewed the pull request (and its preview, if the app changed), they tick the review checkbox at the end of the checklist; docs-only and workflow PRs skip the preview but not the checkbox; an agent never ticks it.
- [ ] **Step 5:** How-to step 9: change "the pull request checklist is complete" to "the pull request checklist is complete, including the owner's review checkbox".
- [ ] **Step 6:** How-to Screen design: delete step 5, the `| Screenshots |` table row, and everything from "To attach screenshots…" through "…stays the check." (the `--attach` paragraphs, the code block, the replace paragraph and the closing paragraph). Keep the blank line before `## End-to-end tests`.
- [ ] **Step 7: Check.** `grep -n -i screenshot AGENTS.md docs/how-to/development-workflow.md .github/pull_request_template.md` prints nothing. `grep -n "owner's review checkbox" AGENTS.md docs/how-to/development-workflow.md` shows the new lines. `grep -n "(390 px)" .github/pull_request_template.md` shows the checkbox. `git diff` on the how-to shows only the intended lines changed.
- [ ] **Step 8:** `git add .github/pull_request_template.md AGENTS.md docs/how-to/development-workflow.md`, then commit `docs: replace PR screenshots with an owner review checkbox`.

### Task 2: Record the decision

**Files:**
- Create: `docs/explanation/decisions/0021-record-the-owners-review-with-a-checkbox.md` (from `templates/adr.md`)
- Modify: `docs/explanation/decisions/0013-design-screens-in-code.md` (one line under the title)
- Modify: `docs/explanation/decisions/README.md` ("How we work" table)

- [ ] **Step 1:** Write the ADR in the voice of 0013 and 0017:
  - Context: 0013 step 5 required screenshots of each new or changed screen at 390 px and 1280 px. They took a lot of manual work, repeated the design attached to the issue (pictures and HTML reference, as on #38 and #65), and the real check was always the owner's preview review, which left no explicit record. #65 already skipped them by the owner's decision.
  - Drivers: little manual work per PR; an explicit record that the owner reviewed; no new tool, service or account; no personal data in public files.
  - Options: 1. Screenshots by hand (today). 2. Screenshots taken in CI (Playwright `toHaveScreenshot`, a hosted service such as Argos, Percy or Chromatic, or CI uploads). 3. A checkbox the owner ticks.
  - Outcome: option 3. Amends step 5 ("Record") of [0013](0013-design-screens-in-code.md); the rest of 0013 stands, so it's amended, not superseded. The record of the agreed look stays the design attached to the issue. The checkbox is on every PR, with the preview part only when the app changes; only the owner ticks it. Dependabot PRs don't use the checklist ([0010](0010-merge-dependabot-prs-without-an-issue.md)).
  - Consequences: good (one click; explicit on every PR; no public screenshots; no tooling). Bad (no picture of the shipped screen on the PR; a tick is a claim, not proof; still no automatic check of the look).
  - Confirmation: the last item of `.github/pull_request_template.md`; merged PRs have it ticked; `AGENTS.md` and the how-to ask for no screenshots.
  - Pros and cons of options 1 and 2. For CI: Playwright is already in CI ([0015](0015-test-screens-end-to-end-with-playwright-in-ci.md)), but baseline images are binary files that need updating with every screen change and differ between browsers and machines; hosted services add an account and cost; uploads still need someone to look at them.
  - More information: issue #68; related 0013, 0010, 0015.
- [ ] **Step 2:** 0013: add the "Amended by" line (Global Constraints) under the title, with a blank line on each side, as in 0011.
- [ ] **Step 3:** Index: add `| [0021](0021-record-the-owners-review-with-a-checkbox.md) | Record the owner's preview review with a checkbox, not screenshots |` after the 0015 row under "How we work".
- [ ] **Step 4: Check.** `git diff docs/explanation/decisions/0013-design-screens-in-code.md` shows two added lines only (the line and a blank). Every relative link in the new ADR resolves: `grep -o '([0-9]\{4\}-[^)]*\.md)' docs/explanation/decisions/0021-*.md | tr -d '()' | while read f; do test -f docs/explanation/decisions/$f || echo missing $f; done` prints nothing.
- [ ] **Step 5:** `git add docs/explanation/decisions/0021-record-the-owners-review-with-a-checkbox.md docs/explanation/decisions/0013-design-screens-in-code.md docs/explanation/decisions/README.md`, then commit `docs: add ADR 0021 on the owner review checkbox`.

### Task 3: Verify

- [ ] **Step 1:** Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`. All pass.
