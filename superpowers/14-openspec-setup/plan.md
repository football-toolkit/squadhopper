# Set up OpenSpec for business specs: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install OpenSpec 1.14.2 for Claude Code, set up its config for business-only specs that hand off to Superpowers, and write the Feature path into the rules, the guide, the README, the Feature form and ADR 0007.

**Architecture:** Docs and config only. `openspec init` generates the commands and skills. `openspec/config.yaml` holds the context, the rules and the apply and archive guidance. `AGENTS.md` holds the rules, the guide puts them in order, `README.md` covers setup, and ADR 0007 records why.

**Tech Stack:** OpenSpec CLI 1.14.2 (global npm package, Node.js >=20.19.0), Markdown, GitHub issue forms (YAML), Mermaid, Python 3 with PyYAML for the checks.

**Spec:** `superpowers/14-openspec-setup/design.md`

## Global Constraints

- English only. No personal data. The project name appears only in the `README.md` title.
- Change key `14-openspec-setup`. Read it with `git branch --show-current`.
- OpenSpec 1.14.2, run as `openspec init --tools claude`, with no other flags.
- `openspec init` must not change `AGENTS.md` or `.claude/CLAUDE.md`. If it does, restore them and stop to ask the owner.
- Show the owner the list of files that init created or changed before committing.
- Keep every "Once CI exists" marker. Remove every "once OpenSpec is set up" and "(once set up)" marker in `AGENTS.md`, `docs/how-to/development-workflow.md` and `superpowers/README.md`. Don't touch accepted ADRs (0001–0006).
- The "Done when" rule, word for word in `AGENTS.md` and guide step 7: "Before opening the PR, tick each 'Done when' item in the issue (the Acceptance criteria, for a Feature) that the change meets (with `gh issue edit`), and note in the PR body how each was checked. Don't merge with unticked items: finish them or remove them with a reason."
- ADR 0007: `status: accepted`, `date: 2026-10-21`, `decision-makers: repository owner`.
- One commit at the end: `chore: set up OpenSpec for business specs`, ending with the `Co-Authored-By` trailer. Afterwards show only `git status` and `git diff --stat HEAD~1`. No push, no PR and no `gh issue edit` without asking.

## Review Focus

1. **`openspec init` touching `AGENTS.md` or `.claude/CLAUDE.md`:** the owner expects them untouched. Gate in Task 1, Step 3.
2. **A config key OpenSpec silently drops:** a misspelled rules key or operation field only prints a warning, and the guidance never reaches the agent. Checked against `openspec instructions` output in Task 1, Step 6.
3. **A stray marker left behind, or a CI marker removed by mistake:** grep in Task 7.
4. **Mermaid labels that GitHub can't parse:** every label in double quotes (Task 4).
5. **Broken relative links,** such as from `superpowers/README.md` to `../openspec/`: link check in Task 7.

---

### Task 0: Check the prerequisites

- [ ] **Step 1:** Run `git branch --show-current && openspec --version && python3 -c "import yaml"`. Expected: `14-openspec-setup`, then `1.14.2`, and no error. If anything differs, stop and tell the owner.
- [ ] **Step 2:** Run `test ! -e openspec && echo clean`. Expected: `clean`.

### Task 1: Initialize OpenSpec and write `openspec/config.yaml`

**Files:**
- Create: whatever `openspec init --tools claude` generates (expected: `openspec/config.yaml`, `.claude/commands/opsx/*.md`, `.claude/skills/openspec-*/SKILL.md`)
- Modify: `openspec/config.yaml`

- [ ] **Step 1:** Run `openspec init --tools claude`. If it prompts, stop and tell the owner rather than guessing.
- [ ] **Step 2:** Run `git status --porcelain --untracked-files=all`. Save the list.
- [ ] **Step 3: Gate.** If `AGENTS.md` or `.claude/CLAUDE.md` appears in the list, run `git checkout -- <file>` and stop to ask the owner. Otherwise show the owner the list from Step 2 and wait for their OK.
- [ ] **Step 4: Write the failing check** in the scratchpad as `check_config.sh`. It copies the repo to a temp folder, creates a throwaway change there, and greps the instructions:

```bash
set -e
T=$(mktemp -d); cp -r openspec "$T/"; cd "$T"
openspec new change demo >/dev/null
for a in proposal specs design tasks; do openspec instructions $a --change demo > $a.out 2> $a.err; done
openspec instructions apply --change demo > apply.out 2> apply.err
openspec instructions archive --change demo > archive.out 2> archive.err || true
! grep -i "warn\|invalid\|unknown" *.err
grep -q "football matches" proposal.out
grep -qi "business language" proposal.out specs.out design.out tasks.out
grep -qi "business impact" proposal.out
grep -q "WHEN" specs.out && grep -q "THEN" specs.out
grep -qi "user flows" design.out
grep -qi "user-visible outcome" tasks.out
grep -q "superpowers/<key>/" apply.out
grep -qi "tasks.md" apply.out
grep -qi "openspec validate --specs" archive.out
echo "config OK"
```

Run it from the repo root. Expected: it fails, because the generated config has no context or rules yet. If `openspec instructions archive` doesn't exist in 1.14.2, check the archive guidance with `grep` on `openspec/config.yaml` instead, and note this.

- [ ] **Step 5: Write `openspec/config.yaml`.** Keep `schema: spec-driven` and any other key init wrote. Set:
  - `context`: two or three lines. A personal app that shows one calendar of the owner's football matches across several teams and flags days with clashes. The repo is public, so no personal data.
  - `rules`: keys `proposal`, `specs`, `design`, `tasks`. Every key gets "Business language only: no technology, libraries, data structures, APIs or code." Then `proposal` adds "Impact" means business impact. `specs` adds that every requirement has at least one WHEN/THEN scenario. `design` adds that it describes user flows, business rules and edge cases. `tasks` adds that each task is a user-visible outcome, linked to its scenarios.
  - `operations.apply.guidance`, as a list:
    - Implement the change through Superpowers, with one technical design and one plan for the whole change in `superpowers/<key>/` (`design.md`, `plan.md`).
    - Map the plan steps to the tasks in `tasks.md`.
    - Test first, from each task's scenarios.
    - Get a code review.
    - Record significant technical choices as ADRs.
    - Tick a task in `tasks.md` only when its scenarios pass.
  - `operations.archive.guidance`, as a list:
    - One active change at a time, across the whole repo.
    - Archive as the last commit before the PR.
    - After archiving, run `openspec validate --specs` and show the owner the `openspec/specs/` diff.
- [ ] **Step 6:** Run the check again. Expected: `config OK` and no warnings.
- [ ] **Step 7:** Run `openspec validate --specs`. Expected: exit 0. With no specs, that means "nothing to validate".

### Task 2: Feature form descriptions

**Files:** Modify `.github/ISSUE_TEMPLATE/feature_request.yml`

- [ ] **Step 1: Write the check and see it fail:**

```bash
python3 - <<'EOF'
import yaml
d = yaml.safe_load(open(".github/ISSUE_TEMPLATE/feature_request.yml"))
f = {b["id"]: b for b in d["body"]}
assert [b["id"] for b in d["body"]] == ["slug", "problem", "solution", "acceptance", "alternatives", "context"]
assert f["problem"]["attributes"]["description"] == "1–3 sentences, from the user's point of view"
assert f["solution"]["attributes"]["description"] == "What the user should see or be able to do. No technology. Write 'to be explored' if unclear"
assert f["acceptance"]["attributes"]["description"] == "2–5 observable checks, as checkboxes"
assert f["problem"]["validations"]["required"] and f["solution"]["validations"]["required"]
print("form OK")
EOF
```

- [ ] **Step 2:** Replace the three descriptions, as double-quoted YAML strings (two of them contain an apostrophe). Change nothing else.
- [ ] **Step 3:** Run the check again. Expected: `form OK`. Then `git diff --stat .github` shows one file, with 3 insertions and 3 deletions.

### Task 3: `AGENTS.md`

**Files:** Modify `AGENTS.md`

- [ ] **Step 1: Write the check and see it fail:**

```bash
f=AGENTS.md
! grep -n "once set up\|once OpenSpec is set up" $f
grep -q "^## Business specs" $f
awk '/^## Business specs/{b=NR} /^## Implementation/{i=NR} END{exit !(b && i && b<i)}' $f
for s in '/opsx:explore' '/opsx:propose' '/opsx:apply' '/opsx:archive' '1.14.2' 'own issue' 'README.md' 'One active change at a time' 'gh issue edit' "the Acceptance criteria, for a Feature" "remove them with a reason"; do grep -qF "$s" $f || { echo "missing: $s"; exit 1; }; done
echo "AGENTS OK"
```

- [ ] **Step 2:** Edit:
  - Line "Features go through OpenSpec (once set up); …" becomes "Features go through OpenSpec (see Business specs below); Tasks and Bugs don't."
  - Change key bullet: drop "(once OpenSpec is set up)".
  - Workflow section: add the "Done when" rule from the Global Constraints as a bullet after the PR bullets, before "Merge only after …".
  - New `## Business specs` section just before `## Implementation`, in terse bullets: Features only. Optionally, once the branch exists, run `/opsx:explore` to settle open business questions. Run `/opsx:propose` with the change name set to the change key. The owner reviews the proposal, specs, design and tasks. Then `/opsx:apply`, where Superpowers settles the technical design. Then `/opsx:archive` before the PR. One active change at a time across the whole repo: never two Feature branches with an open OpenSpec change. OpenSpec is pinned to 1.14.2, and upgrades go through their own issue. To install it, see `README.md`.
  - Don't change the first two lines of the file ("No code or tech stack…" stays).
- [ ] **Step 3:** Run the check again. Expected: `AGENTS OK`.

### Task 4: The workflow guide

**Files:** Modify `docs/how-to/development-workflow.md`

- [ ] **Step 1: Write the check and see it fail:**

```bash
f=docs/how-to/development-workflow.md
! grep -n "once OpenSpec is set up\|once set up\|Until then" $f
grep -q "Once CI exists" $f
for s in '/opsx:explore' '/opsx:propose' '/opsx:apply' '/opsx:archive' 'openspec validate --specs' 'One active change at a time' 'gh issue edit' "the Acceptance criteria, for a Feature" '0007-write-business-specs-with-openspec.md'; do grep -qF "$s" $f || { echo "missing: $s"; exit 1; }; done
python3 - <<'EOF'
import re
t = open("docs/how-to/development-workflow.md").read()
m = re.search(r"```mermaid\n(.*?)```", t, re.S).group(1)
labels = re.findall(r'[\[\{](.*?)[\]\}]', m) + re.findall(r'\|(.*?)\|', m)
assert labels and all(l.startswith('"') and l.endswith('"') for l in labels), labels
print("guide OK")
EOF
```

- [ ] **Step 2:** Edit:
  - Delete the paragraph "The OpenSpec steps apply once OpenSpec is set up. …".
  - Step 3: no marker. Optional `/opsx:explore` once the branch exists, then `/opsx:propose` with the change key as its name. The owner reviews the proposal, specs, design and tasks. One active change at a time across the repo.
  - Step 4: Features start with `/opsx:apply`, which hands the work to Superpowers.
  - Step 5: no marker. `/opsx:archive` as the last commit before the PR, then `openspec validate --specs`. The owner reviews the `openspec/specs/` diff.
  - Step 7: add the "Done when" rule word for word. Keep "Once CI exists, …".
  - Mermaid: node D may read `"OpenSpec: explore (optional), propose"`. Every label stays quoted.
  - Change-key table: "OpenSpec change (once OpenSpec is set up)" becomes "OpenSpec change".
  - "Where next": add `- 💡 Why business specs with OpenSpec: [ADR 0007](../explanation/decisions/0007-write-business-specs-with-openspec.md)`.
- [ ] **Step 3:** Run the check again. Expected: `guide OK`.

### Task 5: README Setup and `superpowers/README.md`

**Files:** Modify `README.md`, `superpowers/README.md`

- [ ] **Step 1: Write the check and see it fail:**

```bash
awk '/^## Documentation/{d=NR} /^## Setup/{s=NR} /^## Contributing/{c=NR} END{exit !(d<s && s<c)}' README.md
for s in 'Node.js 20.19.0 or higher' 'npm install -g @fission-ai/openspec@1.14.2' 'openspec --version' 'openspec config set telemetry.enabled false' '.claude/settings.json'; do grep -qF "$s" README.md || { echo "missing: $s"; exit 1; }; done
! grep -n "once set up" superpowers/README.md
grep -qF "[openspec/](../openspec/)" superpowers/README.md
echo "readmes OK"
```

- [ ] **Step 2:** Add a `## Setup` section between "Documentation" and "Contributing". It says that OpenSpec needs Node.js 20.19.0 or higher, then gives the install command, the version check (prints `1.14.2`) and the command to turn telemetry off, all in one bash block. Superpowers needs no install, because `.claude/settings.json` turns it on for Claude Code. Before writing it, confirm that `openspec config set telemetry.enabled false` runs (it's already false, so it's idempotent).
- [ ] **Step 3:** In `superpowers/README.md`, "Business specs live in `openspec/` (once set up)" becomes `Business specs live in [openspec/](../openspec/)`.
- [ ] **Step 4:** Run the check again. Expected: `readmes OK`.

### Task 6: ADR 0007 and the index

**Files:** Create `docs/explanation/decisions/0007-write-business-specs-with-openspec.md`. Modify `docs/explanation/decisions/README.md`.

- [ ] **Step 1: Write the check and see it fail:**

```bash
f=docs/explanation/decisions/0007-write-business-specs-with-openspec.md
head -5 $f | grep -q "^status: accepted$" && head -5 $f | grep -q "^date: 2026-10-21$"
grep -q "^# 0007: Write business specs with OpenSpec$" $f
for s in 'No specs' 'Hand-written specs in `docs/`' 'Fission-AI/OpenSpec/issues/2033' '1.14.2' 'One active change at a time' '0005-implement-every-change-through-superpowers.md' '0006-one-key-per-change.md'; do grep -qiF "$s" $f || { echo "missing: $s"; exit 1; }; done
awk '/^### How we work/{h=1} h && /0007-write-business-specs-with-openspec.md/{ok=1} END{exit !ok}' docs/explanation/decisions/README.md
echo "adr OK"
```

- [ ] **Step 2:** Write the ADR from `templates/adr.md`, following the design's section 6. Considered options:
  1. No specs.
  2. Hand-written specs in `docs/`.
  3. **OpenSpec's full flow, with business-only artifacts and Superpowers for implementation.**

  Chosen: OpenSpec, because it keeps a living spec of what the app does (deltas are merged on archive), while the design and tasks stay inside the archived change. Consequences: good, a current picture of the app's behavior, kept apart from technical detail. Bad, a young tool with a known archive-merge issue (#2033), mitigated by pinning 1.14.2, one active change at a time across the repo, and checking the specs diff. Confirmation: `openspec/config.yaml`, the Business specs section of `AGENTS.md`, and `openspec/changes/archive/`. Brief pros and cons for options 1 and 2. More information links to 0005, 0006, the guide and https://github.com/Fission-AI/OpenSpec. Leave out "Decision drivers" unless it adds something, as 0006 does.
- [ ] **Step 3:** Add the row `| [0007](0007-write-business-specs-with-openspec.md) | Write business specs with OpenSpec |` under "How we work".
- [ ] **Step 4:** Run the check again. Expected: `adr OK`.

### Task 7: Whole-change checks, review and commit

- [ ] **Step 1: Markers.** `grep -rn "once OpenSpec is set up\|once set up" AGENTS.md docs/how-to superpowers/README.md` prints nothing, and `grep -c "Once CI exists" docs/how-to/development-workflow.md` is unchanged from `main`.
- [ ] **Step 2: Links.** For every changed or new `.md` file, check that each relative link target (with any `#anchor` removed) exists on disk. Expected: none missing.
- [ ] **Step 3: Project name.** A case-insensitive `git grep` for the project name, over every path except `README.md`, prints nothing, and in `README.md` the name appears only on line 1.
- [ ] **Step 4: Protected files.** `git diff --quiet main -- .claude/CLAUDE.md .claude/settings.json` passes. `AGENTS.md` changed only through Task 3's edits.
- [ ] **Step 5: Rerun** the checks from Tasks 1–6. All print OK.
- [ ] **Step 6: Code review** with superpowers:requesting-code-review on the whole diff against `main`. Fix what it finds, and rerun Step 5.
- [ ] **Step 7: Commit** in one commit. First run `git status --porcelain --untracked-files=all`. If it shows any path outside the expected list below, stop and ask the owner. Then stage the expected paths explicitly (owner's request):

```bash
git status --porcelain --untracked-files=all
git add openspec/ .claude/commands/opsx/ .claude/skills/openspec-* \
  .github/ISSUE_TEMPLATE/feature_request.yml AGENTS.md README.md docs/ \
  superpowers/README.md superpowers/14-openspec-setup/
git commit -m "chore: set up OpenSpec for business specs" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git status
git diff --stat HEAD~1
```

Show the owner only the output of `git status` and `git diff --stat HEAD~1`. Then ask before ticking the issue's "Done when" items, before pushing, and before opening the PR.
