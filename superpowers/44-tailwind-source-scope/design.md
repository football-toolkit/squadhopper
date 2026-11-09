# Design: keep docs and design files out of Tailwind's scan

Issue: #44 (Task). Branch and change key: `44-tailwind-source-scope`.

## Intent

Tailwind CSS builds its stylesheet from every class name it finds in the project. The design guide's "don't" examples, such as `border-primary`, live in `docs/` and `superpowers/`, so they end up in the built CSS although no screen uses them. The built CSS should hold only what the app uses.

## Goals

Issue #44's "Done when" list:

- [x] `globals.css` excludes `docs/` and `superpowers/` from Tailwind's scan
- [x] The built CSS has no class that appears only in `docs/` or `superpowers/`
- [x] `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass

## Non-goals

- No change to other folders Tailwind scans, such as `openspec/` or the root Markdown files. The issue names only `docs/` and `superpowers/`.
- No switch to explicit sources (`source(none)` plus `@source` lines). Excluding two folders keeps automatic detection for everything else, and new code folders need no config.
- No ADR: the issue settles the approach, and it's one line to undo.

## Verification against the docs

Checked against [Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files), for the installed Tailwind CSS 4.3.4:

- Tailwind scans every file except those in `.gitignore`, `node_modules`, binary files, CSS files and lock files. `docs/` and `superpowers/` are scanned today.
- `@source not "<path>"` ignores a path, "relative to the stylesheet". The docs' own example excludes a directory.
- `src/app/globals.css` sits two levels below the repo root, so the paths are `../../docs` and `../../superpowers`, as the issue says.

## Changes

### `src/app/globals.css`

After the three `@import` lines, add:

```css
@source not "../../docs";
@source not "../../superpowers";
```

## Testing

There is no unit test for the built CSS, and this change adds none: it is build config, checked once against the build output.

1. Before the change, build and list the class selectors in the CSS under `.next/static/`.
2. After the change, build and list them again.
3. Every class that disappeared must be absent from `src/` (it came only from `docs/` or `superpowers/`), and `.border-primary` must be gone.
4. Every class that `src/` uses is still in the CSS (no class disappeared that `src/` contains).
5. Run the pre-commit checks from `AGENTS.md`.
