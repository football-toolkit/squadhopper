# Make the keyboard focus ring clearly visible: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `ring-ring/50` measures at least 3:1 against the background and the surface.

**Architecture:** One token change in `src/app/globals.css`, a contrast test that reads that file, and one row in the design guide.

**Spec:** [design.md](design.md). Branch: `56-visible-focus-ring`.

## Global Constraints

- Never edit `src/components/ui/`. Never use volt (`primary`) for focus.
- Stage by explicit path only. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Before every commit: `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`. `npm run build` before the PR.

### Task 0: Commit the design and the plan

- [ ] `git add superpowers/56-visible-focus-ring/design.md superpowers/56-visible-focus-ring/plan.md`
- [ ] Commit: `docs: add design and plan for the visible focus ring`

### Task 1: The ring token (TDD)

**Files:** Test: `src/app/__tests__/globals.test.ts`. Modify: `src/app/globals.css`.

- [ ] Write the test: read `--ring`, `--background` and `--surface` from `globals.css`, composite the ring at 50% alpha over each in sRGB, and expect the WCAG contrast ratio to be at least 3.
- [ ] Run `npm test`; expect it to fail with about 2.74.
- [ ] Set `--ring: #f2f5f7;` in `src/app/globals.css`.
- [ ] Run `npm test`; expect it to pass.
- [ ] `git add src/app/__tests__/globals.test.ts src/app/globals.css`
- [ ] Commit: `fix: make the keyboard focus ring clearly visible`

### Task 2: The design guide

**Files:** Modify: `docs/reference/design-guide.md`.

- [ ] Change the `ring` row to `#F2F5F7` and state the rule: at half strength (`ring-ring/50`), at least 3:1 against `background` and `surface`; never volt.
- [ ] `git add docs/reference/design-guide.md`
- [ ] Commit: `docs: record the focus ring's contrast rule`

### Task 3: Verify and open the PR

- [ ] Run all five checks, including `npm run build`.
- [ ] Tick the issue's 'Done when' items that the change meets, and open the PR with the measured ratios.
