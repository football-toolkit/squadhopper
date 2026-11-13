---
status: accepted
date: 2026-11-13
decision-makers: repository owner
---

# 0015: Test screens end to end with Playwright in CI

## Context and problem statement

CI ran only unit tests, in jsdom, a simulated browser with no layout engine. Twice, a layout bug that only Safari showed reached the owner's iPhone through the preview: once the grey surface stayed at half the screen, once the pitch overflowed under the card. Nothing tested in Safari's engine. The agents can't drive a browser on the owner's PC, and the Vercel previews sit behind Vercel's login. How do we test screens in real browsers, before review?

## Decision drivers

- Catch Safari (WebKit) layout bugs, the ones that got through.
- Run on every pull request, with no one having to remember.
- No cost and no new accounts or secrets: the repo is public.
- Tests that agents can write and read, and that fail for real problems only.

## Considered options

1. Playwright in CI, with Chromium and WebKit
2. Cypress in CI
3. Checking every preview by hand on an iPhone
4. A cloud device service, such as BrowserStack

## Decision outcome

Chosen option: **"Playwright in CI, with Chromium and WebKit"**, because it is the only free option that runs WebKit, the engine that broke, on every pull request.

- The tests live in `e2e/` and run against the production build (`npm run build`, then `npm run start`).
- They run inside the existing `checks` job, the ruleset's one required check, so a failing test blocks the merge.
- Two browsers: Chromium (Chrome, Edge, Android) and WebKit (Safari). No Firefox: no bug has come from it, and each browser adds time to every run.
- No retries. A flaky test is fixed or gets an issue right away, never re-run until it passes. Retries would turn real, intermittent problems into green runs.
- The layout tests check a few rules that broke before, with a 1 px tolerance, not every spacing value.
- CI is where the tests always run. Running them locally is optional, because WebKit needs system libraries.

### Consequences

- Good, because WebKit layout bugs show up on the pull request, before review.
- Good, because the report and traces of a failed run are uploaded, so anyone can see what the page looked like when it failed.
- Bad, because every run installs the browsers and their system libraries, which adds time to the `checks` job. Caching them saves little, as the Playwright docs say.
- Bad, because WebKit on Linux isn't Safari on an iPhone: it has the same layout engine, but not the same device, so some phone-only bugs can still get through. TODO(#58): which profile the phone sizes use, and which old bugs it catches, filled in from the bug proof in CI before the PR is ready.

### Confirmation

- `playwright.config.ts`: the `chromium` and `webkit` projects, `retries: 0`.
- `.github/workflows/ci.yml`: the `End-to-end tests` step in the `checks` job.
- `AGENTS.md`: the flaky-test rule.

## Pros and cons of the options

### Cypress in CI

- Good, because it is free, widely used and runs in CI.
- Bad, because it doesn't run WebKit as a supported browser, so it would miss the bugs that got through.

### Checking every preview by hand on an iPhone

- Good, because it tests the real device.
- Bad, because it depends on someone remembering, and only the owner can do it: the previews are behind Vercel's login.

### A cloud device service

- Good, because it runs real iPhones.
- Bad, because it costs money and adds an account and a secret to CI.

## More information

- [How to read a failed run, and run the tests locally](../../how-to/development-workflow.md#end-to-end-tests)
- [Playwright: Continuous Integration](https://playwright.dev/docs/ci)
- [Next.js: How to set up Playwright](https://nextjs.org/docs/app/guides/testing/playwright)
