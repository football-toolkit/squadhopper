# Log in and log out: design

Issue: #65 (Feature). Branch and change key: `65-login-logout`. Business specs: `openspec/changes/65-login-logout/` (proposal, specs for `access`, `login`, `logout` and `error-popup`, design, tasks). This document is the technical design; the OpenSpec change is the source for what the app does.

## Intent

Anyone who opens the app sees everything in it. The matches will be only for the teams' players, so before any match data goes in, the app must know who is using it and keep everyone else out. This change adds the login screen, the gate in front of every address, logging out, and an error popup that later features reuse. Users exist only because the owner adds them in Supabase; nobody signs up.

## Goals

Issue #65's acceptance criteria:

- [ ] A visitor who isn't logged in sees the login screen at any address, including one that doesn't exist; a logged-in user who opens it goes home
- [ ] Empty or invalid fields are outlined with their message; a valid email and password opens the home page
- [ ] A wrong email or password, and a failed check, each show their error popup, which stays until closed
- [ ] Logging in and logging out show the spinner and lock the controls; Log out ends the session on this device and shows the login screen
- [ ] The screens match the attached boards at phone and desktop widths, reviewed on the preview, and CI tests logging in, a wrong password and logging out, end to end, against a real Supabase

And every scenario in the OpenSpec specs, through the tasks in `openspec/changes/65-login-logout/tasks.md`.

## Non-goals

From the issue: sign-up, password reset, "show password", logging out on every device, success or info popups, translations (#64), and what to do about Supabase pausing.

Also:

- **No data access layer yet.** The pages show no per-user data, so the gate is the only check needed today. The first Feature that reads user data adds a check next to the data, as Next.js's [authentication guide](../../node_modules/next/dist/docs/01-app/02-guides/authentication.md) recommends ("Proxy … should not be your only line of defense in protecting your data"). Until then, a removed user keeps access for up to an hour, because the gate checks the token locally; the owner accepted this on 2026-11-16. The first Feature that reads per-user data adds a check next to the data that asks Supabase directly, so a removed user sees no data.
- **No browser-side Supabase client.** Supabase is reached only from the server, so no `NEXT_PUBLIC_` variables and no Supabase code in the browser bundle.
- **No end-to-end test of the "Can't log in right now" popup against real Supabase.** It can't be caused on demand in CI. Unit tests cover the mapping, and the mock lets anyone see it locally and on the preview.

## Anti-goals

- **Never show Supabase's own error text.** The server returns only our codes; the screen turns a code into one of our messages.
- **The mock never runs in production**, even if `APP_ENV` is misconfigured: a missing or unknown value picks Supabase, and the mock itself refuses to start when `APP_ENV` is `production`, or when `VERCEL_ENV` is `production` (a safety stop only: `APP_ENV` still decides the backend).
- **No real credentials anywhere**: not in the repo, the PR, screenshots or tests. The test user is invented and public.
- **No flaky tests.** Every end-to-end test is deterministic in both browsers; no test relies on behavior Playwright documents as unsupported.
- **No one-off colors, fonts or spacing** in the screens we write (AGENTS.md, Screen design).

## Checked against the docs

Checked on 2026-11-16, before this design. Sources are the installed Next.js docs in `node_modules/next/dist/docs/` and the official pages linked below.

- **Next.js 16.4.3.** Middleware is now called Proxy: "Create a `proxy.ts` … inside `src` if applicable" (`01-app/01-getting-started/16-proxy.md`). Proxy is the documented way "to protect static routes that share data between users", and "for auth, it's recommended Proxy runs on all routes" (`01-app/02-guides/authentication.md`). With `cacheComponents: true`, reading cookies in a page needs a `<Suspense>` boundary (`01-app/02-guides/authentication-with-cache-components.md`), which is one reason the gate lives in the proxy, not in the pages. The client cache keeps pages and reuses them "during browser back/forward navigation" (`01-app/04-glossary.md`).
- **Supabase SSR.** `@supabase/ssr` 0.12.7 (peer `@supabase/supabase-js` ^2.114.0; latest 2.119.0). The [Next.js guide](https://supabase.com/docs/guides/auth/server-side/nextjs) uses `proxy.ts`, `getAll`/`setAll` cookie methods, and "Always use `supabase.auth.getClaims()` to protect pages"; "*Never* trust `supabase.auth.getSession()` inside server code such as Proxy". `setAll` receives cache headers that must go on the response, and only on the first cookie write of a client, so one client per request ([creating a client](https://supabase.com/docs/guides/auth/server-side/creating-a-client)). The cookies are not httpOnly by default (`httpOnly: false` in the library's defaults); our own `cookieOptions` override it.
- **Sign-out scope.** [`signOut`](https://supabase.com/docs/reference/javascript/auth-signout) defaults to `global`. With `scope: 'local'`, "The local session is removed first … If the request fails, the client is still signed out locally". The `auth-js` 2.119.0 source confirms the local session (and so our cookies) is removed before the network call. With `global`, a failed request keeps the session.
- **Sign-in errors.** [Error codes](https://supabase.com/docs/guides/auth/debugging/error-codes): `invalid_credentials`, `over_request_rate_limit` (429), `request_timeout`, `unexpected_failure` and others. A network failure isn't documented; in the `auth-js` source it throws `AuthRetryableFetchError` with status 0, and 5xx responses throw the same class. What a paused project returns isn't documented anywhere.
- **Supabase CLI in CI.** `supabase/setup-cli@v3` (v3.2.0) runs on `ubuntu-latest`; CLI 3.1.0. The default stack answers about 85 s after `supabase start`. `-x` excludes services, except Postgres. `supabase status -o env` prints `API_URL`, `PUBLISHABLE_KEY` and `SECRET_KEY`. The `config.toml` template has `[auth] enable_signup`, `minimum_password_length` (default 6) and `[auth.rate_limit] sign_in_sign_ups = 30` (per 5 minutes per IP).
- **shadcn/ui.** shadcn's Sonner page now redirects to the [Base UI Toast](https://ui.shadcn.com/docs/components/base/toast) for Base UI projects (`npx shadcn add toast`). Installed `@base-ui/react` 1.9.0: toast `timeout: 0` "will prevent the toast from being dismissed automatically", and `priority: 'high'` is "announced urgently" (rendered as `role="alert"`). The base-nova Spinner renders `Loader2Icon` with `role="status" aria-label="Loading" animate-spin` and no reduced-motion handling, so we add it.
- **Back/forward cache.** [web.dev/bfcache](https://web.dev/articles/bfcache): "if a user signs out of a site on a public computer and the next user clicks the back button … always update the page after a `pageshow` event if `event.persisted` is `true`". [Chrome](https://developer.chrome.com/docs/web-platform/bfcache-ccns) now stores `Cache-Control: no-store` pages but "will evict a page from the bfcache on changes to cookies". WebKit refuses `no-store` pages only over HTTPS (`BackForwardCache.cpp`), so it may still store them on `http://localhost`. [Playwright](https://playwright.dev/docs/navigations): "By default, Playwright disables the BFCache across all browsers … testing BFCache restorations is not supported"; its WebKit always has it off.

**Where the issue is out of date:** it names Sonner for the popup. The owner chose Base UI Toast instead on 2026-11-16, and the issue now says so. Everything else in the issue matches the docs.

## Approaches

### The gate

1. **One check in the proxy, in front of every address (chosen).** It runs on every request, including addresses that don't exist, so a visitor never reaches a page or the 404 without a session. It's Supabase's documented pattern and Next.js's documented way to protect static pages.
2. A check in each page or layout. With Cache Components, every page would need a `<Suspense>` boundary around the session read. It also can't gate addresses that don't exist: the 404 page must stay synchronous so it gets its status before streaming starts (see `src/app/not-found.tsx`). Rejected.

### The popup

1. **Base UI Toast through shadcn (chosen by the owner).** It's already installed, stays until closed with `timeout: 0`, and is announced as an alert with `priority: 'high'`.
2. Sonner, as the issue first said. It adds `sonner` and `next-themes`, announces only politely, and shadcn no longer points Base UI projects to it.

### Testing Back after logging out (chosen by the owner)

1. **A real Back test, plus a simulated restore, plus a unit test of the listener (chosen).** Deterministic in both browsers.
2. A real restore in Chromium with the cache turned back on. Playwright documents it as unsupported (timeouts), so the test would be flaky, and WebKit can't do it at all.
3. A real Back test and a manual check only.

The owner also asked for a manual check on the preview, already in the PR's "How to test": on an iPhone in Safari and in desktop Chrome, log in, log out, press Back, and the login screen shows.

## What gets built

### Dependencies

- `@supabase/ssr` 0.12.7 and `@supabase/supabase-js` 2.119.0, exact versions (`.npmrc` has `save-exact=true`).
- shadcn components with `npx shadcn add input label toast spinner`, then `npm run format`. Whatever they add to `package.json` stays exact.

### Picking the auth service (`src/lib/auth/`)

Ports and adapters. Screens, actions and the proxy use only the `AuthService` interface.

```ts
type AuthErrorCode = "invalid_credentials" | "unavailable";
type SignInResult = { ok: true } | { ok: false; code: AuthErrorCode };

interface AuthService {
  hasSession(): Promise<boolean>;
  signIn(email: string, password: string): Promise<SignInResult>;
  signOut(): Promise<void>; // always ends the session on this device
}

// How a service reads and writes cookies: built from the request and response
// in the proxy, and from next/headers cookies() in Server Actions and the
// /logout Route Handler.
interface CookieJar {
  getAll(): { name: string; value: string }[];
  setAll(
    cookies: { name: string; value: string; options: CookieOptions }[],
    headers?: Record<string, string>,
  ): void;
}

function createAuthService(jar: CookieJar, env = process.env): AuthService;
```

`pickAuthBackend(appEnv)` holds the table from the issue, as a pure function:

| `APP_ENV` | Backend |
| --- | --- |
| `local` | mock |
| `preview` | mock |
| `test` | Supabase |
| `production` | Supabase |
| missing or unknown | Supabase |

`APP_ENV` is read at request time only (the proxy, the `logIn` Server Action and the `/logout` route), never during the build, so one build works in every environment. `NODE_ENV` and `VERCEL_ENV` aren't used for this.

**Supabase adapter.**

- One `createServerClient` per request, with `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` and the jar's `getAll`/`setAll`. `setAll`'s cache headers go on the response.
- Cookie options: `httpOnly: true` (nothing in the browser reads them), `sameSite: "lax"`, `path: "/"`, and `secure` only when the request came over HTTPS. Playwright's WebKit doesn't store `Secure` cookies on `http://localhost`, and CI serves the app there.
- `hasSession()` calls `getClaims()` and is true only when it returns claims without an error.
- `signIn()` calls `signInWithPassword`. The error mapping:
  - `invalid_credentials` maps to `invalid_credentials`.
  - **The validation errors** `validation_failed` ("Provided parameters are not in the expected format") and `email_address_invalid` also map to `invalid_credentials` (owner's addition, 2026-11-16), so a rejected email never says "try again in a few minutes". The [error-codes page](https://supabase.com/docs/guides/auth/debugging/error-codes) doesn't group validation errors. These two are the ones about the user's input on sign-in. Left out: `bad_json` (our own request was malformed, so it's a failure on our side), `weak_password` and `same_password` (only when setting a password), and `email_address_not_authorized` (about sending email).
  - Every other error maps to `unavailable` (rate limits, `AuthRetryableFetchError` for network failures and 5xx, unknown errors, and whatever a paused project returns). *My call:* `email_not_confirmed` and `user_banned` also map to `unavailable`. The owner adds and removes users by hand, so neither should happen, and neither may say which detail was wrong.
- `signOut()` calls `signOut({ scope: "local" })`. The library clears the cookies before the network call, so the device is logged out even when Supabase can't be reached.
- If `SUPABASE_URL` or `SUPABASE_PUBLISHABLE_KEY` is missing: `hasSession()` is false, so the gate shows the login screen. `signIn()` returns `unavailable`, and the server logs one error that names the missing variable but never its value.

**Mock adapter.**

- The invented test user is defined once in code, in `src/lib/auth/test-user.ts` (owner's decision, 2026-11-16). The mock, the end-to-end tests and the CI setup all import it. Its password has 12+ characters, matching production's minimum. It's invented and public, never a real account.
- That email with that password logs in and sets an httpOnly `mock-session` cookie, with the same options as above.
- `unavailable@example.com`, with any password, returns `unavailable`, so the "Can't log in right now" popup can be seen locally and on the preview.
- Anything else returns `invalid_credentials`.
- `signOut()` deletes the cookie. `hasSession()` checks that the cookie is there.
- The constructor throws if `APP_ENV` is `production`, and also if `VERCEL_ENV` is `production`. That is a safety stop only: `APP_ENV` still decides the backend (owner's decision, 2026-11-16).
- *My call:* the cookie's value isn't signed. The mock only runs locally and on previews behind Vercel's login, where the test user is public anyway.

### The gate (`src/proxy.ts`)

- The matcher runs on every path except `_next/static`, `_next/image` and the icon files (`favicon.ico`, `icon.svg`, `apple-icon.png`).
- The decision is a pure function, `routeFor({ pathname, signedIn })`, unit-tested on its own:
  - not signed in, on any path but `/login` → redirect to `/login`
  - signed in, on `/login` → redirect to `/`
  - otherwise → let the request through
- A redirect copies any cookies the Supabase client wrote (a refreshed token) onto the redirect response, as Supabase's guide shows.
- Every response the proxy returns carries `Cache-Control: private, no-store`, so the browser's HTTP cache never serves a page on Back. Next.js might override this header on prerendered pages. The first end-to-end test asserts the header on `/` and `/login`. **Fallback, pre-approved by the owner on 2026-11-16:** if Next.js wins, render the gated pages per request (`await connection()` inside a `<Suspense>` boundary), which Next.js serves with `no-store`, and say so in the PR. The PR's "How to test" also has the owner check the header on the preview, in the browser's network tab.
- No database or network calls beyond `getClaims()`. With asymmetric signing keys it checks the signature locally.

### Login screen (`src/app/login/`)

- **`page.tsx`:** a synchronous Server Component. It renders `PitchLayout` with no header and a card holding the `Wordmark`, the tagline "All your matches in one place.", and `<LoginForm />`. Under the card, in small print, "Sign-ups are closed." Metadata: `Log in · ${APP_NAME}`. The layout follows the boards: the card is narrower than the home card on desktop, and its exact width is ported to the theme's scale (see Left to the builder).
- **`login-form.tsx`** (Client Component):
  - A `<form noValidate>` with Email (`type="email"`, `autoComplete="email"`, placeholder `you@example.com`) and Password (`type="password"`, `autoComplete="current-password"`, placeholder `••••••••`). Each field has a shadcn `Label` and `Input`.
  - **On submit:**
    1. Close any open login popup, on every click of Log in, even when the field check then stops the attempt. The spec says a new click closes the earlier popup. After a wrong password, the password field is empty, so the very next click fails the field check, and the popup shouldn't stay next to "Enter your password".
    2. Trim the email, then check the fields: empty email → "Enter your email"; an email that doesn't match `^[^\s@]+@[^\s@]+\.[^\s@]+$` → "Enter a valid email address"; empty password → "Enter your password".
    3. An invalid field gets `aria-invalid` (the Input draws a 1 px `border-destructive` border and no red ring; the light keyboard focus ring stays) and `aria-describedby` pointing to its message, shown under it in `text-xs text-destructive` with a decorative `CircleAlert` icon before the text. *My call:* focus moves to the first invalid field.
    4. If both fields are valid, call the `logIn` Server Action inside `useTransition`.
  - **Typing** in a field clears only that field's message.
  - **While pending:** both inputs are disabled; the button is disabled and dimmed, and shows the Spinner and "Logging in…". A second click does nothing, because the button is disabled and the submit handler returns early.
  - **Result `ok`:** `window.location.replace("/")`, keeping the pending state until the page goes. Replacing the history entry keeps the login form out of Back.
  - **Result `invalid_credentials`:** an error popup with "Wrong email or password."; the email stays, and the password is cleared.
  - **Result `unavailable`:** an error popup with "Can't log in right now. Try again in a few minutes." *My call:* both fields keep their values, so a retry is one click.
  - If the action throws (a network error between browser and server), it's treated as `unavailable`.
- **`actions.ts`** (`"use server"`): `logIn({ email, password })`.
  1. Check the input again with the same validation function. Invalid input returns `invalid_credentials` without calling the service.
  2. Call `createAuthService(cookieJarFromNext()).signIn(...)`.
  3. Return only `{ ok: true }` or `{ ok: false, code }`.

All texts come from `src/lib/messages/auth.ts`, which the screens and the tests import: the labels, the field messages, the button labels and the two popup messages, keyed by error code.

### Log out (`src/components/logout-button.tsx`)

- **The button:** a Client Component, a shadcn `Button` with `variant="outline"` and `size="sm"` (as on the boards), with the `LogOut` icon and "Log out".
- **On click:** inside `useTransition`, it sends `fetch("/logout", { method: "POST" })`. While pending, it's disabled and dimmed, and shows the Spinner and "Logging out…".
- **After the request answers or fails:** `goTo("/login")` (`window.location.assign`), staying pending while the page goes. The failure is swallowed, not rethrown, so Next's error page never shows; the gate decides what `/login` shows.
- **Where it shows:** `AppHeader` gets it as a child on `src/app/page.tsx` and `src/app/not-found.tsx`. `not-found.tsx` stays synchronous; a Client Component child doesn't change that.
- **The route, `src/app/logout/route.ts`:** a Route Handler that exports only `POST`. It calls `authServiceForRequest().signOut()` (scope local, so this device's cookies are cleared even when Supabase can't be reached; the cleared cookies go on its response) and answers `204` with `Cache-Control: private, no-store`. Next.js answers any other method with `405 Method Not Allowed` (`node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`), so a link, a typed address or a prefetch can't end the session. A signed-out `POST /logout` gets the gate's redirect to `/login`, which is harmless.

**Why a route and not a Server Action** (changed after the owner's preview review, 2026-11-17). The first build used a `logOut` Server Action. On the Vercel preview, Log out from the 404 page showed the spinner, then landed on home, still logged in; from home it worked. A Server Action is a POST to the page's own address. Locally, `next start` runs the action from an unknown address too: it answers 404 with a component payload and clears the cookie. Next.js's client accepts an action's answer only as `text/x-component` and throws on anything else, which the empty `catch` hid. The likely cause, inferred but not observed (the preview sits behind Vercel's login): on Vercel the 404 page is prerendered, and a POST to an unknown address most likely gets that static HTML instead of running the action, so the cookie stayed and the gate sent the user home. CI's `next start` doesn't show it, so the end-to-end test that logs out from the 404 page guards against regressions, and the owner checks the fix on the preview. A Route Handler lives at one fixed address that exists on every deployment, so logging out no longer depends on which page the button is on.

**Why a full page load and not the router.** Next.js keeps its own copy of visited pages and reuses it on Back and Forward. A router navigation to `/login` would leave the home page in that copy, and Back would show it without asking the server. A full page load starts a new document and throws the copy away. For the same reason, logging in uses `location.replace("/")`, so the logged-out document is gone too.

### Back after logging out

Three layers, so no single browser behavior is relied on:

1. **Next.js's own copy of pages:** thrown away by the full page load after logging out (above).
2. **The browser's HTTP cache:** every gated response carries `Cache-Control: private, no-store`. On Back, the browser asks the server again, and the gate answers with the login screen.
3. **The back/forward cache:** Chrome evicts `no-store` pages when cookies change, and Safari won't store them over HTTPS. Behaviors differ, though: WebKit on `http://localhost`, browsers that don't evict, and enterprise policies. So `src/components/bfcache-reload.tsx`, a Client Component in the root layout, listens for `pageshow`, and when `event.persisted` is true it calls `location.reload()`, as [web.dev/bfcache](https://web.dev/articles/bfcache) recommends for signed-out users. The reload goes through the gate. The session cookies are httpOnly, so the page can't check them in the browser; it always reloads. The cost: no back/forward cache for this app, which is fine at its size.

### Error popup (`src/components/ui/toast.tsx` from shadcn, plus our wrapper)

- The shadcn Toast's provider and viewport go in the root layout.
- A small `showError(message)` helper adds a toast with `timeout: 0`, `priority: "high"` and type `error`, and returns its id so the login form can close it on the next attempt. `closeError(id)` closes it.
- **Look**, ported from the boards to the theme: `bg-surface`, a 1 px `border-destructive` border, `rounded-xl` and `shadow-2xl`, all in one vertically centred row: the `CircleAlert` icon in `text-destructive`, the message in `text-foreground`, and an `X` close button with `aria-label="Close"`. The whole popup slides down and fades in when it appears, and slides back up and fades out when it closes (off under reduced motion, `motion-reduce:transition-none`).
- **Place:** top right from `md:` up (24 px from the top and right, 400 px wide), and across the top, 12 px from the top and each side, on phones.
- `destructive` is used only for errors (design guide).

### Spinner

The shadcn Spinner, used with `motion-reduce:animate-none`, so it shows but doesn't spin when the system asks for reduced motion. It's the same component for logging in and logging out.

### Environment

- **`.env.example`** (committed): `APP_ENV=local`, a comment pointing to `src/lib/auth/test-user.ts` for the login details and to `unavailable@example.com` for the failed-check popup, and commented-out `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` for anyone who runs a local Supabase. The README says to copy it to `.env.local`.
- **Vercel** (owner's manual step, in `docs/how-to/set-up-vercel.md`): `APP_ENV` as a Config variable, `preview` for Preview and `production` for Production. That's the only new Vercel setting, because the mock's user is in code. It has to be set before the preview review; without it, a preview picks Supabase, which has no variables there, so logging in shows "Can't log in right now".

### Supabase in CI

- **`supabase/config.toml`:** created with `supabase init` (CLI 3.1.0) and committed. `project_id` is set to a neutral value (`app`), because the project's name appears only in `README.md` and `src/lib/app-name.ts` (AGENTS.md). It mirrors the production settings that matter here:
  - `[auth] enable_signup = false`
  - `minimum_password_length = 12`
  - `[auth.rate_limit] sign_in_sign_ups = 150`, matching production's token limit in ADR 0016. The template's 30 is too low for a full test run's logins.
- **The `checks` job** (name unchanged; the ruleset requires it):
  1. `supabase/setup-cli@v3` pinned to a commit, with `version: 3.1.0`.
  2. `supabase start -x realtime,storage-api,imgproxy,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor`. Only Postgres, `gotrue` (auth) and `kong` (the API gateway on port 54321) stay. Leaving out `postgrest` matches production's Data API being off. It starts early in the job, so its roughly 85 s overlap with `npm ci` and the build. Whether that runs in the background or as an earlier step is left to the builder.
  3. Map `supabase status -o env` to `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` for the end-to-end step, plus `APP_ENV=test`. The test user comes from `src/lib/auth/test-user.ts`, not from the workflow.
  4. Set `timeout-minutes` and Playwright's `globalTimeout` from measured runs, so a hang stops Playwright first and the job still uploads its report: the end-to-end step's latest start plus `globalTimeout` stays below `timeout-minutes`. Measured on 2026-11-18, the step starts 1 min 39 s to 3 min 41 s into the job, so `timeout-minutes` is 12 and `globalTimeout` 7 minutes (owner's decision; ADR 0019). The PR reports the job time before and after.
- **Playwright global setup:** when `APP_ENV=test`, it creates the test user from `src/lib/auth/test-user.ts` with `supabase-js` admin (`createClient(url, SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } })` and `auth.admin.createUser({ email, password, email_confirm: true })`). It treats "already exists" as success, and fails loudly otherwise. The app never reads `SUPABASE_SECRET_KEY`. With the mock, the user already exists.

## Tests

Test first, from each task's scenarios. Each test names the scenario it proves.

### Unit (Vitest, jsdom), next to the code in `__tests__/`

| Test | Proves (OpenSpec task) |
| --- | --- |
| `pickAuthBackend`: every row of the table, including missing and unknown | 3.1, 3.2 (and the issue's rules) |
| Mock adapter: correct details, wrong password, unknown email, `unavailable@example.com`, `signOut`, `hasSession`, refuses `production` | 2.4, 2.5, 4.3 |
| Supabase adapter with a fake client: the code mapping (`invalid_credentials`; `validation_failed` and `email_address_invalid` to `invalid_credentials`; rate limit, retryable fetch error, `bad_json` and unknown to `unavailable`), `scope: "local"`, `getClaims` decides `hasSession`, missing variables | 2.5, 4.3 |
| `routeFor`: the redirects and pass-throughs; the proxy sets `Cache-Control: private, no-store` | 3.1, 3.2, 4.3 |
| Proxy with a fake Supabase client that writes a refreshed token while checking the session: the redirect response (to `/login` or to `/`) carries the written cookies, with their options, and so does a pass-through response (owner's addition) | 3.1, 3.2 |
| `LoginForm`: empty fields, invalid email, typing clears only that field, `noValidate`, pending locks the fields and the button with "Logging in…", a second click sends nothing, wrong details (popup, email kept, password cleared), unavailable, a thrown action, every new click closes the popup (also when the field check then stops it), success calls `location.replace("/")`, emails trimmed | 2.1–2.5 |
| `logIn` action: validates again and returns only codes | 2.5 |
| Error popup: shows the icon, message and close button named "Close"; `role="alert"`; still there after 60 s with fake timers; the close button and Enter close it; closing it by id | 1.1, 1.2 |
| Spinner usage carries `motion-reduce:animate-none` | 2.3, 4.2 |
| `LogoutButton`: pending state, ignores a second click, `location.assign("/login")` after the `POST /logout` answers and after it fails | 4.2, 4.3 |
| `POST /logout` route: signs out once, answers 204 with `Cache-Control: private, no-store`, and the file exports only `POST` (so `GET` gets 405) | 4.3 |
| `BfcacheReload`: `pageshow` with `persisted: true` reloads; `persisted: false` doesn't | 4.3 |
| Home and 404 headers show Log out (update the existing page tests) | 4.1 |
| Login page: the wordmark, the fields, "Sign-ups are closed.", no sign-up or reset link | 2.1 |

### End to end (Playwright, Chromium and WebKit, `e2e/`)

- **`auth.setup.ts`:** a setup project that logs in through the UI and saves the storage state. The existing specs (`header`, `layout`, `not-found`) depend on it, so they run logged in.
- **`login.spec.ts`** (no saved state):
  - A visitor at `/` and at `/does-not-exist` sees the login screen.
  - Empty fields show both messages.
  - A wrong password shows the popup, which stays until closed, keeps the email and clears the password.
  - Correct details open the home page.
  - A logged-in user at `/login` lands on `/`.
  - The login screen layout at 390 px and 1280 px, measured like the existing layout tests.
- **`logout.spec.ts`:** each test logs in fresh, because logging out revokes that session, and a shared one would break other tests.
  - **Log out from every page that has the button** (the home page and the 404 page) shows the login screen, and opening `/` afterwards still shows it, so the session is really gone. Added after the owner's preview review found Log out from the 404 page leaving the session in place on Vercel. CI runs `next start`, where that case worked, so this test guards against regressions; the owner checks the fix on the preview.
  - **`GET /logout`** answers 405, and the user is still logged in afterwards.
  - **Back after logging out** shows the login screen.
  - **Simulated restore:** two pages in one context on the home page; log out in the second; on the first, dispatch `new PageTransitionEvent("pageshow", { persisted: true })`; the first page reloads into the login screen.
  - **Two devices:** two browser contexts, both logged in; one logs out; the other reloads and still sees home.
  - Gated responses carry `Cache-Control: private, no-store`.
- **Locally,** the tests run against the mock with `.env.local`, which `playwright.config.ts` loads with `process.loadEnvFile` when the file exists. **In CI,** they run against the temporary Supabase.

### Screenshots

From `npm run dev` with Playwright, which the repo already has, for the PR:
- the login screen: empty, with field errors, logging in, and the wrong-details popup
- home: with Log out, and logging out
- the 404 with Log out

All at 390 px and 1280 px, with the invented test user only.

## Docs

- **`docs/reference/design-guide.md`:** the error popup, the spinner (with reduced motion), the field error, the waiting button, and the header's outline button.
- **`README.md`:** copy `.env.example` to `.env.local`; what `APP_ENV` does.
- **`docs/how-to/development-workflow.md`:** the end-to-end tests need `.env.local` (mock) locally; CI uses a temporary Supabase.
- **`docs/how-to/set-up-vercel.md`:** the owner's `APP_ENV` step, done before the preview review.
- **`docs/how-to/set-up-supabase.md`:** previews and local runs now use the mock; the CI stack's `config.toml` mirrors the production settings.
- **`AGENTS.md`:** the `test:e2e` line mentions the env file.

## ADRs

- **0018 Pick the auth service with `APP_ENV`, and a mock outside production.** Named in the issue.
- **0019 Test login against a temporary Supabase in CI.** Named in the issue.
- **0020 Show popups with Base UI Toast.** The owner chose between real alternatives (Base UI Toast or Sonner), and the issue first said Sonner, so someone will ask why.

## Risks

- [Next.js overrides `Cache-Control` on prerendered pages] → The first end-to-end test asserts it; the pre-approved fallback is in "The gate". Vercel's CDN may differ from `next start`, so the owner also checks the header on the preview.
- [Supabase rejects the test user's invented email domain] → The error-codes page says `email_address_invalid` covers "Example and test domains". That's about sending email, and the CI user is created already confirmed, so no email is sent. If the global setup fails on it anyway, change the invented domain in `src/lib/auth/test-user.ts`; nothing else changes.
- [Admin `createUser` blocked by `enable_signup = false` in the local stack] → The admin API isn't a sign-up, but this isn't documented; the global setup fails loudly if it is, and the fallback is to leave sign-ups on only in the CI `config.toml` and say why in ADR 0019.
- [CI gets slower by about 1–2 minutes] → `supabase start` overlaps the other steps; the PR reports the time.
- [The shared Supabase rate limit (ADR 0016)] → Shows as "Can't log in right now", as the spec says.

## Mapping to the OpenSpec tasks

| Task | Delivered by |
| --- | --- |
| 1.1, 1.2 | Error popup |
| 2.1 | Login page |
| 2.2, 2.3 | `LoginForm` (checks, pending state), Spinner |
| 2.4, 2.5 | `LoginForm`, `logIn`, adapters, messages |
| 3.1, 3.2 | Proxy, `routeFor`, `pickAuthBackend` |
| 4.1, 4.2 | `LogoutButton` in `AppHeader` |
| 4.3 | `POST /logout` route, `signOut` scope, full page load, `no-store`, `BfcacheReload` |
| 5.1 | CI Supabase, global setup, end-to-end specs |
| 5.2 | Layout end-to-end tests, screenshots, the owner's preview review |

## Settled with the owner (2026-11-16)

- **The popup:** Base UI Toast, with `timeout: 0` and `priority: "high"`, instead of Sonner. The issue now says so.
- **Testing Back after logging out:** a real Back test, a simulated restore and a unit test of the listener, plus a manual check on the preview (iPhone Safari and desktop Chrome).
- **The test user:** one module in code, `src/lib/auth/test-user.ts`, instead of `.env.example`. Vercel doesn't read `.env.example`, and this way previews need no extra variables. The issue now says so.
- **The `no-store` fallback:** pre-approved (see "The gate"), with a header check on the preview in "How to test".
- **The OpenSpec design:** corrected so the login screen's wordmark and tagline sit in the card, as on the boards.
- **Design approval (with two additions):** Supabase's validation errors map to `invalid_credentials`, and a unit test checks that the proxy copies the cookies the Supabase client writes onto a redirect response.

## Left to the builder

- Exact Tailwind classes ported from the boards (card width, gaps, popup padding), within the theme's scales.
- File names inside `src/lib/auth/` and where the Server Actions live, following the surrounding code.
- How `supabase start` overlaps the other CI steps, and the new timeout values.
- Splitting commits, one logical change each.
