# Plan: add the design step to the workflow

Design: [design.md](design.md). Branch: `39-design-step`.

The design holds the exact text and placement of every change. Each step below names the design section to copy from, and the plan doesn't repeat it.

## Global constraints

- Only these paths change: `AGENTS.md`, `docs/how-to/development-workflow.md`, `docs/explanation/decisions/0013-design-screens-in-code.md`, `docs/explanation/decisions/README.md`, `superpowers/39-design-step/`.
- Screenshot widths are phone 390 px and desktop 1280 px, wherever widths appear.
- The Record step says "adding no tooling just for screenshots", not "to the repo".
- The section is called "Screen design" in both files, so its anchor is `#screen-design`. Its opening text uses the phrase "design step".
- It says "Claude Design artifact", never just "Design artifact".
- Links inside the ADR use bare filenames, such as `0012-keep-the-design-system-in-code.md`.
- Refer to the project as "the project". The project's name doesn't appear.
- No formatter or linter covers Markdown here (`.prettierignore` lists `*.md` and `docs/`), so Task 5 checks links and anchors by hand.

## Review focus

- **A reader following a link:** every new link and the `#screen-design` anchor resolve from the file they're in. Task 5 checks this.
- **A Task or Bug that touches a screen:** no new sentence in steps 3, 4 or 7 reads as if it applies to it. Each one starts "For a Feature that adds or changes screens".
- **An agent reading only `AGENTS.md`:** the color, font and spacing rule rejects `bg-red-500`, and allows Tailwind's spacing and type scales.
- **#38 landing later:** ADR 0013 rejects per-screen mockups, not #38's one picture of the look.
- **ADR 0012:** unchanged. `git diff main -- docs/explanation/decisions/0012-keep-the-design-system-in-code.md` prints nothing.

---

## Task 1: Commit the design and plan

- [ ] **Step 1:** Stage the design and plan by path and commit:

```bash
git add superpowers/39-design-step/design.md superpowers/39-design-step/plan.md
git commit -m "docs: add design and plan for the design step" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 2:** Show the repository owner only `git show --stat`.

## Task 2: ADR 0013 and the index

**Files:** create `docs/explanation/decisions/0013-design-screens-in-code.md`, and modify `docs/explanation/decisions/README.md`.

- [ ] **Step 1:** Copy `docs/explanation/decisions/templates/adr.md` to `docs/explanation/decisions/0013-design-screens-in-code.md`.
- [ ] **Step 2:** Fill it in from the design's ADR section. Set the front matter to `status: accepted`, `date:` the day of writing (`YYYY-MM-DD`), and `decision-makers: repository owner`. Use the title `# 0013: Design screens in code, reviewed on the preview`. Keep every template heading, and follow ADR 0012's wording patterns, such as "Chosen option: **"…"**, because …" and "Good, because …". Remove the template's placeholder text.
- [ ] **Step 3:** In `docs/explanation/decisions/README.md`, add the row `| [0013](0013-design-screens-in-code.md) | Design screens in code, reviewed on the preview |` after the 0010 row under "How we work".
- [ ] **Step 4:** Check: `grep -c '^## ' docs/explanation/decisions/0013-design-screens-in-code.md` prints `6`, the template's section count. `grep -n 'YYYY\|NNNN\|Option A\|Option B\|\.\.\.' docs/explanation/decisions/0013-design-screens-in-code.md` prints nothing.
- [ ] **Step 5:** Commit:

```bash
git add docs/explanation/decisions/0013-design-screens-in-code.md docs/explanation/decisions/README.md
git commit -m "docs: record the screen design decision as ADR 0013" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6:** Show the repository owner only `git show --stat`.

## Task 3: `AGENTS.md`

**Files:** modify `AGENTS.md`, between "## Business specs" and "## Implementation".

- [ ] **Step 1:** Add the `## Screen design` section from the design's `AGENTS.md` section, word for word. It has an opening sentence and six bullets: Flows, Wireframe, Build from the design system, Review, Record, See. Leave every other line of `AGENTS.md` unchanged.
- [ ] **Step 2:** Check: `grep -n '390 px\|1280 px\|just for screenshots\|Claude Design artifact\|bg-red-500' AGENTS.md` shows a hit for each term. `git diff --stat main -- AGENTS.md` shows only insertions.
- [ ] **Step 3:** Commit:

```bash
git add AGENTS.md
git commit -m "docs: add the screen design step to AGENTS.md" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 4:** Show the repository owner only `git show --stat`.

## Task 4: The how-to guide

**Files:** modify `docs/how-to/development-workflow.md`.

- [ ] **Step 1:** Add `## Screen design` after the "Feature, Task and Bug" section and before "The change key", from the design's how-to section. It has:
  - the opening sentence, with "design step"
  - the five steps in the guide's voice, with the same rules as `AGENTS.md`: layout-only wireframe, the color, font and spacing rule, invented data, the 390 px and 1280 px widths, no tooling just for screenshots, the owner fallback, and replacing screenshots on a retake
  - the When and Who table
  - the attach commands
  - the sentence on a local run and the preview
- [ ] **Step 2:** Add the three sentences from the design to step 3.2, step 4 and step 7, each starting "For a Feature that adds or changes screens".
- [ ] **Step 3:** Add the ADR 0013 line from the design to "Where next", after the ADR 0010 line.
- [ ] **Step 4:** Check: the flowchart block is unchanged (`git diff main -- docs/how-to/development-workflow.md` shows no line inside the Mermaid block). `grep -c 'For a Feature that adds or changes screens' docs/how-to/development-workflow.md` prints at least `3`.
- [ ] **Step 5:** Commit:

```bash
git add docs/how-to/development-workflow.md
git commit -m "docs: describe the screen design step in the how-to guide" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6:** Show the repository owner only `git show --stat`.

## Task 5: Verify

- [ ] **Step 1:** Check the links. For each relative link in the four changed docs files, check that the target exists from that file's folder. For each `#anchor`, check that the target file has a heading that GitHub's slug rules turn into that anchor. Use a throwaway script in the scratchpad, not the repo. Expected: no missing target.
- [ ] **Step 2:** Check that the project's name doesn't appear in the changed files: `git diff main --name-only | xargs grep -il "$(basename "$(git rev-parse --show-toplevel)")"` prints nothing. The name comes from the repo folder, so the plan doesn't spell it out.
- [ ] **Step 3:** Check that ADR 0012 is unchanged: `git diff main -- docs/explanation/decisions/0012-keep-the-design-system-in-code.md` prints nothing.
- [ ] **Step 4:** Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build`. All must pass.
- [ ] **Step 5:** `git diff main --name-only` lists only the paths in Global constraints.
- [ ] **Step 6:** Get a code review of the branch against the design, with superpowers:requesting-code-review. Fix what it finds, each fix in its own commit, staged by path.

## Task 6: PR

- [ ] **Step 1:** Ask the repository owner once, before making any change on GitHub. The question covers:
  - ticking the three "Done when" items with `gh issue edit 39`
  - pushing the branch
  - opening the PR with `.github/pull_request_template.md`, titled `docs: add the design step to the workflow`, with `Closes #39`, a note on how each item was checked, and the summary saying ADR 0013 is added
  - assigning the PR to `spanciuc`

  Show the PR title and body in the question.
- [ ] **Step 2:** After the owner agrees, do those four things. The PR is docs only, so it skips the preview review.
