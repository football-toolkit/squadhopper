# Log in and log out: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Only users the owner added can see the app: a gate in front of every address, a login screen, logging out on this device, and an error popup that stays until closed.

**Architecture:** `src/proxy.ts` checks the session on every request through an `AuthService` port, with a Supabase adapter and a mock adapter picked by `APP_ENV`. Logging in and out are Server Actions, followed by a full page load. The popup is shadcn's Base UI Toast, wrapped in our `ErrorToaster`. CI runs the end-to-end tests against a temporary Supabase started with the Supabase CLI.

**Tech Stack:** Next.js 16.4.3 (`cacheComponents`), React 19.3, TypeScript 5.9, `@supabase/ssr` 0.12.7, `@supabase/supabase-js` 2.119.0, `@base-ui/react` 1.9.0 through shadcn (base-nova), lucide-react, Vitest 5 + Testing Library (jsdom), Playwright 1.65 (Chromium, WebKit), GitHub Actions, Supabase CLI 3.1.0.

**Spec:** [design.md](design.md) (approved 2026-11-16) and the OpenSpec change in [`openspec/changes/65-login-logout/`](../../openspec/changes/65-login-logout/). Branch: `65-login-logout`. Draft PR: #66.

## Global Constraints

- **Versions:** `@supabase/ssr` exactly `0.12.7`, `@supabase/supabase-js` exactly `2.119.0` (`.npmrc` has `save-exact=true`); Supabase CLI `3.1.0` through `supabase/setup-cli` v3.2.0, pinned to its commit.
- **No `NEXT_PUBLIC_` variables.** Supabase only from the server: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`. The app never reads `SUPABASE_SECRET_KEY`; only the Playwright global setup does.
- **`APP_ENV` decides the backend**, read at request time only: `local` and `preview` → mock; `test`, `production`, missing or unknown → Supabase. Never `NODE_ENV` or `VERCEL_ENV` for this. The mock throws if `APP_ENV` is `production`, and also if `VERCEL_ENV` is `production`: a safety stop only, `APP_ENV` still decides the backend (owner's decision, 2026-11-16).
- **Texts** live only in `src/lib/messages/auth.ts`; screens and tests import them. The server returns only the codes `invalid_credentials` and `unavailable`, never Supabase's text.
- **The test user** lives only in `src/lib/auth/test-user.ts`: invented, public, its password 12+ characters. No real credentials anywhere.
- **Session cookies:** `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, `secure` only when the request came over HTTPS.
- **Sign-out** uses `scope: "local"`.
- **Gated responses** carry `Cache-Control: private, no-store`. Pre-approved fallback if Next.js overrides it: render the gated pages per request (`await connection()` inside `<Suspense>`) and say so in the PR.
- **Styling:** theme tokens and Tailwind's scales only, no bracket values in code we write (the files `npx shadcn add` generates are exempt). `destructive` only for errors. Volt (`primary`) only for the Log in main button.
- **Tests:** find elements by role and name; test ids only for decorative parts without a role. Unit tests in `__tests__/` next to the file, named after it. No retries.
- **The project's name** appears only in `README.md` and `src/lib/app-name.ts`. Not in `supabase/config.toml` (`project_id = "app"`).
- **This machine:** install no browsers or system packages, and never run `npm run test:e2e` or `npx playwright test` here, except `npx playwright test --list`, which starts nothing. CI runs the end-to-end tests. `npx shadcn add` and `npm install` of the listed packages are allowed.
- **Before every commit:** `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build`. All pass.
- **Commits:** Conventional Commits, first line ≤ 72 characters, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage by explicit path only (`git add -A`, `.` and `-a` are blocked). After each commit, show the owner only `git show --stat`.
- **GitHub:** no push and no `gh` command that changes GitHub without the owner's OK. Task 8, Step 8 asks for the first push; Task 10, Step 3 asks once for the rest. Show exact before/after lines before any `gh issue edit` or `gh pr edit`.

## Review Focus

Inputs and conditions the spec implies but no scenario names, most likely to bite first. Each one is pinned by a test in the task named.

1. **The gate redirects the page's own CSS, fonts and icons:** the login screen would render unstyled. The matcher must skip `/_next/static/…`, `/_next/image…`, `/favicon.ico`, `/icon.svg` and `/apple-icon.png`, and match everything else (Task 4, `matcher` test).
2. **An email typed with capital letters** (`Player@Example.com`): a user expects it to work. The mock compares emails case-insensitively; Supabase already does (Task 2, mock test).
3. **A password with spaces at either end:** only the email is trimmed; the password goes through exactly as typed (Task 1, validation test; Task 6, form test).
4. **An email of only spaces:** shows "Enter your email", not "Enter a valid email address" (Task 1, validation test).
5. **Pressing Enter in the Password field** logs in like clicking the button (Task 6, form test; Task 8, end-to-end test).

---

### Task 0: Commit the plan

- [ ] **Step 1:** After the owner approves this plan: `git add superpowers/65-login-logout/plan.md`, then commit `docs: add plan for logging in and out`.

---

### Task 1: Login texts and field checks

Delivers OpenSpec 2.2 (messages), and the shared validation for 2.5.

**Files:**
- Create: `src/lib/messages/auth.ts`, `src/lib/auth/validate-login.ts`
- Test: `src/lib/messages/__tests__/auth.test.ts`, `src/lib/auth/__tests__/validate-login.test.ts`

**Interfaces:**
- Produces:
  - `authMessages`, a `const` object with exactly these keys and values: `emailLabel: "Email"`, `passwordLabel: "Password"`, `emailPlaceholder: "you@example.com"`, `passwordPlaceholder: "••••••••"`, `tagline: "All your matches in one place."`, `signUpsClosed: "Sign-ups are closed."`, `logIn: "Log in"`, `loggingIn: "Logging in…"`, `logOut: "Log out"`, `loggingOut: "Logging out…"`, `close: "Close"`, `emailMissing: "Enter your email"`, `emailInvalid: "Enter a valid email address"`, `passwordMissing: "Enter your password"`, `errors: { invalid_credentials: "Wrong email or password.", unavailable: "Can't log in right now. Try again in a few minutes." }`.
  - `type AuthErrorCode = keyof typeof authMessages.errors`.
  - `type LoginFieldErrors = { email?: "emailMissing" | "emailInvalid"; password?: "passwordMissing" }`.
  - `validateLogin(input: { email: string; password: string }): { ok: true; email: string; password: string } | { ok: false; errors: LoginFieldErrors }`.
  - The email check is `^[^\s@]+@[^\s@]+\.[^\s@]+$` on the trimmed email.

- [ ] **Step 1: Write the failing tests.**
  - `auth.test.ts`: `authMessages.errors` equals `{ invalid_credentials: "Wrong email or password.", unavailable: "Can't log in right now. Try again in a few minutes." }`, and the three field messages equal the strings above.
  - `validate-login.test.ts`, one test each:
    - `("", "")` → `{ ok: false, errors: { email: "emailMissing", password: "passwordMissing" } }`
    - `("   ", "x")` → `errors.email === "emailMissing"` (Review Focus 4)
    - `("ana.example", "x")` → `errors.email === "emailInvalid"`, no password error
    - `("player@example.com", "")` → only `errors.password`
    - `("  player@example.com ", "  pass word  ")` → `{ ok: true, email: "player@example.com", password: "  pass word  " }` (Review Focus 3)
- [ ] **Step 2:** `npx vitest run src/lib/messages src/lib/auth/__tests__/validate-login.test.ts`. Expected: FAIL, modules not found.
- [ ] **Step 3:** Implement both files to the interfaces above.
- [ ] **Step 4:** Same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add the login texts and field checks`.
  `git add src/lib/messages/auth.ts src/lib/messages/__tests__/auth.test.ts src/lib/auth/validate-login.ts src/lib/auth/__tests__/validate-login.test.ts`

---

### Task 2: The auth port, the backend choice and the mock

Delivers OpenSpec 3.1 and 3.2 (the backend choice), and the mock's part of 2.4, 2.5 and 4.3.

**Files:**
- Create: `src/lib/auth/types.ts`, `src/lib/auth/backend.ts`, `src/lib/auth/test-user.ts`, `src/lib/auth/cookie-options.ts`, `src/lib/auth/mock.ts`
- Test: `src/lib/auth/__tests__/backend.test.ts`, `src/lib/auth/__tests__/mock.test.ts`, plus a test-only in-memory jar in `src/lib/auth/__tests__/memory-jar.ts`

**Interfaces:**
- Consumes: `AuthErrorCode` (Task 1).
- Produces:
  - In `types.ts`:
    ```ts
    type CookieOptions = { httpOnly?: boolean; secure?: boolean; sameSite?: "lax" | "strict" | "none"; path?: string; maxAge?: number; expires?: Date; domain?: string };
    type CookieToSet = { name: string; value: string; options: CookieOptions };
    interface CookieJar { getAll(): { name: string; value: string }[]; setAll(cookies: CookieToSet[], headers?: Record<string, string>): void }
    type SignInResult = { ok: true } | { ok: false; code: AuthErrorCode };
    interface AuthService { hasSession(): Promise<boolean>; signIn(email: string, password: string): Promise<SignInResult>; signOut(): Promise<void> }
    ```
  - `pickAuthBackend(appEnv: string | undefined): "mock" | "supabase"`.
  - `TEST_USER = { email: "player@example.com", password: "kickoff-at-eight" } as const`.
  - `UNAVAILABLE_EMAIL = "unavailable@example.com"`.
  - `sessionCookieOptions(secure: boolean): CookieOptions`, which returns `{ httpOnly: true, sameSite: "lax", path: "/", secure }`.
  - `MOCK_SESSION_COOKIE = "mock-session"`.
  - `createMockAuthService(jar: CookieJar, opts: { appEnv: string | undefined; secure: boolean }): AuthService`.

- [ ] **Step 1: Write the failing tests.**
  - `backend.test.ts`: a table test, `local` → mock, `preview` → mock, `test` → supabase, `production` → supabase, `undefined` → supabase, `""` → supabase, `"staging"` → supabase, `"LOCAL"` → supabase (exact match only).
  - `mock.test.ts`, with the memory jar:
    - `TEST_USER` signs in → `{ ok: true }`, and the jar holds `mock-session` with `sessionCookieOptions(false)`; `hasSession()` is then `true`.
    - `"PLAYER@Example.com"` with the right password → `{ ok: true }` (Review Focus 2).
    - Wrong password → `{ ok: false, code: "invalid_credentials" }`.
    - An unknown email → `invalid_credentials`.
    - `UNAVAILABLE_EMAIL` with any password → `unavailable`.
    - `signOut()` writes `mock-session` with `maxAge: 0`; `hasSession()` is then `false`.
    - `createMockAuthService(jar, { appEnv: "production", secure: true })` throws.
    - `TEST_USER.password.length >= 12`.
- [ ] **Step 2:** `npx vitest run src/lib/auth`. Expected: FAIL, modules not found.
- [ ] **Step 3:** Implement the files. The memory jar's `setAll` stores cookies and drops those with `maxAge: 0`.
- [ ] **Step 4:** Same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add the auth port, the backend choice and the mock`.
  `git add src/lib/auth/types.ts src/lib/auth/backend.ts src/lib/auth/test-user.ts src/lib/auth/cookie-options.ts src/lib/auth/mock.ts src/lib/auth/__tests__/backend.test.ts src/lib/auth/__tests__/mock.test.ts src/lib/auth/__tests__/memory-jar.ts`

---

### Task 3: The Supabase adapter and the service factory

Delivers the Supabase part of OpenSpec 2.4, 2.5 and 4.3.

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `src/lib/auth/supabase.ts`, `src/lib/auth/index.ts`
- Test: `src/lib/auth/__tests__/supabase.test.ts`, `src/lib/auth/__tests__/index.test.ts`

**Interfaces:**
- Consumes: Task 2's types, `sessionCookieOptions`, `createMockAuthService`, `pickAuthBackend`.
- Produces:
  - `mapSignInError(error: { code?: string; name?: string }): AuthErrorCode`.
  - `createSupabaseAuthService(jar: CookieJar, opts: { url: string | undefined; publishableKey: string | undefined; secure: boolean; createClient?: typeof createServerClient }): AuthService`. `createClient` defaults to `@supabase/ssr`'s `createServerClient` and is injected only by tests.
  - `createAuthService(jar: CookieJar, opts: { secure: boolean }, env: Record<string, string | undefined> = process.env): AuthService`.

- [ ] **Step 1:** `npm install @supabase/ssr@0.12.7 @supabase/supabase-js@2.119.0`. Check that `package.json` shows both exact, with no `^`.
- [ ] **Step 2: Write the failing tests** with a fake `createClient` that records its arguments and returns a fake `auth` object.
  - `mapSignInError`:
    - `{ code: "invalid_credentials" }`, `{ code: "validation_failed" }` and `{ code: "email_address_invalid" }` → `invalid_credentials`.
    - `{ code: "over_request_rate_limit" }`, `{ name: "AuthRetryableFetchError" }`, `{ code: "bad_json" }`, `{ code: "user_banned" }`, `{ code: "email_not_confirmed" }` and `{}` → `unavailable`.
  - `signIn`: success → `{ ok: true }`; an error from `signInWithPassword` → `{ ok: false, code: mapSignInError(error) }`. The result never contains the error's message (assert `JSON.stringify(result)` has no `message`).
  - `createClient` was called with the url, the key, and `cookieOptions` equal to `sessionCookieOptions(secure)`. Its `setAll(cookies, headers)` reaches `jar.setAll(cookies, headers)`.
  - `signOut()` calls `auth.signOut({ scope: "local" })` and resolves even when that returns `{ error }`.
  - `hasSession()`: `getClaims` returns `{ data: { claims: {…} }, error: null }` → `true`; returns an error or `data: null` → `false`; throws → `false`.
  - With `url` or `publishableKey` missing: `hasSession()` → `false`, `signIn()` → `{ ok: false, code: "unavailable" }`, `createClient` is never called, and `console.error` is called once with a message naming the missing variable (spy on it).
  - `index.test.ts`: `createAuthService(jar, { secure: false }, { APP_ENV: "local" })` signs in `TEST_USER`, which proves the mock. `{ APP_ENV: "production" }` and `{}` don't, which proves Supabase: with no URL, the result is `unavailable`.
- [ ] **Step 3:** `npx vitest run src/lib/auth`. Expected: the new tests FAIL.
- [ ] **Step 4:** Implement `supabase.ts` and `index.ts`. Create one client per service, so one per request.
- [ ] **Step 5:** Same command. Expected: PASS.
- [ ] **Step 6: Commit** `feat: add the Supabase auth adapter`.
  `git add package.json package-lock.json src/lib/auth/supabase.ts src/lib/auth/index.ts src/lib/auth/__tests__/supabase.test.ts src/lib/auth/__tests__/index.test.ts`

---

### Task 4: The gate

Delivers OpenSpec 3.1 and 3.2, and the `no-store` part of 4.3.

**Files:**
- Create: `src/proxy.ts`, `.env.example`
- Modify: `README.md` (setup: copy `.env.example` to `.env.local`; what `APP_ENV` does)
- Test: `src/__tests__/proxy.test.ts`

**Interfaces:**
- Consumes: `createAuthService` (Task 3).
- Produces:
  - `routeFor(input: { pathname: string; signedIn: boolean }): "/login" | "/" | null`. `null` means let the request through.
  - `proxy(request: NextRequest): Promise<NextResponse>`.
  - `config = { matcher: [...] }`.
  - The jar reads `request.cookies.getAll()`. Its `setAll` writes onto the request (so later code sees fresh values), onto the pass-through response, and onto any redirect response, together with the headers it receives.
  - `secure` is `request.nextUrl.protocol === "https:"`.
  - Every response gets `Cache-Control: private, no-store`.

- [ ] **Step 1: Write the failing tests.**
  - `routeFor`: `("/", false)` → `"/login"`; `("/does-not-exist", false)` → `"/login"`; `("/login", false)` → `null`; `("/login", true)` → `"/"`; `("/", true)` → `null`; `("/does-not-exist", true)` → `null`.
  - The `matcher` (Review Focus 1): build a `RegExp` from it the way Next.js's docs show, or use `unstable_doesProxyMatch` from `next/experimental/testing/server` if 16.4 exports it (check `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`, "Unit testing").
    - Matches: `/`, `/login`, `/does-not-exist`, `/a/b/c`.
    - Doesn't match: `/_next/static/chunks/app.js`, `/_next/static/media/inter.woff2`, `/_next/image?url=x`, `/favicon.ico`, `/icon.svg`, `/apple-icon.png`.
  - `proxy()`, with `vi.mock("@/lib/auth")` returning a fake service:
    - Signed out on `/` → a 307 to `/login`, with `cache-control: private, no-store`.
    - Signed in on `/login` → a 307 to `/`.
    - Signed in on `/` → passes through (`x-middleware-next` header), with `cache-control: private, no-store`.
    - **Refreshed cookies (owner's addition):** the fake `hasSession()` calls `jar.setAll([{ name: "sb-test-auth-token", value: "fresh", options: sessionCookieOptions(false) }], { "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0" })`. On a redirect response (signed out on `/`, and signed in on `/login`) and on a pass-through response, `response.cookies.get("sb-test-auth-token")?.value === "fresh"`, with `httpOnly` true.
    - An `https://` request asks the factory for `{ secure: true }`; an `http://` request asks for `{ secure: false }`.
- [ ] **Step 2:** `npx vitest run src/__tests__/proxy.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `src/proxy.ts`. The `Cache-Control` set last wins over the one from `setAll`, so it stays `private, no-store`.
- [ ] **Step 4:** Same command. Expected: PASS.
- [ ] **Step 5:** Write `.env.example`: `APP_ENV=local`; a comment that the mock's login details are in `src/lib/auth/test-user.ts`, and that `unavailable@example.com` shows the "Can't log in right now" popup; commented-out `SUPABASE_URL=` and `SUPABASE_PUBLISHABLE_KEY=`. Then update `README.md`'s setup.
- [ ] **Step 6:** Run `npm run build`. Expected: it passes, and the output lists "Proxy". Then `npm run start` with `APP_ENV=local`, and `curl -sI http://localhost:3000/`. Expected: `307` to `/login`. Note the `Cache-Control` value on `curl -sI http://localhost:3000/login` in the task report. If it isn't `private, no-store`, flag it, because Task 8's end-to-end test decides on the fallback.
- [ ] **Step 7: Commit** `feat: send visitors who aren't logged in to the login screen`.
  `git add src/proxy.ts src/__tests__/proxy.test.ts .env.example README.md`

---

### Task 5: The error popup and the spinner

Delivers OpenSpec 1.1 and 1.2, and the spinner for 2.3 and 4.2.

**Files:**
- Create, via `npx shadcn add input label toast spinner` then `npm run format`: `src/components/ui/{input,label,toast,spinner}.tsx`. `button.tsx` must stay unchanged (`git diff src/components/ui/button.tsx` is empty; don't pass `--overwrite`).
- Create: `src/components/error-toaster.tsx`
- Modify: `src/app/layout.tsx` (render `<ErrorToaster />` inside `<body>`)
- Test: `src/components/__tests__/error-toaster.test.tsx`, and update `src/app/__tests__/layout.test.tsx` if it asserts the body's children

**Interfaces:**
- Consumes: `authMessages.close` (Task 1); `toast`, `ToastProvider`, `ToastPortal`, `ToastViewport`, `Toast`, `ToastContent`, `ToastDescription` and `ToastClose` from `@/components/ui/toast`; `useToastManager`.
- Produces:
  - `ErrorToaster(): JSX.Element`, a Client Component.
  - `showError(message: string): string`, which calls `toast.add({ description: message, type: "error", timeout: 0, priority: "high" })` and returns the id.
  - `closeError(id: string): void`, which calls `toast.close(id)`.

- [ ] **Step 1: Write the failing tests** (render `<ErrorToaster />`, then call `showError` inside `act`):
  - The message shows, inside an element with `role="alert"`.
  - There's a button named `"Close"` (`authMessages.close`).
  - With `vi.useFakeTimers()`, advancing 60 000 ms leaves the message on screen.
  - Clicking Close removes it. Focusing Close and pressing Enter (`fireEvent.keyDown` plus `click`, or `user.keyboard` if installed) removes it.
  - `closeError(id)` removes it.
  - The popup's root carries `border-destructive`, and the `CircleAlert` icon carries `text-destructive` (find it with `data-testid="error-toast-icon"`, which is decorative).
- [ ] **Step 2:** `npx vitest run src/components/__tests__/error-toaster.test.tsx`. Expected: FAIL. If Base UI needs browser APIs that jsdom lacks (for example `ResizeObserver` or `matchMedia`), add a minimal stub to `vitest.setup.ts` and note it in the report.
- [ ] **Step 3: Implement `ErrorToaster`** from the generated parts, keeping the generated file unchanged:
  - **The viewport:** top right from `md:` up (`top-4 right-4 left-auto w-full max-w-sm` or similar), and across the top with 16 px margins on phones (`inset-x-4 top-4`). Override the bottom placement.
  - **Each toast:** `bg-card border-destructive text-foreground`; `CircleAlert` in `text-destructive` with `aria-hidden`; `ToastDescription` in `text-foreground`; `ToastClose` with `aria-label={authMessages.close}` and the `X` icon. The enter and exit transitions slide from the top, with `motion-reduce:transition-none`.
  - Theme classes only.
- [ ] **Step 4:** Same command. Expected: PASS.
- [ ] **Step 5:** Add `<ErrorToaster />` to `src/app/layout.tsx`. Run `npx vitest run src/app`. Expected: PASS, updating the layout test if it counts children.
- [ ] **Step 6: Commit** `feat: add the error popup`.
  `git add components.json package.json package-lock.json src/components/ui/input.tsx src/components/ui/label.tsx src/components/ui/toast.tsx src/components/ui/spinner.tsx src/components/error-toaster.tsx src/components/__tests__/error-toaster.test.tsx src/app/layout.tsx`, plus `src/app/__tests__/layout.test.tsx` and `vitest.setup.ts` if changed. Check `git status` for anything else `shadcn add` touched, and stage it by path only if it belongs.

---

### Task 6: The login screen

Delivers OpenSpec 2.1–2.5.

**Files:**
- Create: `src/lib/navigation.ts`, `src/app/login/page.tsx`, `src/app/login/login-form.tsx`, `src/app/login/actions.ts`, `src/lib/auth/next-cookie-jar.ts`
- Test: `src/app/login/__tests__/page.test.tsx`, `src/app/login/__tests__/login-form.test.tsx`, `src/app/login/__tests__/actions.test.ts`, `src/lib/__tests__/navigation.test.ts`

**Interfaces:**
- Consumes: `authMessages`, `validateLogin` (Task 1); `SignInResult` (Task 2); `createAuthService` (Task 3); `showError`, `closeError` (Task 5); `Input`, `Label`, `Spinner`, `Button`; `PitchLayout`, `Wordmark`.
- Produces:
  - `goTo(url: string, options?: { replace?: boolean }): void` calls `window.location.replace(url)` or `window.location.assign(url)`. `reloadPage(): void` calls `window.location.reload()`. Components use these, so tests can mock them.
  - `authServiceForRequest(): Promise<AuthService>` (in `next-cookie-jar.ts`) builds the jar from `await cookies()`, with `secure` from `(await headers()).get("x-forwarded-proto") === "https"`.
  - `logIn(input: { email: string; password: string }): Promise<SignInResult>`, a Server Action.
  - `LoginForm(): JSX.Element`.
  - `metadata.title === \`Log in · ${APP_NAME}\``.

- [ ] **Step 1: Write the failing tests.**
  - `actions.test.ts`, with `vi.mock("@/lib/auth/next-cookie-jar")` returning a fake service:
    - Valid input calls `signIn` with the trimmed email and the untrimmed password, and returns its result.
    - Invalid input (`{ email: "", password: "" }`) returns `{ ok: false, code: "invalid_credentials" }` without calling `signIn`.
  - `page.test.tsx`, with `LoginForm` mocked or rendered with its action mocked:
    - The wordmark (`APP_NAME`), `authMessages.tagline`, `authMessages.signUpsClosed`, the Email and Password fields and the Log in button show.
    - No `banner` (no header), and no link whose name matches `/sign up|forgot|reset/i`.
    - `metadata.title`.
  - `login-form.test.tsx`, with `vi.mock("../actions")`, `vi.mock("@/components/error-toaster")` and `vi.mock("@/lib/navigation")`:
    - The form has `noValidate`. The Email input has `type="email"` and `autoComplete="email"`; the Password input has `type="password"` and `autoComplete="current-password"`. The button has the `LogIn` icon (`data-testid="log-in-icon"`) and the text `authMessages.logIn`.
    - **Both empty:** submitting shows `emailMissing` and `passwordMissing`. Both inputs have `aria-invalid="true"` and `aria-describedby` pointing to their message. `logIn` isn't called. Focus is on Email.
    - **`ana.example`:** shows `emailInvalid` only.
    - **Typing fixes one field:** after both messages show, typing in Email removes its message and `aria-invalid`, and Password's message stays.
    - **Pending:** `logIn` returns a promise that hasn't resolved. Both inputs are disabled; the button is disabled, contains `authMessages.loggingIn` and an element with `role="status"` (the Spinner), and the Spinner's class contains `motion-reduce:animate-none`. A second click doesn't call `logIn` again.
    - **`ok`:** `goTo` is called with `("/", { replace: true })`.
    - **`invalid_credentials`:** `showError` is called with `authMessages.errors.invalid_credentials`. Email keeps its value; Password is `""`. The controls are enabled again.
    - **`unavailable`:** `showError` is called with `authMessages.errors.unavailable`, and both values stay.
    - **A thrown action:** treated as `unavailable`.
    - **Every click closes the last popup:** after `invalid_credentials` (`showError` returned `"t1"`), clicking Log in with the now-empty password calls `closeError("t1")`, even though the field check stops the attempt.
    - **Enter in Password:** `fireEvent.submit` on the form (and `keyDown` Enter on the password input, if the submit path differs) calls `logIn` once (Review Focus 5).
    - **Spaces in the password:** `"  pass word  "` reaches `logIn` unchanged (Review Focus 3).
  - `navigation.test.ts`: `goTo` and `reloadPage` call the matching `window.location` methods. Stub `window.location` with `vi.stubGlobal` or `Object.defineProperty`.
- [ ] **Step 2:** `npx vitest run src/app/login src/lib/__tests__/navigation.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **`page.tsx`:** synchronous, `PitchLayout` with no `header`. The card has the `Wordmark`, the tagline (`text-sm text-muted-foreground`), and `<LoginForm />`. "Sign-ups are closed." goes under the card in the small-print style (`text-xs text-muted-foreground`). The card width follows the boards on the theme's scale (narrower than the home card's `md:max-w-160`).
  - **`login-form.tsx`:** follows the design's "On submit" steps 1–4. Field messages are `text-sm text-destructive`. The Log in button is the main button (`h-12 w-full … font-heading … uppercase`, from the design guide) with `LogIn`. Its pending state swaps the icon for `<Spinner className="motion-reduce:animate-none" />` and the label for `loggingIn`.
  - **`actions.ts`:** starts with `"use server"`.
- [ ] **Step 4:** Same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add the login screen`.
  `git add src/lib/navigation.ts src/lib/__tests__/navigation.test.ts src/lib/auth/next-cookie-jar.ts src/app/login/page.tsx src/app/login/login-form.tsx src/app/login/actions.ts src/app/login/__tests__/page.test.tsx src/app/login/__tests__/login-form.test.tsx src/app/login/__tests__/actions.test.ts`

---

### Task 7: Logging out, and the guard for Back

Delivers OpenSpec 4.1–4.3.

**Files:**
- Create: `src/app/actions/log-out.ts`, `src/components/logout-button.tsx`, `src/components/bfcache-reload.tsx`
- Modify: `src/app/page.tsx`, `src/app/not-found.tsx` (pass `<LogoutButton />` to `AppHeader`), `src/app/layout.tsx` (render `<BfcacheReload />`)
- Test: `src/app/actions/__tests__/log-out.test.ts`, `src/components/__tests__/logout-button.test.tsx`, `src/components/__tests__/bfcache-reload.test.tsx`; update `src/app/__tests__/page.test.tsx` and `src/app/__tests__/not-found.test.tsx`

**Interfaces:**
- Consumes: `authServiceForRequest` (Task 6), `goTo` and `reloadPage` (Task 6), `authMessages`, `Spinner`, `Button`.
- Produces: `logOut(): Promise<void>` (Server Action); `LogoutButton(): JSX.Element`; `BfcacheReload(): null`.

- [ ] **Step 1: Write the failing tests.**
  - `log-out.test.ts`: calls the fake service's `signOut` once, and resolves.
  - `logout-button.test.tsx`, with `vi.mock("@/app/actions/log-out")` and `vi.mock("@/lib/navigation")`:
    - It's a button named `authMessages.logOut`, with the `LogOut` icon (`data-testid="log-out-icon"`) and `outline` styling (class contains `border-border`).
    - **Pending:** it's disabled and shows `loggingOut` and `role="status"`, with `motion-reduce:animate-none`. A second click doesn't call `logOut` again.
    - **After `logOut` resolves:** `goTo("/login")`, with no `replace`.
    - **After `logOut` rejects:** also `goTo("/login")`.
  - `bfcache-reload.test.tsx`: after render, `window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }))` calls `reloadPage` once; with `persisted: false` it doesn't. If jsdom lacks `PageTransitionEvent`, build an `Event("pageshow")` with a `persisted` property. Unmounting removes the listener.
  - **`page.test.tsx` and `not-found.test.tsx`:**
    - Mock the action module.
    - The banner shows the app name and a button named "Log out". Change `toBe(APP_NAME)` to `toContain`, plus the button check.
    - The home page still has exactly one link, the wordmark.
    - In `not-found.test.tsx`, replace `queryAllByRole("button")` length 0 with exactly one button, named "Log out".
- [ ] **Step 2:** `npx vitest run src/app src/components`. Expected: the new and updated tests FAIL.
- [ ] **Step 3: Implement.**
  - **`LogoutButton`:** `<Button variant="outline" size="sm">`, with `useTransition` and `try { await logOut() } finally { goTo("/login") }`.
  - **`BfcacheReload`:** a `useEffect` that adds and removes the `pageshow` listener.
  - **`not-found.tsx`:** stays synchronous.
- [ ] **Step 4:** Same command, then `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add the Log out button`.
  `git add src/app/actions/log-out.ts src/app/actions/__tests__/log-out.test.ts src/components/logout-button.tsx src/components/__tests__/logout-button.test.tsx src/components/bfcache-reload.tsx src/components/__tests__/bfcache-reload.test.tsx src/app/page.tsx src/app/not-found.tsx src/app/layout.tsx src/app/__tests__/page.test.tsx src/app/__tests__/not-found.test.tsx`

---

### Task 8: End-to-end tests and Supabase in CI

Delivers OpenSpec 5.1, and the end-to-end proof of 2.2, 2.4, 2.5, 3.1, 3.2 and 4.1–4.3.

**Files:**
- Create: `supabase/config.toml`, `supabase/.gitignore`, `e2e/global-setup.ts`, `e2e/auth.setup.ts`, `e2e/helpers/log-in.ts`, `e2e/login.spec.ts`, `e2e/logout.spec.ts`
- Modify: `playwright.config.ts`, `e2e/layout.spec.ts` (add the login screen), `.github/workflows/ci.yml`, `.gitignore` (`/playwright/.auth/`)

**Interfaces:**
- Consumes: `TEST_USER` (Task 2), `authMessages` (Task 1), `APP_NAME`.
- Produces: `logIn(page: Page): Promise<void>` fills `TEST_USER`, clicks Log in, and waits for `/`.

- [ ] **Step 1: `supabase/config.toml`.**
  - Start from the CLI 3.1.0 template: it's in the scratchpad as `dl/tpl.toml`, or get it with `npm pack supabase@3.1.0` in the scratchpad and find the file that contains `{{ .ProjectId }}`.
  - Set `project_id = "app"`, `[auth] enable_signup = false`, `minimum_password_length = 12` and `[auth.rate_limit] sign_in_sign_ups = 150`. Change nothing else.
  - `supabase/.gitignore` holds `.branches`, `.temp` and `.env`.
- [ ] **Step 2: `playwright.config.ts`.**
  - If `.env.local` exists, `process.loadEnvFile(".env.local")`.
  - `globalSetup: "./e2e/global-setup.ts"`.
  - A `setup` project (`testMatch: /auth\.setup\.ts/`). The `chromium` and `webkit` projects `dependencies: ["setup"]` and `use.storageState: "playwright/.auth/user.json"`.
  - Raise `globalTimeout` with the job timeout (Step 6).
- [ ] **Step 3: `e2e/global-setup.ts`.** When `APP_ENV === "test"`, create `TEST_USER` with `createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } }).auth.admin.createUser({ email, password, email_confirm: true })`. Treat a "user already exists" error as success, and throw on anything else with a message that names the step. Otherwise do nothing.
- [ ] **Step 4: Write the specs.** `login.spec.ts` and `logout.spec.ts` set `test.use({ storageState: { cookies: [], origins: [] } })`.
  - `auth.setup.ts`: `logIn(page)`, then `page.context().storageState({ path: "playwright/.auth/user.json" })`.
  - `login.spec.ts`:
    - `/` and `/does-not-exist` each show the Log in button and URL `/login`.
    - The response for `/login` has a `cache-control` containing `no-store`.
    - Submitting empty fields shows both field messages.
    - A wrong password:
      - Call `await page.clock.install()` before `page.goto`, so the page's timers run on Playwright's clock.
      - The popup with `authMessages.errors.invalid_credentials` (`getByRole("alert")`) shows. After `await page.clock.fastForward(60_000)` it's still visible (Base UI's default would close it after 5 s). Don't use `waitForTimeout`.
      - Email keeps `TEST_USER.email`; Password is empty.
      - Clicking "Close" hides the popup.
    - Correct details: URL `/` and the home heading.
    - Enter in Password logs in (Review Focus 5).
    - After logging in, `page.goto("/login")` ends on `/`.
  - `logout.spec.ts`, each test calling `logIn` first:
    - `/` has `cache-control` containing `no-store`.
    - Log out → URL `/login`.
    - Log out, then `page.goBack()` → the login screen (URL `/login`, Log in button visible).
    - **Simulated restore:** two pages in one context on `/`; page B logs out; on page A, `page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })))`; A reaches `/login`.
    - **Two devices:** two `browser.newContext()`s, each logged in; the first logs out; the second `reload()`s and still shows the home heading.
    - The 404 page shows "Log out".
  - `layout.spec.ts`: add `{ name: "login screen", path: "/login" }` with an empty storage state. Skip the header-based checks on that page only (it has no header), and keep the band, pitch, card and no-horizontal-scroll checks.
- [ ] **Step 5:** `npx playwright test --list`. Expected: the setup tests plus every new and old test, listed for both `chromium` and `webkit`, with no errors. Record the count in the report. Then `npm test`, to check that Vitest doesn't pick up `e2e/`.
- [ ] **Step 6: `ci.yml`, in the `checks` job** (keep the job's name):
  1. **Pin the setup action:** `supabase/setup-cli` v3.2.0, pinned to its commit. Look up the SHA with `gh api repos/supabase/setup-cli/git/ref/tags/v3.2.0`; this is read-only, so allowed. Use `with: version: 3.1.0`.
  2. **Start Supabase early,** so it overlaps `npm ci` and the build: `supabase start -x realtime,storage-api,imgproxy,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor`. Whether it runs in the background or as an earlier step is the builder's call, but a step must wait for it before the end-to-end tests.
  3. **Export the env** before the end-to-end step: `eval "$(supabase status -o env)"`, then write `SUPABASE_URL=$API_URL`, `SUPABASE_PUBLISHABLE_KEY=$PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY=$SECRET_KEY` and `APP_ENV=test` to `$GITHUB_ENV`. These are the local stack's fixed development keys, not secrets.
  4. **Raise the timeouts:** `timeout-minutes` to 16 for now, with `globalTimeout` 12 minutes. Task 10 sets them from measured runs.
- [ ] **Step 7: Commit** `test: test logging in and out end to end against Supabase`.
  `git add supabase/config.toml supabase/.gitignore playwright.config.ts .gitignore .github/workflows/ci.yml e2e/global-setup.ts e2e/auth.setup.ts e2e/helpers/log-in.ts e2e/login.spec.ts e2e/logout.spec.ts e2e/layout.spec.ts`
- [ ] **Step 8: Ask the owner to push** (owner's decision: push after Task 8, so CI runs the temporary Supabase and the end-to-end tests early).
  1. Run the five checks, and confirm `git status` is clean.
  2. Ask the owner for an OK to push the branch, and to push fixes for any CI failure this run finds. Wait for the OK.
  3. `git push origin 65-login-logout`, then `gh run watch`. Tasks 9 and 10 continue while CI runs.
  4. On a failure, read the annotations and the Playwright report, and fix the cause in its own commit. Never re-run to get green.
  5. If the `no-store` test fails, apply the pre-approved fallback (render the gated pages per request) and note it for the PR.
  6. Report the run's result and the `checks` job time.

---

### Task 9: Docs and ADRs

Delivers the docs the design lists; no OpenSpec task on its own.

**Files:**
- Create: `docs/explanation/decisions/0018-pick-the-auth-service-with-app-env.md`, `0019-test-login-against-a-temporary-supabase-in-ci.md`, `0020-show-popups-with-base-ui-toast.md` (from `templates/adr.md`, `status: accepted`, `date: 2026-11-16`; the owner accepted all three with the plan)
- Modify: `docs/explanation/decisions/README.md` (index), `docs/reference/design-guide.md`, `docs/how-to/development-workflow.md`, `docs/how-to/set-up-vercel.md`, `docs/how-to/set-up-supabase.md`, `AGENTS.md`

- [ ] **Step 1: The ADRs.** Each has its considered options, taken from the design's Approaches and "Checked against the docs", with the sources.
  - **0018:** the `APP_ENV` table; the mock refuses production; the test user is in code (and why: Vercel doesn't read `.env.example`); `NODE_ENV` and `VERCEL_ENV` were rejected.
  - **0019:** the CLI in CI with excluded services, `config.toml` mirroring production, the user created by the global setup, and the measured job time (filled in by Task 10).
  - **0020:** Base UI Toast over Sonner, with shadcn's redirect, Sonner's polite-only announcements and the `next-themes` dependency, and the owner's choice on 2026-11-16.
- [ ] **Step 2: The design guide.** Add sections for:
  - the error popup (classes, place, `destructive` only for errors, `showError` and `closeError`)
  - the spinner (with `motion-reduce:animate-none`)
  - the field error (`aria-invalid`, the message classes)
  - the waiting button (disabled, dimmed, spinner and "…ing" label)
  - the header's outline button (`variant="outline" size="sm"`)
  - the login card's width
- [ ] **Step 3: The how-to guides and `AGENTS.md`.**
  - `set-up-vercel.md`: the owner adds `APP_ENV` as a Config variable (`preview` for Preview, `production` for Production), before the preview review.
  - `set-up-supabase.md`: previews and local runs use the mock; CI runs a temporary Supabase from `supabase/config.toml`, which mirrors production's sign-up and password settings.
  - `development-workflow.md`: the end-to-end tests read `.env.local` locally (the mock); CI uses a temporary Supabase.
  - `AGENTS.md`: the `test:e2e` line says it needs `.env.local` locally.
- [ ] **Step 4:** `npm run format:check`, and check every new link resolves (`grep -o "](.*\.md" -r docs | …`, or open each one).
- [ ] **Step 5: Commit** `docs: document login, the auth service choice and the popup`.
  `git add docs/explanation/decisions/0018-pick-the-auth-service-with-app-env.md docs/explanation/decisions/0019-test-login-against-a-temporary-supabase-in-ci.md docs/explanation/decisions/0020-show-popups-with-base-ui-toast.md docs/explanation/decisions/README.md docs/reference/design-guide.md docs/how-to/development-workflow.md docs/how-to/set-up-vercel.md docs/how-to/set-up-supabase.md AGENTS.md`

---

### Task 10: Review, CI, preview, archive and the PR

Delivers OpenSpec 5.2, and the ticks for every task.

- [ ] **Step 1: Code review.** Run superpowers:requesting-code-review on the whole branch against `design.md` and this plan. Fix what it confirms, one commit per logical fix, staged by path.
- [ ] **Step 2: Verify locally.** `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` all pass, `npx playwright test --list` works, and `git status` is clean.
- [ ] **Step 3: Ask the owner once** for the rest of the push sequence: push Tasks 9–10's commits; push fixes for CI failures; the timeout commit; the OpenSpec ticks and the archive commit; edit the PR body and tick the issue's acceptance criteria (showing the lines first); mark the PR ready. Also ask the owner to set `APP_ENV` in Vercel (Preview: `preview`; Production: `production`) before the preview review. Wait for the OK.
- [ ] **Step 4: Push and watch CI** (`gh run watch`). Expected: green. Handle failures as in Task 8, Step 8.
- [ ] **Step 5: Timeout.** From the green runs' `checks` job times (`gh run view <id> --json jobs`), set `timeout-minutes` to about three times the longest run, rounded up, and above `globalTimeout`. Fill the job time before (the last `main` run) and after into ADR 0019. Commit `ci: set the checks job timeout from measured runs` and push.
- [ ] **Step 6: Screenshots.** The owner captures them from the preview (owner's decision); install nothing.
  - At 390 px and 1280 px: login, home and 404, plus the login screen with field errors and with the wrong-password popup.
  - No spinner states; the unit tests prove them.
  - Ask the owner for them once the preview is up and `APP_ENV` is set. Add them to the PR body with `gh pr edit 66 --attach` only after showing the lines.
- [ ] **Step 7: Tick the OpenSpec tasks** whose scenarios pass in CI (1.1–5.1). Tick 5.2 after the owner's preview review. Commit `docs: tick the login tasks`.
- [ ] **Step 8: Archive.** Run `/opsx:archive` as the last commit, then `openspec validate --specs`, and show the owner the `openspec/specs/` diff.
- [ ] **Step 9: Finish the PR.**
  - Show the PR body lines first (what changed, the fallback if used, the job times, the screenshots, how each acceptance criterion was checked). Then `gh pr edit 66`.
  - Tick the met acceptance criteria in issue #65 with `gh issue edit 65 --body-file …`, after showing the lines.
  - Push, and wait for green.
  - `gh pr ready 66`, and tell the owner.
