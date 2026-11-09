# Plan: keep docs and design files out of Tailwind's scan

Design: [design.md](design.md). Branch: `44-tailwind-source-scope`.

## Task 1: Baseline

- [x] **Step 1:** Run `npm run build` and save the class selectors of the CSS under `.next/static/` to a scratch file.

## Task 2: Exclude the folders

- [x] **Step 1:** Add the two `@source not` lines from the design to `src/app/globals.css`, after the `@import` lines.
- [x] **Step 2:** Run `npm run build` and save the class selectors again.
- [x] **Step 3:** Diff the two lists. Confirm `.border-primary` is gone, and that no removed class appears in `src/`.

## Task 3: Commit

- [x] **Step 1:** Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build`. All must pass.
- [x] **Step 2:** Run `git status --short` and confirm that only these paths changed: `src/app/globals.css`, `superpowers/44-tailwind-source-scope/`.
- [x] **Step 3:** Stage them by path and commit:

```bash
git add src/app/globals.css superpowers/44-tailwind-source-scope/
git commit -m "chore: keep docs and design files out of Tailwind's scan" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [x] **Step 4:** Show the repository owner only `git show --stat`.

## Task 4: PR

- [x] **Step 1:** Tick the issue's "Done when" items with `gh issue edit`.
- [x] **Step 2:** Push the branch and open the PR with `.github/pull_request_template.md`.
