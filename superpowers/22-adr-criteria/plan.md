# Define when a change needs an ADR: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace "significant technical choice" with a rule that covers code and how we work, add an ADR item to the PR template, and record #16's decision as ADR 0008.

**Architecture:** Docs and config only. The same rule goes into three places, the PR template gets one checklist item, and a new ADR is added to the decisions index.

**Tech Stack:** Markdown, YAML.

**Spec:** [design.md](design.md). Branch: `22-adr-criteria`.

## Global Constraints

- The rule's wording, used in all three places and adapted only to fit the sentence around it: "Add an ADR in the same PR when the change makes a significant choice, about the code or about how we work. A choice is significant when the change chose between real alternatives, and it's costly to undo or someone will later ask why."
- PR template item, verbatim: `- [ ] An ADR was added, or the Summary says why none is needed`
- ADR 0008: `status: accepted`, `date: 2026-10-22`, recorded later on 2026-10-23 in #22.
- No personal data. Stage by explicit path only.

## Review Focus

- The YAML in `openspec/config.yaml` must still parse. A string that contains `: ` needs quotes. Task 1 checks the parse.
- The wording must say the same thing in all three places. Task 1 greps for it.
- None of the three places may still say "significant technical choice". Task 1 greps for it.
- The relative links in ADR 0008 and the index must resolve. Task 2 checks them.
- ADR 0008 must keep every section of the template. Task 2 compares the headings.

---

### Task 1: The rule and the PR template

**Files:**
- Modify: `AGENTS.md` (Decisions and docs, first bullet)
- Modify: `docs/how-to/development-workflow.md` (step 4, last sentence; keep the link to `../explanation/decisions/README.md`)
- Modify: `openspec/config.yaml` (`operations.apply.guidance`, the "Record significant technical choices…" item)
- Modify: `.github/pull_request_template.md` (Checklist, after the Docs item)

- [ ] **Step 1:** Replace the old rule in the three files with the Global Constraints wording.
- [ ] **Step 2:** Add the PR template item.
- [ ] **Step 3:** Check:
  - `grep -rni "significant technical choice" AGENTS.md docs/how-to openspec/config.yaml` prints nothing. (Accepted ADR 0005 keeps its line, which the wider rule still covers. `config.yaml`'s design rule about "technical choices" is unrelated and stays.)
  - `grep -n "how we work" AGENTS.md docs/how-to/development-workflow.md openspec/config.yaml` finds the rule in all three files.
  - `python3 -c "import yaml; yaml.safe_load(open('openspec/config.yaml'))"` exits 0.
- [ ] **Step 4:** Run `git status --short`, then stage by path and commit:

```bash
git add AGENTS.md docs/how-to/development-workflow.md openspec/config.yaml .github/pull_request_template.md superpowers/22-adr-criteria/
git commit -m "docs: define when a change needs an ADR" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 2: ADR 0008

**Files:**
- Create: `docs/explanation/decisions/0008-stage-files-by-explicit-path.md`
- Modify: `docs/explanation/decisions/README.md` ("How we work" table)

- [ ] **Step 1:** Write the ADR from `templates/adr.md`, using the content in design.md §3. Match the style of `0006-one-key-per-change.md`: bold the chosen option in Considered options, and give pros and cons for the rejected options 1, 2 and 4.
- [ ] **Step 2:** Add the row `| [0008](0008-stage-files-by-explicit-path.md) | Stage files by explicit path, enforced by Claude Code deny rules |` after 0007.
- [ ] **Step 3:** Check:
  - `diff <(grep '^#' docs/explanation/decisions/templates/adr.md | sed 's/^\(#*\).*/\1/') <(grep '^#' docs/explanation/decisions/0008-stage-files-by-explicit-path.md | sed 's/^\(#*\).*/\1/')` shows only the extra `###` lines for the rejected options.
  - Every relative link in the new ADR and in the index row points to a file that exists.
- [ ] **Step 4:** Run `git status --short`, then stage by path and commit:

```bash
git add docs/explanation/decisions/0008-stage-files-by-explicit-path.md docs/explanation/decisions/README.md
git commit -m "docs: record the explicit staging decision as ADR 0008" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 3: PR

- [ ] **Step 1:** Ask, then tick the issue's three "Done when" items with `gh issue edit 22`.
- [ ] **Step 2:** Ask before `git push` and before `gh pr create`. PR title: `docs: define when a change needs an ADR`. Use the PR template, `Closes #22`, note how each "Done when" item was checked, assign the owner, and tick the new ADR item: ADR 0008 was added.
