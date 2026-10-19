---
status: accepted
date: 2026-10-19
decision-makers: repository owner
---

# 0004: Use an issue-driven workflow with squash merges and Conventional Commits

## Context and problem statement

Changes to the project need a consistent path to `main`. The workflow should make it clear why each change was made and keep the history clean enough to build on later.

## Considered options

1. Commit directly to `main`
2. Branches and pull requests without issues
3. **Issue → branch → pull request**

## Decision outcome

Chosen option: **"Issue → branch → pull request"**:

- Every change starts from an issue, typed Bug, Feature, or Task by the issue forms.
- One branch per issue, named `<issue-number>-<short-slug>`.
- A pull request closes the issue.
- Pull requests are squash-merged, so each one becomes one commit on `main`.
- Pull request titles and commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), so the history can later drive automated releases and changelogs.

### Consequences

- Good, because every change on `main` traces back to an issue and a reason.
- Bad, because small changes carry some overhead.

### Confirmation

- The issue forms and pull request template in `.github/`.
- The "Workflow" and "Commits" sections of `AGENTS.md`.
- The squash-only merge setting.
