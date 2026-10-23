# Design: define when a change needs an ADR

Issue: #22 (Task). Branch and change key: `22-adr-criteria`.

## Intent

The rule says to add an ADR for a "significant technical choice", but all our ADRs are about how we work. So #16's decision (stage files by explicit path) got no ADR. Its "no ADR" call sat unseen in its design. The rule should cover choices about the code and about how we work, and say what "significant" means. The PR should also show the ADR call, where the reviewer sees it.

## Goals

Issue #22's "Done when" list:

- [ ] The three places use the new rule and definition
- [ ] The PR template has the ADR checklist item
- [ ] ADR 0008 "Stage files by explicit path" is accepted and in the index

## Non-goals

- No change to the decisions README's "fill it in when the decision is made" step. ADR 0008 explains its own exception.
- ADR 0001 isn't superseded. It already says ADRs are "for important decisions only" and doesn't limit them to technical ones.
- No ADRs for earlier changes other than #16.

## Changes

### 1. The rule, in three places

Use the same wording in each place, adapted to the sentence around it:

> Add an ADR in the same PR when the change makes a significant choice, about the code or about how we work. A choice is significant when the change chose between real alternatives, and it's costly to undo or someone will later ask why.

- `AGENTS.md`, Decisions and docs: replace the first bullet.
- `docs/how-to/development-workflow.md`, step 4: replace the last sentence, and keep the link to Decisions.
- `openspec/config.yaml`, `operations.apply.guidance`: replace "Record significant technical choices as ADRs in docs/explanation/decisions/."

### 2. PR template

Add to `.github/pull_request_template.md`'s checklist, after the Docs item:

```markdown
- [ ] An ADR was added, or the Summary says why none is needed
```

### 3. ADR 0008: Stage files by explicit path

Write `docs/explanation/decisions/0008-stage-files-by-explicit-path.md`, starting from the template.

- Front matter: `status: accepted`, `date: 2026-10-22` (when #16 merged).
- Context: the repo is public. Staging everything can commit stray or local files by accident, and agent sessions and plans have repeatedly used `git add -A`.
- Options:
  1. Stage everything and rely on `.gitignore` and review.
  2. Explicit paths with a written rule only.
  3. Explicit paths with the written rule plus Claude Code deny rules.
  4. Explicit paths with the written rule plus a hook.
- Chosen: option 3.
- Consequences: the harness blocks the common bulk commands. But deny rules match the command text, so unusual variants can slip past them. The written rule and PR review cover those.
- Confirmation: the Commits section of `AGENTS.md`, and the deny rules in `.claude/settings.json`.
- Pros and cons: option 1 relies on `.gitignore` being complete and on review catching stray files. Option 2 has already failed in practice. Option 4 needs a script to write, test and maintain, which is more than this risk needs (the agent's reasoning, put to the owner, who didn't object).
- More information: recorded later, on 2026-10-23, in #22, for the decision made in #16 (PR #17). Links to related ADRs 0004 and 0005.

Add it to the "How we work" group in `docs/explanation/decisions/README.md`.

## Testing

No test setup. Check by reading:

- `grep -rni "significant technical choice" AGENTS.md docs/how-to openspec/config.yaml` finds nothing, and all three files have the new rule. Accepted ADR 0005 keeps its "Significant technical choices still get an ADR" line, which the wider rule still covers.
- `openspec/config.yaml` still parses: `python3 -c "import yaml; yaml.safe_load(open('openspec/config.yaml'))"`. (`openspec validate --all` has nothing to validate yet, so it can't catch a broken config.)
- The ADR has every section of the template, and the index link resolves.
