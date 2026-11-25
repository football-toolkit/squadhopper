# Check whether Vercel can fetch the tournament sites: design

Issue: #72. Branch: `72-site-fetch-spike`.

## Intent

The daily match sync reads the owner's team pages on the four tournament sites, which all run Enjore ProManager. A prototype already fetched and parsed them from a home connection. Before anything is built, this throwaway test checks whether a Vercel function in Frankfurt (`fra1`) gets the same pages, or gets blocked or challenged. The answer decides where the sync runs (see the table in the issue).

The PR is a draft, closed without merging. Nothing from this branch reaches `main`, including this folder. The results and the conclusion live in the issue.

## Checked against the docs

- **Region.** `vercel.json` sets `"regions": ["fra1"]` as the project's function region. Hobby allows a single region. ([Configuring regions](https://vercel.com/docs/functions/configuring-functions/region))
- **The variable.** Vercel variables are now "Config" or "Secret". Secret values are write-only once saved, and a variable can be scoped to Preview. Changes apply only to new deployments, so `SPIKE_TEAM_URLS` must be added before the branch is pushed, or the preview redeployed after. ([Environment variables](https://vercel.com/docs/environment-variables))
- **Time limit.** With Fluid compute, the default and maximum duration on Hobby is 300 s. The worst case here is about 90 s for four pages (8 requests × 10 s timeout, plus pauses), so no `maxDuration` is needed.
- **Route handlers.** With Cache Components on, as here, a `GET` route that doesn't touch request data can be prerendered at build time (`node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`). The handler calls `await connection()` from `next/server` first, so it runs on every request (`.../04-functions/connection.md`).

The issue is accurate, with one correction: on a preview, the login gate uses the mock, and the mock's test user is public in `src/lib/auth/test-user.ts`. What keeps strangers off the preview is Vercel Authentication on previews (`docs/how-to/set-up-vercel.md`). That's enough, because the response never shows an address.

## Goals

- `GET /api/spike/fetch-sites` on the preview returns one numbered summary per page in `SPIKE_TEAM_URLS`, for each user agent.
- No address, hostname or page content appears in the code, the response, the code's own log output, the PR or the issue.

## Non-goals

As the issue lists: parsing matches, storing anything, a database, a schedule, any screen. Also: retries, concurrency, and any change to `main`.

## Anti-goals

- Leaking which teams the owner plays for. A summary row is "page 1, honest UA: 200, 412 ms, 38 KB, 14 match rows", never the address.
- A challenge page counted as success. A 200 with zero match rows isn't success.
- Being rude to the sites: one request at a time, a pause in between, and the owner runs it by hand only a few times.

## Approaches

The issue settles the approach, and the owner approved it in the conversation: a temporary route handler on a draft PR's preview, which fetches from Vercel's real `fra1` addresses. Alternatives that don't fit: a Vercel cron job (needs a merge to production, and the issue rules out a schedule), or a script run locally or with the Vercel CLI (it runs from the wrong network, which is the thing being tested).

## The route

`src/app/api/spike/fetch-sites/route.ts`, exporting only `GET` (Next.js answers other methods with 405).

1. `await connection()`.
2. Read `SPIKE_TEAM_URLS`, split on commas, trim, drop empty entries. If none are left, return 500 with `{ "error": "SPIKE_TEAM_URLS is not set" }`.
3. For each page, in order, fetch it with each user agent in turn, with a 1 s pause before every request except the first:
   - **Honest:** `` `${APP_NAME} (personal schedule sync)` ``, with `APP_NAME` from `src/lib/app-name.ts`.
   - **Browser:** a current desktop Chrome user agent string, plus the `Accept` and `Accept-Language` headers a browser sends.
   - `AbortSignal.timeout(10_000)` covers the request and reading the body. `cache: "no-store"`. Redirects are followed.
4. For each request, record:
   - `status`: the HTTP status, or `"timeout"` (the abort fired) or `"network error"` (any other thrown error);
   - `ms`: time from the start of the request until the body is read;
   - `bytes`: the size of the body;
   - `redirected`: `response.redirected`, so a redirect to a challenge page shows up without showing where;
   - `matchRows`: from the counter below.
5. Return JSON with `Cache-Control: private, no-store`:

```json
{
  "region": "fra1",
  "ranAt": "2026-11-20T08:00:00.000Z",
  "pages": [
    {
      "page": 1,
      "honest": { "status": 200, "ms": 412, "bytes": 38211, "redirected": false, "matchRows": 14 },
      "browser": { "status": 200, "ms": 380, "bytes": 38211, "redirected": false, "matchRows": 14 }
    }
  ]
}
```

`region` comes from `VERCEL_REGION`, which Vercel sets at runtime. It proves the function ran in `fra1`. Locally it's `null`.

Errors are reported in the response only, and the code logs nothing. Vercel still records the hostnames a function calls, by itself: in the project's Observability (External APIs), and possibly under a runtime log's Outgoing Requests ([Observability insights](https://vercel.com/docs/observability/insights), [runtime logs](https://vercel.com/docs/logs/runtime)). Only people with access to the Vercel project see them, so no screenshot of either goes into the issue or the PR.

## The match-row counter

`countMatchRows(html: string): number` counts the links whose `href` contains `/match/` and which contain an element with the classes `row` and `match`. On the real pages, `row match` is the class of an element inside the link, not of the `<a>` itself. It uses [cheerio](https://cheerio.js.org/) (1.2.0, the current release) with the prototype's selectors: `a[href*="/match/"]`, then `.row.match` found inside each. The dependency never reaches `main` from this branch, and it's what the real sync will use. The counter lives in the route's folder, in `count-match-rows.ts`, with a unit test in `__tests__/count-match-rows.test.ts`.

The test uses page-shaped HTML: a link to `/match/` wrapping a `<div class="row match">` (counted), a link to `/match/` without one (not counted), and a `.row.match` outside any `/match/` link (not counted).

My call: that one small test is the only test. The route is throwaway, and the counter is the one piece that decides success or failure. No end-to-end test.

## How it's run

1. The owner adds `SPIKE_TEAM_URLS` in Vercel, Secret, Preview only, before the code is pushed (or redeploys after).
2. The agent opens a draft PR. Vercel builds a preview.
3. The owner opens `/api/spike/fetch-sites` on the preview at least three times, at different times of day, and pastes the JSON into the issue.
4. The owner gives the agent the four site domains in chat, never committed, and keeps the mapping from domain to Site 1–4. The agent reads each site's `robots.txt` and terms of use. If WebFetch is refused for a site, the agent fetches its `robots.txt` with curl from the shell. The issue is public, so the notes on automated access call the sites Site 1–4, never by domain or name, and quote nothing that identifies one.
5. The agent writes the results table and the conclusion into the issue, from the issue's decision table. They also use only page numbers and Site 1–4.
6. The PR is closed without merging, and the owner removes `SPIKE_TEAM_URLS` from Vercel.

## Checks

- `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass. CI runs the end-to-end tests as usual. The new route doesn't change any screen.
- Locally, with `SPIKE_TEAM_URLS` unset, the route answers 500 with the error. With a test address set, it answers with the summary shape above.
- `git grep` for each site's domain on the branch finds nothing.

## Left to the builder

- The exact Chrome user agent string.
- How the counter's test HTML looks beyond the three cases above, as long as it holds no real team, site or match.
