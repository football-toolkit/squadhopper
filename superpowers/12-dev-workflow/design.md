# Design: define the development workflow end to end

Issue: #12. Branch and change key: `12-dev-workflow`.

## Intent

The workflow so far lives in chat. Write it down so people and agents follow the same steps, from an idea to a merged pull request. The main idea is that every change has **one key**, `<issue-number>-<slug>`. The issue, the branch, the OpenSpec change (once OpenSpec is set up) and the Superpowers folder all share that key, so one search finds everything about a change.

## Goals

- `AGENTS.md` defines the issue types, how to create an issue, the change key, and how to split big work.
- All three issue forms ask for a required Slug and describe their type the same way `AGENTS.md` does.
- A how-to guide describes the full flow, from idea to merge.
- ADR 0006 records the one-key decision.

Issue #12's "Done when" list, which these goals cover in full:

- [ ] AGENTS.md covers types, issue creation, the change key and big work
- [ ] All issue forms have a required Slug field
- [ ] docs/how-to/development-workflow.md describes the full flow and is linked from the docs
- [ ] ADR 0006 is accepted and in the index

## Non-goals

- No CI check yet. The guide marks the key-consistency check "once CI exists".
- No OpenSpec setup. The guide marks the OpenSpec steps "once OpenSpec is set up".
- No changes to accepted ADRs (0004 already requires `<issue-number>-<short-slug>` branches; 0006 adds to it and doesn't supersede it).
- No rewording of places that already say `<issue-number>-<short-slug>` and don't contradict the new rules: the PR template checklist, the `AGENTS.md` Implementation section, and `superpowers/README.md` (my call).

## Changes

### 1. `AGENTS.md`, Workflow section

Add these rules (wording from the issue owner; final phrasing is the builder's, matching the file's terse bullet style):

- **Issue types.** Feature = changes what the app does (its business spec changes). Bug = the app doesn't do what its spec says. Task = everything else (the spec doesn't change, no defect).
- **Creating issues.** Pick the type, read its form in `.github/ISSUE_TEMPLATE/`, and write the body with one `### <label>` heading per form field, in order. Fill every required field, including Slug. Show the owner the title, type and body first, then run `gh issue create --type <Type> --title "…" --body-file <file> --assignee @me`. No personal data in issues.
- **Change key.** Every change has one key, `<issue-number>-<slug>`. The slug comes from the issue's Slug field: 2–4 words, kebab-case, filled in by the agent when it creates the issue and approved by the owner. Don't change it once the branch exists. Create the branch from the issue with `gh issue develop <number> --name <key> --checkout`, so it's linked to the issue. After that, the key is the branch name: read it with `git branch --show-current`, never invent it, and never rename a branch once its PR is open. Use it as the OpenSpec change name (once OpenSpec is set up) and as the Superpowers folder name.
- **Big work.** Split it when it has more than one independently useful outcome, won't fit in one reviewable PR, or touches several independent parts. The parent issue has no branch or PR. Create sub-issues with `gh issue create --parent <number>`. Each sub-issue follows the normal flow and its PR closes only that sub-issue. Close the parent by hand when the last one merges.

The existing bullets "Every change starts from a GitHub issue…" and "Branch from an up-to-date `main` and name the branch `<issue-number>-<short-slug>`" get reworded so they agree with the new rules (the branch is created from the issue with `gh issue develop`, named after the key). Builder's call: keep the bullets that still hold (one issue per branch, PR template, squash merge, checklist).

### 2. Issue forms (`.github/ISSUE_TEMPLATE/*.yml`)

In `feature_request.yml`, `bug_report.yml` and `task.yml`:

- Add a new first field:

  ```yaml
  - type: input
    id: slug
    attributes:
      label: Slug
      description: 2–4 words, kebab-case (e.g. clash-days). The branch will be <issue-number>-<slug>.
    validations:
      required: true
  ```

- Replace the form's top-level `description` with its type definition:
  - Feature: "Change what the app does: its business spec changes."
  - Bug: "The app doesn't do what its spec says."
  - Task: "Everything else: the spec doesn't change and nothing is broken."

  (Exact wording is my call, kept close to the type definitions.)

No other fields change.

### 3. How-to guide

- New `docs/how-to/README.md`, a landing page in the same style as `docs/explanation/README.md` (emoji intro line 🛠️, a Contents table, a "Where next" section).
- New `docs/how-to/development-workflow.md` with:
  - the full flow: issue → branch from the issue → OpenSpec business change (Features only, once OpenSpec is set up) → Superpowers design and plan → OpenSpec archive (Features only, once OpenSpec is set up) → PR → squash merge;
  - a short Mermaid flowchart of that flow (GitHub renders Mermaid; my call over ASCII art);
  - the paths for Feature, Task and Bug: Features go through OpenSpec, while Tasks and Bugs skip it because the spec doesn't change (a Bug brings the app back in line with the spec);
  - the change key, and where it shows up;
  - the big-work split with sub-issues;
  - a key-consistency check, marked "once CI exists": the branch name, the Superpowers folder and the OpenSpec change name match the linked issue's number and Slug.
  - Commands are shown as they'd be run. The guide links to `AGENTS.md` as the source of the rules, instead of copying every rule.
  - The points where the owner approves: the issue draft before `gh issue create`, the branch before `gh issue develop`, and before pushing and opening the PR. These come from the existing General rule ("ask before any command that changes GitHub"). The design and plan approvals are Superpowers' own gates. "Show the diff before committing" isn't in `AGENTS.md`, so the guide doesn't state it as a rule (my call, changed after the final review).
  - A note that `gh issue create --type` and `--parent` need a recent gh CLI. gh 2.45.0 doesn't have them; gh 2.102.0 does (my call, verified on 2026-10-20).
- `docs/README.md`: add a How-to row to the Contents table.

### 4. ADR 0006

`docs/explanation/decisions/0006-one-key-per-change.md`, from the template:

- Title: "0006: Link issue, branch, specs and plans with one key per change".
- `status: accepted`, `date: 2026-10-20`, `decision-makers: repository owner`.
- Considered options: free-form branch and folder names; issue number only; one `<issue-number>-<slug>` key everywhere.
- Chosen: one key, because everything for a change can be found with one search, and GitHub links the branch to the issue.
- Consequences: good, full traceability; bad, it relies on discipline until a CI check enforces it.
- Confirmation: the Slug field in the issue forms; the `AGENTS.md` rules; a CI check later.
- Pros and cons for the two rejected options (builder writes them briefly). More information links to 0004 and 0005.
- Added to the index under "How we work".

## Constraints

- Follow `AGENTS.md`: English, no personal data, the project name only in the `README.md` title, every `docs/` folder has a `README.md`, kebab-case file names.
- Match the tone and formatting of the existing docs and ADRs.
- One commit: `docs: define the development workflow end to end`. Show the diff to the owner before committing, and ask before pushing and before opening the PR.

## Verification

There's no test setup, so checks are manual:

- The YAML forms parse, and `slug` is the first field and required in all three.
- All relative links in the changed Markdown files resolve.
- Each item in the issue's "Done when" list is covered.
- No mention of the project name outside the `README.md` title.

## Changes after the final review

The owner asked for these after reviewing the diff:

- The branch command is `--name <key>` everywhere, and each document defines the key, `<issue-number>-<slug>`, only once.
- "Never rename a branch once its PR is open" becomes "Never rename the branch. If the key is wrong, delete the branch and recreate it before any work starts", in `AGENTS.md`, the guide and ADR 0006. In `AGENTS.md` and the guide, it's followed by "If the slug is what's wrong, fix the issue's Slug first" (my call, so the branch and the Slug stay in step).
- Big work: a parent issue takes the type of its overall outcome (Feature if the work as a whole changes what the app does, otherwise Task). Its Slug names the overall work, but no branch uses it.
- `AGENTS.md` issue types: "Features go through OpenSpec (once set up); Tasks and Bugs don't." The gh version note stays in the guide only.
- The change-key example in the guide is Feature #20, `20-clash-days`.

## Left to the builder

The exact wording of the docs, the guide's section order, and the Mermaid diagram's layout.
