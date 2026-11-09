# Make the header wordmark link home: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The header's wordmark links to `/`, with an accessible name built from `APP_NAME` and a grey keyboard focus ring.

**Architecture:** One component change (`AppHeader`), its tests, the home page test, and one line in the design guide.

**Tech Stack:** Next.js 16.4.3 (`next/link`), Tailwind CSS 4.3.4, Vitest with Testing Library and jsdom, Node 24.

**Spec:** [design.md](design.md). Branch: `47-wordmark-home-link`.

## Global Constraints

- No arbitrary `[…]` values, no hex colors, no volt (`primary`) on the link.
- The app name only through `APP_NAME`.
- Stage by explicit path only. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Before every commit: `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`. `npm run build` before the PR.

---

### Task 0: Commit the design and the plan

- [ ] `git add superpowers/47-wordmark-home-link/design.md superpowers/47-wordmark-home-link/plan.md`
- [ ] `git commit -m "docs: add design and plan for the wordmark home link"`

### Task 1: Link the wordmark (TDD)

**Files:** `src/components/app-header.tsx`, `src/components/__tests__/app-header.test.tsx`, `src/app/__tests__/page.test.tsx`

- [ ] **Step 1:** Add a header test: one link named `` `${APP_NAME} home` `` with `href="/"`, text `APP_NAME`, classes containing `focus-visible:outline-ring` and no `primary`. Change the page test to expect exactly one link, to `/`.
- [ ] **Step 2:** Run `npm test`. Expect the new tests to fail (no link).
- [ ] **Step 3:** In `AppHeader`, wrap `<Wordmark />` in `<Link href="/" aria-label={`${APP_NAME} home`} className="rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">`.
- [ ] **Step 4:** Run `npm test`. Expect all to pass. Run lint, typecheck, format:check.
- [ ] **Step 5:** Commit `src/components/app-header.tsx src/components/__tests__/app-header.test.tsx src/app/__tests__/page.test.tsx` as `feat: link the header wordmark to the home page`.

### Task 2: Design guide

**Files:** `docs/reference/design-guide.md`

- [ ] **Step 1:** Note in Page layout that `AppHeader`'s wordmark links home, and add to the links row of Do and don't that the header's wordmark is the one link without an underline, with the grey focus ring.
- [ ] **Step 2:** Run `npm run format:check`; commit as `docs: note the wordmark link in the design guide`.

### Task 3: Verify

- [ ] `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build` all pass.
- [ ] Run `npm run dev` and check `/` renders the link with `href="/"` and the `aria-label`.
