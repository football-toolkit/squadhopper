---
status: accepted
date: 2026-11-16
decision-makers: repository owner
---

# 0018: Pick the auth service with `APP_ENV`, and a mock outside production

## Context and problem statement

The login checks passwords with Supabase in production ([0016](0016-use-supabase-for-authentication.md)). Production is the only Vercel environment with the Supabase variables, so a preview or a local run has no Supabase to talk to. Yet the owner reviews every change that touches the screens on its preview, which means logging in there. What should decide whether the app talks to Supabase or to a stand-in, and where should the stand-in's user live?

## Decision drivers

- A preview and a local run can log in and show every screen, including the "Can't log in right now" popup, with no Supabase project and no real credentials.
- The stand-in can never run in production, even if a setting is wrong.
- One build works in every environment, so the choice is made when a request arrives, not when the app is built.
- No real credentials anywhere in a public repo.

## Considered options

1. **A dedicated variable, `APP_ENV`**, read at request time: `local` and `preview` use a mock, everything else uses Supabase
2. `NODE_ENV`
3. `VERCEL_ENV`

## Decision outcome

Chosen option: **"`APP_ENV`"**, because it is ours: its values mean what we say they mean, and it works the same on Vercel, in CI and on a laptop.

| `APP_ENV` | Backend |
| --- | --- |
| `local` | mock |
| `preview` | mock |
| `test` | Supabase |
| `production` | Supabase |
| missing or unknown | Supabase |

- **The safe side is Supabase.** A missing or misspelled value picks Supabase, never the mock. On a preview without `APP_ENV`, logging in then shows "Can't log in right now", which is why [Set up Vercel](../../how-to/set-up-vercel.md) has the owner add it before the first preview review.
- **The mock refuses production.** Creating it throws when `APP_ENV` is `production`, so even a wrong table row could not open production to the mock. It also refuses to start when `VERCEL_ENV` is `production`: `APP_ENV` still decides the backend, and `VERCEL_ENV` is only a safety stop (owner's decision, 2026-11-16).
- **The test user lives in code**, in `src/lib/auth/test-user.ts`: an invented, public account whose password has 12 or more characters, matching production's minimum. The mock, the end-to-end tests and the CI setup all import it. The owner chose this on 2026-11-16 over an environment variable, because Vercel doesn't read `.env.example`: a variable would have to be added by hand in Vercel, and the only value that is needed there is `APP_ENV`. `.env.example` points to the file.
- **Why not the platform's own variables.** `NODE_ENV` is `production` for every `next build` and `next start`, including the preview and the CI run, so it can't tell them apart. `VERCEL_ENV` ([system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables)) exists only on Vercel, so local runs and CI would need a second rule.
- `APP_ENV` is read only in the proxy and the Server Actions, at request time. It has no `NEXT_PUBLIC_` prefix, so it isn't built into the browser code.

### Consequences

- Good, because the owner reviews real logins on every preview without any Supabase setup there.
- Good, because the mock can't reach production: unknown values pick Supabase, and the mock refuses `production`.
- Good, because the test user is defined once, in a reviewed file, with no secret to manage.
- Bad, because a removed user keeps access until their session token expires, up to an hour (Supabase's default `jwt_expiry`, 3600 s), since the gate checks the token locally. The first Feature that reads per-user data adds a check next to the data that asks Supabase directly, so a removed user sees no data.
- Bad, because the owner must add one Vercel variable, and forgetting it makes previews say "Can't log in right now".
- Bad, because a preview doesn't exercise Supabase. CI does ([0019](0019-test-login-against-a-temporary-supabase-in-ci.md)).
- Bad, because the mock's cookie isn't signed. It runs only locally and on previews behind Vercel's login, where the test user is public anyway.

### Confirmation

- Unit tests cover every row of the table, including a missing and an unknown value, and the mock's refusal to start when `APP_ENV` or `VERCEL_ENV` is `production` (`src/lib/auth/__tests__/mock.test.ts`).
- Vercel lists `APP_ENV` as `preview` for Preview and `production` for Production.

## Pros and cons of the options

### `NODE_ENV`

- Good, because it needs no setting.
- Bad, because Next.js sets it to `production` for every build and start, so previews and CI look like production, and nothing could pick the mock.

### `VERCEL_ENV`

- Good, because Vercel sets it on its own.
- Bad, because it doesn't exist on a laptop or in CI, so those need a second rule, and a variable we don't control decides which backend runs.

## More information

- How to set it up: [Set up Vercel](../../how-to/set-up-vercel.md), [Set up Supabase](../../how-to/set-up-supabase.md).
- Related: [0016](0016-use-supabase-for-authentication.md), [0019](0019-test-login-against-a-temporary-supabase-in-ci.md)
