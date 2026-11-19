# Upgrade to Node 26: design

Issue: #35 (Task). Branch and change key: `35-node-26-upgrade`.

Status: draft, waiting for the owner's approval.

## Intent

The project pinned Node 24 in #25, because Vercel then offered only 24.x and 22.x. Node 26 is now the Active LTS, and Vercel's default. Node 24 gets security fixes until 30 April 2028, and Node 26 until 30 April 2029. Upgrading now, while the app is small, costs little and gives the project another year of support.

## Goals

Issue #35's "Done when" list:

- [ ] `.nvmrc` is `26`, `engines.node` is `26.x`, and `@types/node` is on major 26
- [ ] `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass on Node 26, locally and in CI
- [ ] The Vercel project setting is `26.x`, and a production deployment runs on Node 26
- [ ] The docs name Node 26 wherever they named Node 24

## Non-goals

- No other dependency upgrades. Only `@types/node` moves, because its major follows the runtime.
- No CI workflow change. `actions/setup-node` reads the version from `.nvmrc`.
- No edits to history: accepted ADRs (0011 says the upgrade is tracked in #35) and the `superpowers/` folders of earlier changes stay as they are.

## Anti-goals

- **No turning off HTTP/2 for `fetch`.** On Vercel, Node 26's `fetch` uses HTTP/2. Nothing here needs HTTP/1.1, so we don't set `VERCEL_FETCH_DISABLE_H2`.
- **No version ranges.** `engines.node` stays a single major (`26.x`), and `@types/node` stays an exact version, like the other dependencies.

## Checked against the docs

Checked on 2026-11-19.

- **Release status** ([Node.js releases](https://nodejs.org/en/about/previous-releases), [endoflife.date](https://endoflife.date/nodejs)): Node 26 is LTS, and the latest release is 26.13.1. It gets security fixes until 30 April 2029. Node 24's active support ended on 20 October 2026, and its security fixes last until 30 April 2028. The sources don't give the exact day Node 26 entered LTS. The [v26.0.0 post](https://nodejs.org/en/blog/release/v26.0.0) says "in October". The issue's date (October 28) appears only in its "Why", so it changes nothing here.
- **Vercel** ([Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)): Vercel offers 26.x (the default), 24.x and 22.x. `engines.node` in `package.json` overrides the project setting, and `26.x` resolves to the latest 26 release. The build and the function runtime may run different minor versions.
- **Vercel and `fetch`** ([advanced Node.js configuration](https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration), [changelog, 29 October 2026](https://vercel.com/changelog/node-js-26-lts-is-now-generally-available-on-vercel)): in Vercel Functions on Node 26, the built-in `fetch` negotiates HTTP/2, and `response.statusText` is empty for HTTP/2 responses. Neither `src/` nor Supabase's auth client reads `statusText`, so nothing breaks.
- **Node 26.0.0 breaking changes** ([release post](https://nodejs.org/en/blog/release/v26.0.0)): the release removes `http.Server.prototype.writeHeader()`, the `_stream_*` legacy modules and `--experimental-transform-types`. `localStorage` now returns `undefined` without `--localstorage-file`. `module.register()` and some crypto and stream APIs are now deprecated at runtime. Temporal is on by default, with V8 14.6 and Undici 8. A search of `src/`, `e2e/` and the config files finds none of the removed or changed APIs.
- **`@types/node`** (npm registry): the latest release is 26.6.6.
- **Locally on Node 26.13.1 (npm 11.20.0):** `npm test` (188 tests) and `npm run typecheck` already pass before any change.

## Approaches

1. **Upgrade now to Node 26, the newest LTS that Vercel offers (chosen).** It gets the longest support, it follows the rule from #25 (pin the newest LTS Vercel supports), and the checks above found nothing to change in the code.
2. **Stay on Node 24 until it's closer to its end of life.** No work now, but the gap grows, and the upgrade would happen later when the app is bigger.
3. **Allow a range such as `>=24`.** Vercel would pick 26 on its own, but local runs, CI and Vercel could then drift apart. One pinned major keeps them on the same version.

## Design

1. **Runtime pin:** `.nvmrc` becomes `26`, and `package.json` `engines.node` becomes `26.x`.
2. **Types:** `@types/node` becomes exactly `26.6.6`, installed with `npm install`, which also updates `package-lock.json`. The Dependabot rule that ignores its majors stays, because its comment doesn't name a version.
3. **Docs:**
   - `README.md`: "The app needs Node.js 26."
   - `AGENTS.md`: "The app is built with Next.js on Node 26."
   - `docs/how-to/set-up-vercel.md`, step 7: pick 26.x, production runs on Node 26, and the sentence about #35 is removed.
4. **No ADR.** The upgrade makes no new choice. It applies the existing rule (pin the newest LTS Vercel offers), and it's cheap to undo. The PR body will say this.
5. **Vercel setting (owner, by hand):** Settings → Build and Deployment → Node.js Version → 26.x. Production follows `engines` either way. The setting keeps the dashboard in line with it.

## Verification

- On Node 26: `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`, and `npm run test:e2e` when the local setup allows. CI runs all of them on Node 26 from `.nvmrc`.
- `node -v` prints v26, `.nvmrc` is `26`, `engines.node` is `26.x`, and `npm ls @types/node` shows 26.6.6.
- A search for "Node 24", "Node.js 24" and "24.x" outside history (accepted ADRs, earlier `superpowers/` folders) finds nothing.
- The Vercel deployment's build log shows Node 26.

## Open question for the owner

The "Done when" list asks for a production deployment on Node 26. Production deploys only after the merge, but we don't merge with unticked items. Proposal: reword the item to "a preview deployment runs on Node 26". The preview build uses the same `engines` setting, so it proves the same thing.

## Left to the builder

- The order of the commits (proposal: one commit for the runtime pin and types, one for the docs).
