# Design: add Tailwind CSS and shadcn/ui

Issue: #37 (Task). Branch and change key: `37-tailwind-shadcn`.

## Intent

Every screen from v0.1's login onward is built from a design system kept in code. This change adds that foundation before any screen exists, so the first Feature can stay focused on behavior. It sets up Tailwind CSS and shadcn/ui, styles the placeholder page through them so the setup is used and checked by the build, and records why as an ADR.

The app has no styles today: #25 dropped the starter's `globals.css` and `page.module.css`.

## Goals

Issue #37's "Done when" list:

- [ ] Tailwind CSS and shadcn/ui are set up as their official Next.js guides describe
- [ ] The placeholder page is styled through Tailwind classes and the theme variables
- [ ] `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass
- [ ] The ADR "Keep the design system in code, with Tailwind CSS and shadcn/ui" is accepted and in the index
- [ ] The repository owner reviewed the PR's Vercel preview

The last item can only happen after the PR exists, and only the owner can do it. It's the one exception to "tick before opening the PR": the PR opens with it unticked, and an agent never claims it.

## Non-goals

- No colors, fonts, logo or other visual choices. #38 owns them, including replacing the theme values and loading a font with `next/font`.
- No dark mode. The CLI's `.dark` block stays in `globals.css` as generated, but nothing turns it on. #38 scopes the app to light only for now.
- No shadcn/ui component. Each one is added when a screen first needs it.
- No design step in the workflow (#39).
- No Tailwind class-sorting Prettier plugin (my call): neither guide asks for it, and it would reorder classes in every generated component.

## Anti-goals

- The page must not gain any text, heading, link or image. It still shows only "Coming soon".
- The app must not be left relying on a font that isn't loaded (see The font, below).
- Lint and format must never touch `.claude/`, `openspec/`, `docs/` or `superpowers/`.

## Constraints

- **Tailwind CSS 4.3.4**, set up as [its Next.js guide](https://tailwindcss.com/docs/installation/framework-guides/nextjs) says. There's no `tailwind.config` file in v4.
- **shadcn/ui CLI 4.23.0**, the existing-project path of [its Next.js guide](https://ui.shadcn.com/docs/installation/next): Tailwind first, then `shadcn init`.
- **Base UI with the `base-nova` preset** (the owner's call). It's what `--defaults` selects, and [Base UI has been shadcn/ui's default since July 2026](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default). Radix stays supported.
- Exact versions, as `.npmrc` already enforces with `save-exact=true`. Commit `package-lock.json`.
- No personal data. Stage by explicit path only.

## What the CLI writes

Checked by running it on a throwaway copy of the app in the session scratchpad, with Tailwind already set up, using this command:

```bash
npx -y shadcn@4.23.0 init --defaults --yes --no-monorepo --no-rtl
```

| It writes | Keep? |
| --- | --- |
| `components.json` (`style: base-nova`, `baseColor: neutral`, `cssVariables: true`, `iconLibrary: lucide`, the `@/` aliases) | Keep as generated. |
| `src/lib/utils.ts`: one line, `export { cn } from "cn"` | Keep. This is the `cn()` helper. |
| `src/app/globals.css`: the imports, the `@theme inline` block, `:root` and `.dark` values, `@layer base` | Keep, with one line removed (see The font). |
| `package.json`: `@base-ui/react`, `class-variance-authority`, `cn`, `lucide-react`, `shadcn`, `tw-animate-css` | Keep all six (see The dependencies). |
| `src/components/ui/button.tsx` | **Delete.** The issue says no component yet. |
| `src/app/layout.tsx`: the Geist font through `next/font/google`, and a `cn("font-sans", geist.variable)` class on `<html>` | **Undo.** Fonts belong to #38. |

### The `cn()` helper

The issue's `cn()` helper is now a one-line re-export of the `cn` npm package, not the local `twMerge(clsx(...))` function older guides show. This is the current official path: the [changelog](https://ui.shadcn.com/docs/changelog) (September 2026) and the [manual install guide](https://ui.shadcn.com/docs/installation/manual) both describe it. `npm view cn` shows the maintainer is shadcn and the repository is `shadcn-ui/cn`. It's at version 0.5.2, and it has no install scripts. Nothing changes in the code: the helper stays at `@/lib/utils`, and nothing imports it yet.

### The dependencies

Keep `@base-ui/react`, `class-variance-authority` and `lucide-react`, even though nothing uses them yet. They look removable, but they're the `base-nova` style's own dependencies, which only `init` installs. In the probe, after removing them, `shadcn add button` wrote `button.tsx` and left `package.json` unchanged, and `tsc` then failed with `Cannot find module '@base-ui/react/button'`. Removing them would break the first real component.

Keep them all in `dependencies`, where the Tailwind guide's command and the CLI put them (my call). `shadcn` is only imported from CSS at build time, so `devDependencies` would also work, but following the guides is simpler and Vercel installs both.

### The font

Remove Geist from the layout, and remove the one line `--font-sans: var(--font-sans);` from `@theme inline` in `globals.css`. Keep `--font-heading: var(--font-sans);`.

The second removal is what makes the first safe. With Geist gone, that line refers to itself: the compiled CSS contains `--font-sans:var(--font-sans)`, which is invalid, so the page would fall back to the browser's default font. With the line removed, the compiled CSS has Tailwind's default sans stack. Checked by building both versions.

Removing Geist is my call. The issue puts fonts out of scope and #38 picks the font, so this PR shouldn't ship a visual choice nobody made, or add a build-time download from Google Fonts.

## What gets built

### Tailwind CSS

- `npm install tailwindcss @tailwindcss/postcss postcss`, as the guide says.
- `postcss.config.mjs` at the root, with the guide's content.
- `src/app/globals.css` starts as `@import "tailwindcss";`, and `src/app/layout.tsx` imports `./globals.css`. The guide assumes the starter's existing `globals.css` import. This app dropped it in #25, so it comes back here.

### shadcn/ui

Run the command above, then make the two corrections in the table: delete the Button, and undo the font. Run `npm run format` afterwards, because the CLI writes `globals.css` with 4-space indentation and no final newline.

### The page

```tsx
export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <p className="text-muted-foreground">Coming soon</p>
    </main>
  );
}
```

"Coming soon" sits in the center of the screen, in the theme's muted color (my call on the layout). The background and text color come from the theme through the `@layer base` rule on `body`. The muted color compiles to `#737373` on white, about 4.7:1, which passes WCAG AA.

`src/app/layout.tsx` ends up the same as today, plus the `./globals.css` import.

### Test

The two existing tests stay as they are, and must still pass. No new test (the owner's call): a test on a class name checks markup rather than behavior, and #38 will change the look. jsdom doesn't compile Tailwind anyway. The build-output check (see Testing) and the owner's preview review cover the "styled through the theme" item.

### Lint and format

Add the new root config files to the existing explicit lists in `package.json`:

- `lint` and `format`, `format:check`: add `postcss.config.mjs`.
- `format`, `format:check`: add `components.json`.

`src/` is already covered, which includes `globals.css` for Prettier. `.prettierignore` doesn't change.

### Docs

`AGENTS.md`, Code section, one new bullet: style with Tailwind classes and the theme variables in `src/app/globals.css`, and add a shadcn/ui component with `npx shadcn add <name>` when a screen first needs it, then run `npm run format`. Because `shadcn` is a project dependency, `npx` uses the pinned version.

`README.md` doesn't change: `npm install` covers the setup. No other doc mentions styling.

### ADR 0012: Keep the design system in code, with Tailwind CSS and shadcn/ui

Write `docs/explanation/decisions/0012-keep-the-design-system-in-code.md` from the template, and add it to the "Stack and architecture" group in the index.

- Front matter: `status: accepted`, `date` as the day it's written, `decision-makers: repository owner`.
- Context: v0.1's login is the first of many screens, and they need one consistent look. The app has no styles yet. Screens are built by one person and coding agents, so where the design lives decides whether agents can read and change it.
- Decision drivers: one source of truth for the design; agents can read and change it directly; no cost; a standard path for Next.js; adding it before any screen exists, so it doesn't complicate the first Feature.
- Considered options:
  1. Tailwind CSS + shadcn/ui
  2. Plain CSS or CSS Modules, built into Next.js
  3. A component library such as MUI
  4. Figma as the design's source of truth
- Decision outcome: Tailwind CSS + shadcn/ui, because the design lives in the repo as theme variables and components we own, which agents can edit like any other code. State the **Base UI** choice here: shadcn/ui's components build on a headless library, and we take Base UI with the `base-nova` preset, shadcn/ui's default for new projects since July 2026 (link the changelog). Radix and React Aria are the alternatives the CLI offers.
- Consequences:
  - Good: one source of truth, reviewed in pull requests like everything else. Components are copied into the repo, so we can change them and aren't tied to a library's release cycle.
  - Good: no design tool or subscription.
  - Bad: Tailwind classes make markup longer and are a thing to learn.
  - Bad: copied components don't update themselves. We re-add them or merge changes by hand.
  - Bad: the `shadcn` package is a CLI, but `globals.css` imports its CSS, so it stays a dependency. It brings most of the about 190 packages this change adds to the install, and 5 audit findings (2 low, 3 moderate), none high or critical, in CLI code the app never imports. `main` already has 16 moderate ones, through ESLint.
  - Bad: `cn` is at 0.x, so its API may still change.
- Confirmation: `components.json` and `postcss.config.mjs` are in the repo, and `globals.css` holds the theme. No Figma file or design-tool link is a source of truth.
- Pros and cons of the other options:
  - Plain CSS or CSS Modules: good, nothing to install. Bad, we'd build every accessible component and the whole token system ourselves.
  - A component library such as MUI: good, ready-made components. Bad, the look and behavior live in a dependency, so restyling means fighting its theme, and upgrades are on its schedule.
  - Figma: good, a strong visual tool. Bad, two sources of truth that drift. Bad, its AI handoff is limited on the free plan: Figma's [MCP guide](https://github.com/figma/mcp-server-guide) says Starter users are "limited to up to 6 tool calls per month".
- More information: the Tailwind and shadcn/ui guides, the Base UI changelog entry, issues #37, #38, #39, and ADR 0009, linked as `0009-build-with-nextjs.md` from the ADR's own folder.

## Review focus

- **The font trap:** the compiled CSS must not contain `--font-sans:var(--font-sans)`. A green build doesn't catch it.
- **No leftovers from the CLI:** no `src/components/`, no `Geist` or `next/font` anywhere in `src/`.
- **Base dependencies stay:** `package.json` still lists `@base-ui/react`, `class-variance-authority` and `lucide-react`.
- **The CLI's output otherwise untouched:** apart from the one font line and Prettier's whitespace, `globals.css` is what the CLI generated, so #38 starts from the real theme.
- **Exact versions:** no `^` or `~` in `package.json`.
- **Scope:** `git diff --name-only main...` lists nothing in `.claude/`, `openspec/` or `superpowers/` except `superpowers/37-tailwind-shadcn/`.

## Left to the builder

- How to split the commits, as Conventional Commits.
- The ADR's exact wording, within the points above.

## Testing

- `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass, as they did on the probe's end state.
- After the build, the CSS in `.next/static/` contains `.text-muted-foreground{color:var(--muted-foreground)}` and `.min-h-svh`, a `--muted-foreground` value, and a `--font-sans` value that is a font stack rather than a reference to itself.
- `npm run dev`, then fetch `http://localhost:3000`: the HTML has "Coming soon" and the classes on `<main>`. Then `git status` shows `AGENTS.md` unchanged.
- `npx prettier --check components.json postcss.config.mjs docs` passes. `docs/` passes because `.prettierignore` skips it.
- The ADR has every section of the template, and the index link resolves.
- The owner reviews the look on the PR's Vercel preview. An agent can't do this step.
