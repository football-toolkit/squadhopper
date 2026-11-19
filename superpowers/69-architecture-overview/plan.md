# Add an architecture overview: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `docs/explanation/architecture.md`, a one-page map of how the app is built, and link it from the docs indexes and `AGENTS.md`.

**Architecture:** Docs only. One new explanation page with six sections and three Mermaid sequence diagrams, plus three small index edits.

**Tech Stack:** Markdown, Mermaid (rendered by GitHub).

**Spec:** [design.md](design.md). Branch: `69-architecture-overview`.

## Global Constraints

- No code changes. No new tooling or dependencies.
- Describe `main` as it is. Link to code files and ADRs instead of repeating them.
- Refer to the project as "the project" or "this project"; never its name.
- Voice of the other docs: short plain sentences, written for people first; a "Where next" footer.
- No personal data. Stage by explicit path only.

## Review Focus

- A fact on the page that doesn't match the code (a wrong file, function, cookie header or redirect). Task 1 Step 3 re-reads each claim against its file.
- A relative link or named path that doesn't resolve. Task 1 Step 4 and Task 2 Step 2 check them.
- A Mermaid block that GitHub can't render (for example a `;` or `:` inside a message, or an unbalanced `alt`/`end`). Task 1 Step 4 checks the syntax.
- A section that drifts into restating an ADR's reasoning rather than linking it. Task 1 Step 3.
- The "new area" section reading as if `src/lib/matches/` exists. Task 1 Step 3.

---

### Task 1: The architecture page

**Files:**
- Create: `docs/explanation/architecture.md`
- Create: `superpowers/69-architecture-overview/design.md`, `superpowers/69-architecture-overview/plan.md` (already written)

**Interfaces:**
- Produces: the page at `docs/explanation/architecture.md`, which Task 2 links to.

- [ ] **Step 1: Read the sources.** `src/proxy.ts`, everything in `src/lib/auth/`, `src/app/login/actions.ts`, `src/app/login/login-form.tsx`, `src/app/logout/route.ts`, `src/components/logout-button.tsx`, `src/components/bfcache-reload.tsx`, `src/app/layout.tsx`, ADRs 0016–0019, and in `node_modules/next/dist/docs/01-app/`: `03-api-reference/03-file-conventions/proxy.md` and `03-api-reference/01-directives/use-server.md`, `use-client.md`.
- [ ] **Step 2: Write the page**, with an intro paragraph and these sections, in order, as design.md describes:
  1. `## Where code runs`: table with columns *File or marker*, *Runs*, *When*, *Here*; then `import "server-only"`; then the backend-terms mapping.
  2. `## The folder map`
  3. `## The auth module`
  4. `## The three flows`: `### Opening a page`, `### Logging in`, `### Logging out`, each a ```` ```mermaid ```` `sequenceDiagram` with a few lines of text under it.
  5. `## Adding a new area`
  6. `## Environments`: table with columns *`APP_ENV`*, *Where*, *Backend*.
  7. `## Where next`: links to ⬆️ Explanation, 🏠 Docs home, and the decisions index.
- [ ] **Step 3: Check every claim** against the file it describes. Expected: each named function, file, header and status code exists as stated (`routeFor`, `hasSession`, `createAuthService`, `pickAuthBackend`, `authServiceForRequest`, `Cache-Control: private, no-store`, 403/204 from `/logout`, 405 for other methods). Section 5 says it's the pattern to follow, not existing code.
- [ ] **Step 4: Check links and diagrams.**
  - Run a link check over the page: for each `](relative/path)` target (without `#anchor`), `test -e` from `docs/explanation/`. Expected: no missing targets.
  - Read each Mermaid block: every `alt`/`else`/`opt` has its `end`; messages hold no `;`; participants are declared. Expected: all three are valid sequence diagrams.
- [ ] **Step 5: Commit**

```bash
git status --short
git add docs/explanation/architecture.md superpowers/69-architecture-overview/design.md superpowers/69-architecture-overview/plan.md
git commit -m "docs: add an architecture overview" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 2: Link it from the indexes and AGENTS.md

**Files:**
- Modify: `docs/explanation/README.md` (Contents table; the "More sections…" line)
- Modify: `docs/README.md` (Contents table, Explanation row)
- Modify: `AGENTS.md` (Code section)

**Interfaces:**
- Consumes: `docs/explanation/architecture.md` from Task 1.

- [ ] **Step 1: Make the edits.**
  - `docs/explanation/README.md`: add `| [Architecture](architecture.md) | How the app is built: where code runs, the folders, the auth module, the main flows, and how to add a new area |` above the Decisions row. Change the last line to `More sections are added as they're written.`
  - `docs/README.md`: Explanation row's second cell becomes `[How the app is built](explanation/architecture.md), and design decisions (ADRs)`, so the docs index links the page directly.
  - `AGENTS.md`, Code section, after "Follow the conventions already in the surrounding code.": `- Before adding code in a new area, read [the architecture overview](docs/explanation/architecture.md). When a change alters the structure it describes, update it in the same PR.`
- [ ] **Step 2: Check.** `grep -n "architecture.md" AGENTS.md docs/README.md docs/explanation/README.md` finds a link in all three files, and each target exists. Then run `npm ci` (the worktree has no `node_modules`), `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`. Expected: all pass.
- [ ] **Step 3: Commit**

```bash
git status --short
git add docs/explanation/README.md docs/README.md AGENTS.md
git commit -m "docs: link the architecture overview" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
