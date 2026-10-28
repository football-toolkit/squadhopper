# Design: create the Next.js app

Issue: #25 (Task). Branch and change key: `25-nextjs-app`.

## Intent

The repo has docs and a workflow but no code. v0.1 needs an app before it can be checked, deployed or given a login. This change adds the smallest real app: a Next.js project with tests, lint, format and type checks wired up, and a placeholder home page. It also records why the project is built with Next.js.

## Goals

Issue #25's "Done when" list:

- [ ] `npm run dev` shows the placeholder page
- [ ] `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass, and `npm test` exits on its own
- [ ] Node 24 is pinned in `.nvmrc` and `engines`
- [ ] No file in `.claude/`, `openspec/` or `superpowers/` is changed except this change's own folder
- [ ] ADR 0009 "Build with Next.js" is accepted and in the index
- [ ] The PR shows CodeQL analyzing JavaScript/TypeScript

## Non-goals

- No Supabase, CI workflows, Vercel project, `core/` or `adapters/` folders.
- No Tailwind or other styling library. Styling (Tailwind CSS and shadcn/ui) comes in a later design issue.
- No end-to-end tests. Only the one unit test.
- OpenSpec stays a global install, not a project dependency, because its generated skills call `openspec` from the PATH.
- No ADRs for the tool choices (npm, Vitest, ESLint, Prettier). They follow the defaults of the starter, the official Next.js guide or the issue, so there was no real choice. The PR Summary says this.

## Anti-goals

- The page must not show the project name, the Next.js or Vercel logos, or any starter links. The project name appears only in the `README.md` title.
- Lint and format must never touch `.claude/`, `openspec/`, `docs/` or `superpowers/`.
- Our `README.md` and `AGENTS.md` must not be replaced by the starter's.

## Constraints

- **Next.js** (latest, 16.4.3 when this was written) with the App Router, TypeScript in strict mode, and the `src/` folder. Use the default bundler, Turbopack. No `--webpack` flag anywhere.
- **Node 24:** `.nvmrc` holds `24`, and `package.json` `engines.node` is `"24.x"`. Vercel builds with 24.x (the default and newest) or 22.x, and `24.x` maps to the latest 24 ([source](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)).
- **npm**, with `.npmrc` holding `save-exact=true`. `package.json` keeps `"private": true`. Every version in `package.json` is exact, with no `^` or `~`, including the ones the starter writes as ranges. Commit `package-lock.json`.
- **Starter:** run `create-next-app` in a temporary folder outside the repo (the session scratchpad), never in the repo itself, then copy in only the app files. Keep our `README.md` and `AGENTS.md`, and drop the starter's (Next.js 16 may also generate `AGENTS.md` or `CLAUDE.md`). Merge `.gitignore`: add the starter's entries but keep our env rules (`.env`, `.env.*`, `!.env.example`) instead of the starter's `.env*`.
- No personal data. Stage by explicit path only.

## What gets built

### The page

`src/app/page.tsx` renders a blank page with one short line: "Coming soon". No heading, no name, no links, no images (the owner's call). It stays a plain synchronous component, because Vitest can't render async Server Components.

`src/app/layout.tsx` is the minimal root layout: `<html lang="en">` and `<body>`. Its metadata title is neutral, "Coming soon" (my call), not the project name or "Create Next App". My call: drop the starter's Geist fonts, `globals.css`, `page.module.css`, `favicon.ico` (the Next.js logo) and everything in `public/`. Nothing on a blank page needs them.

### Next.js config

What `create-next-app` 16.4.3 and `next` 16.4.3 do here was checked in their package sources:

- **Agent feedback: off.** `next` itself defaults `experimental.agentFeedback` to `false`, but `create-next-app` turns it on (with `--yes`, or at its prompt, which defaults to Yes) by writing `experimental: { agentFeedback: true }` into `next.config.ts`. When it's on, and telemetry is on, `next dev` writes a feedback block into `AGENTS.md` whenever it detects an AI coding agent, and re-adds it if removed. Generate the starter with `--no-agent-feedback`, and also set `experimental.agentFeedback: false` in `next.config.ts`, so the choice is visible in the repo and survives a change of default.
- **Agent rules: off** (the owner's call). `next` writes a managed "This is NOT the Next.js you know" block into `AGENTS.md` whenever `next dev` detects an AI agent, unless `next.config.ts` sets `agentRules: false`. Set it, so Next.js never edits our rules file. Also skip the starter's own `AGENTS.md` (`--no-agents-md`, or drop the file). In its place, `AGENTS.md`'s Code section gets one line of ours (my call): Next.js changes fast, so check the docs bundled with the installed version in `node_modules/next/dist/docs/` before writing Next.js code.
- **Cache Components: on, as the starter sets it** (the owner's call): keep `cacheComponents: true` and `partialPrefetching: true` in `next.config.ts`. It's Next.js's recommended model since 16.4 and becomes the default in Next.js 17. ADR 0009 records it.

### Scripts

`package.json` has exactly these scripts, plus `start` from the starter:

| Script | Runs |
| --- | --- |
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `test` | `vitest run` (runs once and exits, never watches) |
| `lint` | ESLint on `src/` and the root config files |
| `typecheck` | the TypeScript compiler with no output, see Review focus |
| `format` | Prettier, writing, on `src/` and the root config files |
| `format:check` | Prettier, checking only, same files |

### Tests

Vitest, set up as in the [Next.js Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest): the dev packages `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom` and `vite-tsconfig-paths`, and a root `vitest.config.mts` with `tsconfigPaths()`, `react()` and the `jsdom` environment.

Test location (the owner's call): unit tests go in a `__tests__/` folder next to the code they test, named after the file. The one test is `src/app/__tests__/page.test.tsx`, for `src/app/page.tsx`. It renders `Page` and checks that "Coming soon" is on the page. Folders starting with `_` are private in the App Router, so `__tests__/` never becomes a route.

### Lint and format

- ESLint with the starter's flat config (`eslint.config.mjs`, using `eslint-config-next`), plus `eslint-config-prettier` so ESLint doesn't fight Prettier.
- Prettier with its default style, in `.prettierrc.json` (my call: `{}`, no custom options).
- Scope: the scripts pass explicit paths, `src/` and the root config files (`next.config.ts`, `eslint.config.mjs`, `vitest.config.mts`, and for Prettier also `tsconfig.json`, `package.json`, `.prettierrc.json`). Markdown and `package-lock.json` are not formatted.
- A `.prettierignore` also lists `.claude/`, `openspec/`, `docs/` and `superpowers/` (my call), so an editor running Prettier on save skips them too.

### Docs

- `README.md`, Setup: before the OpenSpec part, add the app setup. Use Node 24 (`nvm use` reads `.nvmrc`), run `npm install`, and turn Next.js telemetry off with `npx next telemetry disable` (run in the project root; `NEXT_TELEMETRY_DISABLED=1` also works, [source](https://nextjs.org/telemetry)). Mention `npm run dev` to start the app.
- `AGENTS.md`:
  - Replace "No code or tech stack is set up yet. When one is, add the build, test, and lint commands to this file." with a short Commands section: the scripts above, and the commands to run before committing: `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build`.
  - In Code, add the test location convention, and drop "once a test setup exists" from the tests bullet.

### ADR 0009: Build with Next.js

Write `docs/explanation/decisions/0009-build-with-nextjs.md` from the template.

- Front matter: `status: accepted`, `date: 2026-10-28`, `decision-makers: repository owner`.
- Context: v0.1 needs pages, a login and server code, and it will be deployed. TypeScript is a given.
- Decision drivers (agreed with the owner):
  - One codebase for pages and server code.
  - Deploys on Vercel with no setup.
  - Small team: one framework, one build, one deploy.
  - Room to grow: server-rendered pages and server-side data fetching are built in.
- Considered options:
  1. Next.js
  2. A Vite single-page app with API functions
  3. NestJS with a separate frontend
- Decision outcome: Next.js, with the App Router and Cache Components (`cacheComponents: true`, `partialPrefetching: true`), because it covers pages and server code in one app that Vercel builds natively. Cache Components is Next.js's recommended model since 16.4 and becomes the default in Next.js 17, so starting on it avoids a later migration (the owner's call). Link the source, <https://nextjs.org/blog/next-16-4>, in More information.
- Consequences: good, one project to build, test and deploy, already on the model Next.js is moving to. Bad, the app is tied to Next.js conventions (App Router, Server Components, Cache Components), and some tools lag behind them, e.g. Vitest can't test async Server Components. Bad, Next.js is maintained by Vercel, so the framework and the host come from the same company.
- Confirmation: `package.json` depends on `next`, the app lives in `src/app/`, and `next.config.ts` sets `cacheComponents: true`.
- Pros and cons of options 2 and 3: the Vite app needs API functions kept as a separate piece, with its own routing and deploy setup. NestJS needs a whole second frontend project, which means two builds and two deploys, more than a small team needs.
- More information: the Next.js, Vite and NestJS sites, and a link to issue #25.

Add it to `docs/explanation/decisions/README.md` under a new group, "Stack and architecture" (the owner's call), after "How we work". The row text is the ADR title, "Build with Next.js".

## Review focus

- **Typecheck from a clean clone.** The starter gitignores `next-env.d.ts`, and Next.js 16 generates route types, so plain `tsc --noEmit` may fail before a first `dev` or `build`. The builder settles the script (for example `next typegen && tsc --noEmit`) and checks it on a fresh checkout without `.next/`.
- **Exact versions:** no `^` or `~` in `package.json`.
- **Scope:** `npm run lint` and `npm run format:check` touch no file outside `src/` and the root config files.
- **`npm test` exits on its own** and doesn't start watch mode.
- **No starter leftovers:** no logos, links, "Create Next App", Geist fonts or `public/` files.
- **Next.js never edits `AGENTS.md`:** `next.config.ts` has `experimental.agentFeedback: false` and `agentRules: false`, and after running `npm run dev` from an agent session, `git status` shows `AGENTS.md` unchanged.
- **CodeQL:** the repo has CodeQL default setup on, but with no languages detected yet, and it may only pick up JavaScript/TypeScript once that code is on `main`. This item can only be checked after the PR exists, so it is the one exception to "tick before opening the PR" (the owner's call). Open the PR with this item unticked, then check the PR's checks. If CodeQL analyzes JavaScript/TypeScript, tick the item and add how it was checked to the PR body. If it doesn't, ask the owner before turning the language on in CodeQL default setup (a GitHub change), then re-check.

## Left to the builder

- The exact `create-next-app` flags beyond `--no-agent-feedback`, Cache Components on and no Tailwind (check `--help`: not every option has a `--no-` form, so drop anything unwanted by hand), and the temporary folder's name (pick one that keeps `package.json` `name` neutral, e.g. `app`, not the project name).
- The exact ESLint and Prettier file lists in the scripts, within the scope above.
- How to split the commits, as Conventional Commits.

## Testing

- `npm test` passes and exits.
- `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass.
- `npm run dev`, then fetch `http://localhost:3000` and check that the HTML contains "Coming soon" and no starter text. Then `git status` shows `AGENTS.md` unchanged.
- `git diff --name-only main...` lists nothing in `.claude/`, `openspec/` or `superpowers/` except `superpowers/25-nextjs-app/`.
- The ADR has every section of the template, and the index link resolves.
