---
status: accepted
date: 2026-11-07
decision-makers: repository owner
---

# 0012: Keep the design system in code, with Tailwind CSS and shadcn/ui

## Context and problem statement

v0.1's login is the first of many screens, and they need one consistent look. The app has no styles yet: the starter's `globals.css` and `page.module.css` were dropped in #25. One person and coding agents build the screens, so where the design lives decides whether agents can read and change it. Where should the design system live, and what should it be built from?

## Decision drivers

- One source of truth for the design.
- Coding agents can read and change it directly.
- No cost.
- A standard path for Next.js ([0009](0009-build-with-nextjs.md)).
- It can be added before any screen exists, so it doesn't complicate the first Feature.

## Considered options

1. Tailwind CSS + shadcn/ui
2. Plain CSS or CSS Modules, built into Next.js
3. A component library such as MUI
4. Figma as the design's source of truth

## Decision outcome

Chosen option: **"Tailwind CSS + shadcn/ui"**, because the design lives in the repo as theme variables and components we own, which agents can edit like any other code.

shadcn/ui's components build on a headless component library, and the CLI offers Base UI, Radix and React Aria. We take **Base UI** with the `base-nova` preset, which has been [shadcn/ui's default for new projects since July 2026](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default). Radix stays supported.

We add each component when a screen first needs it, not up front.

### Consequences

- Good, because there's one source of truth, reviewed in pull requests like everything else.
- Good, because components are copied into the repo, so we can change them and aren't tied to a library's release cycle.
- Good, because no design tool or subscription is needed.
- Bad, because Tailwind classes make markup longer, and they're one more thing to learn.
- Bad, because copied components don't update themselves. We re-add them or merge changes by hand.
- Bad, because the `shadcn` package is a CLI, but `globals.css` imports its CSS, so it stays a dependency. Most of the about 200 packages this adds to the install come through it. When this was written, it also added 5 audit findings (2 low, 3 moderate), none high or critical, in CLI code the app never imports. `main` already had 10 moderate ones, through ESLint.
- Bad, because the `cn` package behind the `cn()` helper is at 0.x, so its API may still change.

### Confirmation

- `components.json` and `postcss.config.mjs` are in the repo, and `src/app/globals.css` holds the theme.
- `components.json` has `"style": "base-nova"`, and `package.json` depends on `@base-ui/react`.
- No Figma file or design-tool link is a source of truth.

## Pros and cons of the options

### Plain CSS or CSS Modules, built into Next.js

- Good, because there's nothing to install.
- Bad, because we'd build every accessible component and the whole token system ourselves.

### A component library such as MUI

- Good, because the components are ready-made.
- Bad, because the look and behavior live in a dependency, so restyling means fighting its theme.
- Bad, because upgrades happen on its schedule.

### Figma as the design's source of truth

- Good, because it's a strong visual tool.
- Bad, because it makes two sources of truth, a design file and the code, and they drift.
- Bad, because its AI handoff is limited on the free plan: Figma's [MCP guide](https://github.com/figma/mcp-server-guide) says Starter users are "limited to up to 6 tool calls per month".

## More information

- [Install Tailwind CSS with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [Install shadcn/ui with Next.js](https://ui.shadcn.com/docs/installation/next)
- [shadcn/ui changelog: Base UI as the default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)
- Issues: #37 sets this up, #38 defines the visual identity, and #39 adds the design step to the workflow.
- Related: [0009](0009-build-with-nextjs.md)
