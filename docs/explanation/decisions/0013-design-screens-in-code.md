---
status: accepted
date: 2026-11-08
decision-makers: repository owner
---

# 0013: Design screens in code, reviewed on the preview

## Context and problem statement

v0.1's login is the first Feature with screens. [0012](0012-keep-the-design-system-in-code.md) decided where the design system lives, in code with Tailwind CSS and shadcn/ui, but not how a screen goes from idea to review. The workflow says how a Feature's business spec and technical design are made, but not how its screens are designed and checked. How should a Feature's screens be designed, and what does the owner review?

## Decision drivers

- One source of truth for how a screen looks.
- Exact values (colors, spacing, type) in one place, not copied from a picture.
- The owner reviews the real screen, not a picture of it.
- Coding agents build the screens, and the project has no design tool or subscription.

## Considered options

1. Figma mockups before code
2. Static mockup images of each screen, committed to the repo
3. Screens designed in code from the design system, reviewed on the preview

## Decision outcome

Chosen option: **"Screens designed in code from the design system, reviewed on the preview"**, because it keeps one source of truth, the exact values are in the code, and the preview shows the real screen.

For a Feature that adds or changes screens:

1. **Flows:** the Feature's OpenSpec design describes the screens and the user's path between them, as Mermaid diagrams in business language.
2. **Wireframe, only if the layout is unclear:** a Claude Design artifact, agreed with the owner. It settles layout only, and isn't stored as a source.
3. **Build from the design system:** colors and fonts only from the theme variables, spacing and type sizes only from the theme's scales, and components from shadcn/ui. No one-off values.
4. **Review:** the owner reviews the screens on the pull request's Vercel preview.
5. **Record:** the pull request includes screenshots of each new or changed screen at phone (390 px) and desktop (1280 px) widths, with invented data only.

The one picture of the chosen look that #38 commits with the design guide records the app's look as a whole. It isn't a mockup of any screen, so it doesn't conflict with this decision.

### Consequences

- Good, because there's one source of truth, with exact values in the code.
- Good, because the preview shows the real screen, as it will look in production.
- Good, because Mermaid flows are text, reviewed and archived with the OpenSpec change.
- Bad, because a screen can only be judged once it's built, so a wrong layout costs a build. The optional wireframe limits this.
- Bad, because the step has no automatic check. Nothing fails if the screenshots are missing or a one-off value slips in, so it relies on review.
- Bad, because screenshots on pull requests are public, so they need invented data.

### Confirmation

- The Screen design section in `AGENTS.md` and in the [development workflow](../../how-to/development-workflow.md#screen-design).
- Merged Features with screens have flows in their archived OpenSpec design and screenshots on their pull request.

## Pros and cons of the options

### Figma mockups before code

- Good, because it's a strong visual tool, and problems show before anything is built.
- Bad, because the mockup and the code are two sources of truth, and they drift.
- Bad, because [0012](0012-keep-the-design-system-in-code.md) already rejected Figma as the design's source of truth, partly because its AI handoff is limited on the free plan.

### Static mockup images of each screen, committed to the repo

- Good, because they need no tool or account to view, and they're versioned with the code.
- Bad, because images hold no exact values, so the code has to guess them.
- Bad, because they drift from the code with every change.
- Bad, because they add binary files to the repo.

## More information

- Issues: #39 adds this step to the workflow, and #38 defines the visual identity the screens are built from.
- Related: [0007](0007-write-business-specs-with-openspec.md), [0011](0011-host-the-app-on-vercel.md), [0012](0012-keep-the-design-system-in-code.md)
