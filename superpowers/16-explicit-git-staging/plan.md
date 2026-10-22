# Plan: stage files by explicit path

Design: [design.md](design.md). Branch: `16-explicit-git-staging`.

## Task 1: Deny rules

- [ ] **Step 1:** Add the `permissions.deny` list from the design to `.claude/settings.json`, keeping `enabledPlugins`.
- [ ] **Step 2:** Check that the file is valid JSON: `python3 -m json.tool .claude/settings.json`.

## Task 2: AGENTS.md rule

- [ ] **Step 1:** Add the staging bullet under Commits in `AGENTS.md`.

## Task 3: Commit

- [ ] **Step 1:** Run `git status --short` and confirm that only these paths changed: `.claude/settings.json`, `AGENTS.md`, `superpowers/16-explicit-git-staging/`.
- [ ] **Step 2:** Stage them by path and commit:

```bash
git add .claude/settings.json AGENTS.md superpowers/16-explicit-git-staging/
git commit -m "chore: block staging all files at once" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 4: Test on a clean tree

- [ ] **Step 1:** Confirm that `git status --short` is empty.
- [ ] **Step 2:** Run each command below as its own Bash call and check the result:
  - `git add -A`: blocked by a permission rule
  - `git commit -am "x"`: blocked by a permission rule
  - `git add AGENTS.md`: runs, exit 0
  - `git add ./docs/README.md`: runs, exit 0
- [ ] **Step 3:** Confirm that `git status --short` is still empty and `git log -1` is still the Task 3 commit.

## Task 5: PR

- [ ] **Step 1:** Tick the issue's "Done when" items with `gh issue edit` (ask first).
- [ ] **Step 2:** Ask before `git push` and before opening the PR.
