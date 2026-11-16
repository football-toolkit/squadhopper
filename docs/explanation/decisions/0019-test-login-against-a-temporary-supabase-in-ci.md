---
status: accepted
date: 2026-11-16
decision-makers: repository owner
---

# 0019: Test login against a temporary Supabase in CI

## Context and problem statement

The end-to-end tests ([0015](0015-test-screens-end-to-end-with-playwright-in-ci.md)) now log in and out. A test against the mock proves our screens, but not that the real Supabase accepts our calls, sets our cookies and ends the session. Where should CI log in?

## Decision drivers

- The tests use the real Supabase Auth code, not a copy of its behavior.
- CI never touches the production project: no secrets in CI, and no risk to real users.
- Every run starts from a clean state, so the tests can't depend on what an earlier run left behind.
- CI stays fast enough to wait for.

## Considered options

1. **A temporary Supabase in the job**, started with the Supabase CLI
2. The production Supabase project, with a test user
3. A second hosted Supabase project for tests
4. The mock only

## Decision outcome

Chosen option: **"A temporary Supabase in the job"**, because it runs the same Auth service as production, costs nothing, and disappears with the job.

- **The CLI in CI.** The `checks` job installs the Supabase CLI with `supabase/setup-cli` (CLI 3.1.0, the action pinned to its commit) and runs `supabase start`. The default stack takes about 85 seconds to answer (measured when this was designed; see the [setup-cli action](https://github.com/supabase/setup-cli)), so `-x` leaves out every service except Postgres, auth and the API gateway (Realtime, storage, image proxy, mail, PostgREST, Postgres Meta, Studio, edge functions, logs, vector and the pooler). Leaving out PostgREST also matches production, where the Data API is off ([0016](0016-use-supabase-for-authentication.md)). It starts in the background, early in the job, so its start overlaps `npm ci` and the build, and the "Wait for Supabase" step waits for it.
- **`supabase/config.toml` mirrors production.** It was created with `supabase init` and sets `enable_signup = false` and `minimum_password_length = 12`, the same as production. `sign_in_sign_ups` is 150 per 5 minutes per IP, matching production's token limit in 0016. The template's 30 is too low for a full test run's logins. `project_id` is `app`, because the project's name appears only in `README.md` and `src/lib/app-name.ts`.
- **The keys.** `supabase status -o env` prints the URL and the keys of the local stack, which the job maps to `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`, with `APP_ENV=test`. They are the CLI's fixed development keys, not secrets. The app never reads `SUPABASE_SECRET_KEY`: only the Playwright global setup does.
- **The user is created by the global setup.** When `APP_ENV=test`, `e2e/global-setup.ts` creates the test user from `src/lib/auth/test-user.ts` through the admin API, already confirmed ([0018](0018-pick-the-auth-service-with-app-env.md)). It treats "already exists" as success and fails loudly on anything else. The setup uses the admin API, which isn't a sign-up, so `enable_signup = false` stays the same as in production.
- **Job time.** <!-- job time: filled in by Task 10 --> The job's `timeout-minutes` and Playwright's `globalTimeout` were raised to leave room, and the report still uploads on a hang.

The official pages behind this: the Supabase [CLI start reference](https://supabase.com/docs/reference/cli/supabase-start) for `-x`, and the [rate limits page](https://supabase.com/docs/guides/auth/rate-limits) for `sign_in_sign_ups`.

### Consequences

- Good, because CI proves the real login, logout and session cookies, and a wrong password.
- Good, because production and its users are never involved, and CI holds no secret.
- Good, because each run starts with an empty database.
- Bad, because CI is slower, by the time reported above.
- Bad, because the "Can't log in right now" popup isn't tested end to end: it can't be caused on demand. Unit tests cover the mapping, and the mock shows it locally and on previews.
- Bad, because the CLI's images come from the internet, so a registry outage can fail a run.

### Confirmation

- `supabase/config.toml` is in the repo, with the settings above.
- The `checks` job runs the login, wrong password and logout tests against the temporary Supabase, in Chromium and WebKit.

## Pros and cons of the options

### The production Supabase project

- Good, because it is the real thing.
- Bad, because CI would need a secret key for production, and tests would create and revoke sessions next to real users. Pull requests from forks and Dependabot don't get secrets either.

### A second hosted Supabase project

- Good, because it is a real hosted service.
- Bad, because the Free plan allows two active projects ([pricing](https://supabase.com/pricing)), it would be paused after a week without use ([0016](0016-use-supabase-for-authentication.md)), and it keeps state between runs.

### The mock only

- Good, because it is fast and needs nothing.
- Bad, because it tests our copy of Supabase's behavior, so a wrong cookie option or error mapping would pass CI and fail in production.

## More information

- How it is set up: [Set up Supabase](../../how-to/set-up-supabase.md), [Development workflow](../../how-to/development-workflow.md#end-to-end-tests).
- Related: [0015](0015-test-screens-end-to-end-with-playwright-in-ci.md), [0016](0016-use-supabase-for-authentication.md), [0018](0018-pick-the-auth-service-with-app-env.md)
