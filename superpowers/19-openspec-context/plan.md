# Plan: describe the project in the OpenSpec context

Design: [design.md](design.md). Branch: `19-openspec-context`.

## Task 1: Replace the context

- [ ] **Step 1:** In `openspec/config.yaml`, replace the `context` block with the text in the design.

## Task 2: Check

- [ ] **Step 1:** Run `git diff openspec/config.yaml` and confirm that only lines inside the `context` block changed.
- [ ] **Step 2:** Run `openspec list` and confirm that it exits 0 with no config warning.

## Task 3: Commit

- [ ] **Step 1:** Run `git status --short` and confirm that only these paths changed: `openspec/config.yaml`, `superpowers/19-openspec-context/`.
- [ ] **Step 2:** Stage them by path and commit:

```bash
git add openspec/config.yaml superpowers/19-openspec-context/
git commit -m "chore: describe the project in the OpenSpec context" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Task 4: PR

- [ ] **Step 1:** Tick the issue's "Done when" items with `gh issue edit` (ask first).
- [ ] **Step 2:** Ask before `git push` and before opening the PR.
