# SquadHopper

All your football matches in one place.

No code or tech stack is set up yet. When one is, add the build, test, and lint commands to this file.

## General

- Write in English: code, comments, docs, commit messages, issues and pull requests.
- The repo is public. Never commit personal data, secrets, API keys, or credentials. Use environment variables and keep them out of git.
- Ask before running any command that changes GitHub or the remote, such as `git push`, `gh issue`, `gh pr`, or `gh repo`.

## Workflow

- Every change starts from a GitHub issue. Use the issue templates in `.github/ISSUE_TEMPLATE/`.
- Never commit directly to `main`. Branch from an up-to-date `main` and name the branch `<issue-number>-<short-slug>`, e.g. `1-dev-workflow`.
- Keep each branch to one issue. If you find unrelated work, open a new issue for it.
- Open a pull request into `main` using `.github/pull_request_template.md`, and link the issue with `Closes #<issue-number>`.
- Pull requests are squash-merged, so write the PR title like a commit subject (see Commits below).
- Merge only after the PR checklist is complete.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>: <subject>`, e.g. `feat: add match list`.

- Types:
  - `feat`: a new feature
  - `fix`: a bug fix
  - `docs`: documentation only
  - `chore`: maintenance, config, or tooling
  - `ci`: CI configuration
  - `test`: adding or updating tests
  - `refactor`: a code change that neither fixes a bug nor adds a feature
- Write the subject in the imperative mood ("add match list", not "added match list").
- Keep the whole first line at most 72 characters, with no trailing period.
- Use the body to explain why, when that isn't obvious from the change.
- Make each commit one logical change.

## Code

- Follow the conventions already in the surrounding code.
- Add or update tests with every behavior change, once a test setup exists.
- Update `README.md` and `AGENTS.md` when setup steps or conventions change.

## Decisions and docs

- When a change involves a significant technical choice, add an ADR in the same PR. See [docs/explanation/decisions/](docs/explanation/decisions/README.md).
- To write one, copy `docs/explanation/decisions/templates/adr.md` to the next free number, e.g. `0003-short-title.md`, and add it to the index.
- Never rewrite an accepted ADR. To change a decision, write a new ADR and mark the old one `superseded by NNNN`.
- Every folder under `docs/` has a `README.md`.
