---
status: accepted
date: 2026-10-21
decision-makers: repository owner
---

# 0007: Write business specs with OpenSpec

## Context and problem statement

A Feature changes what the app does. Without a written spec, the current behavior lives only in the code and in closed issues, and business rules get mixed up with technical detail. Superpowers already owns the technical design and the plan of each change ([0005](0005-implement-every-change-through-superpowers.md)). The project needs a place that says, in business terms, what the app does today.

## Considered options

1. No specs
2. Hand-written specs in `docs/`
3. **OpenSpec's full flow, with business-only artifacts and Superpowers for implementation**

## Decision outcome

Chosen option: **"OpenSpec's full flow, with business-only artifacts and Superpowers for implementation"**, because it keeps a living spec of what the app does (each change's deltas are merged into `openspec/specs/` on archive), while the change's design and tasks stay inside the archived change.

- Features only. Tasks and Bugs don't change the spec, so they skip OpenSpec.
- `openspec/config.yaml` keeps the proposal, specs, design and tasks in business language, with WHEN/THEN scenarios for every requirement.
- `/opsx:apply` hands the change to Superpowers, which writes the technical design and the plan in `superpowers/<key>/`. The OpenSpec change is named after the same key ([0006](0006-one-key-per-change.md)).
- `/opsx:archive` is the last commit before the pull request.
- One active change at a time, across the whole repo.
- OpenSpec is pinned to 1.14.2. Upgrades go through their own issue.

### Consequences

- Good, because there's a current picture of the app's behavior, kept apart from technical detail.
- Bad, because OpenSpec is a young tool with a known issue in how archive merges specs ([Fission-AI/OpenSpec#2033](https://github.com/Fission-AI/OpenSpec/issues/2033)). We mitigate this by pinning 1.14.2, by keeping one active change at a time, and by running `openspec validate --specs` and checking the `openspec/specs/` diff after every archive.

### Confirmation

- `openspec/config.yaml` holds the business-only rules and the Superpowers hand-off.
- The "Business specs" section of `AGENTS.md`.
- Each Feature leaves an archived change under `openspec/changes/archive/`, and its deltas in `openspec/specs/`.

## Pros and cons of the options

### No specs

- Good, because there's nothing to write or maintain.
- Bad, because what the app should do is only in the code and in closed issues, so a Bug can't be told apart from a missing Feature.

### Hand-written specs in `docs/`

- Good, because there's no extra tool, and the format is entirely ours.
- Bad, because nothing ties a spec update to the change that needs it, so the specs drift from the app.
- Bad, because there's no structure for requirements and scenarios, and nothing checks them.

## More information

- OpenSpec: <https://github.com/Fission-AI/OpenSpec>
- The full flow: [Development workflow](../../how-to/development-workflow.md)
- Related: [0005](0005-implement-every-change-through-superpowers.md), [0006](0006-one-key-per-change.md)
