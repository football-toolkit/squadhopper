# Make the keyboard focus ring clearly visible: design

Issue: #56. Branch: `56-visible-focus-ring`.

## Problem

shadcn/ui's components draw keyboard focus as `ring-ring/50`, and the base layer gives every element `outline-ring/50`: the `--ring` color at half strength. With `--ring: #9AA4B2`, that measures 2.74:1 on the background (`#0B0F14`) and 2.71:1 on the surface (`#141A22`). WCAG 2.2 SC 1.4.11 (Non-text Contrast) asks a focus indicator for at least 3:1 against the adjacent background, and the threshold is not rounded.

## Checked against the docs

- [WCAG 2.2 Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html): 3:1 against adjacent colors, for focus indicators too; 2.999:1 fails.
- [WCAG 2.2 Understanding 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html): the focus indicator must be visible.
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming): `--ring` is the token for "Focus rings and outlines", mapped to `ring-ring` and `outline-ring` through `--color-ring`; the base layer applies `outline-ring/50`.

The issue is accurate and up to date.

## Decision

Set `--ring` to `#F2F5F7`, the text color. It stays neutral (never volt) and needs no new color in the palette.

Tailwind 4 draws `ring-ring/50` as `color-mix(in oklab, var(--ring) 50%, transparent)`, which is the ring color at 50% alpha, composited in sRGB over what's behind it. Measured that way:

| `--ring` | Strength | On background `#0B0F14` | On surface `#141A22` |
| --- | --- | --- | --- |
| `#9AA4B2` (before) | 50% | 2.74:1 | 2.71:1 |
| `#F2F5F7` (after) | 50% | 4.97:1 | 4.86:1 |
| `#F2F5F7` (after) | 100% | 17.55:1 | 15.97:1 |

Full strength: the header wordmark's `focus-visible:outline-ring` becomes a near-white 2 px outline, offset 4 px from the logo. That's clearly a focus ring and doesn't clash with the volt pitch. shadcn's `focus-visible:border-ring` on buttons and inputs becomes a light border, which is the usual shadcn dark-theme look.

## Out of scope

- No edits to generated files in `src/components/ui/`; the token reaches them.
- No new focus styles; nothing uses volt for focus.

## Tests

A new `src/app/__tests__/globals.test.ts` reads `--ring`, `--background` and `--surface` from `globals.css`, composites the ring at 50% over each, and expects at least 3:1. It fails today (2.74:1) and guards the rule against later palette changes. The wordmark's existing test still checks it uses `outline-ring`, never volt.

## Docs

The design guide's `ring` row shows `#F2F5F7` and states the rule: at half strength, at least 3:1 against the background and the surface.
