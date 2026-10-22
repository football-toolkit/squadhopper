# Design: stage files by explicit path

Issue: #16 (Task). Branch and change key: `16-explicit-git-staging`.

## Intent

The repo is public. Staging everything (`git add -A` and friends) can commit stray or local files by accident, and agent sessions and draft plans have repeatedly used it. A written rule alone has not been enough, so the harness blocks the bulk-staging commands too.

## Goals

Issue #16's "Done when" list:

- [ ] AGENTS.md says to stage by explicit path and names the banned commands
- [ ] `.claude/settings.json` denies `git add -A`, `git add .`, `git add --all`, `git commit -a`, `git commit -am` and `git commit --all`, and keeps `enabledPlugins`
- [ ] In a session, `git add -A` and `git commit -am "x"` are blocked
- [ ] In a session, `git add AGENTS.md` and `git add ./docs/README.md` still work

## Non-goals

- No hook. Permission deny rules are enough.
- No `.gitignore` changes.
- No ADR: this is a convention, not a significant technical choice.

## Changes

### 1. `.claude/settings.json`

Keep `enabledPlugins` and add these deny rules (the owner's exact list):

```json
"permissions": {
  "deny": [
    "Bash(git add -A *)",
    "Bash(git add . *)",
    "Bash(git add --all *)",
    "Bash(git commit -a *)",
    "Bash(git commit -am *)",
    "Bash(git commit --all *)"
  ]
}
```

Claude Code checks each part of a chained command (`&&`, `;`, `|`) on its own, so `git add -A && git commit …` is blocked as well. `git add ./docs/README.md` doesn't match `git add . *`, because the rule needs a space after the dot.

### 2. `AGENTS.md`

Add a bullet under Commits: check `git status`, stage by explicit path, never use the bulk commands (which `.claude/settings.json` blocks), and have plans list the paths each commit stages.

## Testing

In a live session, after the settings change:

- Blocked: `git add -A`, `git commit -am "x"`.
- Allowed: `git add AGENTS.md`, `git add ./docs/README.md`.

Run the tests on a clean working tree, so a rule that fails to block can't stage or commit anything.
