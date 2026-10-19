---
status: accepted
date: 2026-10-19
decision-makers: repository owner
---

# 0003: Host the code in a public repository in a GitHub organization, locked down

## Context and problem statement

This project needs a home on GitHub. The choice of visibility and owner affects where the app can be deployed for free, which security tooling is available, and how the project is kept apart from personal work.

## Considered options

1. A private repository
2. A public repository in a personal account
3. **A public repository in an organization**

## Decision outcome

Chosen option: **"A public repository in an organization"**, because:

- the free plan of the intended host (Vercel Hobby) can't deploy private organization repositories;
- public repositories get security features for free: secret scanning, push protection, Dependabot alerts and updates, code scanning, and private vulnerability reporting;
- an organization keeps the project separate from the personal account.

The repository is locked down:

- Only the owner can write.
- Issues and pull requests can be opened by collaborators only.
- `main` is protected: no deletion, no force push, linear history.
- Pull requests are squash-merged only.
- Two-factor authentication is required in the organization.
- GitHub Actions are limited to actions by GitHub and verified creators, pinned to a full commit SHA, with a read-only default token.

### Consequences

- Good, because everyone can read the code, and the security tooling is free.
- Bad, because everything committed is public and may be archived permanently, so secrets and personal data must never be committed.

### Confirmation

- The repository and organization settings.
- The "General" rules in `AGENTS.md`.
