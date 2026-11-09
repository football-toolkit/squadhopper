---
status: accepted
date: 2026-11-09
decision-makers: repository owner
---

# 0014: Ship one dark theme

## Context and problem statement

The login Feature's screens need a look to be built from. The owner explored several visual directions with Claude, as Claude Design artifacts, and picked "Night pitch": a near-black page, a football pitch drawn in volt (`#C8FF2E`) lines across a darker surface, and cards that overlap it. shadcn/ui ships a light theme and a dark theme by default, toggled with a `.dark` class. Should the app ship both themes, or only the one the chosen look was designed as?

## Decision drivers

- The look the owner chose is dark. Volt on near-black is what makes it work.
- One person and coding agents build and review every screen. Each theme is one more thing to check.
- One source of truth for the design ([0012](0012-keep-the-design-system-in-code.md)).
- Screens are reviewed on the Vercel preview ([0013](0013-design-screens-in-code.md)), so every theme there needs a review.

## Considered options

1. One dark theme
2. Light and dark, as shadcn/ui generates
3. Light only

## Decision outcome

Chosen option: **"One dark theme"**, because the chosen look only exists in dark, and a second theme would double the checking for every screen without a user asking for it.

The theme's values live in `:root` in `src/app/globals.css`. There's no `.dark` block. `<html>` carries the `dark` class, so shadcn/ui components use their styles for dark backgrounds, and `scheme-dark`, so the browser draws scrollbars and form controls dark.

`globals.css` and the components in `src/components/` are the one source of truth, as [0012](0012-keep-the-design-system-in-code.md) says. The [design guide](../../reference/design-guide.md) describes them for people building screens. Where they disagree, the code wins.

### Consequences

- Good, because every screen is designed, built and reviewed against one theme.
- Good, because the theme has one set of values, with no light values to keep in step.
- Bad, because users who prefer light pages get dark ones.
- Bad, because adding light mode later means a new ADR, a second set of values, and re-checking every screen.

### Confirmation

- `src/app/globals.css` has no `.dark` block.
- `<html>` in `src/app/layout.tsx` has the `dark` and `scheme-dark` classes, checked by `src/app/__tests__/layout.test.tsx`.

## Pros and cons of the options

### Light and dark, as shadcn/ui generates

- Good, because it respects each user's system setting.
- Bad, because the chosen look has no light version. One would have to be designed first.
- Bad, because every screen needs checking twice, on the preview and in screenshots.

### Light only

- Good, because it's shadcn/ui's starting point.
- Bad, because it isn't the look the owner chose.

## More information

- [shadcn/ui theming](https://ui.shadcn.com/docs/theming)
- Issue: #38 defines the visual identity.
- Related: [0012](0012-keep-the-design-system-in-code.md), [0013](0013-design-screens-in-code.md)
