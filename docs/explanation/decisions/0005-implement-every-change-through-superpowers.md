---
status: accepted
date: 2026-10-20
decision-makers: repository owner
---

# 0005: Implement every change through Superpowers

## Context and problem statement

Changes to the project are implemented with coding agents. Without a shared process, each change gets a different amount of design, planning, testing, and review. The project needs one consistent way to go from an issue to a reviewed pull request.

## Considered options

1. No fixed process
2. Claude Code plan mode only
3. **Superpowers**

## Decision outcome

Chosen option: **"Superpowers"**, because it gives every change the same discipline (design, plan, test first, code review) and scales the ceremony to the size of the change.

- Every change (Feature, Task, or Bug) is implemented through the [Superpowers](https://github.com/obra/superpowers) plugin, enabled for the project in `.claude/settings.json`.
- Superpowers saves technical designs to `superpowers/specs/` and plans to `superpowers/plans/`. Its default location, `docs/superpowers/`, is overridden so that `docs/` stays pure Diátaxis ([0002](0002-structure-docs-with-diataxis.md)).
- Significant technical choices still get an ADR in the same pull request.

### Consequences

- Good, because work is consistent and reviewable: each change follows the same steps and leaves its design and plan behind.
- Bad, because Superpowers is a fast-moving third-party plugin, so its behavior can change under us.
- Bad, because tiny changes carry some overhead.

### Confirmation

- `.claude/settings.json` enables `superpowers@claude-plugins-official`.
- The "Implementation" section of `AGENTS.md`.
- Designs and plans appear under `superpowers/`, not `docs/superpowers/`.

## More information

- Superpowers: <https://github.com/obra/superpowers>
- Related: [0002](0002-structure-docs-with-diataxis.md), [0004](0004-issue-driven-workflow.md)
