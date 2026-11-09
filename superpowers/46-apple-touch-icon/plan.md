# Add an Apple touch icon and a PNG favicon: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `src/app/apple-icon.png` and `src/app/favicon.ico`, drawn from `src/app/icon.svg`, so the home screen and every browser tab show the app's icon.

**Architecture:** Static files under the Next.js metadata file conventions; Next.js adds the `<link>` tags. A throwaway script (outside the repo) renders them with `sharp`. A unit test checks their sizes.

**Tech Stack:** Next.js 16.4.3, `sharp` (already installed by Next.js), Vitest 5, Node 24.

**Spec:** [design.md](design.md). Branch: `46-apple-touch-icon`.

## Global Constraints

- No new dependency or script in `package.json`. No change to `icon.svg`.
- Only the two colors already in `icon.svg`.
- Stage by explicit path only. Every commit ends with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. After each commit, show only `git show --stat`.

---

### Task 0: Commit the design and the plan

- [ ] `git add superpowers/46-apple-touch-icon/design.md superpowers/46-apple-touch-icon/plan.md`
- [ ] Commit `docs: add the design and plan for the app icons`

### Task 1: Test the icon files (red)

**Files:** create `src/app/__tests__/icons.test.ts`.

- [ ] Read `apple-icon.png` and check the PNG signature and the IHDR width and height are 180.
- [ ] Read `favicon.ico`, check the header (reserved 0, type 1), and that its entries are 16, 32 and 48 px, each holding a PNG.
- [ ] `npm test`: both tests fail because the files don't exist.

### Task 2: Draw the icons (green)

**Files:** create `src/app/apple-icon.png`, `src/app/favicon.ico`.

- [ ] In the scratchpad, write a Node script that:
  - renders `icon.svg` to 16, 32 and 48 px PNGs with `sharp` and packs them into an ICO (6-byte header, one 16-byte entry per image, then the PNG data);
  - renders a copy of `icon.svg` with the background `rect`'s `rx` removed to a 180 × 180 PNG, flattened onto `#141A22` with no alpha channel.
- [ ] Run it, writing into `src/app/`. Look at the PNGs.
- [ ] `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` pass.
- [ ] `git add src/app/__tests__/icons.test.ts src/app/apple-icon.png src/app/favicon.ico`
- [ ] Commit `chore: add an Apple touch icon and an ICO favicon`

### Task 3: Note it in the design guide

**Files:** modify `docs/reference/design-guide.md`.

- [ ] Add an "App icons" section before "Need a new value?": list the three icon files, and say the raster ones are redrawn from `icon.svg` whenever it changes.
- [ ] Commit `docs: list the app icons in the design guide`

### Task 4: Verify the build

- [ ] `npm run build` passes.
- [ ] `npm start`, fetch `/`: the head links `/favicon.ico` (`rel="icon"`), `/icon.svg` (`rel="icon"`) and `/apple-icon.png` (`rel="apple-touch-icon"`, `sizes="180x180"`). Each URL returns 200 with `image/x-icon`, `image/svg+xml` and `image/png`.
