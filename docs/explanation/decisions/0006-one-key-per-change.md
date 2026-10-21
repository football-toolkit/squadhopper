---
status: accepted
date: 2026-10-20
decision-makers: repository owner
---

# 0006: Link issue, branch, specs and plans with one key per change

## Context and problem statement

A change leaves traces in several places: the issue, the branch, the pull request, the Superpowers design and plan ([0005](0005-implement-every-change-through-superpowers.md)) and, once OpenSpec is set up, a business spec change. If each one is named independently, finding everything about a change means searching several places with different names. The project needs one way to tie them together.

## Considered options

1. Free-form branch and folder names
2. Issue number only
3. **One `<issue-number>-<slug>` key everywhere**

## Decision outcome

Chosen option: **"One `<issue-number>-<slug>` key everywhere"**, because everything for a change can be found by one search, and GitHub links the branch to the issue.

- The slug comes from a required Slug field in the issue forms: 2–4 words, kebab-case.
- The branch is created from the issue with `gh issue develop <number> --name <key> --checkout`, so GitHub links them.
- After that, the key is read from the branch name, never invented. It's also the Superpowers folder name and, once OpenSpec is set up, the OpenSpec change name.
- Never rename the branch. If the key is wrong, delete the branch and recreate it before any work starts.

### Consequences

- Good, because there's full traceability: the issue, branch, specs and plans of a change share one name.
- Bad, because it relies on discipline until a CI check enforces it.

### Confirmation

- The required Slug field in the issue forms in `.github/ISSUE_TEMPLATE/`.
- The "Change key" rules in the Workflow section of `AGENTS.md`.
- Later, a CI check that the branch, the Superpowers folder and the OpenSpec change all match the linked issue's key.

## Pros and cons of the options

### Free-form branch and folder names

- Good, because there's nothing to learn or enforce.
- Bad, because nothing ties a branch or folder back to its issue, so finding all the files of a change takes guesswork.

### Issue number only

- Good, because it's short and can't drift from the issue.
- Bad, because a bare number says nothing about the change, so branch lists and folders are hard to scan.

## More information

- The full flow: [Development workflow](../../how-to/development-workflow.md)
- Related: [0004](0004-issue-driven-workflow.md), [0005](0005-implement-every-change-through-superpowers.md)
