# Move screen texts into translatable message files: design

Issue: #64 (Task). Branch and change key: `64-i18n-messages`.

Status: waiting for the owner's review.

## Intent

Whether the app needs other languages isn't decided yet. Today its texts sit in two kinds of places: `src/lib/messages/auth.ts` holds the login, logout and popup texts, and the home page, the 404 page, the header's link label and two page titles are written into the components. This change gathers every text the screens show into one translatable file, `messages/en.json`, read through next-intl. A second language then becomes a second file instead of a rewrite. English stays the only language, and the URL has no language in it.

The screens must look and read exactly as before. The owner checks that on the Vercel preview.

## Goals

Issue #64's "Done when" list:

- [ ] next-intl is set up without i18n routing: the plugin in `next.config.ts`, `src/i18n/request.ts` with the locale `en`, and `NextIntlClientProvider` in the root layout. `src/proxy.ts` is unchanged.
- [ ] Every text the screens show, page titles included, is in `messages/en.json`, grouped by feature with ID keys. No screen text is left in `src/` apart from the app name in `src/lib/app-name.ts`.
- [ ] `src/lib/messages/` is gone, and unit and end-to-end tests read texts from `messages/en.json`.
- [ ] `npm run typecheck` fails on an unknown message key, and on an error code with no message.
- [ ] The screens look and read as before: the end-to-end tests pass, `npm run build` still lists `/`, `/login` and `/_not-found` as static, and an unknown URL still answers 404.
- [ ] `AGENTS.md` has the messages rule, and the architecture overview and the design guide are updated.
- [ ] An ADR records the choice and is in the index.

## Non-goals

From the issue:

- A second language, a language switcher, locale routing, or picking the language from the browser.
- A time zone and date formats. Nothing shows dates yet. The first screen with dates sets `timeZone`.
- `useExtracted` (experimental) and `createMessagesDeclaration` (experimental).
- A lint rule that fails on text written into JSX.

Also:

- **`unrs-resolver`'s install script.** #75 decides it. This change only denies the two packages next-intl brings in.
- **The texts that shadcn/ui generates.** `src/components/ui/spinner.tsx` has `aria-label="Loading"` and `src/components/ui/toast.tsx` has `aria-label="Close toast"`. AGENTS.md exempts generated code, and neither text reaches a screen today: every Spinner we render has `aria-hidden="true"`, and `ErrorToaster` passes its own `aria-label` to `ToastClose`. The new AGENTS.md rule says so.
- **History.** Accepted ADRs and earlier `superpowers/` folders (such as `65-login-logout/`, which names `auth.ts`) stay as they are.

## Anti-goals

- **No visible change.** Same words, same line breaks, same highlighted words, same page titles, same accessible names. A diff of what the screens show is empty.
- **No dynamic rendering.** `src/i18n/request.ts` reads no cookie, header or URL. The home, login and 404 pages stay prerendered, and the 404 page stays synchronous.
- **No text from the server.** `logIn` keeps returning only codes, and `/logout` only a status. The browser turns a code into a message.
- **No new install scripts running.** `@swc/core` and `@parcel/watcher` are denied in `allowScripts`.

## Checked against the docs

Checked on 2026-11-26, on Node 26.13.1 and npm 11.20.0 (this branch's `.nvmrc`), with Next.js 16.4.6. The issue's "Sources" list the pages. What this design relies on:

- **next-intl 4.16.2** is the latest 4.x (published 25 November). Its peer dependencies allow Next.js 16, React 19 and `@types/react` 19. The 4.16.0–4.16.2 release notes change `Link`, `useRouter`, `localeCookie` and `pathnames` matching, none of which this setup uses. None of the three mentions Cache Components, the provider, `getRequestConfig` or new dependencies.
- **Setup without i18n routing** (next-intl, "App Router setup without i18n routing"): `createNextIntlPlugin()` in `next.config.ts`, `src/i18n/request.ts` found by default when there is a `src/` folder, and `<NextIntlClientProvider>` in the root layout. No proxy is involved.
- **The provider** (next-intl, "Request configuration" and "Server & Client Components"): rendered from a Server Component, it inherits `locale`, `messages`, `now`, `timeZone` and `formats`, and sends all messages to the browser by default.
- **Server and client** (next-intl, "Server & Client Components"; "Server Actions, Metadata & Route Handlers"): `useTranslations` works in Server Components that aren't async and in Client Components. Async code, including `generateMetadata`, uses `getTranslations` from `next-intl/server`.
- **Metadata on the 404 page** (installed Next.js docs, `01-app/03-api-reference/03-file-conventions/not-found.md`): "Both the root `app/not-found.js` and `app/global-not-found.js` support exporting a `metadata` object or a `generateMetadata` function".
- **Rich text** (next-intl, "Rendering translations"): "a closing tag is required by the ICU parser", so a line break is `<br></br>` with `br: () => <br />`.
- **Types** (next-intl, "TypeScript augmentation"): `AppConfig` with `Locale` and `Messages` makes an unknown key a type error. Argument types need the experimental `createMessagesDeclaration`, which is a non-goal.
- **Testing** (next-intl, "Testing"): wrap components in `NextIntlClientProvider` with `locale` and `messages`. Vitest needs `server.deps.inline` only with `createNavigation`, which we don't use. Outside React Server Components, `next-intl/server`'s functions, `getRequestConfig` and `getTranslations` included, throw "is not supported in Client Components" (the installed `dist/esm/development/server/react-client/index.js` says this entry exists "mostly [for] testing").
- **Install scripts** (npm 11.20.0): `npm install-scripts deny <pkg>` writes a name-only `false` entry into `allowScripts`. A denied package's script is skipped and drops out of the "not yet covered by allowScripts" warning. Without an entry, npm 11.20.0 runs the script and warns.

### The spike on 4.16.2 (2026-11-26)

A throwaway copy of this branch, not committed, with next-intl 4.16.2, both scripts denied, and every screen in this design moved to `messages/en.json`:

- `npm ci` ran no script from `@swc/core` or `@parcel/watcher`, and warned only about `unrs-resolver`.
- `next build` listed `/`, `/_not-found` and `/login` as static (○) and `/logout` as dynamic (ƒ), as on `main`.
- The prerendered HTML had the titles `SquadHopper`, `Page not found · SquadHopper` and `Log in · SquadHopper`, and the texts.
- `next start` with a mock session: an unknown URL answered 404 with `Page not found · SquadHopper`, and the header link was named `SquadHopper home`.
- `messages/en.json` is about 1 KB.

An earlier spike, on 4.15.3 and 4.16.2, showed in Vitest that a component renders inside the provider and fails without it, that `generateMetadata` works once `next-intl/server` is mocked with `createTranslator`, and that `npm run typecheck` rejects an unknown key and `` t(`errors.${code}`) `` when a code has no message, but not a missing argument.

## Approaches

The issue settled the library. The ADR records the comparison:

1. **next-intl without i18n routing (chosen).** One API for Server and Client Components, ICU messages, typed keys, and no proxy or URL changes. Its cost is a dependency, a provider in the layout, and test setup.
2. **Plain TypeScript modules, as `auth.ts` is today.** No dependency, already typed. But no ICU (plurals, arguments), and a second language means building our own lookup and passing the language around.
3. **The Next.js guide's dictionaries** (`getDictionary` with JSON per language). No dependency, but it runs only on the server: Client Components get their texts through props. No ICU, and its example puts the language in the URL.
4. **i18next.** Widely used, splits texts into namespace files. Its own docs say one file is fine for a small app, and it adds more setup for Server Components than next-intl.
5. **next-intl's `useExtracted`.** The English text is written in the code and the key is generated. It's experimental.

## Design

### Package and install scripts

- `npm install --save-exact next-intl@4.16.2`, or a later 4.x if one is out when the build starts. Then re-run the spike's checks (build output and the 404) on that version before going on. If they fail on the later version, pin 4.16.2, the version the spike passed on, and say so in the PR.
- `npm install-scripts deny @swc/core @parcel/watcher`. `package.json` gets `"allowScripts": { "@swc/core": false, "@parcel/watcher": false }`. `unrs-resolver` stays uncovered for #75.

### Setup

- **`next.config.ts`**: `export default createNextIntlPlugin()(nextConfig);`, with `import createNextIntlPlugin from "next-intl/plugin";`. The existing options and comments stay.
- **`src/i18n/request.ts`**: `getRequestConfig(async () => ({ locale: "en", messages }))`, with a static `import messages from "../../messages/en.json";`. With one language, a static import replaces the docs' `import(\`../../messages/${locale}.json\`)`. A comment says the locale is fixed and must read nothing from the request, so the pages stay static.
- **`src/i18n/global.ts`**: the `AppConfig` augmentation, `Locale: "en"` and `Messages: typeof messages` (type-only import of `messages/en.json`). `tsconfig.json`'s `**/*.ts` already includes it.
- **`src/app/layout.tsx`**: `<body><NextIntlClientProvider>{children}<ErrorToaster /><BfcacheReload /></NextIntlClientProvider></body>`, with no props. `lang="en"` and the title (the app name alone) stay.
- **`src/proxy.ts`**: unchanged.

### `messages/en.json`

One top-level namespace per feature or screen, camelCase IDs, ICU syntax. `title` is the page's `<title>`, `heading` its `h1`, `lead` the line under it. Every value below is today's text.

```json
{
  "Common": {
    "close": "Close",
    "homeLink": "{appName} home"
  },
  "Home": {
    "heading": "All your matches <br></br>in <highlight>one place.</highlight>",
    "lead": "Every team and every tournament on one calendar."
  },
  "NotFound": {
    "title": "Page not found · {appName}",
    "heading": "<highlight>404</highlight> <br></br>Page not found.",
    "lead": "This page doesn't exist or has moved.",
    "backHome": "Back to home"
  },
  "Login": {
    "title": "Log in · {appName}",
    "tagline": "All your matches in one place.",
    "signUpsClosed": "Sign-ups are closed.",
    "emailLabel": "Email",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "Password",
    "passwordPlaceholder": "••••••••",
    "logIn": "Log in",
    "loggingIn": "Logging in…",
    "emailMissing": "Enter your email",
    "emailInvalid": "Enter a valid email address",
    "passwordMissing": "Enter your password",
    "errors": {
      "invalid_credentials": "Wrong email or password.",
      "unavailable": "Can't log in right now. Try again in a few minutes."
    }
  },
  "Logout": {
    "logOut": "Log out",
    "loggingOut": "Logging out…",
    "logOutFailed": "Can't log out right now. Try again."
  }
}
```

- `Common` holds texts used by more than one screen: the popup's Close button (every page has `ErrorToaster`) and the header's home link (home and 404).
- The login field messages keep the IDs `validateLogin` returns (`emailMissing`, `emailInvalid`, `passwordMissing`), so the form calls `t(errors.email)` with no mapping. They stay in `Login` until a second form needs them.
- The error popups keep the server's codes as keys (`errors.invalid_credentials`, `errors.unavailable`), so the form calls `` t(`errors.${code}`) `` and the type check fails if a new `AuthErrorCode` has no message.
- `highlight` is the volt text (`text-primary`). `<br></br>` is the line break. The spaces around them match today's JSX, so the text content doesn't change: "All your matches in one place." and "404 Page not found."
- In ICU an apostrophe followed by `{`, `}`, `<` or `#` starts quoted text. Today's apostrophes ("doesn't", "Can't") are followed by letters, so they print as is.
- The app name stays in `src/lib/app-name.ts`. Messages that include it take `{appName}`, passed as `APP_NAME`. The wordmark isn't a message.

### Screens and components

| File | Kind | Change |
| --- | --- | --- |
| `src/app/page.tsx` | Server, sync | `useTranslations("Home")`; `t.rich("heading", { br, highlight })`, `t("lead")` |
| `src/app/not-found.tsx` | Server, sync | `useTranslations("NotFound")` in the component, which stays synchronous (its comment stays true). `metadata` becomes `async function generateMetadata()` with `getTranslations("NotFound")` and `t("title", { appName: APP_NAME })` |
| `src/app/login/page.tsx` | Server, sync | `useTranslations("Login")` for `tagline` and `signUpsClosed`; `generateMetadata()` with `Login.title` |
| `src/app/login/login-form.tsx` | Client | `useTranslations("Login")` for labels, placeholders, buttons, field messages and `` t(`errors.${code}`) `` |
| `src/components/logout-button.tsx` | Client | `useTranslations("Logout")` |
| `src/components/error-toaster.tsx` | Client | `ErrorList` uses `useTranslations("Common")` for `aria-label={t("close")}`. `showError(message)` still takes a string |
| `src/components/app-header.tsx` | Shared, no marker | `useTranslations("Common")`, `aria-label={t("homeLink", { appName: APP_NAME })}` |

Both rich headings use the same two tags, so one small `const` in each page (or a shared helper, the builder's call) maps `br: () => <br />` and `highlight: (chunks) => <span className="text-primary">{chunks}</span>`.

`src/lib/messages/auth.ts` and `src/lib/messages/__tests__/auth.test.ts` are deleted, and so is the empty folder.

### Tests

- **A shared helper in `src/i18n/__tests__/`** (like `src/lib/auth/__tests__/memory-jar.ts`, a helper that isn't a test): `renderWithMessages(ui)` renders inside `<NextIntlClientProvider locale="en" messages={messages}>`, and a `getTranslations` stand-in built on `createTranslator({ locale: "en", messages, namespace })` for tests to pass to `vi.mock("next-intl/server", …)`.
- **Every component test** that renders a component using `useTranslations` uses the helper. Mocked modules stay mocked as today.
- **Page title tests** (`not-found.test.tsx`, `login/__tests__/page.test.tsx`) mock `next-intl/server` and check `await generateMetadata()`. `layout.test.tsx` still checks `metadata.title`.
- **Where texts come from.** Unit tests find elements by texts from `messages/en.json` (plain messages directly, `{appName}` ones through the translator), instead of `authMessages`. Two kinds of literal stay on purpose, because they check what the reader sees:
  - the visible headings that rich text builds, e.g. heading named "All your matches in one place."
  - `"Coming soon"`, which checks that an old text is gone
- **`src/i18n/__tests__/request.test.ts`**: with `getRequestConfig` mocked as the identity, the config returns `locale: "en"` and the messages from `messages/en.json`.
- **`messages/__tests__/en.test.ts`**: the "agreed texts" tests from `auth.test.ts` (the two error popups, the three field messages, the logout failure), now reading `messages/en.json`.
- **End-to-end** (`e2e/login.spec.ts`, `e2e/logout.spec.ts`, `e2e/helpers/log-in.ts`): import `messages/en.json` instead of `authMessages`. `e2e/header.spec.ts` builds the link name from `Common.homeLink` with `createTranslator`, or the builder may keep `` `${APP_NAME} home` `` if next-intl won't load in Playwright. `e2e/not-found.spec.ts` takes "Back to home" from the file, and the heading patterns stay. A broken import shows up locally in `npx playwright test --list`, which needs no browsers. The tests themselves run in CI.

### Scripts

`format` and `format:check` add `messages`, and `lint` adds `messages`, for the test in `messages/__tests__/`.

### Rules, docs and the ADR

- **`AGENTS.md`**, under Code: "Put every text the screens show, accessible names and page titles included, in `messages/en.json`, under the feature's namespace, with an ID as its key and ICU syntax for variable parts. Never write it into the code. The app name is the one exception: it stays in `src/lib/app-name.ts` and goes into messages as `{appName}`. Texts in generated shadcn/ui components are exempt, and a screen that shows one passes its own." The Commands list says `lint` and `format` also cover `messages/`.
- **`docs/explanation/architecture.md`**:
  - Where code runs: `src/i18n/request.ts` runs on the server, when a page renders or prerenders, and gives next-intl the locale and the messages.
  - Folder map: `messages/` (the texts) and `src/i18n/` (next-intl's setup). The `src/lib/` row stops naming `messages/`.
  - Logging in: "The text of each message is in `messages/en.json`, under `Login`."
  - Adding a new area: "Text in its own namespace in `messages/en.json`."
- **`docs/reference/design-guide.md`**, Error popup: "Take its message from `messages/en.json`, never from a library's own error text."
- **ADR `0022-keep-screen-texts-in-next-intl-messages.md`**, under "Stack and architecture" in the index: the options above, the trade-offs (all messages to the browser, test setup, the denied scripts), and that a second language means a second file plus a decision on how to pick it.

## Verification

- `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass on Node 26, and CI's end-to-end tests pass.
- The build output lists `/`, `/login` and `/_not-found` as static (○).
- `next start` with `APP_ENV=local` and a mock session: an unknown URL answers 404 with `Page not found · SquadHopper`.
- **Reads as before:** the visible text, the `<title>` and the `aria-label`s of `/`, `/login` and the 404 page in the prerendered HTML are the same as on `main` (compare a build of `main` with one of the branch).
- **Typecheck guard:** a throwaway edit, removing `Login.errors.unavailable` and adding `t("nope")`, makes `npm run typecheck` fail. Reverted before committing.
- A search of `src/` for string literals in JSX and in `aria-label` and `title` props finds none, apart from the app name, test files and `src/components/ui/`.
- `npm ci` shows no install-scripts warning for `@swc/core` or `@parcel/watcher`.
- The owner reviews the Vercel preview at 390 px and 1280 px.

## Left to the builder

- Whether the rich-text tag map is a `const` in each page or a shared helper.
- The exact names inside the test helper.
- The order of the commits (proposal: package and setup; messages and screens with their tests; e2e; docs and AGENTS.md; ADR).
