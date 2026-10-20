# Decisions (ADRs)

Every important choice in this repo, **why** it was made, and which alternatives were rejected. Each decision is an **ADR** (Architecture Decision Record) in the [MADR](https://adr.github.io/madr/) format, as decided in [0001](0001-record-decisions-with-madr.md).

## Contents

### How we work

| ADR | Decision |
| --- | --- |
| [0001](0001-record-decisions-with-madr.md) | Record decisions as ADRs, using MADR |
| [0002](0002-structure-docs-with-diataxis.md) | Structure docs with Diátaxis, with a landing page in every folder |
| [0003](0003-public-repo-in-an-organization.md) | Host the code in a public repository in a GitHub organization, locked down |
| [0004](0004-issue-driven-workflow.md) | Use an issue-driven workflow with squash merges and Conventional Commits |
| [0005](0005-implement-every-change-through-superpowers.md) | Implement every change through Superpowers |

## Writing a new ADR

1. Copy [templates/adr.md](templates/adr.md) to `NNNN-short-title.md` in this folder, using the next free number.
2. Fill it in **when the decision is made**, not later, and add it in the same pull request as the change.
3. Add it to the right group above.
4. Never rewrite an accepted ADR. To change a decision, write a new ADR and mark the old one `superseded by NNNN`.

This folder stays flat on purpose: ADR numbers are permanent IDs. The grouping above keeps the list readable instead of subfolders. Only the template lives in [templates/](templates/README.md).

## Where next

- ⬆️ [Explanation](../README.md)
- 🏠 [Docs home](../../README.md)
