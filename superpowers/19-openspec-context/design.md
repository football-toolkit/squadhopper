# Design: describe the project in the OpenSpec context

Issue: #19 (Task). Branch and change key: `19-openspec-context`.

## Intent

OpenSpec injects `context` into every artifact it writes. The current context lists two features (one calendar of matches, flagging clash days), so every proposal gets pulled toward them. The context should hold only what the project is, the shared terms and the non-obvious constraints. Features belong in `openspec/specs/`.

## Goals

Issue #19's "Done when" list:

- [ ] `context` matches the text in the issue.
- [ ] `rules` and `operations` are unchanged.
- [ ] `openspec list` runs with no config warning.

## Non-goals

- No changes to `schema`, `rules` or `operations`.
- No ADR: no technical choice is involved.

## Changes

In `openspec/config.yaml`, replace the `context` block with:

```yaml
context: |
  For amateur football players who play in several teams across different tournaments. It brings everything about their matches into one place, so they don't have to follow each team and organizer separately.
  Terms:
  - Team: a squad a player plays for; a player can belong to several teams.
  - Tournament: a competition that teams play in; a team can play in several tournaments.
  - Organizer: the body that runs tournaments and publishes their schedules.
  - Match: a game between two teams in a tournament, at a date, time and place.
  This repo is public: artifacts use invented teams, places and people, never real ones.
```

## Testing

- `git diff openspec/config.yaml` shows changes only inside the `context` block.
- `openspec list` exits 0 and prints no config warning.
