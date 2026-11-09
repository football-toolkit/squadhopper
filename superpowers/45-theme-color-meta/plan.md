# Plan: add a theme color for phone browsers

Design: [design.md](design.md). Branch: `45-theme-color-meta`.

## Task 1: Theme color

- [ ] **Step 1:** In `src/app/__tests__/layout.test.tsx`, import `viewport` from `../layout` and add a test that `viewport.themeColor` is `"#141A22"`.
- [ ] **Step 2:** Run `npm test` and confirm the new test fails.
- [ ] **Step 3:** In `src/app/layout.tsx`, import `Viewport` with `Metadata` and export `viewport` as in the design.
- [ ] **Step 4:** Run `npm test` and confirm it passes.

## Task 2: Design guide

- [ ] **Step 1:** Add the "Hex values outside the theme" subsection from the design at the end of Tokens > Colors in `docs/reference/design-guide.md`.

## Task 3: Verify and commit

- [ ] **Step 1:** Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build`. All must pass.
- [ ] **Step 2:** Confirm `.next/server/app/index.html` contains `<meta name="theme-color" content="#141A22"/>`.
- [ ] **Step 3:** Run `git status --short` and confirm only these paths changed: `src/app/layout.tsx`, `src/app/__tests__/layout.test.tsx`, `docs/reference/design-guide.md`, `superpowers/45-theme-color-meta/`.
- [ ] **Step 4:** Stage them by path and commit:

```bash
git add src/app/layout.tsx src/app/__tests__/layout.test.tsx docs/reference/design-guide.md superpowers/45-theme-color-meta/
git commit -m "chore: add a theme color for phone browsers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5:** Show the repository owner only `git show --stat`.

## Task 4: PR

- [ ] **Step 1:** Tick the issue's "Done when" items with `gh issue edit`.
- [ ] **Step 2:** Push the branch and open the PR into `main` from `.github/pull_request_template.md`, with `Closes #45`, assigned to the repository owner.
