# Design: let the pitch fill the band on large screens

Issue: #53 (Task). Branch and change key: `53-pitch-fills-band`.

## Intent

On large screens the pitch stays at 368 × 228 px in a big grey band, so the page looks unfinished. The pitch is the app's main visual: it should grow with the band, with space around it that grows in proportion, without breaking phones or short screens.

## Goals

Issue #53's "Done when" list:

- [ ] The pitch grows with the band, with proportional space around it, capped at 960 px wide
- [ ] At 360 × 640, 390 × 844, 844 × 390, 1280 × 800, 1920 × 1080, 2560 × 1440 and 3840 × 2160: the grey ends at half the screen (or below it only on short screens), the pitch is whole, doesn't touch the card, and has equal space above and below
- [ ] The comment, the tests and the design guide (including the issue's sentence) match the new structure
- [ ] `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass
- [ ] The repository owner reviewed the PR's Vercel preview on a large screen and on an iPhone (portrait and landscape)

Only the owner can do the last item, once the PR exists.

## Non-goals

- The pitch's line thickness (stays 2 px; the owner judges it on the preview).
- The card widths.
- Any other Safari-sensitive change.

## Constraints

- **Tailwind 4.3.4**, with the default `--spacing: 0.25rem` (`globals.css` doesn't override it). Compiled with the installed Tailwind, the issue's classes give: `grow` → `flex-grow: 1`, `grow-8` → `flex-grow: 8`, `max-w-240` → 60rem (960 px), `min-h-44` → 176 px, `min-h-24` → 96 px, `min-h-4` → 16 px, `h-12` → 48 px, `inset-y-0` → `inset-block: 0`. All on the default scale, so no new bracket classes; `min-h-[50svh]` stays the only one.
- **Safari (#43):** the pitch must stay inside an absolutely positioned box, because Safari doesn't resolve `height: 100%` inside a flex band.

## Design

The approach is the issue's, taken as written. In `src/components/pitch-layout.tsx`, the band becomes a flex column:

```tsx
<div className="flex min-h-44 flex-1 flex-col border-b border-divider">
  <div className="min-h-4 grow" />
  <div className="relative min-h-24 grow-8">
    <div className="absolute inset-x-5 inset-y-0 flex items-center justify-center">
      <Pitch className="block size-full max-w-240" />
    </div>
  </div>
  <div className="min-h-4 grow" />
  <div className="h-12 shrink-0" />
</div>
```

- **Proportions:** the pitch area's only child is absolutely positioned, so its content height is 0 and all three grow items share the free height by their grow factors: 8 for the pitch area, 1 for each space. The pitch area gets about 80%, and the two spaces get equal shares, so the space above the pitch equals the space between the pitch and the card.
- **The overlap:** the last 48 px (`h-12 shrink-0`) sits under the card, replacing the old box's `bottom-16` (16 + 48).
- **The cap:** `max-w-240` caps the pitch at 960 px wide, about 1.5 times the home card (640 px). The old `max-h-57 max-w-92` go away. The pitch's SVG keeps its aspect ratio inside the box, as today.
- **Minimums:** `min-h-44` = 16 + 96 + 16 + 48, so the band still keeps room for a pitch at least 96 px tall, the minimum from #43. On short screens the surface grows past half the screen, as before.
- **The comment** above `PitchLayout` is rewritten to describe the column, the proportions, the cap and the minimums, keeping the Safari and `svh` explanations.

## Testing

`src/components/__tests__/pitch-layout.test.tsx` checks the structure through classes (jsdom has no layout). The tests that walk the old structure change:

- The box: `absolute inset-x-5 inset-y-0 flex items-center justify-center`, and no longer `top-4`/`bottom-16`.
- The pitch: `max-w-240`, and no longer `max-h-57`/`max-w-92`.
- The pitch area: `relative min-h-24 grow-8`.
- The band: `flex flex-col min-h-44`, and its children in order: a space (`min-h-4 grow`), the pitch area, a space (`min-h-4 grow`), the overlap (`h-12 shrink-0`).
- The surface test keeps its checks, one level further up.

The header, `main` and `aria-hidden` tests stay as they are.

**The seven screen sizes:** I can't drive a browser in this environment (no Playwright or Chromium installed, and the rules forbid adding tooling just for this). So I'll check the second "Done when" item by working out the flex layout at each size and comparing it with the issue's table. The owner then confirms it in a real browser, on a local run or on the preview, before that item is ticked. If the owner gives me a browser I can drive, I'll measure the seven sizes myself instead.

## Docs

- The design guide's page-layout section: the pitch grows with the band, takes about 80% of its free height with equal space above and below, is at most 960 px wide, and never shrinks below about 96 px tall. Add the issue's sentence word for word: "The pitch's maximum width (960 px) belongs to the page frame, not to any card. If a card gets much wider, check the pitch on a large screen and raise the cap in the same change if needed."
- No ADR: this follows the issue's tested approach and keeps the #43 frame. It doesn't choose between real alternatives in a way that would be costly to undo.
