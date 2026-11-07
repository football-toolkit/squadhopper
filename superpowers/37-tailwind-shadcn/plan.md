# Add Tailwind CSS and shadcn/ui: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Tailwind CSS and shadcn/ui as the app's styling foundation, style the placeholder page through them, and record the decision as ADR 0012.

**Architecture:** Set up Tailwind by its Next.js guide and commit that, so the shadcn/ui CLI's changes can be seen and partly undone against a clean state. Run `shadcn init`, then remove what it adds beyond the issue's scope: the Button and the Geist font. Then style the page, and write the ADR and the `AGENTS.md` rule.

**Tech Stack:** Tailwind CSS 4.3.4 (`@tailwindcss/postcss`), shadcn/ui CLI 4.23.0 (Base UI, `base-nova` preset), Next.js 16.4.3, Node 24, npm.

**Spec:** [design.md](design.md). Branch: `37-tailwind-shadcn`.

## Global Constraints

- `.npmrc` is `save-exact=true`, and no version in `package.json` has `^` or `~`.
- Base UI with the `base-nova` preset. No Radix or React Aria.
- No shadcn/ui component in the repo: `src/components/` must not exist at the end.
- No font: no `Geist` or `next/font` anywhere in `src/`. #38 picks the font.
- Don't change the theme's values. Apart from the one `--font-sans` line and Prettier's whitespace, `globals.css` stays as the CLI generated it.
- The page shows only "Coming soon": no heading, no project name, no links, no images.
- No new test (the owner's call). The two existing page tests stay as they are, and must pass.
- Lint and format touch only `src/` and the root config files, never `.claude/`, `openspec/`, `docs/` or `superpowers/`.
- The project name appears only in the `README.md` title.
- No file in `.claude/`, `openspec/` or `superpowers/` changes, except `superpowers/37-tailwind-shadcn/`.
- Stage by explicit path only. No personal data.
- Every commit message ends with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, after a blank line. The commit commands below show only the subject, so add the trailer to each.
- Pushing and opening the PR are not part of this plan. They need the owner's OK.

## Review Focus

These have no unit test, so each is pinned by a verification step in the task named.

- **The font trap:** with Geist gone, `--font-sans: var(--font-sans);` refers to itself and the page falls back to the browser's default font, while the build stays green. Task 2 checks the compiled CSS.
- **The first real component:** `npx shadcn add <name>` must give code that typechecks, because `add` doesn't install the base dependencies. Task 1 adds a Button, runs the typecheck and removes it again.
- **A fresh clone, as in CI and on Vercel:** `npm ci` must accept the lockfile, and the typecheck and build must pass with no `.next/` or `next-env.d.ts`. Task 2 checks this.
- **CLI leftovers:** no Button, no Geist, and no change to `tsconfig.json` or `next.config.ts`. Task 1 checks this.
- **An AI agent running `next dev`:** `AGENTS.md` must stay unchanged by Next.js. Task 2 checks `git status` after `npm run dev`, before Task 3 edits the file.

---

### Task 0: Commit the design and the plan

**Files:**
- Create: `superpowers/37-tailwind-shadcn/design.md`, `superpowers/37-tailwind-shadcn/plan.md` (already written)

- [ ] **Step 1: Commit**

```bash
git add superpowers/37-tailwind-shadcn/design.md superpowers/37-tailwind-shadcn/plan.md
git commit -m "docs: add design and plan for Tailwind CSS and shadcn/ui"
```

### Task 1: Tailwind CSS and shadcn/ui

**Files:**
- Create: `postcss.config.mjs`, `src/app/globals.css`, `components.json`, `src/lib/utils.ts`
- Modify: `src/app/layout.tsx`, `package.json`, `package-lock.json`

**Interfaces:**
- Produces: `src/app/globals.css` with the theme, imported by the layout, so `bg-background`, `text-foreground`, `text-muted-foreground` and the rest work as classes. `cn` from `@/lib/utils`.

- [ ] **Step 1: Install Tailwind CSS**

Run: `npm install tailwindcss@4.3.4 @tailwindcss/postcss@4.3.4 postcss@8.5.32`
Expected: all three appear in `dependencies`, at exact versions.

- [ ] **Step 2: Add the PostCSS config, the stylesheet and its import**

- `postcss.config.mjs`: the guide's content, a `config` const with `plugins: { "@tailwindcss/postcss": {} }`, and `export default config;`.
- `src/app/globals.css`: the single line `@import "tailwindcss";`.
- `src/app/layout.tsx`: add `import "./globals.css";` after the `Metadata` import. Nothing else changes.

- [ ] **Step 3: Add `postcss.config.mjs` to the scripts**

In `package.json`:

```
"lint": "eslint src eslint.config.mjs next.config.ts postcss.config.mjs vitest.config.mts vitest.setup.ts",
"format": "prettier --write src eslint.config.mjs next.config.ts postcss.config.mjs vitest.config.mts vitest.setup.ts tsconfig.json package.json .prettierrc.json",
"format:check": "prettier --check src eslint.config.mjs next.config.ts postcss.config.mjs vitest.config.mts vitest.setup.ts tsconfig.json package.json .prettierrc.json"
```

- [ ] **Step 4: Verify and commit**

Run: `npm run lint && npm run format:check && npm run build`
Expected: all pass.

```bash
git add postcss.config.mjs src/app/globals.css src/app/layout.tsx package.json package-lock.json
git commit -m "chore: add Tailwind CSS"
```

The next steps rely on this commit: it's what `git restore` goes back to.

- [ ] **Step 5: Run the shadcn/ui CLI**

Run: `npx -y shadcn@4.23.0 init --defaults --yes --no-monorepo --no-rtl`
Expected: it finds Next.js and Tailwind v4, and writes `components.json` with `"style": "base-nova"`. `package.json` gains `@base-ui/react`, `class-variance-authority`, `cn`, `lucide-react`, `shadcn` and `tw-animate-css`. If `style` isn't `base-nova`, or it writes files beyond those in the design's table, stop and tell the owner.

- [ ] **Step 6: Remove what's out of scope**

- Delete the Button: `rm -r src/components` (first check it holds only `ui/button.tsx`).
- Undo the font in the layout: `git restore src/app/layout.tsx`.
- In `src/app/globals.css`, delete the line `--font-sans: var(--font-sans);` from `@theme inline`. Keep `--font-heading: var(--font-sans);`.
- Keep `@base-ui/react`, `class-variance-authority` and `lucide-react`. Only `init` installs them (see the design).

- [ ] **Step 7: Add `components.json` to the format scripts, and format**

In `package.json`'s `format` and `format:check`, add `components.json` after `src`. Then run `npm run format`.
Expected: `globals.css` is now 2-space indented with a final newline.

- [ ] **Step 8: Check the first real component would work**

Run: `npx shadcn add button --yes && npm run format && git status --short src && npm run typecheck`
Expected: `git status` shows `src/components/` as the only new path in `src`, on top of this task's uncommitted `globals.css` and `lib/`, and the typecheck passes, so the kept dependencies are enough.

Then remove it again: `rm -r src/components`.

- [ ] **Step 9: Check for leftovers**

Run: `git status --short && git diff --stat -- tsconfig.json next.config.ts && grep -rnE 'Geist|next/font' src; grep -n 'font-sans: var' src/app/globals.css`
Expected: `src/components/` is absent. `tsconfig.json` and `next.config.ts` have no diff. The `Geist` grep finds nothing. The only `font-sans: var` hit is `--font-heading: var(--font-sans);`.

- [ ] **Step 10: Verify and commit**

Run: `npm test && npm run lint && npm run typecheck && npm run format:check && npm run build`
Expected: all pass.

```bash
git add components.json src/lib/utils.ts src/app/globals.css package.json package-lock.json
git commit -m "chore: set up shadcn/ui with Base UI"
```

### Task 2: Style the placeholder page

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: the theme's classes from Task 1.

- [ ] **Step 1: Style the page**

`src/app/page.tsx`: `<main className="flex min-h-svh items-center justify-center">`, and `<p className="text-muted-foreground">Coming soon</p>`. Nothing else changes. `Page` stays a plain synchronous component.

- [ ] **Step 2: Check the compiled CSS, from a clean build**

Run: `rm -rf .next && npm run build`, then:

```bash
grep -rhoE '\.text-muted-foreground\{[^}]*\}|\.min-h-svh\{[^}]*\}' .next/static --include='*.css'
grep -rhoE -- '--muted-foreground:[^;}]*' .next/static --include='*.css'
grep -rhoE -- '--font-sans:[^;}]{0,30}' .next/static --include='*.css'
grep -rlF -- '--font-sans:var(--font-sans)' .next/static --include='*.css'
```

Expected:
- `.text-muted-foreground{color:var(--muted-foreground)}` and `.min-h-svh{min-height:100svh}`.
- A `--muted-foreground` value.
- A `--font-sans` value that's a font stack, not a reference to itself.
- The last grep finds nothing. A hit means the font trap is back.

- [ ] **Step 3: Check the running page**

Run `npm run dev` in the background, fetch `http://localhost:3000`, then stop the server.
Expected: the HTML has `Coming soon` and `flex min-h-svh items-center justify-center`, and links a stylesheet. `git status --short` doesn't list `AGENTS.md`.

- [ ] **Step 4: Check a fresh clone**

Run: `rm -rf .next next-env.d.ts node_modules && npm ci && npm run typecheck && npm test && npm run lint && npm run format:check && npm run build`
Expected: all pass, and `git status --short` lists only `src/app/page.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "chore: style the placeholder page through the theme"
```

### Task 3: The ADR and the styling rule

**Files:**
- Create: `docs/explanation/decisions/0012-keep-the-design-system-in-code.md`
- Modify: `docs/explanation/decisions/README.md`, `AGENTS.md`

- [ ] **Step 1: Write the ADR**

Copy `docs/explanation/decisions/templates/adr.md` to `docs/explanation/decisions/0012-keep-the-design-system-in-code.md`, and fill it in from the design's "ADR 0012" section: every point there goes in.

- Front matter: `status: accepted`, `date:` today, `decision-makers: repository owner`.
- Title: `# 0012: Keep the design system in code, with Tailwind CSS and shadcn/ui`.
- Option 2 is worded exactly "Plain CSS or CSS Modules, built into Next.js".
- The Decision outcome names Base UI and links <https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default>.
- The Figma option quotes "limited to up to 6 tool calls per month" and links <https://github.com/figma/mcp-server-guide>.

- [ ] **Step 2: Add it to the index**

In `docs/explanation/decisions/README.md`, under "Stack and architecture", after 0011:

```
| [0012](0012-keep-the-design-system-in-code.md) | Keep the design system in code, with Tailwind CSS and shadcn/ui |
```

- [ ] **Step 3: Check the ADR**

Run: `grep -E '^##+ ' docs/explanation/decisions/0012-keep-the-design-system-in-code.md; grep -il squadhopper docs/explanation/decisions/0012-keep-the-design-system-in-code.md`
Expected: every section heading of the template, and no project name. Check by eye that the relative links resolve.

- [ ] **Step 4: Commit the ADR**

```bash
git add docs/explanation/decisions/0012-keep-the-design-system-in-code.md docs/explanation/decisions/README.md
git commit -m "docs: record the design system decision as ADR 0012"
```

- [ ] **Step 5: Add the styling rule to `AGENTS.md`**

In the Code section, after the "Next.js changes fast" bullet:

```
- Style with Tailwind classes and the theme variables in `src/app/globals.css`. Add a shadcn/ui component with `npx shadcn add <name>` when a screen first needs it, then run `npm run format`.
```

- [ ] **Step 6: Commit the rule**

```bash
git add AGENTS.md
git commit -m "docs: add the styling rule to AGENTS.md"
```

- [ ] **Step 7: Final checks on the whole branch**

Run: `npm test && npm run lint && npm run typecheck && npm run format:check && npm run build`
Expected: all pass.

Run: `git diff --name-only main...` and `grep -E '[\^~][0-9]' package.json`
Expected: the only path in `.claude/`, `openspec/` or `superpowers/` is under `superpowers/37-tailwind-shadcn/`, and the grep finds nothing.

Run: `npx prettier --check components.json postcss.config.mjs docs`
Expected: `All matched files use Prettier code style!` `docs/` passes because `.prettierignore` skips it, so Prettier doesn't check its Markdown.

Then stop and show the owner the result. Ticking the issue, pushing and opening the PR need the owner's OK. The "reviewed the Vercel preview" item stays unticked for the owner.
