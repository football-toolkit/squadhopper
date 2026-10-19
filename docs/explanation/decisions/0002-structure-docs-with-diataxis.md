---
status: accepted
date: 2026-10-19
decision-makers: repository owner
---

# 0002: Structure the documentation with Diátaxis, with a landing page in every folder

## Context and problem statement

Readers need different things at different moments: learning the setup, doing one task, looking up a fact, or understanding a design. The project's docs need a structure that keeps these apart and stays easy to navigate as the project grows.

## Considered options

1. **Diátaxis**
2. A flat `docs/` folder

## Decision outcome

Chosen option: **"Diátaxis"**: it separates the four reader needs and is widely adopted.

- `docs/` has up to four top folders: `tutorials/`, `how-to/`, `reference/`, `explanation/`.
- **Every folder has a `README.md`**: a short overview, a table of contents and "where next" links.
- About 7 entries per list; larger folders are split into topic subfolders.
- **No empty structure:** a folder is created together with its first real page.
- `explanation/decisions/` stays flat (ADR numbers are permanent IDs); its index groups them by topic. Only the ADR template lives in a subfolder, `templates/`.
- File names are kebab-case; number prefixes only where order matters (tutorial steps, ADRs).

### Consequences

- Good, because each page has one job, and readers know where to look.
- Bad, because every new folder needs its landing page.

### Confirmation

`AGENTS.md` states the rule that every docs folder has a `README.md`, and pull request review checks it.

## More information

- Diátaxis: <https://diataxis.fr>
