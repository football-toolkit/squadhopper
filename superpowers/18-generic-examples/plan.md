# Plan: replace app-specific examples with generic ones

Design: [design.md](design.md). Branch: `18-generic-examples`.

## Task 1: Issue forms

- [ ] **Step 1:** In `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml` and `task.yml`, change `e.g. clash-days` to `e.g. short-change-name` in the Slug description.

## Task 2: Change-key table

- [ ] **Step 1:** In `docs/how-to/development-workflow.md`, change the table header to `Example for Feature #42, Slug \`short-change-name\``, and the rows to `42-short-change-name`, `superpowers/42-short-change-name/` and `openspec/changes/42-short-change-name/`.

## Task 3: Commits section

- [ ] **Step 1:** In `AGENTS.md`, change the example commit to `docs: fix typo in README`.
- [ ] **Step 2:** Change the imperative-mood example to ("fix typo", not "fixed typo").

## Task 4: Check

- [ ] **Step 1:** Run the check. It must print nothing:

```bash
git grep -n -i -E "clash|match list|20-" -- . ':!superpowers' ':!openspec/config.yaml' ':!.claude/skills' ':!.claude/commands'
```

- [ ] **Step 2:** Run `git grep -n "short-change-name" -- .github/ISSUE_TEMPLATE/` and confirm all 3 forms match.

## Task 5: Commit

- [ ] **Step 1:** Run `git status --short` and confirm that only these paths changed: `.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/feature_request.yml`, `.github/ISSUE_TEMPLATE/task.yml`, `docs/how-to/development-workflow.md`, `AGENTS.md`, `superpowers/18-generic-examples/`.
- [ ] **Step 2:** Stage them by path and commit:

```bash
git add .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml .github/ISSUE_TEMPLATE/task.yml docs/how-to/development-workflow.md AGENTS.md superpowers/18-generic-examples/
git commit -m "docs: replace app-specific examples with generic ones" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 6: PR

- [ ] **Step 1:** Tick the issue's "Done when" items with `gh issue edit` (ask first).
- [ ] **Step 2:** Ask before `git push` and before opening the PR.
