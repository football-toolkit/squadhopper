---
status: accepted
date: 2026-10-19
decision-makers: repository owner
---

# 0001: Record architecture decisions as ADRs, using the MADR template

## Context and problem statement

SquadHopper is designed through discussion: options are compared and reasons given. So far those reasons only exist in chat. Without a record, the code shows *what* was built but not *why*, and the same questions get asked again.

## Considered options

1. **ADRs using MADR**
2. No records, or free-form notes in the README

## Decision outcome

Chosen option: **"ADRs using MADR"**: a widely used Markdown ADR template, and it records the rejected options, not only the winner.

- One decision per file: `docs/explanation/decisions/NNNN-short-title.md`, numbered in the order decisions are recorded.
- New ADRs start as a copy of `templates/adr.md`.
- An ADR is **never rewritten** once merged into `main`. A changed decision gets a new ADR, and the old one becomes `superseded by NNNN`. Before the merge, on its branch, it may be revised freely.
- Allowed edits after the merge: typos, broken links and moved paths, and dated **Update** notes for factual corrections.
- Decisions get their ADR **when they're made**, in the same pull request as the change.

### Consequences

- Good, because the reasoning survives lost chats, and each ADR is a short lesson on one topic.
- Bad, because writing ADRs takes time; they're for important decisions only.

### Confirmation

The index in [README.md](README.md) lists every ADR. Template: [templates/adr.md](templates/adr.md). `AGENTS.md` tells people and coding agents when to add one.

## More information

- MADR: <https://adr.github.io/madr/>
