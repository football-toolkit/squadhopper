# Plan: write the standing session habits into AGENTS.md

Design: [design.md](design.md). Branch: `29-agent-habits`.

## Task 1: AGENTS.md rules

- [ ] **Step 1:** Add the verify-before-designing bullet from the design as the last bullet under Implementation in `AGENTS.md`.
- [ ] **Step 2:** Add the short-output bullet from the design as the last bullet under Commits in `AGENTS.md`.

## Task 2: Commit

- [ ] **Step 1:** Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build`. All must pass.
- [ ] **Step 2:** Run `git status --short` and confirm that only these paths changed: `AGENTS.md`, `superpowers/29-agent-habits/`.
- [ ] **Step 3:** Stage them by path and commit:

```bash
git add AGENTS.md superpowers/29-agent-habits/
git commit -m "docs: write the standing session habits into AGENTS.md" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 4:** Show the repository owner only `git show --stat`.

## Task 3: PR

- [ ] **Step 1:** Tick the issue's "Done when" items with `gh issue edit` (ask first).
- [ ] **Step 2:** Ask before `git push` and before opening the PR.
