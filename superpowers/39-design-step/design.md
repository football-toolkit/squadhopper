# Design: add the design step to the workflow

Issue: #39 (Task). Branch and change key: `39-design-step`.

## Intent

v0.1's login Feature is the first with screens. The workflow says how a Feature's business spec and technical design are made, but not how its screens are designed and reviewed. This change writes that step down before the Feature starts, so the screens get designed the same way each time.

## Goals

Issue #39's "Done when" list:

- [ ] `AGENTS.md` and the how-to guide describe the design step for Features with screens
- [ ] The ADR "Design screens in code, reviewed on the preview" is accepted and in the index
- [ ] No other file changes, except this change's `superpowers/` folder

## Non-goals

- No app changes. The issue is docs only.
- No change to `openspec/config.yaml` (see "Verification against the docs") or `.github/pull_request_template.md` (see "Calls made in this design"). The issue allows no other files.
- No tooling just for screenshots. Playwright will come with the login Feature's end-to-end tests, and using it for screenshots then is allowed.
- The step doesn't cover Tasks and Bugs that touch screens. They keep the existing preview rule, and need no flows or screenshots. The issue scopes the step to Features.
- The step doesn't define the visual identity. That's #38. The step works with whatever the theme holds when a Feature is built.

## Verification against the docs

Before this design, what the issue relies on was checked against the docs and the repo:

- **Mermaid in OpenSpec's design.** GitHub renders Mermaid, and the how-to guide already uses it. `openspec/config.yaml` tells OpenSpec's `design.md` to "Describe user flows", in "Business language only: no technology, libraries, data structures, APIs or code." A diagram of the user's path, labeled in business language, fits this, so the config doesn't need to change. The guide says the labels stay in business language.
- **Claude Design artifact.** Claude's Artifact tool lists a "Design" type for "screens, UI mockups, wireframes", and artifacts are private by default. #38 uses the same term, "with Claude". Not storing it as a source matches [ADR 0012](../../docs/explanation/decisions/0012-keep-the-design-system-in-code.md), whose Confirmation says no design-tool link is a source of truth.
- **Theme tokens.** Today `src/app/globals.css` holds colors, the radius scale and the heading font, but no spacing tokens. `@import "tailwindcss"` also brings in Tailwind 4.3.4's defaults from `node_modules/tailwindcss/theme.css`: the spacing scale (`--spacing: 0.25rem`), the type sizes (`--text-sm`), and colors and fonts that aren't part of the design (`--color-red-500`, `--font-serif`). #38 will make spacing a theme value too. So the rule has to name what comes from where, and it must not allow every Tailwind default.
- **Screenshots on a PR.** gh 2.102.0 has `--attach` on `gh pr create`, `gh pr edit` and `gh pr comment`, for images and video, up to 50 files per command ([gh pr create manual](https://cli.github.com/manual/gh_pr_create), plus each command's `--help`). `gh pr edit --attach` keeps the existing body and appends the attachment.
- **Who can see the screenshots.** [GitHub's docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files) say files uploaded to a public repository can be accessed without authentication, with a 10 MB limit for images. This repo is public, so screenshots need the same care as committed files.
- **The preview.** [Set up Vercel](../../docs/how-to/set-up-vercel.md) protects previews with a Vercel login, and the how-to guide already says an agent can't do the preview review. So an agent can't capture screenshots from the preview either.
- **This machine.** `chromium`, `chromium-browser`, `google-chrome` and `playwright` aren't on the PATH, and Playwright and Puppeteer aren't installed in the repo. Whether a Claude browser tool can capture at set widths wasn't checked. So the owner fallback may be the usual path here, not an edge case.

The issue holds up. Nothing in it is out of date. One phrase needs care: "only the theme tokens" can't literally cover spacing until #38 merges, which the rule below handles.

## Changes

### `AGENTS.md`

Add a section `## Screen design` between "Business specs" and "Implementation":

> The design step for Features that add or change screens. Everything else skips this section.
>
> - **Flows:** the Feature's OpenSpec design describes the screens and the user's path between them, as Mermaid diagrams, in business language.
> - **Wireframe, only if the layout is unclear:** the agent or the repository owner can call for one. Sketch it as a Claude Design artifact and agree it with the repository owner. It settles layout only, and isn't stored as a source.
> - **Build from the design system:** take colors and fonts only from the theme variables in `src/app/globals.css`, spacing and type sizes only from the theme's scales (Tailwind's defaults, unless `globals.css` overrides them), and components from shadcn/ui. No one-off colors, fonts or spacing, such as `p-[13px]`, `text-[#123456]` or `bg-red-500`. This covers the code we write for screens, not what `npx shadcn add` generates.
> - **Review:** the repository owner reviews the screens on the PR's Vercel preview.
> - **Record:** the PR includes screenshots of each new or changed screen at phone (390 px) and desktop (1280 px) widths. The agent captures them from `npm run dev` with a browser it can already drive, adding no tooling just for screenshots. If it can't, the repository owner captures them from the preview or a local run. They're publicly reachable, so use invented data only. If the review changes a screen, retake its screenshots and replace the old ones in the PR body.
> - See [the how-to guide](docs/how-to/development-workflow.md#screen-design) and [ADR 0013](docs/explanation/decisions/0013-design-screens-in-code.md).

The existing bullet under Code ("Style with Tailwind classes…") stays. The new section adds the "no one-offs" limit and doesn't repeat how to add a component. The existing rule to ask before any `gh pr` command applies to attaching screenshots too, so the section doesn't restate it.

### `docs/how-to/development-workflow.md`

Add a section `## Screen design` after "Feature, Task and Bug". It opens by calling this the design step for Features that add or change screens, then has the five steps from `AGENTS.md` in the guide's voice, with this table saying when each happens:

| Step | When | Who |
| --- | --- | --- |
| Flows | Written with `/opsx:propose`, reviewed with the rest of the change | Agent writes, owner reviews |
| Wireframe, if needed | Before the owner finishes reviewing the OpenSpec change | Agent sketches, owner agrees |
| Build from the design system | During Superpowers | Agent |
| Review on the preview | After the PR opens (step 8) | Owner |
| Screenshots | When the PR opens, and again if the review changes a screen | Agent, else owner |

It also says:

- The widths: phone 390 px and desktop 1280 px, one screenshot of each new or changed screen at each.
- How to attach them: `gh pr create --attach` when opening the PR, or `gh pr edit --attach` once it's open, with `gh pr comment --attach` if that fails. Alt text goes after `#`, as in `--attach './login-phone.png#Login at phone width'`. The owner can also drag files into the PR on GitHub.
- A local run and the preview build the same code at the same commit, apart from data and environment settings. So the screenshots are a record, and the owner's preview review stays the check.

Add to the numbered steps, with nothing else in them changing:

- Step 3.2, after "all in business language": "For a Feature that adds or changes screens, the design also holds its flows (see [Screen design](#screen-design))."
- Step 4: "For a Feature that adds or changes screens, build them from the design system (see [Screen design](#screen-design))."
- Step 7: "For a Feature that adds or changes screens, attach the first screenshots when opening the pull request (see [Screen design](#screen-design))."

Add to "Where next", following the pattern: `- 💡 Why screens are designed in code: [ADR 0013](../explanation/decisions/0013-design-screens-in-code.md)`.

The flowchart at the top stays as it is, because the design step adds no new branch to the path. It happens inside the existing OpenSpec, Superpowers and pull request boxes.

### `docs/explanation/decisions/0013-design-screens-in-code.md`

New ADR, from the template with all its sections, `status: accepted`, dated the day the PR is written, titled "0013: Design screens in code, reviewed on the preview". Links in the ADR use bare filenames, as ADR 0012 does.

- **Context:** v0.1's login is the first Feature with screens. ADR 0012 decided where the design system lives, but not how a screen goes from idea to review.
- **Drivers:** one source of truth, exact values in the code, and reviewing the real screen. Coding agents build the screens, and the project has no design tool or subscription.
- **Options:**
  1. Figma mockups before code
  2. Static mockup images of each screen, committed to the repo
  3. Screens designed in code from the design system, reviewed on the preview
- **Outcome:** Chosen option: **"Screens designed in code from the design system, reviewed on the preview"**, because it keeps one source of truth, the exact values are in the code, and the preview shows the real screen. It also says that the one picture #38 commits records the chosen look, and isn't a mockup of any screen.
- **Consequences:**
  - Good, because there's one source of truth, with exact values in the code.
  - Good, because the preview shows the real screen.
  - Good, because Mermaid flows are text, reviewed and archived with the OpenSpec change.
  - Bad, because a screen can only be judged once it's built, so a wrong layout costs a build. The optional wireframe limits this.
  - Bad, because the step has no automatic check. Nothing fails if the screenshots are missing or a one-off value slips in, so it relies on review.
  - Bad, because screenshots on PRs are public, so they need invented data.
- **Confirmation:** the Screen design section in `AGENTS.md` and the how-to guide. Merged Features with screens have flows in their archived OpenSpec design and screenshots on their PR.
- **Pros and cons of the rejected options:**
  - Figma mockups before code. Good, because it's a strong visual tool, and problems show before anything is built. Bad, because the mockup and the code are two sources of truth that drift, and ADR 0012 already rejected Figma as a source of truth and notes its AI handoff limits on the free plan.
  - Static mockup images of each screen. Good, because they need no tool or account to view, and they're versioned with the code. Bad, because images hold no exact values, they drift from the code with every change, and they add binary files to the repo.
- **More information:** related ADRs [0007](0007-write-business-specs-with-openspec.md), [0011](0011-host-the-app-on-vercel.md) and [0012](0012-keep-the-design-system-in-code.md). Issues #38 and #39.

ADR 0012 stays untouched. It already points to #39, and accepted ADRs are never rewritten.

### `docs/explanation/decisions/README.md`

Add a row under "How we work": `| [0013](0013-design-screens-in-code.md) | Design screens in code, reviewed on the preview |`. The issue's "Done when" list requires it.

## Calls made in this design

**The repository owner decided:**

- The agent captures screenshots from a local run and attaches them. If it has no browser available, the owner does it.
- Screenshots are taken at phone (390 px) and desktop (1280 px) widths.
- The rule adds no tooling just for screenshots. Playwright, once the login Feature adds it for end-to-end tests, may be used for them.

**Made by the agent, for the owner to check:**

- Colors and fonts come only from the theme variables, and spacing and type sizes from the theme's scales. Allowing "Tailwind's defaults" outright would let `bg-red-500` and `font-serif` through, against the issue's "no one-off colors, fonts".
- The rule covers the code we write for screens, not what `npx shadcn add` generates.
- Screenshots hold invented data only. The issue doesn't say this, but they're publicly reachable and the repo rules forbid personal data.
- With no browser, the owner both captures and attaches, from the preview or a local run. "A browser it can already drive" includes a Claude browser tool, and Playwright once the login Feature adds it for end-to-end tests.
- A retake replaces the old screenshots in the PR body, because `--attach` only appends. Old uploads may stay reachable, which is one more reason for invented data.
- A wireframe settles layout only, so it can't become a second source for colors or spacing. Either the agent or the owner can call for one. It has no fallback beyond Claude, because it's optional.
- It's written "Claude Design artifact", and the section is called "Screen design", to avoid the meanings "design" and "artifact" already have here in OpenSpec and Superpowers.
- ADR 0013 rejects mockups of each screen, and says that #38's one committed picture records the look, so the two don't conflict.
- The PR template isn't changed, because the issue allows no other files, so it won't remind anyone about screenshots. If that matters, it's a follow-up issue.

## Testing

No code changes. Run the pre-commit checks from `AGENTS.md`. Check that the links and the `#screen-design` anchor resolve, and that `git status` lists only `AGENTS.md`, `docs/how-to/development-workflow.md`, the new ADR, `docs/explanation/decisions/README.md` and `superpowers/39-design-step/`.
