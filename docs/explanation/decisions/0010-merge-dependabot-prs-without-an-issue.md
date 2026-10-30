---
status: accepted
date: 2026-10-28
decision-makers: repository owner
---

# 0010: Merge Dependabot PRs without an issue

## Context and problem statement

[0004](0004-issue-driven-workflow.md) says every change starts from an issue, [0005](0005-implement-every-change-through-superpowers.md) that every change goes through Superpowers, and [0006](0006-one-key-per-change.md) that every change has a key. Dependabot opens its own PRs, with its own branch names: weekly version updates, set up in #26, and security updates, which were already enabled. It can't follow any of those rules, so the project needs to decide how its PRs reach `main`.

## Decision drivers

- Little manual work per update.
- Every code change we write is still traced to an issue.
- Security fixes land quickly.

## Considered options

1. An issue for every update
2. **Exempt Dependabot PRs**
3. Security updates only

## Decision outcome

Chosen option: **"Exempt Dependabot PRs"**, because it keeps dependencies and the pinned action SHAs current at little cost, and CI still checks every update before it merges.

- The exemption covers all Dependabot PRs, both version updates and security updates.
- They need no issue, change key or Superpowers folder, and they skip the PR template checklist.
- The bar to merge is a green CI run plus the owner's review.
- The `chore` commit message prefix makes their titles, and so their squash commits, Conventional Commits (`chore: bump …`).

Scope of the exemption: it covers only Dependabot's own diff. If a bot PR fails CI and needs code or config changes beyond the bump, typically for a major version, the owner closes it and does the upgrade as a normal Task, with an issue, key and Superpowers folder. Nobody pushes to a Dependabot branch. Pushing the fixes onto the bot's branch was rejected, because code changes would then reach `main` with no issue behind them, and Dependabot stops maintaining a PR once someone else pushes to it.

### Consequences

- Good, because dependencies and security fixes land at little cost.
- Good, because every change we write ourselves still starts from an issue.
- Bad, because some commits on `main` have no issue behind them. The bot's PR, linked from the squash commit, explains them instead.

### Confirmation

- `.github/dependabot.yml`.
- The Dependabot bullet in the Workflow section of `AGENTS.md`, and the "Dependency updates" section of the [development workflow](../../how-to/development-workflow.md).

## Pros and cons of the options

### An issue for every update

The owner opens an issue for each bot PR, then recreates the PR from a keyed branch.

- Good, because the workflow keeps no exception.
- Bad, because every bot PR turns into manual work, and the result is the same diff.

### Security updates only

Turn off version updates, and keep only Dependabot security updates.

- Good, because there are far fewer bot PRs.
- Bad, because the pinned action SHAs and dependencies go stale between security fixes.
- Bad, because the security PRs still need either an issue each or an exemption.

## More information

- Related: [0004](0004-issue-driven-workflow.md), [0005](0005-implement-every-change-through-superpowers.md), [0006](0006-one-key-per-change.md)
