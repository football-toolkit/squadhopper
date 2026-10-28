# Design: check every PR with CI

Issue: #26 (Task). Branch and change key: `26-ci-checks`.

## Intent

Checks only run when someone remembers to run them. This change runs the five project checks on every pull request into `main` and, once the owner adds the rule, blocks merging until they pass. It also keeps dependencies and the pinned action SHAs current with Dependabot, and records why Dependabot's PRs skip the issue-driven workflow.

## Goals

Issue #26's "Done when" list:

- [ ] A PR shows one CI job, with a stable name, running typecheck, lint, format check, test and build
- [ ] The `main` ruleset requires the CI check with an up-to-date branch, alongside the existing PR rule, and its bypass list is empty
- [ ] All actions are pinned to a full commit SHA; the token is read-only; the job has a timeout
- [ ] Dependabot covers npm and GitHub Actions, with `chore:` PR titles
- [ ] An ADR records the exception for bot dependency PRs, and `AGENTS.md` and the how-to guide mention it and the CI requirement
- [x] CodeQL default setup lists JavaScript/TypeScript, and its first scan on `main` succeeded (already ticked in the issue)

## Non-goals

- No CodeQL workflow: CodeQL already runs through the default setup.
- No deploys.
- No change-key check (ADR 0006). A later Task adds it.
- No push trigger on `main` (the owner's call): `main` only changes through PRs that CI already checked, and the up-to-date rule means the checked code is the merged code.
- No repo-level "require SHA pinning" setting: the organization already enforces it for all repos (the owner's call).
- No change to the PR template, `README.md`, or any accepted ADR.

## Anti-goals

- No third-party actions, and no action referenced by tag or branch.
- No write permission on the token, and no secrets used by the workflow.
- CI must run the same `npm run …` scripts a person runs locally, not its own copies of the commands, so the two can't drift.

## Verification against the docs

Checked on 2026-10-28, before this design:

- **Ruleset:** the `main` ruleset already has a `pull_request` rule (0 approvals, squash only), plus deletion, non-fast-forward, linear-history and signed-commit rules, and an empty bypass list. The issue was updated to match.
- **CodeQL:** default setup is configured for `javascript-typescript`, and its first scan on `main` succeeded on 2026-10-28.
- **Actions:** the repo allows only GitHub-owned and verified actions, and the default workflow token is read-only. Latest releases: `actions/checkout` v7.0.1 (`3d3c42e5aac5ba805825da76410c181273ba90b1`) and `actions/setup-node` v7.1.0 (`949feb2413d6458794dcd2491c4babbbce0c15c1`).
- **setup-node:** `node-version-file` reads `.nvmrc`. Automatic npm caching only applies when `package.json` has a `packageManager` field, which ours doesn't, so `cache: npm` is set explicitly ([setup-node README](https://github.com/actions/setup-node)).
- **Dependabot:** with a `commit-message.prefix` that ends in a letter, Dependabot adds the colon, and the prefix also sets the PR title. A 3-day cooldown applies to version updates by default. For GitHub Actions, `directory: "/"` covers `.github/workflows` ([options reference](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference)).
- **Required status checks:** in a ruleset, "require branches to be up to date" is part of the status-check rule (the strict policy), not a separate rule ([available rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)).
- **Locally:** all five checks pass on Node 24 with `NEXT_TELEMETRY_DISABLED=1`, and leave the working tree clean.

## What gets built

### `.github/workflows/ci.yml`

- Workflow `name: CI`.
- Trigger: `pull_request` with `branches: [main]`, default activity types. Nothing else.
- Top-level `permissions: contents: read`.
- Top-level `env: NEXT_TELEMETRY_DISABLED: 1`.
- My call: `concurrency` grouped by workflow and PR number, with `cancel-in-progress: true`, so a new push cancels the run it replaces.
- One job, id `checks`, with no `name:` override. The check run is then named `checks`, which is what the ruleset matches. Renaming the job later breaks the required check, so a comment in the file says so.
- `runs-on: ubuntu-latest` (my call: GitHub keeps it current, and nothing here depends on the image version).
- `timeout-minutes: 10` (my call: the whole run takes well under a minute locally, and a cold `npm ci` adds about a minute).
- Steps, in this order:
  1. `actions/checkout` pinned to `3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1`, with `persist-credentials: false` (my call: no later step uses git, so the token isn't left in the git config).
  2. `actions/setup-node` pinned to `949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0`, with `node-version-file: .nvmrc` and `cache: npm`.
  3. `npm ci`
  4. `npm run typecheck`
  5. `npm run lint`
  6. `npm run format:check`
  7. `npm test`
  8. `npm run build`

  Each check is its own step, so the PR shows which one failed. The `# vX.Y.Z` comment after each SHA is the form Dependabot updates along with the SHA.

### `.github/dependabot.yml`

`version: 2`, two `updates` entries, both `schedule.interval: weekly` and `commit-message.prefix: chore`:

- **npm**, `directory: "/"`. One group, `npm-minor-patch`, with `patterns: ["*"]` and `update-types: [minor, patch]`, so all minor and patch bumps arrive as one weekly PR. My call: major updates stay ungrouped, one PR each, because a major can break the build and should be reviewed and reverted on its own.
- **github-actions**, `directory: "/"`. One group, `github-actions`, with `patterns: ["*"]`, so the two actions arrive as one PR, majors included. Both are GitHub's own and change rarely.

My call: the npm entry ignores `semver-major` updates of `@types/node`. Its major has to match the Node runtime in `.nvmrc` and `engines` (24), so it moves with a Node upgrade, not on its own. Minor and patch bumps still come in the weekly group.

Defaults left as they are: the 5-PR limit, the Monday schedule, the 3-day cooldown, and the versioning strategy (it keeps the exact versions in `package.json` exact).

### ADR 0010: Merge Dependabot PRs without an issue

`docs/explanation/decisions/0010-merge-dependabot-prs-without-an-issue.md`, from the template, `status: accepted`, dated 2026-10-28.

- **Context:** ADR 0004 says every change starts from an issue, ADR 0005 that every change goes through Superpowers, and ADR 0006 that every change has a key. Dependabot opens its own PRs, with its own branch names: weekly version updates (from this change) and security updates (already enabled). It can't follow any of those rules.
- **Considered options:**
  1. An issue for every update: the owner opens an issue, then recreates the PR from a keyed branch. It keeps the workflow with no exception, but turns each bot PR into manual work, and the result is the same diff.
  2. **Exempt Dependabot PRs**
  3. Security updates only: turn off version updates. There are far fewer bot PRs, but the pinned action SHAs and dependencies go stale between security fixes, and the security PRs still need either an issue each or an exemption.
- **Decision outcome:** option 2, "Exempt Dependabot PRs". It covers all Dependabot PRs, both version updates and security updates. They need no issue, change key or Superpowers folder, and they skip the PR template checklist. The bar to merge is a green CI run plus the owner's review. The `chore:` prefix keeps squash commits Conventional.
  - **Scope of the exemption** (the owner's call): it covers only Dependabot's own diff. If a bot PR fails CI and needs code or config changes beyond the bump (typically a major version), the owner closes it and does the upgrade as a normal Task, with an issue, key and Superpowers folder. Nobody pushes to a Dependabot branch. Pushing the fixes onto the bot's branch was rejected, because code changes would then reach `main` with no issue behind them, and Dependabot stops maintaining a PR once someone else pushes to it.
- **Consequences:** good, because dependencies and security fixes land at little cost. Bad, because some commits on `main` have no issue behind them. The bot's title and the Dependabot branch explain them instead.
- **Pros and cons of the options:** for options 1 and 3, as above.
- **Confirmation:** `.github/dependabot.yml`, and the exception in `AGENTS.md` and the how-to guide.
- **More information:** links to 0004, 0005 and 0006.

Add it to the "How we work" table in `docs/explanation/decisions/README.md`. ADRs 0004, 0005 and 0006 stay unchanged: they're accepted, and an exception isn't a supersession.

### `AGENTS.md`

In the Workflow section:

- The first bullet becomes: "Every change starts from a GitHub issue of the right type (see Issue types below). Dependabot PRs are the only exception (see below)."
- The "Merge only after…" bullet becomes: "Merge only after CI is green and the PR checklist is complete."
- A new last bullet: "Dependency PRs opened by Dependabot, both version updates and security updates, need no issue, change key, Superpowers folder or PR checklist. The repository owner reviews them and merges them once CI is green. If one needs code or config changes beyond the bump, close it and do the upgrade as a Task. Never push to a Dependabot branch. See [ADR 0010](docs/explanation/decisions/0010-merge-dependabot-prs-without-an-issue.md)."

### `docs/how-to/development-workflow.md`

- Step 7: replace "Once CI exists, a check confirms that the branch, the Superpowers folder and the OpenSpec change all use the issue's key." with "A later Task adds a CI check that the branch, the Superpowers folder and the OpenSpec change all use the issue's key."
- Step 8 becomes: "**Squash-merge** once CI is green and the pull request checklist is complete. CI runs typecheck, lint, format check, tests and build on every pull request into `main`, and the `main` ruleset blocks merging until they pass and the branch is up to date. The issue closes on its own."
- A new section, "Dependency updates", before "Big work": every week, Dependabot opens PRs that update npm packages and the pinned GitHub Actions, titled `chore: bump …`. It also opens security update PRs whenever an alert has a fix. The same rules apply to both version updates and security updates: they need no issue, change key, Superpowers folder or PR checklist. The owner reviews each one and squash-merges it once CI is green. If one fails CI and needs code or config changes beyond the bump, the owner closes it and opens a Task for the upgrade, which then follows the normal flow. If it's behind `main`, the owner comments `@dependabot rebase`. My call: the docs don't suggest GitHub's "Update branch" button, because once anyone else pushes to a Dependabot branch, Dependabot stops rebasing and refreshing that PR. Why: ADR 0010.
- "Where next" gets a link to ADR 0010.

## Ruleset on `main` (manual, by the owner)

Done by hand after the PR's first CI run has gone green, because a check can only be picked once GitHub has seen it run. In Settings → Rules → Rulesets → `main`:

1. Turn on **Require status checks to pass**.
2. Inside it, tick **Require branches to be up to date before merging**.
3. **Add checks**: `checks`, with the source set to **GitHub Actions**, so no other app can set that status.
4. Leave the existing rules as they are, and check that the bypass list is still empty.
5. Save, then merge the PR.

The PR body lists these same steps.

## Commits

My call, one logical change each:

1. `docs: design and plan the CI checks` stages `superpowers/26-ci-checks/design.md` and `plan.md`.
2. `ci: check every pull request` stages `.github/workflows/ci.yml`.
3. `chore: keep dependencies current with Dependabot` stages `.github/dependabot.yml`.
4. `docs: exempt Dependabot PRs from the issue workflow` stages the ADR, the ADR index, `AGENTS.md` and `docs/how-to/development-workflow.md`.

## Ticking the "Done when" items

My call, following the order the issue sets (the PR's CI run, then the rule, then the merge):

- **Before opening the PR:** tick the Dependabot item, based on `dependabot.yml` (both ecosystems, `prefix: chore`) and the docs, which say the prefix also sets the PR title and the colon is added. Tick the ADR and docs item, and the pinning, token and timeout item, from the files.
- **After the PR's first CI run:** tick the CI-job item once the PR shows one green job named `checks` with all eight steps.
- **After the owner adds the rule:** read the ruleset with a read-only `gh api repos/<owner>/<repo>/rulesets/<id>` call, confirm the status-check rule (`checks`, strict, GitHub Actions source), the existing PR rule and the empty bypass list, then tick the ruleset item. Then the owner merges.
- The PR body says how each item was checked. The post-merge look at Dependabot's config status is an extra check, not a "Done when" item, so it doesn't block the merge.

## Testing

No app code changes, so no new unit tests. Instead:

- Lint both YAML files by parsing them, and check every `uses:` against the pattern `owner/repo@<40 hex chars>`.
- Run the five checks locally before committing, as `AGENTS.md` requires.
- The real test is the PR itself: it must show one job named `checks`, with all eight steps green.
- Dependabot validates `dependabot.yml` once it's on the default branch. After the merge, its Insights → Dependency graph → Dependabot tab shows both ecosystems with no config errors. This is checked after the merge, so the PR notes it as a follow-up.

## Left to the builder

- The exact wording of the ADR body and the new how-to section, within what's above.
- The workflow's comment text and YAML key order.
