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
| [0006](0006-one-key-per-change.md) | Link issue, branch, specs and plans with one key per change |
| [0007](0007-write-business-specs-with-openspec.md) | Write business specs with OpenSpec |
| [0008](0008-stage-files-by-explicit-path.md) | Stage files by explicit path |
| [0010](0010-merge-dependabot-prs-without-an-issue.md) | Merge Dependabot PRs without an issue |
| [0013](0013-design-screens-in-code.md) | Design screens in code, reviewed on the preview |
| [0015](0015-test-screens-end-to-end-with-playwright-in-ci.md) | Test screens end to end with Playwright in CI |
| [0021](0021-record-the-owners-review-with-a-checkbox.md) | Record the owner's preview review with a checkbox, not screenshots |

### Stack and architecture

| ADR | Decision |
| --- | --- |
| [0009](0009-build-with-nextjs.md) | Build with Next.js |
| [0011](0011-host-the-app-on-vercel.md) | Host the app on Vercel |
| [0012](0012-keep-the-design-system-in-code.md) | Keep the design system in code, with Tailwind CSS and shadcn/ui |
| [0014](0014-ship-one-dark-theme.md) | Ship one dark theme |
| [0016](0016-use-supabase-for-authentication.md) | Use Supabase for authentication |
| [0017](0017-run-in-the-eu-in-frankfurt.md) | Run in the EU, in Frankfurt |
| [0018](0018-pick-the-auth-service-with-app-env.md) | Pick the auth service with `APP_ENV`, and a mock outside production |
| [0019](0019-test-login-against-a-temporary-supabase-in-ci.md) | Test login against a temporary Supabase in CI |
| [0020](0020-show-popups-with-base-ui-toast.md) | Show popups with Base UI Toast |

## Writing a new ADR

1. Copy [templates/adr.md](templates/adr.md) to `NNNN-short-title.md` in this folder, using the next free number.
2. Fill it in **when the decision is made**, not later, and add it in the same pull request as the change.
3. Add it to the right group above.
4. Never rewrite an accepted ADR. To change a decision, write a new ADR and mark the old one `superseded by NNNN`.

This folder stays flat on purpose: ADR numbers are permanent IDs. The grouping above keeps the list readable instead of subfolders. Only the template lives in [templates/](templates/README.md).

## Where next

- ⬆️ [Explanation](../README.md)
- 🏠 [Docs home](../../README.md)
