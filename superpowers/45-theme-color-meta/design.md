# Design: add a theme color for phone browsers

Issue: #45 (Task). Branch and change key: `45-theme-color-meta`.

## Intent

Browsers that read `<meta name="theme-color">` (such as Chrome on Android) color their bar above the page. Without the tag the bar is light while the app is dark, which breaks the look at the top of every screen. The tag sets it to the surface color, `#141A22`, the color of the header and the pitch band.

## Goals

Issue #45's "Done when" list:

- [ ] The page's HTML has `<meta name="theme-color" content="#141A22">`
- [ ] The design guide lists the exception
- [ ] `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass

## Non-goals

- No light theme color and no `media` variants: the app ships one dark theme ([ADR 0014](../../docs/explanation/decisions/0014-ship-one-dark-theme.md)).
- No other viewport fields. Next.js sets the `viewport` meta tag itself.
- No web app manifest.
- No ADR: the issue settles the approach, and there was no real alternative to weigh.

## Verification against the docs

Checked against the docs for the installed Next.js 16.4.3 (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-viewport.md`, the same page as the issue's source):

- A layout exports a static `viewport` object of type `Viewport` from `next`. Use it rather than `generateViewport`, since the color doesn't depend on the request.
- `themeColor: '<color>'` renders `<meta name="theme-color" content="<color>" />`.
- `viewport` is only supported in Server Components. `src/app/layout.tsx` is one.

One premise of the issue is out of date: it says to record the exception "next to the favicon's", but the design guide doesn't list the favicon's exception. Only #38's design (`superpowers/38-visual-identity/design.md`) does. So this change adds a short section to the guide that lists both. The owner asked for no confirmations in this session, so this is the agent's call, noted in the PR.

## Changes

### `src/app/layout.tsx`

Import the `Viewport` type next to `Metadata`, and export after `metadata`:

```tsx
// A <meta> tag can't read CSS variables, so this repeats --surface (see the design guide).
export const viewport: Viewport = {
  themeColor: "#141A22",
};
```

Uppercase hex, as in the issue's "Done when" item and in `icon.svg`.

### `docs/reference/design-guide.md`

A new subsection at the end of Tokens > Colors, "Hex values outside the theme", that lists the two files that write palette values directly, because they can't read CSS variables:

| File | Values | Why |
| --- | --- | --- |
| `src/app/icon.svg` (the favicon) | `#141A22` (surface), `#C8FF2E` (primary) | An SVG file served as an icon can't read the page's CSS variables |
| `src/app/layout.tsx` (`viewport.themeColor`) | `#141A22` (surface) | The `theme-color` meta tag takes a color value, not a CSS variable |

Followed by: if `--surface` or `--primary` changes in `globals.css`, change these too, in the same pull request. Screens still never write hex values.

### `src/app/__tests__/layout.test.tsx`

Add a test that `viewport.themeColor` is `#141A22`.

## Testing

- Unit test (written first, seen failing): `viewport.themeColor` equals `"#141A22"`.
- After `npm run build`, check the prerendered HTML (`.next/server/app/index.html`) contains `<meta name="theme-color" content="#141A22"/>`.
- The pre-commit checks from `AGENTS.md`.
