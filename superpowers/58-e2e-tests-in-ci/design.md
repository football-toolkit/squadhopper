# Add end-to-end tests in CI with Playwright: design

Issue: #58 (Task). Branch and change key: `58-e2e-tests-in-ci`.

## Intent

Today CI tests screens only in jsdom, which has no layout engine. Twice, an iPhone (Safari) layout bug reached the preview because nothing ran the app in Safari's engine. This change runs the production build in real Chromium and WebKit on every pull request. It checks the layout rules that broke before and the navigation of the two pages we have (home and 404), so problems show up before review.

## Goals

Issue #58's "Done when" list:

- [ ] Playwright runs the tests below in Chromium and WebKit against the production build
- [ ] The `checks` job runs them on every PR and fails if they fail, with the report uploaded on failure
- [ ] Vitest ignores `e2e/`, and `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass
- [ ] `AGENTS.md` and the how-to guide describe the end-to-end tests and the flaky-test rule
- [ ] The PR says how long the `checks` job takes before and after

## Non-goals

From the issue:

- No login tests and no temporary Supabase in CI (the login Feature).
- No environment settings such as `APP_ENV`.
- Running the tests on the owner's PC stays optional. WebKit needs system libraries there.

Also:

- No Firefox. The bugs came from Safari, and Chromium covers Chrome, Edge and Android.
- No screenshot comparisons (visual regression). The tests measure positions instead.
- No new required check. The tests run inside the existing `checks` job, so the ruleset doesn't change.

## Anti-goals

- **No retries.** A test that fails once fails the run. Retries would hide flaky tests, which goes against the flaky-test rule below.
- **No CSS-class selectors in tests.** Classes change with styling, and tests tied to them break for no reason.
- **No pile of pixel checks.** The layout tests guard only the few rules that broke before. Adding a check for every spacing value would make the tests break on every design change.
- **No separate CI copy of the commands.** CI runs `npm run test:e2e`, the same script a person runs locally.

## Checked against the docs

Checked on 2026-11-12, before this design:

- **Version:** `@playwright/test` 1.65.0 is the latest release (2026-11-05). It needs Node 20 or later, and we use Node 24. It supports Ubuntu 22.04, 24.04 and 26.04, and `ubuntu-latest` is 24.04. ([intro](https://playwright.dev/docs/intro))
- **CI:** the docs install browsers with `npx playwright install --with-deps`, which can take a list of browsers. They recommend `workers: 1` on CI, upload `playwright-report/` with `actions/upload-artifact`, and advise against caching browsers: restoring the cache takes about as long as downloading them, and the system libraries can't be cached anyway. A job `timeout-minutes` should stay well above Playwright's `globalTimeout`. ([CI](https://playwright.dev/docs/ci))
- **webServer:** `command`, `url`, `reuseExistingServer` (the docs suggest `!process.env.CI`), and a `timeout` that defaults to 60 s. The server's working directory defaults to the config file's folder. `use.baseURL` lets tests call `page.goto("/")`. ([webServer](https://playwright.dev/docs/test-webserver))
- **Next.js 16.4 guide** (`node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md`): run the tests against the production build (`npm run build`, then `npm run start`). It mentions `webServer` as a way to start the server.
- **upload-artifact:** latest release v7.0.2, commit `cf430e030ddbb5b0abf93d22962f4752f3646cd9`.
- **Current job time:** the last `checks` run on `main`'s latest PR (#57) took 58 s. `npm ci` took 39 s and `npm run build` took 4 s.

The issue is accurate and up to date.

## What gets built

### Dependency and scripts (`package.json`)

- Add the dev dependency `@playwright/test` at exactly `1.65.0` (`.npmrc` has `save-exact=true`).
- Add the `test:e2e` script: `playwright test`.
- Add `e2e` and `playwright.config.ts` to the `lint`, `format` and `format:check` scripts' path lists, so the new code is linted and formatted like the rest. `typecheck` already covers them, because `tsconfig.json` includes `**/*.ts`.

### `playwright.config.ts`

- `testDir: "./e2e"`
- `forbidOnly: !!process.env.CI`, so a leftover `test.only` fails CI.
- `retries: 0` (see Anti-goals).
- `workers: process.env.CI ? 1 : undefined`, as the CI docs recommend.
- Reporters: in CI, `github` (failures show as annotations on the PR's files) and `html` with `open: "never"`. Locally, `list` and `html` with `open: "never"`.
- `use.baseURL: "http://localhost:3100"`, and `use.trace: "retain-on-failure"`. A trace is kept only for a failed test, and the HTML report embeds it, so one artifact holds both.
- `globalTimeout` in CI: 8 minutes, below the job's 11-minute timeout, so a hung run still uploads its report (the owner's change before merge).
- Two projects:
  - `chromium`, using `devices["Desktop Chrome"]`
  - `webkit`, using `devices["Desktop Safari"]`
- `webServer`:
  - `command`: locally `npm run build && npm run start -- --port 3100`, as the issue says: a production build, then the production server. In CI, only `npm run start -- --port 3100`, because the Build step has already built the app (the owner's change before merge).
  - `url: "http://localhost:3100"`
  - `reuseExistingServer: !process.env.CI`
  - `timeout: 120_000`, to leave room for the build.

  My call: port 3100 instead of Next.js's default 3000. If `npm run dev` is running on 3000, a local run would otherwise reuse the dev server and test development code instead of the production build.

### Vitest (`vitest.config.mts`)

Add `exclude: [...configDefaults.exclude, "e2e/**"]` to `test`. Vitest's default `include` matches `*.spec.ts`, so without this it would try to run the Playwright specs.

### `.gitignore`

Add Playwright's output folders: `/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/`.

### Finding elements

As a user would, by role and name: `getByRole("banner")`, `getByRole("main")`, `getByRole("heading", { level: 1 })`, `getByRole("link", { name: … })`.

Two layout parts have no role, because they're decorative: the surface band and the pitch drawing (which is `aria-hidden`). My call: `PitchLayout` gives them `data-testid="pitch-band"` (the `bg-surface` div) and `data-testid="pitch"` (passed to the `Pitch` svg, which then accepts a `data-testid` prop or spreads its props). `getByTestId` is Playwright's own fallback for parts a user can't name, and test ids don't change when the styling does.

The card is found as `getByRole("main").locator('[data-slot="card"]')`. `data-slot` is the shadcn/ui Card's own marker, not a CSS class, so the pages don't need a test id.

The wordmark link's name comes from `APP_NAME` in `src/lib/app-name.ts` (`` `${APP_NAME} home` ``). The specs import it rather than writing the name, so the name stays in one place. A relative import works; so does `@/` if Playwright resolves `tsconfig` paths.

### Specs (`e2e/`)

One file per area. Every test runs in both projects.

**`e2e/layout.spec.ts`**: for each page (`/` and `/does-not-exist`), and each size in this table:

| Size | What it stands for | Surface ends at half? |
| --- | --- | --- |
| 360 × 640 | a small Android phone | yes |
| 390 × 844 | an iPhone | yes |
| 844 × 390 | an iPhone in landscape | no: the surface grows past half |
| 1280 × 800 | a laptop | yes |
| 2560 × 1440 | a large monitor | yes |

The last column is written in the table, not worked out by the test, so the test doesn't copy `PitchLayout`'s sums. At each size, the test sets the viewport, opens the page, and waits for `document.fonts.ready`, so text can't still change size, and with it the page's width, after the measurements are taken. Then it checks, with a 1 px tolerance:

1. **No sideways scrolling:** `document.documentElement.scrollWidth` is at most its `clientWidth`.
2. **The pitch is whole:** the drawn pitch is inside the page's width (`clientWidth`), below the header (`banner`), and inside the surface band. "Drawn" means the bounds of the lines inside the svg (for example the svg's content group's `getBoundingClientRect()`), not the svg box, which can be larger than the drawing.
3. **The pitch doesn't touch the card:** the drawn pitch's bottom is above the card's top.
4. **The surface ends at half the screen:** where the table says yes, the band's bottom is half the viewport height. Where it says no, the band's bottom is below half.

Names read like the rule, e.g. `home at 844 × 390: the surface grows past half the screen`, so a failure in the report says which rule broke.

**`e2e/not-found.spec.ts`**:

- `/does-not-exist` and `/a/b/c` each answer with status 404 (from the `page.goto` response) and show the 404 heading.
- On the 404 page, clicking the "Back to home" link opens `/` and shows the home heading.

**`e2e/header.spec.ts`**:

- Starting from `/does-not-exist` (so the click really navigates), clicking the wordmark link opens `/` and shows the home heading.

### CI (`.github/workflows/ci.yml`)

In the existing `checks` job, after `Build`:

1. **Install Playwright browsers:** `npx playwright install --with-deps chromium webkit`.
2. **End-to-end tests:** `npm run test:e2e`.
3. **Upload Playwright report:** `actions/upload-artifact` pinned to `cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2`, with `if: failure() && steps.e2e.outcome == 'failure'` (the end-to-end step has `id: e2e`). It uploads `playwright-report/` and `test-results/` as one artifact named `playwright-report`, with `retention-days: 14`.

My calls:

- Only when the end-to-end step failed, rather than the docs' `!cancelled()`: the issue asks for the report on failure, a green run has nothing to look at, and an earlier failing step (such as lint) leaves no report to upload.
- 14 days' retention: long enough to look at a failure during a review. The repo's default is 90 days, which is more storage than this needs.
- `timeout-minutes` goes from 10 to 15 at first, then gets set from the measured CI run time (see Running the tests while building). It ended at 11, above Playwright's 8-minute `globalTimeout`. The PR body reports the job time before (58 s) and after.
- No browser cache, as the docs advise.

### ADR

My call: add ADR 0015, "Test screens end to end with Playwright in CI". It records the choices someone will later ask about: Playwright over Cypress (Cypress can't run WebKit, the engine that broke), Chromium and WebKit only, CI as the place the tests always run, and no retries, so a flaky test gets fixed or gets an issue. Add it to the decisions index.

### Docs

- **`AGENTS.md`:**
  - Commands: add `npm run test:e2e`, noting that it needs the browsers installed (see the how-to guide) and that CI always runs it.
  - Code: end-to-end tests live in `e2e/`, one spec per area, and find elements by role and name (test ids only for decorative parts).
  - The flaky-test rule: a flaky test is fixed or gets an issue right away, never re-run until it passes.
  - The pre-commit list stays as it is. The end-to-end tests are optional locally.
- **The how-to guide** (`docs/how-to/development-workflow.md`):
  - Step 9 lists the end-to-end tests among the CI checks.
  - A new section on the end-to-end tests, holding everything about them in one place (the owner's decision):
    - **Reading a failed run:** open the failed `checks` run, read the annotations, download the `playwright-report` artifact from the run's summary page, unzip it, run `npx playwright show-report <folder>`, and open a failed test's trace. The trace can also be dropped onto trace.playwright.dev.
    - **Running them locally (optional):** `npx playwright install --with-deps chromium webkit` (WebKit needs system libraries, installed with apt), then `npm run test:e2e`. CI always runs them, so this is never required.
    - **The flaky-test rule**, restated.
- **`README.md`:** unchanged (the owner's decision). The local-run steps live only in the how-to guide, with the short command line in `AGENTS.md`.

## Proving the layout tests catch the old bugs

The owner's decision: the layout spec has to be shown to catch the two Safari bugs that reached the preview before, not just assumed to. Both are in `superpowers/38-visual-identity/design.md`:

- **Bug A, the surface stuck at half:** the surface had a fixed `h-[50svh]` with `min-h-min`. Chrome let it grow; Safari kept it at half, so the band overflowed below the grey and the card covered the pitch. To bring it back, change the surface's `min-h-[50svh]` to `h-[50svh] min-h-min`.
- **Bug B, the pitch's height in the flex band:** on a real iPhone in landscape, Safari didn't resolve the pitch's `height: 100%` inside the flex band, so the pitch stayed full size and showed under the card. To bring it back, drop the absolutely positioned box and put `<Pitch className="block size-full max-w-240" />` straight into the pitch area.

The check runs in CI, on this PR's branch (the owner's decision). For each bug, in turn:

1. Push a temporary commit that brings the bug back.
2. Wait for the CI run to finish, and read which browser failed and on which check.
3. Expected: WebKit fails at 844 × 390, on the surface check or the "doesn't touch the card" check. Chromium passing would show the tests see the difference between the engines, but isn't required.
4. Push a revert (`git revert`), and check that its CI run is green.

Wait for each run to finish before the next push: the workflow's `concurrency` setting cancels a run when a newer push arrives. The squash merge keeps these commits out of `main`.

If desktop WebKit doesn't fail on a bug, run the phone sizes (360 × 640, 390 × 844, 844 × 390) in WebKit with phone emulation: `isMobile: true` and `hasTouch: true`, as Playwright's iPhone profiles set them. The desktop sizes stay on the desktop profile. Then repeat the check. If WebKit still misses the bug, keep the setup that is closest to an iPhone, and the PR and the ADR name the bug the tests can't catch. Whatever happens, the ADR records which profile the phone sizes use and why.

The PR body lists, for each bug, which browsers failed and on which check, with links to the runs.

## Running the tests while building

The owner's decision: nothing is installed on the owner's machine, so no Playwright browsers, no system libraries and no apt. The specs are written without running them locally. `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` still run locally, and they also check the specs and the config (types, lint, formatting) and that Vitest skips `e2e/`. CI is the only place the end-to-end tests run.

CI runs only on pull requests into `main`, so the branch needs a PR before the first end-to-end run. It opens as a **draft**. The pushes go in this order:

1. Push the finished change and open the draft PR. CI runs the end-to-end tests for the first time.
2. Bug A: the temporary commit, then its revert (above).
3. Bug B: the same.
4. Set `timeout-minutes` from the measured job time, and push it.
5. Fill in the PR body: the bug results, and the `checks` job time before (58 s) and after. Tick the issue's "Done when" items and mark the PR ready for review.

The owner's OK is asked once, before step 1, for this whole sequence. Any push outside it needs a new OK: a fix after a CI failure that isn't one of the expected bug failures, or the phone-emulation fallback.

## Left to the builder

- Exactly how the drawn pitch's bounds are measured, as long as it's the lines, not the svg box.
- How the layout spec is laid out (a loop over pages × sizes, `test.describe` blocks, helper functions).
- Whether `Pitch` takes a `data-testid` prop or spreads extra props.
- Unit tests: `PitchLayout`'s test checks the two test ids exist, so removing one breaks a unit test before it breaks the end-to-end tests.

## Outcome

Recorded after the PR's CI runs, for the record. The details are in PR #60 and ADR 0015.

- **Bug A** (the surface stuck at half) isn't caught: Playwright's WebKit is a newer build than iOS Safari and doesn't have that behavior. The unit test pinning `min-h-[50svh]` still guards that exact change.
- **Bug B** (the pitch outside its positioned box) is caught in both browsers, through the surface growing past half instead of the pitch spilling under the card.
- **Phone emulation** wasn't tried (the owner's decision): it changes viewport and touch behavior, not how WebKit calculates heights. The phone sizes stay on the desktop Safari profile.
- **Consequence:** the end-to-end tests don't replace a check on a real iPhone. For screen changes, the owner's phone check on the preview stays part of the review.
- **Job time:** 58 s before, 100–153 s after. `timeout-minutes` is 11.
