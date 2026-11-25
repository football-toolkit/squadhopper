# Check whether Vercel can fetch the tournament sites: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A throwaway `GET /api/spike/fetch-sites` on a draft PR's Vercel preview that reports, per page and user agent, whether the tournament sites answer a Vercel function in `fra1`.

**Architecture:** One route handler that fetches each address in `SPIKE_TEAM_URLS` twice, one request at a time, and returns numbered summaries. One helper counts the match rows with cheerio. Nothing reaches `main`.

**Tech Stack:** Next.js 16 route handler, cheerio 1.2.0, Vitest.

**Spec:** `superpowers/72-site-fetch-spike/design.md`

## Global Constraints

- No address, hostname or page content in the code, the tests, the response, the code's own log output, commits, the PR or the issue. In the issue, sites are only "Site 1" to "Site 4", and pages only "page 1", "page 2" and so on.
- The code logs nothing: no `console.*`.
- Requests run one at a time, with a 1 s pause before every request except the first, and a 10 s timeout covering the request and reading the body.
- The route exports only `GET`, and calls `await connection()` first.
- Every answer, the 500 included, carries `Cache-Control: private, no-store`.
- The counter's unit test is the only new test (the owner approved this in the design). The route is checked by hand in Task 2.
- Node 26, from `.nvmrc` after Task 1 merges `main`. Run `nvm use` in each shell.
- Install only project dependencies (`npm ci`, `npm install`). No browsers or other tools: the end-to-end tests run in CI.
- Nothing is pushed, and no `gh` command that changes GitHub runs, without the owner's OK.
- Stage by explicit path. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. After each commit, show `git show --stat`.

## Review Focus

The design allows one unit test, so Task 2's local run covers the first four, against a local server, and Task 3 covers the last.

- A site that accepts the connection and never answers, or stalls partway through the body: `"timeout"` after about 10 s, and the remaining pages still run.
- An entry that isn't a valid address, or a host that refuses: `"network error"`, with no address or error text in the response.
- A challenge page answering 200: `status` 200 and `matchRows` 0.
- Spaces and a trailing comma in `SPIKE_TEAM_URLS`: trimmed, and no phantom page.
- The preview was built before the variable was added: 500 with the fixed error message, and the owner redeploys.

---

### Task 1: The match-row counter

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `src/app/api/spike/fetch-sites/count-match-rows.ts`
- Test: `src/app/api/spike/fetch-sites/__tests__/count-match-rows.test.ts`

**Interfaces:**
- Produces: `export function countMatchRows(html: string): number`

- [ ] **Step 1: Bring the branch up to date.** `git fetch origin`, then `git merge --no-edit origin/main`. `main` moved to Node 26 after the branch started, and the test should run on the runtime production uses. Expected: `cat .nvmrc` prints `26`.
- [ ] **Step 2: Install.** `nvm use`, `npm ci`, then `npm install cheerio@1.2.0`. Expected: `package.json` has `"cheerio": "1.2.0"`, with no caret, under `dependencies`.
- [ ] **Step 3: Write the failing test**

```ts
// @vitest-environment node
import { expect, test } from "vitest";
import { countMatchRows } from "../count-match-rows";

test("counts a match link that wraps a match row", () => {
  const html = `<a href="/match/1"><div class="row match">A - B</div></a>`;
  expect(countMatchRows(html)).toBe(1);
});

test("doesn't count a match link without a match row in it", () => {
  const html = `<a href="/match/1"><div class="row">A - B</div></a>`;
  expect(countMatchRows(html)).toBe(0);
});

test("doesn't count a match row outside a match link", () => {
  const html = `<div class="row match">A - B</div>
    <a href="/team/1"><div class="row match">A - B</div></a>`;
  expect(countMatchRows(html)).toBe(0);
});

test("counts each link once on a page-shaped document", () => {
  const html = `<!doctype html><html><body>
    <a href="https://site.example.test/match/1"><div class="row match"><div class="row match">A - B</div></div></a>
    <a href="/match/2"><div class="row match">C - D</div></a>
    <a href="/match/3">Details</a>
    <div class="row match">E - F</div>
  </body></html>`;
  expect(countMatchRows(html)).toBe(2);
});
```

- [ ] **Step 4:** Run `npx vitest run src/app/api/spike`. Expected: FAIL, `../count-match-rows` can't be found.
- [ ] **Step 5: Implement `countMatchRows`.** Use `load` from `cheerio`: the number of `a[href*="/match/"]` elements in which `.find(".row.match")` finds at least one element.
- [ ] **Step 6:** Run `npx vitest run src/app/api/spike`. Expected: 4 tests pass.
- [ ] **Step 7: Commit.** `git add package.json package-lock.json src/app/api/spike/fetch-sites/count-match-rows.ts src/app/api/spike/fetch-sites/__tests__/count-match-rows.test.ts`, then commit `test: count match rows for the site fetch spike`.

### Task 2: The route

**Files:**
- Create: `src/app/api/spike/fetch-sites/route.ts`

**Interfaces:**
- Consumes: `countMatchRows(html: string): number` from `./count-match-rows`, `APP_NAME` from `@/lib/app-name`, `connection` from `next/server`.
- Produces: `export async function GET(): Promise<Response>`, returning the JSON in the design's "The route".

Types, in `route.ts`:

```ts
type FetchSummary = {
  status: number | "timeout" | "redirect loop" | "network error";
  ms: number;
  bytes: number | null;
  redirected: boolean | null;
  matchRows: number | null;
};

async function fetchSummary(url: string, headers: HeadersInit): Promise<FetchSummary>;
```

The design leaves the fields of a failed request open: `bytes`, `redirected` and `matchRows` are `null` when `status` is a string, and `ms` is the time until the failure.

- [ ] **Step 1: Implement `fetchSummary`.** `fetch` with `headers`, `cache: "no-store"` and `signal: AbortSignal.timeout(10_000)`. Read the body with `arrayBuffer()`: `bytes` is its `byteLength`, and the HTML is it decoded as UTF-8. The `try` covers the fetch and the body read. An error named `TimeoutError` gives `"timeout"`, one whose cause says `redirect count exceeded` gives `"redirect loop"`, and any other gives `"network error"`. The error itself goes nowhere.
- [ ] **Step 2: Implement `GET`** as in the design's steps 1 to 5. `honest` sends only `User-Agent: ${APP_NAME} (personal schedule sync)`. `browser` sends a current desktop Chrome `User-Agent`, `Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8` and `Accept-Language: en-GB,en;q=0.9`. `region` is `process.env.VERCEL_REGION ?? null`. With no addresses: status 500 and `{ "error": "SPIKE_TEAM_URLS is not set" }`.
- [ ] **Step 3: Write a local test server in the scratchpad** (not in the repo), on `127.0.0.1:4010`, with `node:http`:
  - `/ok`: 200, a page with two match rows
  - `/challenge`: 200, a page with none
  - `/blocked`: 403
  - `/moved`: 302 to `/ok`
  - `/stall`: sends headers and part of a body, then never ends
- [ ] **Step 4: Run the app against it.** `npm run build`. The build output lists `/api/spike/fetch-sites` as dynamic (`ƒ`), not static. Then start it with the variable set only for that process, and ask it with the mock's session cookie:

```bash
APP_ENV=local SPIKE_TEAM_URLS=" http://127.0.0.1:4010/ok, http://127.0.0.1:4010/challenge,http://127.0.0.1:4010/blocked,http://127.0.0.1:4010/moved,http://127.0.0.1:4010/stall,http://127.0.0.1:4011/,not-an-address," npm start
curl -s -i -H 'Cookie: mock-session=signed-in' http://localhost:3000/api/spike/fetch-sites
```

Expected, for both user agents, with 7 pages:

| Page | `status` | `redirected` | `matchRows` |
|---|---|---|---|
| 1 | 200 | false | 2 |
| 2 | 200 | false | 0 |
| 3 | 403 | false | 0 |
| 4 | 200 | true | 2 |
| 5 | "timeout", `ms` about 10000 | null | null |
| 6 | "network error" | null | null |
| 7 | "network error" | null | null |

Also: the headers include `cache-control: private, no-store`, `region` is `null`, `ranAt` changes on a second run, the body contains no `127.0.0.1` and no `not-an-address`, the server's own output shows no address, and the test server saw requests at least 1 s apart.

- [ ] **Step 5: Check the other answers.** Without the cookie: a redirect to `/login`. A POST with the cookie: 405. Restarted without `SPIKE_TEAM_URLS`: 500 and the fixed error. Stop both servers.
- [ ] **Step 6: Run the checks.** `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` all pass.
- [ ] **Step 7: Commit.** `git add src/app/api/spike/fetch-sites/route.ts`, then commit `feat: add a temporary route that fetches the tournament sites`.

### Task 3: Run the test and record the result

Done by the agent in the main session with the owner, not by a subagent. Each GitHub command waits for the owner's OK, with the exact title, body or changed lines shown first.

- [ ] **Step 1:** The owner confirms that `SPIKE_TEAM_URLS` is in Vercel (Secret, Preview only). Until then, no code is pushed. The agent never sees the value.
- [ ] **Step 2:** Show the PR title `feat: check whether Vercel can fetch the tournament sites` and the body, from `.github/pull_request_template.md`. Its Summary says the PR is closed without merging, and that no ADR is needed because nothing is kept. The owner's review checkbox stays unticked. After the OK: `git push origin 72-site-fetch-spike`, then `gh pr create --draft --base main --assignee spanciuc`.
- [ ] **Step 3:** CI is green, and the preview has built. The owner opens `/api/spike/fetch-sites` on it at least three times, at different times of day, and pastes each JSON into the issue. Each shows `"region": "fra1"` and as many pages as there are addresses, or the run doesn't count. If the answer is 500, the owner redeploys the preview. No screenshot of Vercel's Observability or logs goes into the issue or the PR: they show the hostnames.
- [ ] **Step 4:** The owner gives the four site domains in chat and keeps the mapping to Site 1–4. With the domains, `git log -p origin/main..HEAD` piped through `grep -iF` for each finds nothing. Read each site's `robots.txt` and terms of use. If WebFetch is refused for a site, fetch its `robots.txt` with curl's default user agent. Terms that can't be read are recorded as "not read", and the owner decides whether to read them in a browser.
- [ ] **Step 5:** Draft a results comment for the issue: one table row per run and page (status, time, size and match rows for each user agent), the `robots.txt` and terms notes per Site 1–4, quoting nothing that identifies a site, and the conclusion from the issue's decision table. "Every page returns its match rows" needs `matchRows` above 0 on every page in every run. A page with 0 rows, or a "network error" with `ms` near 0, isn't "blocked" yet: the owner first opens that page from home, since it may list no matches that day, or the address may be mistyped. Don't compare `ms` between the user agents, since the browser request comes second on a warm connection. The browser row changes only the user agent and two headers, so the conclusion doesn't say how a real browser would fare. If only the browser user agent works, say so: the conclusion then depends on whether the sites' terms allow it, and the owner decides. Check the draft for each domain, then post it after the OK.
- [ ] **Step 6:** The owner removes `SPIKE_TEAM_URLS` from Vercel. After the OK, close the PR with `gh pr close` (not merged).
- [ ] **Step 7:** Show the "Done when" lines before and after, and tick them after the OK with `gh issue edit`. Re-read the body. Then close the issue with `gh issue close 72` after the OK, because a PR that isn't merged doesn't close it.
