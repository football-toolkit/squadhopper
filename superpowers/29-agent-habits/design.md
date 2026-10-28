# Design: write the standing session habits into AGENTS.md

Issue: #29 (Task). Branch and change key: `29-agent-habits`.

## Intent

Session prompts keep repeating two instructions that aren't in `AGENTS.md`. Written down once, they apply to every session, and a prompt can shrink to "Work on issue #N."

## Goals

Issue #29's "Done when" list:

- [ ] `AGENTS.md` has the verify-before-designing rule
- [ ] `AGENTS.md` has the short-output rule
- [ ] No other file changes, except this change's `superpowers/` folder

## Non-goals

- No change to the Next.js docs rule under Code. It stays, as the issue says.
- No ADR: this writes down habits already in use, with no real alternative weighed.

## Verification against the docs

Before this design, the issue's rules were checked against the official docs:

- The short-output rule first said `git status` and `git diff --stat`. Per the [git-diff docs](https://git-scm.com/docs/git-diff), `git diff` with no commit compares the working tree to the index, so after a commit it prints nothing. The owner chose `git show --stat`, which shows the commit just made, and the issue was updated.
- Claude Code loads `AGENTS.md` through the `@../AGENTS.md` import in `.claude/CLAUDE.md`. Per the [memory docs](https://code.claude.com/docs/en/memory), import paths resolve relative to the importing file, so the rules reach every session.

## Changes

### `AGENTS.md`

Add a last bullet under Implementation:

> - Before designing, check what the issue relies on (tools, versions, settings, limits) against the current official docs. If the issue is wrong or out of date, stop and tell the repository owner before designing.

Add a last bullet under Commits, after the staging rule:

> - After each commit, show the repository owner only `git show --stat`. The repository owner reviews the full diff on the PR.

"Repository owner" (not the issue's "owner") matches the term `AGENTS.md` already uses.

## Testing

No code changes. Run the pre-commit checks from `AGENTS.md` and confirm `git status` lists only `AGENTS.md` and `superpowers/29-agent-habits/`.
