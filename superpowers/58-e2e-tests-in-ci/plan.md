# Add end-to-end tests in CI with Playwright: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Playwright runs the home and 404 pages' layout and navigation tests in Chromium and WebKit, against the production build, in the `checks` job of every PR.

**Architecture:** `@playwright/test` with a `playwright.config.ts` (two projects, a `webServer` that builds and starts the app on port 3100), three specs in `e2e/`, two test ids in `PitchLayout`, and three new steps in the existing `checks` job. The end-to-end tests are never run on this machine. CI runs them, and the bug proof runs there too.

**Tech Stack:** Next.js 16.4, Node 24, `@playwright/test` 1.65.0, Vitest 5, GitHub Actions.

**Spec:** [design.md](design.md). Branch: `58-e2e-tests-in-ci`.

## Global Constraints

- **Install nothing on this machine:** no `npx playwright install`, no system libraries, no apt. Never run `npm run test:e2e` or `npx playwright test` locally, except `npx playwright test --list`, which starts no browser and no server.
- `@playwright/test` exactly `1.65.0`. `upload-artifact` pinned to `cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2`.
- Find elements by role and name. Test ids only for the band (`pitch-band`) and the pitch (`pitch`). The card is `getByRole("main").locator('[data-slot="card"]')`. No CSS-class selectors.
- The app's name only comes from `APP_NAME` in `src/lib/app-name.ts`, never written in a spec.
- `retries: 0` everywhere.
- Stage by explicit path only. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. After each commit, show the owner only `git show --stat`.
- Before every commit: `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`. Also `npm run build` before the first push.
- **No push and no `gh` command that changes GitHub before the owner's one OK for the whole push sequence (Task 5).** Any push outside that sequence needs a new OK, with one exception (the owner's decision): after the first push, a fix that only touches `e2e/` or `playwright.config.ts`, changes no app code and adds no retries may be pushed without asking.

## Review Focus

Without a local run, these are the most likely ways the first CI run breaks or misleads. Each one is pinned by a step below.

1. **Fonts not loaded before measuring:** the card's height changes when Barlow Condensed arrives, so measurements must come after `document.fonts.ready` (Task 2, the `measure` helper).
2. **The svg box measured instead of the drawing:** with `preserveAspectRatio` "meet", the svg box can be wider or taller than the lines, which hides cropping. The helper measures the svg's first `<g>` (Task 2).
3. **Vitest running the specs:** Vitest's default `include` matches `*.spec.ts`. Checked locally with `npm test` after the specs exist (Task 2, step 6).
4. **A typo in a test name or a missing project:** checked locally with `npx playwright test --list`, which must print exactly 28 tests (Task 2, step 7).
5. **A dev server on port 3000 tested by mistake:** the config uses port 3100 for both `webServer.url` and `use.baseURL` (Task 2).

---

### Task 0: Commit the design and the plan

- [ ] `git add superpowers/58-e2e-tests-in-ci/design.md superpowers/58-e2e-tests-in-ci/plan.md`
- [ ] Commit: `docs: add design and plan for end-to-end tests in CI`

### Task 1: Test ids on the band and the pitch (TDD)

**Files:** Modify: `src/components/pitch.tsx`, `src/components/pitch-layout.tsx`. Test: `src/components/__tests__/pitch-layout.test.tsx`.

**Interfaces:**
- Produces: `data-testid="pitch-band"` on the `bg-surface` div, and `data-testid="pitch"` on the pitch `<svg>`. Task 2 relies on both.

- [ ] **Step 1: Write the failing test** in `pitch-layout.test.tsx`:

```tsx
test("the band and the pitch have test ids for the end-to-end tests", () => {
  render(
    <PitchLayout>
      <p>Card</p>
    </PitchLayout>,
  );
  expect(classesOf(screen.getByTestId("pitch-band"))).toContain("bg-surface");
  expect(screen.getByTestId("pitch").tagName.toLowerCase()).toBe("svg");
});
```

- [ ] **Step 2:** Run `npm test`. Expected: this test fails ("Unable to find an element by: [data-testid="pitch-band"]").
- [ ] **Step 3:** In `pitch.tsx`, add `"data-testid"?: string` to `PitchProps` and set it on the `<svg>`. In `pitch-layout.tsx`, add `data-testid="pitch-band"` to the surface div and pass `data-testid="pitch"` to `<Pitch>`. Change nothing else.
- [ ] **Step 4:** Run `npm test`. Expected: all tests pass.
- [ ] **Step 5:** `git add src/components/pitch.tsx src/components/pitch-layout.tsx src/components/__tests__/pitch-layout.test.tsx`
- [ ] **Step 6:** Commit: `test: add test ids to the pitch band and the pitch`

### Task 2: Playwright setup and the three specs

**Files:**
- Modify: `package.json`, `package-lock.json` (by `npm install`), `vitest.config.mts`, `.gitignore`
- Create: `playwright.config.ts`, `e2e/layout.spec.ts`, `e2e/not-found.spec.ts`, `e2e/header.spec.ts`

**Interfaces:**
- Consumes: the test ids from Task 1; `APP_NAME` from `src/lib/app-name.ts`.
- Produces: the `test:e2e` script, which Task 3 runs in CI. The projects are named `chromium` and `webkit`.

- [ ] **Step 1: Dependency and scripts.** Run `npm install --save-dev @playwright/test@1.65.0`. This installs no browsers. Check that `package.json` has `"@playwright/test": "1.65.0"` (no caret). Add the script `"test:e2e": "playwright test"`. Append `e2e playwright.config.ts` to the path lists of `lint`, `format` and `format:check`.

- [ ] **Step 2: `playwright.config.ts`**, with these values from the design:
  - `testDir: "./e2e"`, `forbidOnly: !!process.env.CI`, `retries: 0`, `workers: process.env.CI ? 1 : undefined`
  - `reporter`: in CI `[["github"], ["html", { open: "never" }]]`, otherwise `[["list"], ["html", { open: "never" }]]`
  - `globalTimeout`: `10 * 60 * 1000` in CI, otherwise `undefined`
  - `use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" }`
  - `projects`: `{ name: "chromium", use: { ...devices["Desktop Chrome"] } }` and `{ name: "webkit", use: { ...devices["Desktop Safari"] } }`
  - `webServer: { command: "npm run build && npm run start -- --port 3100", url: "http://localhost:3100", reuseExistingServer: !process.env.CI, timeout: 120_000 }`
  - A short comment on why the port is 3100 (so a dev server on 3000 is never tested by mistake) and why there are no retries (the flaky-test rule).

- [ ] **Step 3: `vitest.config.mts` and `.gitignore`.** Import `configDefaults` from `vitest/config` and add `exclude: [...configDefaults.exclude, "e2e/**"]` to `test`. In `.gitignore`, add a `# Playwright` block with `/test-results/`, `/playwright-report/`, `/blob-report/` and `/playwright/.cache/`.

- [ ] **Step 4: `e2e/layout.spec.ts`.**

  Data:
  ```ts
  const pages = [
    { name: "home", path: "/" },
    { name: "404 page", path: "/does-not-exist" },
  ];
  const sizes = [
    { width: 360, height: 640, endsAtHalf: true },
    { width: 390, height: 844, endsAtHalf: true },
    { width: 844, height: 390, endsAtHalf: false },
    { width: 1280, height: 800, endsAtHalf: true },
    { width: 2560, height: 1440, endsAtHalf: true },
  ];
  const TOLERANCE = 1;
  ```

  A helper `measure(page: Page): Promise<Layout>` that first awaits `document.fonts.ready`, then returns:
  ```ts
  type Box = { top: number; bottom: number; left: number; right: number };
  type Layout = {
    viewport: { width: number; height: number };
    scrollWidth: number; // document.documentElement.scrollWidth
    clientWidth: number; // document.documentElement.clientWidth
    headerBottom: number; // getByRole("banner")
    band: Box; // getByTestId("pitch-band")
    pitch: Box; // the first <g> inside getByTestId("pitch"): the lines, not the svg box
    cardTop: number; // getByRole("main").locator('[data-slot="card"]')
  };
  ```

  One test per page and size, named `` `${page.name} at ${width} × ${height}` ``, so 10 tests. Each one sets the viewport with `page.setViewportSize`, opens the page, calls `measure`, and checks the four rules. Each rule is a `test.step` whose name is the rule, so the report says which rule broke (my call: one test per page and size instead of one per rule, which keeps the run at 28 tests instead of 88). Use `expect.soft`, so one failing rule doesn't hide the others:
  1. Step `no sideways scrolling`: `scrollWidth <= clientWidth + TOLERANCE`.
  2. Step `the pitch is whole`: `pitch.left >= -TOLERANCE`, `pitch.right <= viewport.width + TOLERANCE`, `pitch.top >= headerBottom - TOLERANCE`, `pitch.bottom <= band.bottom + TOLERANCE`.
  3. Step `the pitch doesn't touch the card`: `pitch.bottom < cardTop - TOLERANCE`.
  4. If `endsAtHalf`, step `the surface ends at half the screen`: `Math.abs(band.bottom - viewport.height / 2) <= TOLERANCE`. Otherwise, step `the surface grows past half the screen`: `band.bottom > viewport.height / 2 + TOLERANCE`.

  Each `expect.soft` gets a message naming the values, e.g. `` `pitch bottom ${pitch.bottom} vs card top ${cardTop}` ``, so a CI failure can be read without the trace.

- [ ] **Step 5: `e2e/not-found.spec.ts` and `e2e/header.spec.ts`.**
  - `not-found.spec.ts`, for `/does-not-exist` and `/a/b/c`: the test `` `${path} answers 404 and shows the 404 page` `` checks `(await page.goto(path))?.status()` is `404`, and that `getByRole("heading", { level: 1, name: /page not found/i })` is visible.
  - `not-found.spec.ts`: the test `"Back to home" opens the home page` opens `/does-not-exist`, clicks `getByRole("link", { name: "Back to home" })`, and expects `toHaveURL("/")` and `getByRole("heading", { level: 1, name: /all your matches/i })` to be visible.
  - `header.spec.ts`: the test `the wordmark opens the home page` opens `/does-not-exist`, clicks `` getByRole("link", { name: `${APP_NAME} home` }) ``, and expects the same URL and home heading. Import `APP_NAME` with `import { APP_NAME } from "../src/lib/app-name";`.

- [ ] **Step 6: Local checks without browsers.** Run `npm run format`, then `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`. Expected: all pass, and the Vitest output lists no file from `e2e/`.

- [ ] **Step 7: List the tests.** Run `npx playwright test --list`. Expected: `Total: 28 tests in 3 files` (14 per project, in `[chromium]` and `[webkit]`), with no browser launched and no build started. If the command tries to start the server or a browser, stop it, don't install anything, and note it for the owner.

- [ ] **Step 8:** `git add package.json package-lock.json vitest.config.mts .gitignore playwright.config.ts e2e/layout.spec.ts e2e/not-found.spec.ts e2e/header.spec.ts`
- [ ] **Step 9:** Commit: `test: add Playwright end-to-end tests for layout and navigation`

### Task 3: Run the end-to-end tests in CI

**Files:** Modify: `.github/workflows/ci.yml`.

**Interfaces:**
- Consumes: the `test:e2e` script from Task 2.

- [ ] **Step 1:** Change `timeout-minutes: 10` to `15`. After the `Build` step, add, in order:

```yaml
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium webkit

      - name: End-to-end tests
        run: npm run test:e2e

      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2
        with:
          name: playwright-report
          path: |
            playwright-report/
            test-results/
          retention-days: 14
```

  Don't rename the job: the ruleset requires `checks` by name.

- [ ] **Step 2:** Check the YAML parses and the steps are in order: `python3 -c "import yaml; print([s['name'] for s in yaml.safe_load(open('.github/workflows/ci.yml'))['jobs']['checks']['steps']])"`. Expected: the list ends with `'Build', 'Install Playwright browsers', 'End-to-end tests', 'Upload Playwright report'`.
- [ ] **Step 3:** `git add .github/workflows/ci.yml`
- [ ] **Step 4:** Commit: `ci: run the end-to-end tests in the checks job`

### Task 4: Docs and ADR 0015

**Files:** Modify: `AGENTS.md`, `docs/how-to/development-workflow.md`, `docs/explanation/decisions/README.md`. Create: `docs/explanation/decisions/0015-test-screens-end-to-end-with-playwright-in-ci.md`.

- [ ] **Step 1: `AGENTS.md`.**
  - Commands: add `` - `npm run test:e2e`: run the end-to-end tests in Chromium and WebKit against the production build. It needs the Playwright browsers (see the how-to guide). CI always runs them. `` Change the `lint` and `format` lines from "`src/` and the config files" to "`src/`, `e2e/` and the config files". The "Before committing" list stays as it is.
  - Code: add two bullets. First: end-to-end tests live in `e2e/`, one spec per area, and find elements by role and name, with test ids only for decorative parts that have no role. Second: CI is where they always run, and a flaky test is fixed or gets an issue right away, never re-run until it passes.
- [ ] **Step 2: The how-to guide.**
  - Step 9: "CI runs typecheck, lint, format check, tests, build and the end-to-end tests…".
  - A new `## End-to-end tests` section between `## Screen design` and `## The change key`, with three parts: **Read a failed run** (open the failed `checks` run, read the annotations, download `playwright-report` from the run's summary page, unzip it, `npx playwright show-report <folder>`, open the failed test's trace, or drop `trace.zip` onto https://trace.playwright.dev), **Run them locally (optional)** (`npx playwright install --with-deps chromium webkit`, which installs WebKit's system libraries with apt, then `npm run test:e2e`; never required, since CI always runs them), and **Flaky tests** (the rule). Link ADR 0015 from it and from "Where next".
- [ ] **Step 3: ADR 0015** from `templates/adr.md`, `status: accepted`, `date: 2026-11-13`. It covers:
  - **Context:** jsdom has no layout, and two Safari bugs reached the preview.
  - **Options:** Playwright in CI; Cypress (no WebKit, the engine that broke); checking the Vercel preview by hand (it's behind Vercel's login, and agents can't reach it); a cloud device service (costs money, and adds an account and a secret).
  - **Outcome:** Playwright, Chromium and WebKit only, inside the required `checks` job, against the production build, no retries.
  - **Consequences:** about two more minutes per run, the system libraries are installed on each run, and WebKit on Linux isn't an iPhone. Leave a placeholder sentence for the phone profile, filled in by Task 5 from the bug proof.
  - **Confirmation:** `playwright.config.ts`, the `End-to-end tests` step in `ci.yml`, `retries: 0`.
- [ ] **Step 4:** Add 0015 to the **How we work** table in `docs/explanation/decisions/README.md`.
- [ ] **Step 5:** `git add AGENTS.md docs/how-to/development-workflow.md docs/explanation/decisions/README.md docs/explanation/decisions/0015-test-screens-end-to-end-with-playwright-in-ci.md`
- [ ] **Step 6:** Commit: `docs: describe the end-to-end tests and the flaky-test rule`

### Task 5: Push, prove the bugs in CI, and finish the PR

- [ ] **Step 1: Verify locally.** `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`. All pass, and `git status` is clean.
- [ ] **Step 2: Ask the owner once** for the whole sequence below (pushes, the draft PR, the temporary commits and reverts, the timeout commit, the issue edit, marking ready). Wait for the OK.
- [ ] **Step 3: Push and open the draft PR.** `git push -u origin 58-e2e-tests-in-ci`. Then `gh pr create --draft --assignee spanciuc` using `.github/pull_request_template.md`, title `ci: add end-to-end tests with Playwright in Chromium and WebKit`, body with `Closes #58` and the 58 s "before" time. Wait for the run to finish (`gh run watch`). Expected: green. If it fails, read the annotations and the report, fix the cause. A fix that only touches `e2e/` or `playwright.config.ts` (no app code, no retries) may be pushed without asking; any other fix needs the owner's OK first. Never re-run to get green.
- [ ] **Step 4: Bug A.** Change the surface's `min-h-[50svh]` to `h-[50svh] min-h-min` in `pitch-layout.tsx`. Commit `test: temporarily bring back the surface stuck at half` and push. Wait for the run to finish, then record which browser and which step failed, with the run link. Expected: WebKit, `home at 844 × 390` and `404 page at 844 × 390`, on `the surface grows past half the screen` or `the pitch doesn't touch the card`. Then `git revert --no-edit HEAD`, push, and wait for green.
- [ ] **Step 5: Bug B.** Remove the absolutely positioned box, so `<Pitch className="block size-full max-w-240" data-testid="pitch" />` sits straight in the pitch area. Commit `test: temporarily bring back the pitch height bug`, push, record the results the same way, then revert, push, and wait for green.
- [ ] **Step 6: If desktop WebKit missed a bug:** stop and ask the owner before the fallback push (WebKit phone sizes with `isMobile: true` and `hasTouch: true`, then repeat that bug's check). Otherwise skip.
- [ ] **Step 7: Timeout.** From the green runs' `checks` job times (`gh run view <id> --json jobs`), set `timeout-minutes` to about three times the longest run, rounded up to a whole number of minutes and at least 11 (above `globalTimeout`). If it's still 15, skip the commit. Otherwise commit `ci: set the checks job timeout from measured runs` and push.
- [ ] **Step 8: Fill in the ADR's phone-profile sentence** from the proof results. Commit `docs: record the phone profile the end-to-end tests use` and push.
- [ ] **Step 9: Finish the PR.** The body gets the bug results (browser, test, step, run link, for each bug), the job time before (58 s) and after, and how each "Done when" item was checked. Tick the met items in issue #58 with `gh issue edit 58 --body-file …`. Then `gh pr ready`. Tell the owner the PR is ready. It changes nothing the app shows, so it needs no preview review.
