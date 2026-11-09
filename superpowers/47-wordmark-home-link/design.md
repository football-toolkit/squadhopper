# Design: make the header wordmark link to the home page

Issue: #47 (Task). Branch and change key: `47-wordmark-home-link`.

## Intent

People expect clicking the logo to take them home. The header's wordmark becomes a link to `/`, looking exactly as it does today.

## Goals

Issue #47's "Done when" list:

- [ ] Clicking the header's wordmark opens the home page
- [ ] The link has an accessible name and a visible grey focus ring
- [ ] The tests and the design guide are updated
- [ ] `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass
- [ ] The repository owner reviewed the PR's Vercel preview

Only the owner can do the last item, once the PR exists.

## Non-goals

- The wordmark inside the login card (the login Feature decides that).
- Any change to the `Wordmark` component itself.

## Constraints

- **Next.js 16.4.3.** Per the installed docs (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`), `<Link>` extends `<a>`, takes `href`, and passes `<a>` attributes such as `className` and `aria-label` to the underlying `<a>`. Matches the issue's source (https://nextjs.org/docs/app/api-reference/components/link).
- **Design guide:** volt is never used for links or focus rings. Focus rings use the grey `ring` token. Links normally get `text-foreground underline`; the wordmark is the one exception.
- **App name rule:** the name lives only in `src/lib/app-name.ts`, so the accessible name is built from `APP_NAME`.

## Design

`AppHeader` wraps `<Wordmark />` in `<Link href="/">`:

- **Accessible name:** `aria-label={`${APP_NAME} home`}`. It starts with the visible text, so voice-control users can say what they see (WCAG 2.5.3, label in name).
- **Markup:** the `Wordmark` keeps rendering its default `<p>`. An `<a>` in flow content (the `<header>`) may hold flow content, so `<a><p>…</p></a>` is valid HTML and the wordmark's box, and so the header's look, stays the same.
- **No underline:** Tailwind's preflight already sets `text-decoration: inherit` and `color: inherit` on `<a>`, so the wordmark looks as today. No extra class needed.
- **Focus ring:** `rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`. A solid 2 px grey outline, 4 px off the text, only for keyboard focus. Full-strength `ring` grey (`#9AA4B2`) on the surface (`#141A22`) is clearly visible; never volt. All values are Tailwind defaults or theme tokens.

Alternatives considered: rendering the wordmark as a `<span>` inside the link changes its line box (the `<a>` strut adds height), so the header could shift by a pixel or two. Keeping the `<p>` avoids that.

## Testing

- `src/components/__tests__/app-header.test.tsx`: the header has one link, named `<APP_NAME> home`, with `href="/"`, holding the wordmark's text, and its focus-ring classes use `outline-ring`, not `primary`.
- `src/app/__tests__/page.test.tsx`: "there are no links" becomes "exactly one link, to `/`".
- Manual: `npm run build` and the owner's review of the Vercel preview (click, Tab to see the ring, no underline).

## Docs

The design guide's Do and don't table gets the exception: the header's wordmark is the one link without an underline, with a grey focus ring. No ADR: the change follows the existing design guide and makes no choice between real alternatives that is costly to undo.
