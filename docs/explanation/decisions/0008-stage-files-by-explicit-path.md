---
status: accepted
date: 2026-10-22
decision-makers: repository owner
---

# 0008: Stage files by explicit path, enforced by Claude Code deny rules

## Context and problem statement

The repo is public. Staging everything with `git add -A` and similar commands can commit stray or local files by accident, such as notes, scratch files or environment files that `.gitignore` misses. Coding agent sessions and draft plans have used `git add -A` repeatedly. The project needs a staging rule, and a way to make it stick.

## Decision drivers

- Nothing private or stray may reach the public repo.
- Coding agents do most of the committing, so the rule has to hold for them.
- The guard should take little effort to set up and maintain.

## Considered options

1. Stage everything and rely on `.gitignore` and review
2. Explicit paths with a written rule only
3. **Explicit paths with the written rule plus Claude Code deny rules**
4. Explicit paths with the written rule plus a hook

## Decision outcome

Chosen option: **"Explicit paths with the written rule plus Claude Code deny rules"**, because the harness blocks the common bulk commands with a few lines of settings, and there's no script to maintain.

- Check `git status`, then stage with `git add <path>…`.
- Never use `git add -A`, `git add .`, `git add --all`, `git commit -a`, `git commit -am` or `git commit --all`. `.claude/settings.json` denies them.
- Plans list the paths each commit stages.

### Consequences

- Good, because an agent can't run the common bulk commands, even inside a chained command, since Claude Code checks each part on its own.
- Good, because every staged path was chosen on purpose and shows up in the plan.
- Bad, because deny rules match the command text, so unusual variants can slip past them. The written rule and PR review cover those.
- Bad, because the deny rules only apply in Claude Code. People and other tools rely on the written rule.

### Confirmation

- The staging bullet in the Commits section of `AGENTS.md`.
- The `permissions.deny` list in `.claude/settings.json`.

## Pros and cons of the options

### Stage everything and rely on `.gitignore` and review

- Good, because there's nothing to learn and commits are quick.
- Bad, because it's only safe while `.gitignore` covers every local file, and a reviewer has to spot each stray file in the diff.

### Explicit paths with a written rule only

- Good, because it costs one line in `AGENTS.md`.
- Bad, because it has already failed in practice: agent sessions and plans kept using `git add -A`.

### Explicit paths with the written rule plus a hook

- Good, because a hook can parse the command and catch more variants than text matching can.
- Bad, because it's a script someone has to write, test and maintain, which is more than this risk needs.

## More information

- Recorded on 2026-10-23, in #22, after the fact. The decision was made in #16 and merged in PR #17 on 2026-10-22, before the ADR rule covered choices about how we work.
- Related: [0004](0004-issue-driven-workflow.md), [0005](0005-implement-every-change-through-superpowers.md)
