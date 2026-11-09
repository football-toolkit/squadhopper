# Let the pitch fill the band: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The pitch grows with the band, with proportional space above and below it, capped at 960 px wide.

**Architecture:** One component change (`PitchLayout`: the band becomes a flex column of a space, the pitch area, a space and the 48 px overlap), its tests, its comment, and the design guide's page-layout section.

**Tech Stack:** Next.js 16.4.3, Tailwind CSS 4.3.4, Vitest with Testing Library and jsdom, Node 24.

**Spec:** [design.md](design.md). Branch: `53-pitch-fills-band`.

## Global Constraints

- No new bracket `[…]` classes; `min-h-[50svh]` stays the only one. No one-off colors or spacing.
- The pitch stays inside an absolutely positioned box (Safari, #43).
- Stage by explicit path only. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Before every commit: `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`. `npm run build` before the PR.

## Review Focus

- Short screens (phone landscape, 844 × 390): the band's minimums (`min-h-44`, `min-h-24`, `min-h-4`) must still hold, so the surface grows past half the screen and the pitch stays about 96 px tall. Pinned by the band and area class tests in Task 1, and by the layout check in Task 3.
- Very large screens: the pitch stops at 960 px wide and stays centered. Pinned by the `max-w-240` test in Task 1.
- jsdom has no layout, so the tests pin classes only; real sizes are checked in Task 3 and by the owner.

---

### Task 0: Commit the design and the plan

- [ ] `git add superpowers/53-pitch-fills-band/design.md superpowers/53-pitch-fills-band/plan.md`
- [ ] `git commit -m "docs: add design and plan for the pitch filling the band" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 1: The band as a flex column (TDD)

**Files:** `src/components/pitch-layout.tsx`, `src/components/__tests__/pitch-layout.test.tsx`

- [ ] **Step 1:** Rewrite the structure tests. `renderBand()` returns the classes of the pitch (`svg`), the box (its parent), the pitch area (the box's parent), the band (the area's parent) and the band's children. Tests:
  - "the pitch sits in a box positioned over the pitch area": the box has `absolute inset-x-5 inset-y-0 flex items-center justify-center`, not `top-4` or `bottom-16`; the area has `relative`; the band hasn't `contain-size`.
  - "the pitch is at most 960 px wide": the pitch has `block size-full max-w-240`, not `max-h-57` or `max-w-92`.
  - "the band splits its height between two equal spaces and the pitch area": the band has `flex flex-1 flex-col border-b border-divider`; its four children are, in order, `min-h-4 grow`, the area (`relative min-h-24 grow-8`), `min-h-4 grow`, `h-12 shrink-0`.
  - "the band keeps room for a pitch at least 96 px tall": the band has `min-h-44` (16 + 96 + 16 + 48), and the area has `min-h-24`.
  - The surface test looks one level further up (the band's parent); its assertions stay.
- [ ] **Step 2:** Run `npm test`. Expect the new structure tests to fail.
- [ ] **Step 3:** In `PitchLayout`, replace the band with the design's markup, word for word. Rewrite the comment above the function: the surface and `min-h-[50svh]` paragraph stays; the pitch paragraph describes the column (8 : 1 : 1 grow, so about 80% for the pitch and equal space above and below), the absolutely positioned box for Safari, the 960 px cap, and the minimums (`min-h-44` = 16 + 96 + 16 + 48).
- [ ] **Step 4:** Run `npm test` and expect all to pass. Run lint, typecheck, format:check.
- [ ] **Step 5:** Commit `src/components/pitch-layout.tsx src/components/__tests__/pitch-layout.test.tsx` as `feat: let the pitch fill the band on large screens`.

### Task 2: Design guide

**Files:** `docs/reference/design-guide.md`

- [ ] **Step 1:** In "Page layout", rewrite the pitch bullet: centered in the band, it grows with the band, taking about 80% of its free height with equal space above and below, at most 960 px wide, never cropped, never below about 96 px tall. The space above it still equals the space between it and the card. Add the sentence word for word: "The pitch's maximum width (960 px) belongs to the page frame, not to any card. If a card gets much wider, check the pitch on a large screen and raise the cap in the same change if needed."
- [ ] **Step 2:** Search `docs/` and `src/` for the old internals (`top-4`, `bottom-16`, `max-w-92`, `max-h-57`, `368 × 228`) and update every hit to the new structure. Leave `superpowers/38-visual-identity/` as it is.
- [ ] **Step 3:** Run `npm run format:check`.
- [ ] **Step 4:** Commit `docs/reference/design-guide.md` and any other file Step 2 changed, by explicit path, as `docs: describe the pitch growing with the band`.

### Task 3: Check the seven screen sizes

No commit.

- [ ] Work out the flex layout at 360 × 640, 390 × 844, 844 × 390, 1280 × 800, 1920 × 1080, 2560 × 1440 and 3840 × 2160 (header 68 px, 88 px from 768 px wide; pitch aspect 368 : 228; box inset 20 px each side), and compare the pitch width with the issue's table. Report any difference over 2 px to the owner.
- [ ] Run `npm run build`.
- [ ] Ask the owner to confirm the sizes in a real browser before ticking the second "Done when" item.
