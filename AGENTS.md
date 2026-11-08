# Project rules

All your football matches in one place.

## Commands

The app is built with Next.js on Node 24. Setup steps are in `README.md`.

- `npm run dev`: start the app at http://localhost:3000
- `npm run build`: build the app for production
- `npm test`: run the unit tests once
- `npm run lint`: lint `src/` and the config files
- `npm run typecheck`: check the TypeScript types
- `npm run format`: format `src/` and the config files
- `npm run format:check`: check the formatting without changing files

Before committing, run `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build`. All must pass.

## General

- Write in English: code, comments, docs, commit messages, issues and pull requests.
- Refer to the project as "the project" or "this project". Its name appears only in the `README.md` title.
- The repo is public. Never commit personal data, secrets, API keys, or credentials. Use environment variables and keep them out of git.
- Ask before running any command that changes GitHub or the remote, such as `git push`, `gh issue`, `gh pr`, or `gh repo`.

## Workflow

See [docs/how-to/development-workflow.md](docs/how-to/development-workflow.md) for the full flow.

- Every change starts from a GitHub issue of the right type (see Issue types below). Dependabot PRs are the only exception (see below).
- Never commit directly to `main`. Start from an up-to-date `main` and create the branch from the issue, named after the change key (see Change key below).
- Keep each branch to one issue. If you find unrelated work, open a new issue for it.
- Open a pull request into `main` using `.github/pull_request_template.md`, and link the issue with `Closes #<issue-number>`.
- Pull requests are squash-merged, so write the PR title like a commit subject (see Commits below).
- Before opening the PR, tick each 'Done when' item in the issue (the Acceptance criteria, for a Feature) that the change meets (with `gh issue edit`), and note in the PR body how each was checked. Don't merge with unticked items: finish them or remove them with a reason.
- Merge only after CI is green and the PR checklist is complete.
- When a PR changes what the app shows or does, the repository owner reviews its Vercel preview before merging.
- Dependency PRs opened by Dependabot, both version updates and security updates, need no issue, change key, Superpowers folder or PR checklist. The repository owner reviews them and merges them once CI is green. If one needs code or config changes beyond the bump, close it and do the upgrade as a Task. Never push to a Dependabot branch. See [ADR 0010](docs/explanation/decisions/0010-merge-dependabot-prs-without-an-issue.md).

### Issue types

- **Feature**: changes what the app does (its business spec changes).
- **Bug**: the app doesn't do what its spec says.
- **Task**: everything else (the spec doesn't change, and there's no defect).

Features go through OpenSpec (see Business specs below); Tasks and Bugs don't.

### Creating issues

1. Pick the type and read its form in `.github/ISSUE_TEMPLATE/`.
2. Write the body with one `### <label>` heading per form field, in the form's order. Fill every required field, including Slug.
3. Show the repository owner the title, type and body first.
4. Then run `gh issue create --type <Type> --title "…" --body-file <file> --assignee @me`.

No personal data in issues.

### Change key

- Every change has one key, `<issue-number>-<slug>`, e.g. `12-dev-workflow` (Dependabot PRs excepted, see Workflow).
- The slug comes from the issue's Slug field: 2–4 words, kebab-case. The agent fills it in when creating the issue, and the repository owner approves it.
- Create the branch from the issue, so GitHub links them: `gh issue develop <number> --name <key> --checkout`.
- After that, the key is the branch name. Read it with `git branch --show-current`, and never invent it.
- Never rename the branch. If the key is wrong, delete the branch and recreate it before any work starts. If the slug is what's wrong, fix the issue's Slug first.
- Use the key as the OpenSpec change name and as the Superpowers folder name, `superpowers/<key>/`.

### Big work

- Split the work when it has more than one independently useful outcome, won't fit in one reviewable PR, or touches several independent parts.
- A parent issue takes the type of its overall outcome: Feature if the work as a whole changes what the app does, otherwise Task. Its Slug names the overall work, but no branch uses it.
- The parent issue has no branch or PR. Create each sub-issue with `gh issue create --parent <number>`.
- Each sub-issue follows the normal flow, and its PR closes only that sub-issue.
- Close the parent by hand when the last sub-issue's PR merges.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>: <subject>`, e.g. `docs: fix typo in README`.

- Types:
  - `feat`: a new feature
  - `fix`: a bug fix
  - `docs`: documentation only
  - `chore`: maintenance, config, or tooling
  - `ci`: CI configuration
  - `test`: adding or updating tests
  - `refactor`: a code change that neither fixes a bug nor adds a feature
- Write the subject in the imperative mood ("fix typo", not "fixed typo").
- Keep the whole first line at most 72 characters, with no trailing period.
- Use the body to explain why, when that isn't obvious from the change.
- Make each commit one logical change.
- Stage by explicit path: check `git status`, then `git add <path>…`. Never stage everything with `git add -A`, `git add .`, `git add --all`, or `git commit -a`/`-am`/`--all`; `.claude/settings.json` blocks them. Plans list the paths each commit stages.
- After each commit, show the repository owner only `git show --stat`. The repository owner reviews the full diff on the PR.

## Code

- Follow the conventions already in the surrounding code.
- Add or update tests with every behavior change.
- Put unit tests in a `__tests__/` folder next to the code they test, named after the file, e.g. `src/app/__tests__/page.test.tsx` for `src/app/page.tsx`.
- Next.js changes fast. Before writing Next.js code, check the docs for the installed version in `node_modules/next/dist/docs/`.
- Style with Tailwind classes and the theme variables in `src/app/globals.css`. Add a shadcn/ui component with `npx shadcn add <name>` when a screen first needs it, then run `npm run format`. The `cn()` helper lives at `@/lib/utils`.
- Update `README.md` and `AGENTS.md` when setup steps or conventions change.

## Business specs

- Features only. Tasks and Bugs skip this section.
- Optionally, once the branch exists, run `/opsx:explore` to settle open business questions.
- Run `/opsx:propose` with the change name set to the change key.
- The repository owner reviews the proposal, specs, design and tasks.
- Then run `/opsx:apply`. Superpowers settles the technical design (see Implementation below).
- Then run `/opsx:archive` before opening the PR.
- One active change at a time, across the whole repo: never two Feature branches with an open OpenSpec change.
- OpenSpec is pinned to 1.14.2. Upgrades go through their own issue. To install it, see `README.md`.

## Screen design

The design step for Features that add or change screens. Everything else skips this section.

- **Flows:** the Feature's OpenSpec design describes the screens and the user's path between them, as Mermaid diagrams, in business language.
- **Wireframe, only if the layout is unclear:** the agent or the repository owner can call for one. Sketch it as a Claude Design artifact and agree it with the repository owner. It settles layout only, and isn't stored as a source.
- **Build from the design system:** take colors and fonts only from the theme variables in `src/app/globals.css`, spacing and type sizes only from the theme's scales (Tailwind's defaults, unless `globals.css` overrides them), and components from shadcn/ui. No one-off colors, fonts or spacing, such as `p-[13px]`, `text-[#123456]` or `bg-red-500`. This covers the code we write for screens, not what `npx shadcn add` generates.
- **Review:** the repository owner reviews the screens on the PR's Vercel preview.
- **Record:** the PR includes screenshots of each new or changed screen at phone (390 px) and desktop (1280 px) widths. The agent captures them from `npm run dev` with a browser it can already drive, adding no tooling just for screenshots. If it can't, the repository owner captures them from the preview or a local run. They're publicly reachable, so use invented data only. If the review changes a screen, retake its screenshots and replace the old ones in the PR body.
- See [the how-to guide](docs/how-to/development-workflow.md#screen-design) and [ADR 0013](docs/explanation/decisions/0013-design-screens-in-code.md).

## Implementation

- Implement every change (Feature, Task, or Bug) through the [Superpowers](https://github.com/obra/superpowers) plugin, enabled in `.claude/settings.json` (Dependabot PRs excepted, see Workflow).
- Superpowers saves each change's files in one folder named like its branch, `superpowers/<issue-number>-<short-slug>/`: the technical design as `design.md` and the plan as `plan.md` (not in its default `docs/superpowers/`).
- Before designing, check what the issue relies on (tools, versions, settings, limits) against the current official docs. If the issue is wrong or out of date, stop and tell the repository owner before designing.

## Decisions and docs

- Add an ADR in the same PR when the change makes a significant choice, about the code or about how we work. A choice is significant when the change chose between real alternatives, and it's costly to undo or someone will later ask why. See [docs/explanation/decisions/](docs/explanation/decisions/README.md).
- To write one, copy `docs/explanation/decisions/templates/adr.md` to the next free number, e.g. `0003-short-title.md`, and add it to the index.
- Never rewrite an accepted ADR. To change a decision, write a new ADR and mark the old one `superseded by NNNN`.
- Every folder under `docs/` has a `README.md`.
