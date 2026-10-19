# SquadHopper

All your football matches in one place.

The project is at an early stage: no tech stack has been chosen yet. When one is, add the build, test, and lint commands to this file.

## Workflow

- Every change starts from a GitHub issue. Use the issue templates in `.github/ISSUE_TEMPLATE/`.
- Never commit directly to `main`. Branch from an up-to-date `main` and name the branch `<issue-number>-<short-slug>`, e.g. `1-dev-workflow`.
- Keep each branch to one issue. If you find unrelated work, open a new issue for it.
- Open a pull request into `main` using `.github/pull_request_template.md`, and link the issue with `Closes #<issue-number>`.
- Pull requests are squash-merged, so write the PR title like a commit subject (see Commits below).
- Merge only after the PR checklist is complete.

## Commits

- Write the subject in the imperative mood ("Add match list", not "Added match list"), at most 72 characters, with no trailing period.
- Use the body to explain why, when that isn't obvious from the change.
- Make each commit one logical change.

## Code

- Follow the conventions already in the surrounding code.
- Add or update tests with every behavior change, once a test setup exists.
- Never commit secrets, API keys, or credentials. Use environment variables and keep them out of git.
- Update `README.md` and `AGENTS.md` when setup steps or conventions change.
