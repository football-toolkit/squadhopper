# Define the development workflow end to end: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write down the workflow from idea to merge: the issue types, issue creation, one change key per change, and big work. This goes in `AGENTS.md`, the issue forms, a how-to guide and ADR 0006.

**Architecture:** Docs and config only. `AGENTS.md` holds the rules, the issue forms enforce the Slug, the how-to guide explains the flow and links back to `AGENTS.md`, and ADR 0006 records why.

**Tech Stack:** Markdown, GitHub issue forms (YAML), Mermaid (rendered by GitHub), gh CLI 2.102.0.

**Spec:** `superpowers/12-dev-workflow/design.md`

## Global Constraints

- English only. No personal data. The project name appears only in the `README.md` title.
- Every folder under `docs/` has a `README.md`. File names use kebab-case.
- Match the tone and layout of the existing docs: short sentences, emoji in landing-page intros and "Where next" links, tables for contents.
- Slug field: `type: input`, `id: slug`, `label: Slug`, description exactly `2–4 words, kebab-case (e.g. clash-days). The branch will be <issue-number>-<slug>.`, `required: true`, first item under `body:`.
- Change key format: `<issue-number>-<slug>`.
- Commands, exactly as written: `gh issue create --type <Type> --title "…" --body-file <file> --assignee @me`, `gh issue develop <number> --name <key> --checkout`, `gh issue create --parent <number>`, `git branch --show-current`.
- OpenSpec steps are marked "once OpenSpec is set up". The key-consistency check is marked "once CI exists".
- ADR 0006: `status: accepted`, `date: 2026-10-20`, `decision-makers: repository owner`.
- One commit at the end, `docs: define the development workflow end to end`, only after the owner has seen the diff. No push and no PR without asking.

## Review Focus

1. **Mermaid that GitHub can't parse:** a label with unquoted `(`, `)`, `<`, `>` or `/` shows an error box instead of a diagram. Put every node label in double quotes (Task 3, Step 2).
2. **An agent reading only `AGENTS.md`:** it must find every command and rule there, not only in the guide. Grep checks in Task 2.
3. **Broken relative links from the new `docs/how-to/` depth,** e.g. to `../../AGENTS.md` (Task 5 link check).
4. **Form YAML that GitHub rejects:** a duplicate `id`, or `slug` not first or not required (Task 1 check).
5. **The project name leaking outside the `README.md` title** (Task 5 grep).

---

### Task 0: Check the prerequisites

- [ ] **Step 1:** Run `python3 -c "import yaml"`. If PyYAML is missing, stop and tell the owner before installing anything.

### Task 1: Slug field and type descriptions in the issue forms

**Files:**
- Modify: `.github/ISSUE_TEMPLATE/feature_request.yml`, `.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/task.yml`

- [ ] **Step 1: Run the check to see it fail**

```bash
python3 - <<'EOF'
import yaml
want = {
  "feature_request.yml": "Change what the app does: its business spec changes.",
  "bug_report.yml": "The app doesn't do what its spec says.",
  "task.yml": "Everything else: the spec doesn't change and nothing is broken.",
}
for f, desc in want.items():
    d = yaml.safe_load(open(f".github/ISSUE_TEMPLATE/{f}"))
    first = d["body"][0]
    ids = [b["id"] for b in d["body"]]
    assert d["description"] == desc, (f, d["description"])
    assert first["type"] == "input" and first["id"] == "slug", f
    assert first["attributes"]["label"] == "Slug", f
    assert first["attributes"]["description"] == "2–4 words, kebab-case (e.g. clash-days). The branch will be <issue-number>-<slug>.", f
    assert first["validations"]["required"] is True, f
    assert len(ids) == len(set(ids)), f
print("forms OK")
EOF
```

Expected: an `AssertionError` on `feature_request.yml` (the description doesn't match).

- [ ] **Step 2: Edit the three forms.** Replace each top-level `description` with the value above. Insert the Slug field from the Global Constraints as the first item under `body:`. Leave every other field unchanged.

- [ ] **Step 3: Run the check again.** Expected output: `forms OK`.

### Task 2: Workflow rules in `AGENTS.md`

**Files:**
- Modify: `AGENTS.md` (the "Workflow" section)

- [ ] **Step 1: Run the check to see it fail**

```bash
for s in 'Feature' 'Bug' 'Task' '### <label>' 'gh issue create --type <Type> --title "…" --body-file <file> --assignee @me' \
  '<issue-number>-<slug>' 'gh issue develop <number> --name <key> --checkout' 'git branch --show-current' \
  'gh issue create --parent <number>' 'once OpenSpec is set up'; do
  grep -qF -- "$s" AGENTS.md || echo "MISSING: $s"; done
```

Expected: several `MISSING:` lines.

- [ ] **Step 2: Edit the Workflow section.** Add four groups of bullets, **Issue types**, **Creating issues**, **Change key** and **Big work**, worded as in design §1 and in the file's terse bullet style. Reword the bullets "Every change starts from a GitHub issue…" and "Never commit directly to `main`. Branch from an up-to-date `main`…" (keep "Never commit directly to `main`" verbatim) so the branch is created from the issue with `gh issue develop` and named after the key. Keep the remaining bullets (one issue per branch, PR template with `Closes #`, squash-merge title, checklist). Link the guide: `See [docs/how-to/development-workflow.md](docs/how-to/development-workflow.md) for the full flow.`

- [ ] **Step 3: Run the check again.** Expected: no output.

### Task 3: How-to guide

**Files:**
- Create: `docs/how-to/README.md`, `docs/how-to/development-workflow.md`
- Modify: `docs/README.md` (the Contents table)

- [ ] **Step 1: Write `docs/how-to/README.md`.** Copy the layout of `docs/explanation/README.md`: a title, a 🛠️ intro line ("Pages that help you get one specific task done…"), a Contents table with one row linking `development-workflow.md`, and "Where next" → 🏠 `../README.md`.

- [ ] **Step 2: Write `docs/how-to/development-workflow.md`.** Sections in this order:
  1. a one-paragraph intro that names `AGENTS.md` as the source of the rules;
  2. **The flow**: a Mermaid `flowchart` of issue → branch from the issue → OpenSpec change (Feature, once OpenSpec is set up) → Superpowers design and plan → implement → OpenSpec archive (Feature, once OpenSpec is set up) → PR → squash merge, with every node label in double quotes;
  3. **Steps**, numbered and with the exact commands, including the owner's approval points (the issue draft, the branch, the diff, push, PR) and the key-consistency check "once CI exists" (the branch, the Superpowers folder and the OpenSpec change name all match `<issue-number>-<slug>` from the linked issue);
  4. **Feature, Task and Bug**: a table of which steps each type takes (Features go through OpenSpec; Tasks and Bugs skip it because the spec doesn't change);
  5. **The change key**: the format, and where the key shows up (issue Slug, branch, `superpowers/<key>/`, `openspec/changes/<key>/` once set up);
  6. **Big work**: when to split, `gh issue create --parent <number>`, closing the parent by hand;
  7. a note that `--type` and `--parent` need a recent gh (2.45.0 doesn't have them; 2.102.0 does);
  8. **Where next**: `../../AGENTS.md`, ADR `../explanation/decisions/0006-one-key-per-change.md`, 🏠 `../README.md`.

- [ ] **Step 3: Add a row to the Contents table in `docs/README.md`**, above Explanation: `| 🛠️ [How-to guides](how-to/README.md) | The development workflow, from idea to merge |`.

- [ ] **Step 4: Check the Mermaid.** Run `awk '/^```mermaid/{m=1;next} /^```/{m=0} m' docs/how-to/development-workflow.md | grep -nE '[[({][^"]'`. Expected: no output, meaning every node label inside the mermaid block is quoted.

### Task 4: ADR 0006

**Files:**
- Create: `docs/explanation/decisions/0006-one-key-per-change.md`
- Modify: `docs/explanation/decisions/README.md` (the "How we work" table)

- [ ] **Step 1: Write the ADR from `templates/adr.md`.** Front matter as in the Global Constraints. Title `# 0006: Link issue, branch, specs and plans with one key per change`. Options: 1. Free-form branch and folder names, 2. Issue number only, 3. **One `<issue-number>-<slug>` key everywhere**. Chosen option 3, "because everything for a change can be found by one search and GitHub links the branch to the issue". Consequences: good, full traceability; bad, it relies on discipline until a CI check enforces it. Confirmation: the Slug field in the issue forms; the `AGENTS.md` rules; a CI check later. Pros and cons for options 1 and 2. More information: links to 0004, 0005 and `../../how-to/development-workflow.md`. Drop the "Decision drivers" section, as 0004 and 0005 do.

- [ ] **Step 2: Add the index row** after 0005: `| [0006](0006-one-key-per-change.md) | Link issue, branch, specs and plans with one key per change |`.

### Task 5: Verify, show the diff, commit

**Files:** none new.

- [ ] **Step 1: Check the links.** Every relative link in the changed Markdown files must resolve.

```bash
python3 - <<'EOF'
import re, os, subprocess
files = subprocess.run(["git","ls-files","-mo","--exclude-standard","*.md"],capture_output=True,text=True).stdout.split()
bad = 0
for f in files:
    for t in re.findall(r"\]\(([^)#\s]+)", open(f).read()):
        if "://" in t: continue
        p = os.path.normpath(os.path.join(os.path.dirname(f), t))
        if not os.path.exists(p): print(f"{f}: {t}"); bad += 1
print("links OK" if not bad else f"{bad} broken")
EOF
```

Expected: `links OK`.

- [ ] **Step 2: Run the name and Done-when checks.** `git grep -niE 'squad ?hopper' -- . ':!README.md'` should print nothing, and the `README.md` match should be the title only. Re-run the checks from Tasks 1 and 2 and confirm all four "Done when" items in the design.

- [ ] **Step 3: Show the owner the diff.** Run `git status`, then stage the changed files explicitly by path (`AGENTS.md`, the three forms, `docs/README.md`, `docs/how-to/README.md`, `docs/how-to/development-workflow.md`, `docs/explanation/decisions/README.md`, `docs/explanation/decisions/0006-one-key-per-change.md`, `superpowers/12-dev-workflow/design.md`, `superpowers/12-dev-workflow/plan.md`). Then run `git diff --cached --stat && git diff --cached`. Wait for approval.

- [ ] **Step 4: Commit after approval**

```bash
git commit -m "docs: define the development workflow end to end" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Ask before `git push` and before opening the PR.
