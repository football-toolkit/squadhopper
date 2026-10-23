# Design: replace app-specific examples with generic ones

Issue: #18 (Task). Branch and change key: `18-generic-examples`.

## Intent

Examples should show the format, not hint at planned features. The current examples (`clash-days`, `add match list`) read like features the app might get, so readers can take them as plans.

## Goals

Issue #18's "Done when" list:

- [ ] No app-specific example is left outside `superpowers/` and `openspec/config.yaml` (check with `git grep -n -i -E "clash|match list|20-"`).
- [ ] All 3 issue forms show the new example, `short-change-name`.

## Non-goals

- Leave the `superpowers/` history and `openspec/config.yaml` unchanged.
- No other wording changes in the touched files.
- No ADR: no technical choice is involved.

## Changes

### 1. Issue forms

In the Slug field of `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml` and `task.yml`, change `(e.g. clash-days)` to `(e.g. short-change-name)`.

### 2. Change-key table in `docs/how-to/development-workflow.md`

Use issue #42 with Slug `short-change-name`, and update every row:

| Where | Example for Feature #42, Slug `short-change-name` |
| --- | --- |
| Branch | `42-short-change-name` |
| Superpowers folder | `superpowers/42-short-change-name/` |
| OpenSpec change | `openspec/changes/42-short-change-name/` |

The header keeps "Feature", because the OpenSpec row only applies to Features.

### 3. Commits section of `AGENTS.md`

- Example commit: `feat: add match list` becomes `docs: fix typo in README`.
- Imperative mood: "add match list" / "added match list" becomes "fix typo" / "fixed typo".

## Testing

This command must print nothing:

```bash
git grep -n -i -E "clash|match list|20-" -- . ':!superpowers' ':!openspec/config.yaml' ':!.claude/skills' ':!.claude/commands'
```

Also, `git grep -n "short-change-name" -- .github/ISSUE_TEMPLATE/` must show all 3 forms.
