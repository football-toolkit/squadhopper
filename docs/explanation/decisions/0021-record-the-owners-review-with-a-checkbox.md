---
status: accepted
date: 2026-11-19
decision-makers: repository owner
---

# 0021: Record the owner's preview review with a checkbox, not screenshots

## Context and problem statement

Step 5 ("Record") of [0013](0013-design-screens-in-code.md) asks every pull request that adds or changes screens to include a screenshot of each one at phone (390 px) and desktop (1280 px) widths: often ten or more for one screen change, taken by hand and retaken after each review change. They repeat the design already attached to the issue (pictures and an HTML reference, as on #38 and #65), and #65 already skipped them by the owner's decision. The real check is the owner's review of the preview, which leaves no explicit record on the pull request. How should a pull request record that the owner reviewed it?

## Decision drivers

- Little manual work per pull request.
- An explicit record, on the pull request, that the owner reviewed it.
- No new tool, service or account.
- No personal data in public files.

## Considered options

1. Screenshots by hand (today)
2. Screenshots taken in CI: Playwright's `toHaveScreenshot`, a hosted service such as Argos, Percy or Chromatic, or screenshots uploaded by CI
3. A checkbox the owner ticks

## Decision outcome

Chosen option: **"A checkbox the owner ticks"**, because it records the review that matters, on every pull request, at the cost of one click.

The pull request template ends its checklist with:

> The repository owner reviewed this PR, and its Vercel preview at phone (390 px) and desktop (1280 px) widths if it changes what the app shows or does

- It's on every pull request. The preview part applies only when the app changes.
- Only the owner ticks it, on GitHub, after reviewing. An agent never ticks it.
- The record of the agreed look stays the design attached to the issue.
- Dependabot pull requests don't use the checklist ([0010](0010-merge-dependabot-prs-without-an-issue.md)), so nothing changes for them.

This amends step 5 of 0013 only. The rest of 0013 stands, so it's amended, not superseded.

### Consequences

- Good, because it costs one click instead of often ten or more screenshots.
- Good, because every pull request says explicitly whether the owner reviewed it, not only those with screens.
- Good, because no screenshots are posted publicly, so there's no risk of personal data in them.
- Good, because it needs no tool, service or account.
- Bad, because the pull request no longer shows a picture of the shipped screen. The design on the issue and the preview stand in for it.
- Bad, because a ticked box is a claim, not proof, and nothing checks the look automatically.

### Confirmation

- The last item of the checklist in `.github/pull_request_template.md`.
- Merged pull requests have it ticked.
- `AGENTS.md` and the [development workflow](../../how-to/development-workflow.md) ask for no screenshots.

## Pros and cons of the options

### Screenshots by hand

- Good, because the pull request shows what was built.
- Bad, because it's a lot of manual work for each screen change, again after each review change.
- Bad, because the screenshots repeat the design on the issue, and the owner reviews the preview anyway.
- Bad, because files attached on a public repository can be opened without signing in, so they need invented data.

### Screenshots taken in CI

- Good, because nobody takes them by hand.
- Good, because Playwright already runs in CI ([0015](0015-test-screens-end-to-end-with-playwright-in-ci.md)), and `toHaveScreenshot` could catch unintended changes.
- Bad, because baseline images are binary files that need updating with every screen change, and they differ between browsers and machines.
- Bad, because a hosted service adds an account and may cost money.
- Bad, because uploaded screenshots still need someone to look at them, and they don't record that the owner did.

## More information

- Issue: #68
- Related: [0010](0010-merge-dependabot-prs-without-an-issue.md), [0013](0013-design-screens-in-code.md), [0015](0015-test-screens-end-to-end-with-playwright-in-ci.md)
