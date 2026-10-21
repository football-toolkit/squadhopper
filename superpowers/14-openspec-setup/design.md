# Design: set up OpenSpec for business specs

Issue: #14 (Task). Branch and change key: `14-openspec-setup`.

## Intent

Features need a living business spec of what the app does, kept apart from technical design. OpenSpec keeps that spec: each Feature describes its business change, and archiving the change merges it into `openspec/specs/`. Superpowers keeps owning the technical design, the plan and the build ([ADR 0005](../../docs/explanation/decisions/0005-implement-every-change-through-superpowers.md)). This change installs OpenSpec, configures it so its artifacts stay in business language and hand implementation to Superpowers, and writes the Feature path into the rules, the guide, the Feature form and a new ADR.

## Goals

Issue #14's "Done when" list, which these goals cover in full:

- [ ] OpenSpec is initialized and its Claude Code commands are committed
- [ ] `config.yaml` holds the business-only rules and the Superpowers hand-off
- [ ] AGENTS.md and the guide describe the Feature path without "once set up" markers
- [ ] AGENTS.md and the guide require ticking "Done when" items before the PR
- [ ] The Feature form explains what to write in each field
- [ ] ADR 0007 is accepted and in the index

## Non-goals

- No business specs or OpenSpec changes yet. `openspec/specs/` and `openspec/changes/` stay empty apart from what `openspec init` creates.
- No CI. The "once CI exists" markers stay as they are.
- No changes to accepted ADRs. ADR 0006 still says "once OpenSpec is set up"; ADR 0007 supersedes nothing, it adds to 0005 and 0006.
- No edits to the files `openspec init` generates (commands and skills), apart from `openspec/config.yaml`.
- No changes to the Bug and Task forms or the PR template.
- No upgrade of OpenSpec. It stays at 1.14.2, which is already installed globally with telemetry off.

## Anti-goals

- `openspec init` must not change `AGENTS.md` or `.claude/CLAUDE.md` without the owner's OK. If it does, stop, restore them, and ask.
- OpenSpec artifacts must not drift into technical design. That belongs to Superpowers.

## Changes

### 1. Initialize OpenSpec

Run `openspec init --tools claude` (the owner's exact command) at the repo root, with the default (core) profile: propose, explore, apply, update, sync, archive. Then show the owner the list of files it created or changed, using `git status --porcelain --untracked-files=all`, before going on. If `AGENTS.md` or `.claude/CLAUDE.md` is in that list, restore it with `git checkout -- <file>` and ask the owner before continuing.

### 2. `openspec/config.yaml`

Keep `schema: spec-driven` (and anything else init writes that the schema needs). Set:

- `context`: two or three lines. A personal app that shows one calendar of the owner's football matches across several teams and flags days with clashes. The repo is public, so no personal data.
- `rules` (keys `proposal`, `specs`, `design`, `tasks`, which are the artifact IDs of the `spec-driven` schema):
  - all four: business language only, with no technology, libraries, data structures, APIs or code;
  - `proposal`: "Impact" means business impact;
  - `specs`: every requirement has at least one WHEN/THEN scenario;
  - `design`: describes user flows, business rules and edge cases;
  - `tasks`: each task is a user-visible outcome linked to its scenarios.
- `operations.apply.guidance` (a list of strings):
  - implement the change through Superpowers: one technical design and one plan for the whole change, in `superpowers/<key>/` (`design.md`, `plan.md`);
  - plan steps map to the tasks in `tasks.md`;
  - test first, from each task's scenarios;
  - code review;
  - record significant technical choices as ADRs;
  - tick a task in `tasks.md` only when its scenarios pass.
- `operations.archive.guidance`:
  - one active change at a time;
  - archive as the last commit before the PR;
  - after archiving, run `openspec validate --specs` and show the owner the `openspec/specs/` diff.

Exact wording is the builder's, short and imperative. The schema accepts only `guidance` under each operation, and only `apply` and `archive` as operations.

### 3. `AGENTS.md`

- **New "Business specs" section** (placed just before "Implementation", my call):
  - Features only.
  - Optionally, once the branch exists, run `/opsx:explore` to settle open business questions.
  - Run `/opsx:propose` with the change name set to the change key.
  - The owner reviews the proposal, specs, design and tasks.
  - Then `/opsx:apply`. Superpowers settles the technical design.
  - Then `/opsx:archive`, before the PR.
  - One active change at a time, across the whole repo: never two Feature branches with an open OpenSpec change. This is the owner's decision. It avoids two branches archiving into the same spec files ([Fission-AI/OpenSpec#2033](https://github.com/Fission-AI/OpenSpec/issues/2033)).
  - OpenSpec is pinned to 1.14.2. Upgrades go through their own issue. How to install it: see `README.md`.
- **Workflow section**, new bullet. This is the owner's wording, extended to Features at the owner's request: "Before opening the PR, tick each 'Done when' item in the issue (the Acceptance criteria, for a Feature) that the change meets (with `gh issue edit`), and note in the PR body how each was checked. Don't merge with unticked items: finish them or remove them with a reason." Bugs have no checklist, so there's nothing to tick.
- **Markers removed:**
  - "Features go through OpenSpec (once set up); Tasks and Bugs don't." becomes "Features go through OpenSpec (see Business specs below); Tasks and Bugs don't." (my wording).
  - "Use the key as the OpenSpec change name (once OpenSpec is set up) and …" loses the parenthesis.

### 4. `docs/how-to/development-workflow.md`

- Remove the paragraph "The OpenSpec steps apply once OpenSpec is set up. Until then, …".
- Step 3 (Features: write the business change): drop the marker. Add the optional explore step, `/opsx:explore` once the branch exists, and the propose step, `/opsx:propose` named after the change key, and the owner's review of the proposal, specs, design and tasks.
- Step 4: Features start with `/opsx:apply`, which hands the work to Superpowers.
- Step 5 (archive): drop the marker. Use `/opsx:archive` as the last commit before the PR, then `openspec validate --specs`, and the owner reviews the `openspec/specs/` diff.
- Step 7: add the "Done when" rule (Acceptance criteria included), with the same wording as `AGENTS.md`. Keep its "Once CI exists" sentence.
- State the repo-wide rule of one active OpenSpec change at a time next to the Feature steps.
- Change-key table: "OpenSpec change (once OpenSpec is set up)" becomes "OpenSpec change".
- Mermaid diagram: the Feature node may mention explore and propose. The layout is the builder's call, with every label in double quotes.
- The Feature row of the type table may add "(explore optional)". Builder's call.
- Link ADR 0007 from "Where next" (my call).

### 4a. `README.md`: install OpenSpec

At the owner's request, add a short "Setup" section to `README.md` (between "Documentation" and "Contributing", my call):

- OpenSpec needs Node.js 20.19.0 or higher (from its `engines` field).
- Install the pinned version: `npm install -g @fission-ai/openspec@1.14.2`.
- Check it: `openspec --version` prints `1.14.2`.
- Turn telemetry off: `openspec config set telemetry.enabled false`.
- Superpowers needs no install: `.claude/settings.json` turns it on for Claude Code.

The builder checks each command against the installed CLI before writing it down. The project name still appears only in the title.

### 4b. `superpowers/README.md`

At the owner's request, "Business specs live in `openspec/` (once set up)" loses "(once set up)" and links to `openspec/`, so it reads `Business specs live in [openspec/](../openspec/)`.

### 5. Feature form (`.github/ISSUE_TEMPLATE/feature_request.yml`)

Field descriptions only (owner's wording):

- Problem: "1–3 sentences, from the user's point of view"
- Proposed solution: "What the user should see or be able to do. No technology. Write 'to be explored' if unclear"
- Acceptance criteria: "2–5 observable checks, as checkboxes"

The ids, labels, required flags, placeholder and other fields don't change.

### 6. ADR 0007

`docs/explanation/decisions/0007-write-business-specs-with-openspec.md`, from the template:

- Title: "0007: Write business specs with OpenSpec". `status: accepted`, `date: 2026-10-21`, `decision-makers: repository owner`.
- Context: Features change what the app does. Without a written spec, the current behavior lives only in code and closed issues, and technical detail mixes with business rules.
- Considered options: no specs; hand-written specs in `docs/`; OpenSpec's full flow with business-only artifacts and Superpowers for implementation.
- Chosen: OpenSpec, because it keeps a living spec of what the app does (deltas are merged on archive), while the design and tasks stay inside the archived change.
- Consequences: good, there's a current picture of the app's behavior, kept apart from technical detail. Bad, it's a young tool with a known archive-merge issue ([Fission-AI/OpenSpec#2033](https://github.com/Fission-AI/OpenSpec/issues/2033)), mitigated by pinning 1.14.2, one active change at a time across the repo, and checking the specs diff after archiving.
- Confirmation: `openspec/config.yaml`, the "Business specs" section of `AGENTS.md`, and archived changes under `openspec/changes/archive/`.
- Pros and cons for the two rejected options, written briefly by the builder.
- More information: links to 0005 and 0006, OpenSpec's repo, and the guide.
- Index: a new row under "How we work" in `docs/explanation/decisions/README.md`.

## Constraints

- Follow `AGENTS.md`: English, no personal data, the project name only in the `README.md` title, every `docs/` folder has a `README.md`.
- Match the tone and layout of the existing docs and ADRs: short sentences and terse bullets.
- One commit at the end, `chore: set up OpenSpec for business specs` (my call). Then show the owner only `git status` and `git diff --stat` for that commit.
- Ask the owner before ticking the issue's "Done when" items, before pushing, and before opening the PR.

## Verification

There's no test setup, so the checks are manual or scripted:

- `openspec/config.yaml` loads without warnings, and `openspec instructions` shows the context, rules and guidance. Check this on a throwaway copy of the repo, so no test change lands in this one.
- `openspec validate --specs` runs cleanly on the empty specs.
- The Feature form YAML parses, and only the three descriptions changed.
- No "once OpenSpec is set up" or "once set up" marker is left in `AGENTS.md` or the guide. The "Once CI exists" markers are still there.
- All relative links in the changed Markdown resolve.
- `AGENTS.md` and `.claude/CLAUDE.md` weren't touched by `openspec init`.
- The project name appears only in the `README.md` title.

## Left to the builder

The exact wording of the docs and config, the guide's diagram layout, and the order of bullets inside the new section.

## Owner's answers after the builder check

- The "Done when" rule also covers a Feature's Acceptance criteria.
- One active change at a time means across the whole repo. It goes in the config, `AGENTS.md`, the guide and the ADR.
- The OpenSpec install is documented in `README.md`.

At design approval, the owner added:

- Also remove "(once set up)" from `superpowers/README.md`.
- The README Setup section states that OpenSpec needs Node.js 20.19.0 or higher.

## My calls (for the owner to check)

- No `.gitkeep` files in the empty `openspec/specs/` and `openspec/changes/` folders. A clone with only `openspec/config.yaml` is still a valid OpenSpec root in 1.14.2.
- The README section is named "Setup", and it sits between "Documentation" and "Contributing".

- "Business specs" sits just before "Implementation" in `AGENTS.md`.
- Commit type `chore`, subject `chore: set up OpenSpec for business specs`.
- ADR 0006's "once OpenSpec is set up" stays, because accepted ADRs aren't rewritten.
