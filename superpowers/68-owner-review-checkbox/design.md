# Replace PR screenshots with an owner review checkbox: design

Issue: #68. Branch: `68-owner-review-checkbox`.

## Intent

Ten screenshots per screen change took a lot of manual work for little value. They repeated the design already attached to the issue, and the real check is the owner's review of the preview. One checkbox in the PR template records that review on every PR, at the cost of one click.

## Checked against the docs

The change relies only on GitHub task lists in a PR body (`- [ ]`), which anyone with write access can tick on GitHub. Nothing version-dependent. The issue is accurate.

## Goals

- `AGENTS.md` and `docs/how-to/development-workflow.md` no longer ask for screenshots.
- The PR template ends with the owner's review checkbox, and `AGENTS.md` says only the owner ticks it.
- A new accepted ADR, in the index, and ADR 0013 has an "Amended by" line.

## Non-goals

- Screenshots taken automatically in CI (considered in the ADR, not worth it for now).
- The bug report form's optional "Screenshots, logs, or links" field stays.
- Dependabot PRs don't use the checklist (ADR 0010), so nothing changes for them.
- Accepted ADRs aren't rewritten. ADR 0014 says screens are checked "on the preview and in screenshots"; it stays as it is. ADR 0013 gets only the "Amended by" line.
- Past `superpowers/` folders stay as they are: they record what was planned then.

## Approaches

The issue settles the approach, and the owner approved it in the conversation: a checkbox the owner ticks, instead of screenshots by hand (today) or screenshots taken in CI (Playwright `toHaveScreenshot`, a hosted service such as Argos, Percy or Chromatic, or CI uploads). The ADR records the trade-offs.

## Changes

### `.github/pull_request_template.md`

Add as the last Checklist item, worded exactly as in the issue:

```
- [ ] The repository owner reviewed this PR, and its Vercel preview at phone (390 px) and desktop (1280 px) widths if it changes what the app shows or does
```

### `AGENTS.md`

- Screen design: remove the **Record** bullet.
- Workflow: after "When a PR changes what the app shows or does, the repository owner reviews its Vercel preview before merging", add a bullet saying every PR ends with the owner's review checkbox, which only the repository owner ticks, on GitHub, after reviewing; an agent never ticks it.

### `docs/how-to/development-workflow.md`

- Step 7: remove "For a Feature that adds or changes screens, attach the first screenshots when opening the pull request (see Screen design)." (My call: the issue names step 5, the table row and the attach/replace paragraphs, but this sentence also asks for screenshots, and the first "Done when" item needs it gone.)
- Step 8: say the owner reviews the preview at phone (390 px) and desktop (1280 px) widths, and ticks the review checkbox at the end of the PR checklist once they've reviewed the PR. Docs-only and workflow PRs skip the preview, but not the checkbox. An agent never ticks it.
- Step 9: "the pull request checklist is complete" already covers the checkbox; add "including the owner's review checkbox" so it's explicit.
- Screen design: remove step 5 ("Record with screenshots"), the Screenshots row of the table, the `--attach` paragraphs and code block, the "replace a screenshot" paragraph, and the closing "So the screenshots are a record" paragraph. Step 4 points at step 8, which now holds the widths.

### New ADR `docs/explanation/decisions/0021-record-the-owners-review-with-a-checkbox.md`

- Title: "0021: Record the owner's preview review with a checkbox, not screenshots". Status accepted, dated 2026-11-19.
- Amends step 5 ("Record") of 0013. The record of the agreed look stays the design attached to the issue (pictures and HTML reference, as on #38 and #65).
- Options: screenshots by hand; screenshots taken in CI (Playwright `toHaveScreenshot`, a hosted service such as Argos, Percy or Chromatic, or CI uploads); a checkbox the owner ticks. Chosen: the checkbox.
- Confirmation: the PR template's last item, and merged PRs have it ticked.
- Added to the index under "How we work".

### `docs/explanation/decisions/0013-design-screens-in-code.md`

One line under the title, in 0011's format: "Amended by [0021](0021-record-the-owners-review-with-a-checkbox.md): replaces the screenshot record with the owner's review checkbox."

## Checks

- `grep -n -i screenshot AGENTS.md docs/how-to/development-workflow.md` finds nothing.
- `npm run format:check` (covers config files only, but the PR rules run it), plus the usual `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.
- The PR for this change has the new checkbox, left unticked by the agent.

## Left to the builder

The exact wording of the ADR's context, drivers and pros and cons, in the voice of the existing ADRs.
