# Create the Next.js app: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Next.js app with a "Coming soon" placeholder page, wired up with tests, lint, format and type checks, and record why the project uses Next.js as ADR 0009.

**Architecture:** Generate the `create-next-app` starter in the session scratchpad, copy only the app files into the repo, then trim it to a blank page. Vitest follows the official Next.js guide. ESLint and Prettier get explicit path lists, so they never touch the docs and tooling folders.

**Tech Stack:** Next.js 16.4.3 (App Router, Turbopack, Cache Components), React, TypeScript (strict), Node 24, npm, Vitest with React Testing Library and jsdom, ESLint (`eslint-config-next`, `eslint-config-prettier`), Prettier.

**Spec:** [design.md](design.md). Branch: `25-nextjs-app`.

## Global Constraints

- Node: `.nvmrc` is `24`, and `package.json` `engines.node` is `"24.x"`.
- `.npmrc` is `save-exact=true`, and no version in `package.json` has `^` or `~`.
- `next.config.ts` sets `cacheComponents: true`, `partialPrefetching: true`, `agentRules: false` and `experimental.agentFeedback: false`.
- No `--webpack` flag anywhere. No Tailwind, no PostCSS config.
- The page shows only "Coming soon": no heading, no project name, no links, no images. The layout's metadata title is `"Coming soon"`.
- Unit tests go in a `__tests__/` folder next to the code they test, named after the file.
- Lint and format touch only `src/` and the root config files, never `.claude/`, `openspec/`, `docs/` or `superpowers/`.
- Keep our `README.md` and `AGENTS.md`. Don't take the starter's README, `AGENTS.md` or `CLAUDE.md`.
- The project name appears only in the `README.md` title. `package.json` `name` is `"app"`.
- No file in `.claude/`, `openspec/` or `superpowers/` changes, except `superpowers/25-nextjs-app/`.
- Stage by explicit path only. No personal data.
- Every commit message ends with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, after a blank line, as in earlier changes. The commit commands below show only the subject, so add the trailer to each.

## Review Focus

- **A fresh clone with no `.next/`:** `npm run typecheck` must pass before any `dev` or `build`, because `next-env.d.ts` and the route types are generated, not committed. Task 2 checks this after deleting `.next/` and `next-env.d.ts`.
- **An AI agent running `next dev`:** `AGENTS.md` must stay unchanged. Task 1 checks `git status` after `npm run dev`.
- **`npm test` in a terminal:** it must exit on its own, not wait in watch mode. Task 1 checks the exit code.
- **Editor format-on-save in `docs/`:** Prettier must skip it. Task 2 checks that `.prettierignore` exists and that `npx prettier --check docs` reports the files as ignored.
- **Starter leftovers:** no "Create Next App", Geist, `next.svg`, `vercel.svg` or `favicon.ico` in the repo. Task 1 greps for them.

---

### Task 0: Commit the design and the plan

**Files:**
- Create: `superpowers/25-nextjs-app/design.md`, `superpowers/25-nextjs-app/plan.md` (already written)

- [ ] **Step 1: Commit**

```bash
git add superpowers/25-nextjs-app/design.md superpowers/25-nextjs-app/plan.md
git commit -m "docs: add design and plan for the Next.js app"
```

### Task 1: The app, its page and its test

**Files:**
- Create: `package.json`, `package-lock.json`, `.nvmrc`, `.npmrc`, `tsconfig.json`, `next.config.ts`, `vitest.config.mts`, `src/app/layout.tsx`, `src/app/page.tsx`
- Test: `src/app/__tests__/page.test.tsx`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `src/app/page.tsx` default-exports `Page(): JSX.Element` (synchronous, no props). The scripts `dev`, `build`, `start` and `test` exist in `package.json`. Task 2 adds the rest.

- [ ] **Step 1: Generate the starter in the scratchpad**

```bash
cd <scratchpad> && npx -y create-next-app@16.4.3 app --ts --app --src-dir --eslint --no-tailwind --no-react-compiler --cache-components --no-agent-feedback --no-agents-md --import-alias "@/*" --use-npm --skip-install --disable-git --yes
```

Expected: an `app/` folder with no `postcss.config.*`, no `AGENTS.md` or `CLAUDE.md`, and a `next.config.ts` containing `cacheComponents: true` and `partialPrefetching: true` but no `agentFeedback: true`. If any of these differ, fix them by hand when copying.

- [ ] **Step 2: Copy the app files into the repo**

Copy `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `src/app/layout.tsx` and `src/app/page.tsx`. Don't copy `README.md`, `public/`, `src/app/favicon.ico`, `src/app/globals.css` or `src/app/page.module.css`. Leave `eslint.config.mjs` uncommitted until Task 2.

Merge the starter's `.gitignore` into ours: add its entries (`node_modules`, `.next/`, `out/`, `build`, `coverage`, `next-env.d.ts`, `*.tsbuildinfo`, `.vercel`, npm/yarn debug logs, `.DS_Store`, `*.pem`, and the like) under a `# Next.js and Node` heading, but keep our env rules instead of its `.env*`.

- [ ] **Step 3: Pin Node and npm**

- `.nvmrc`: `24`
- `.npmrc`: `save-exact=true`
- `package.json`: `"name": "app"`, `"private": true`, `"engines": { "node": "24.x" }`.

- [ ] **Step 4: Set `next.config.ts`**

Keep `cacheComponents: true` and `partialPrefetching: true`. Add `agentRules: false` and `experimental: { agentFeedback: false }`.

- [ ] **Step 5: Install, with exact versions**

Run `npm install`, then reinstall every dependency the starter wrote as a range at an exact version, with `@types/node` on major 24, e.g. `npm install -D typescript@5 @types/node@24 @types/react@19 @types/react-dom@19 eslint@9 eslint-config-next@16.4.3`. Then add the Vitest packages:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

Check: `grep -E '"[\^~]' package.json` prints nothing.

- [ ] **Step 6: Add Vitest**

`vitest.config.mts`, as in the Next.js guide: `defineConfig({ plugins: [tsconfigPaths(), react()], test: { environment: "jsdom" } })`. Scripts: `"test": "vitest run"`. Keep `dev`, `build` and `start` as the starter wrote them, with no `--webpack`.

- [ ] **Step 7: Write the failing test**

`src/app/__tests__/page.test.tsx`:

```tsx
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";

test("the home page only says Coming soon", () => {
  render(<Page />);
  expect(screen.getByText("Coming soon")).toBeDefined();
  expect(screen.queryByRole("heading")).toBeNull();
  expect(screen.queryByRole("link")).toBeNull();
  expect(screen.queryByRole("img")).toBeNull();
});
```

- [ ] **Step 8: Run it and see it fail**

Run: `npm test`
Expected: FAIL. The starter page has no "Coming soon" text. The command exits on its own.

- [ ] **Step 9: Write the page and the layout**

- `src/app/page.tsx`: `export default function Page()` returns a `<main>` holding one `<p>Coming soon</p>`. It stays synchronous.
- `src/app/layout.tsx`: `export const metadata: Metadata = { title: "Coming soon" }`, and `RootLayout({ children })` renders `<html lang="en"><body>{children}</body></html>`. No fonts, no CSS import.

- [ ] **Step 10: Run the test and see it pass**

Run: `npm test; echo "exit $?"`
Expected: 1 test passed, `exit 0`, and no watch prompt.

- [ ] **Step 11: Build and run the app**

1. Run `npm run build`. Expected: it succeeds, and the output shows Turbopack.
2. Run `npm run dev` in the background, then `curl -s http://localhost:3000`. Expected: the HTML contains `Coming soon`. Stop the server.
3. Check that `git status --short AGENTS.md` prints nothing.
4. Check that `grep -rniE "create next app|geist|next\.svg|vercel\.svg|favicon" src next.config.ts package.json` prints nothing.

- [ ] **Step 12: Commit**

```bash
git add .gitignore .nvmrc .npmrc package.json package-lock.json tsconfig.json next.config.ts vitest.config.mts src/app/layout.tsx src/app/page.tsx src/app/__tests__/page.test.tsx
git commit -m "chore: create the Next.js app with a placeholder page"
```

### Task 2: Lint, format and type checks

**Files:**
- Create: `eslint.config.mjs` (from the starter, kept back in Task 1), `.prettierrc.json`, `.prettierignore`
- Modify: `package.json`, `package-lock.json`, and any file in `src/` or the root configs that the formatter changes

**Interfaces:**
- Consumes: Task 1's `package.json` and app files.
- Produces: the scripts `lint`, `typecheck`, `format` and `format:check`.

- [ ] **Step 1: Install Prettier**

```bash
npm install -D prettier eslint-config-prettier
```

- [ ] **Step 2: Configure ESLint and Prettier**

- `eslint.config.mjs`: the starter's config, with `eslint-config-prettier/flat` added last.
- `.prettierrc.json`: `{}`.
- `.prettierignore`: `.claude/`, `openspec/`, `docs/`, `superpowers/`, `package-lock.json`, `*.md`.

- [ ] **Step 3: Add the scripts**

```json
"lint": "eslint src eslint.config.mjs next.config.ts vitest.config.mts",
"typecheck": "next typegen && tsc --noEmit",
"format": "prettier --write src eslint.config.mjs next.config.ts vitest.config.mts tsconfig.json package.json .prettierrc.json",
"format:check": "prettier --check src eslint.config.mjs next.config.ts vitest.config.mts tsconfig.json package.json .prettierrc.json"
```

- [ ] **Step 4: Format once, then run every check**

Run `npm run format`, then:

```bash
npm run format:check && npm run lint && npm test
rm -rf .next next-env.d.ts && npm run typecheck
npm run build
```

Expected: all pass. Typecheck passes even with no `.next/` and no `next-env.d.ts`. If `next typegen` doesn't produce what `tsc` needs, find the command that does and use it in the script.

- [ ] **Step 5: Check the scope**

- `npx prettier --check docs` reports nothing to check, because `.prettierignore` skips it.
- `git status --short` shows no change in `.claude/`, `openspec/`, `docs/` or `superpowers/`.

- [ ] **Step 6: Commit**

```bash
git add eslint.config.mjs .prettierrc.json .prettierignore package.json package-lock.json <any files the formatter changed>
git commit -m "chore: add lint, format and type checks"
```

### Task 3: Setup docs and agent rules

**Files:**
- Modify: `README.md` (Setup), `AGENTS.md` (intro, Code)

- [ ] **Step 1: README Setup**

Before the OpenSpec paragraph, add the app setup: the app needs Node 24 (`nvm use` reads `.nvmrc`), install with `npm install`, turn off Next.js telemetry with `npx next telemetry disable` (run in the project root; `NEXT_TELEMETRY_DISABLED=1` also works), and start it with `npm run dev`.

- [ ] **Step 2: AGENTS.md**

- Replace "No code or tech stack is set up yet. When one is, add the build, test, and lint commands to this file." with a `## Commands` section. It lists `npm run dev`, `npm run build`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run format` and `npm run format:check`, and says to run `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` before committing.
- In Code, change "Add or update tests with every behavior change, once a test setup exists." to drop "once a test setup exists".
- In Code, add: "Put unit tests in a `__tests__/` folder next to the code they test, named after the file, e.g. `src/app/__tests__/page.test.tsx` for `src/app/page.tsx`."
- In Code, add: "Next.js changes fast. Before writing Next.js code, check the docs for the installed version in `node_modules/next/dist/docs/`."

- [ ] **Step 3: Check**

`grep -n "No code or tech stack" AGENTS.md` prints nothing. The project name appears only in the README title: `grep -rn "SquadHopper" README.md AGENTS.md` shows only line 1 of `README.md`.

- [ ] **Step 4: Commit**

```bash
git add README.md AGENTS.md
git commit -m "docs: add app setup and commands"
```

### Task 4: ADR 0009, "Build with Next.js"

**Files:**
- Create: `docs/explanation/decisions/0009-build-with-nextjs.md`
- Modify: `docs/explanation/decisions/README.md`

- [ ] **Step 1: Write the ADR**

Copy `docs/explanation/decisions/templates/adr.md` and fill it in as the design's "ADR 0009" section says: title `# 0009: Build with Next.js`, `status: accepted`, `date: 2026-10-28`. Use the four drivers, the three options, and the outcome "Next.js, with the App Router and Cache Components", with its consequences and confirmation. The Bad consequences include, verbatim: "Next.js is maintained by Vercel, so the framework and the host come from the same company." Write pros and cons for the Vite and NestJS options. Under More information, link <https://nextjs.org/blog/next-16-4> as the source for Cache Components being recommended since 16.4 and the default in 17. Also link issue #25 and the Next.js, Vite and NestJS sites.

- [ ] **Step 2: Add it to the index**

In `docs/explanation/decisions/README.md`, add a `### Stack and architecture` group after "How we work", with the same table header and one row: `[0009](0009-build-with-nextjs.md)`, "Build with Next.js".

- [ ] **Step 3: Check**

The ADR has every heading from the template. `diff <(grep '^#' templates/adr.md) <(grep '^#' 0009-build-with-nextjs.md)` shows only the title line, plus one extra `###` per rejected option: the template's single `### Option B` becomes one `###` for the Vite option and one for the NestJS option. Every relative link resolves.

- [ ] **Step 4: Commit**

```bash
git add docs/explanation/decisions/0009-build-with-nextjs.md docs/explanation/decisions/README.md
git commit -m "docs: add ADR 0009 on building with Next.js"
```

### Task 5: Final check against the issue

- [ ] **Step 1:** From a clean state (`rm -rf node_modules .next next-env.d.ts && npm ci`), run `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build`. Expected: all pass, and `npm test` exits.
- [ ] **Step 2:** `node -v` prints v24, `.nvmrc` is `24`, and `engines.node` is `"24.x"`.
- [ ] **Step 3:** `git diff --name-only main... -- .claude openspec superpowers` lists only `superpowers/25-nextjs-app/` files.
- [ ] **Step 4:** Record how each "Done when" item was checked, for the PR body. CodeQL is checked after the PR opens (see the design's Review focus).
