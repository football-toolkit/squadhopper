# Design: deploy to Vercel

Issue: #27 (Task). Branch and change key: `27-vercel-deploy`.

## Intent

v0.1's login has to run on the real host. This change records how the empty app was put on Vercel, so the host, the deploy flow and the Hobby limits are proven before any login code depends on them. The owner has already done the Vercel setup by hand. What's left is in the repo: a how-to guide that lets anyone repeat the setup and roll back, an ADR that says why Vercel and which limits we accept, and a step in the workflow to review each PR's preview before merging.

## Goals

Issue #27's "Done when" list:

- [ ] At import, production shows the placeholder page, deployed from a `main` commit that carries the `Co-Authored-By` trailer
- [ ] This PR's branch gets a Vercel preview that builds successfully
- [ ] Previews require a Vercel login; production is public
- [ ] `NEXT_TELEMETRY_DISABLED=1` is set in Vercel as a Config variable
- [ ] The how-to guide covers every setup step and how to roll back
- [ ] An ADR "Host the app on Vercel" is accepted and in the index, and records the `Co-Authored-By` and Dependabot results as observed facts

## Non-goals

- No `vercel.json`, and no change to app code or config. The import's defaults are what we keep.
- No function region choice. It stays at the default until the login issue picks it together with the Supabase region.
- Vercel's PR check isn't added to the `main` ruleset. CI stays the only merge gate.
- No secrets, no Supabase.
- No Node 26 upgrade. That's #35.
- No change to accepted ADRs, including 0003 and 0009, which already mention Vercel.

## Anti-goals

- No hard-coded URLs, project name or team name in the docs. The guide describes where to click, not what the owner's project is called.
- No personal data: no email addresses, account names or screenshots.
- Results are written as what was observed, with the commit or PR that shows them. They aren't presented as risks or guesses, and the docs don't guess at why Vercel behaved as it did.
- Sources stay separate: what Vercel's docs say, what Vercel staff said on the community forum, and what we observed are each attributed to their source.

## Facts this change records

### The owner's setup (done by hand, 2026-10-30)

1. Vercel Hobby account, signed up with the owner's GitHub account, with two-factor authentication on.
2. The Vercel GitHub app is installed on the organization, with access to this repository only.
3. The repository was imported with the default settings. Vercel detected Next.js.
4. `NEXT_TELEMETRY_DISABLED=1` is a Config variable for all environments.
5. Deployment Protection is set to Standard Protection with Vercel Authentication.
6. The project's Node.js version is 24.x. The project setting defaulted to 26.x, but `engines` in `package.json` (`24.x`) overrides it, so production already ran on 24. The owner set the project setting to 24.x so the two match. Vercel now offers Node 26, so #25's reasoning that 24 is the newest Vercel supports is out of date. The upgrade is tracked in #35.

### Observed results

- **Import:** the first production deployment is Ready. It deployed commit `e44796f` on `main`, which carries the `Co-authored-by: Claude …` trailer. The production URL shows "Coming soon" with no login, checked in a private browser window. So the Hobby block reported on the community forum for such commits didn't happen here.
- **Dependabot:** PRs #32 (`08c194b`) and #34 (`f1ba75b`) were squash-merged with `dependabot[bot]` as the commit author, and Vercel deployed both to production.
- **Preview:** this branch's commits carry the same trailer. The result of its preview build is recorded once it has run (see "Recording the preview result").

### Verified against the docs (2026-10-30)

- **Hobby plan** ([docs](https://vercel.com/docs/plans/hobby)): free, for personal, non-commercial use only. 100 deployments a day.
- **Who can deploy** ([KB guide](https://vercel.com/kb/guide/why-aren-t-commits-triggering-deployments-on-vercel)): on Hobby, only the account owner can trigger deployments. The commit-author check is described for private repositories connected to a team project. The guide says nothing about public or organization repositories, or about co-authors.
- **Private organization repositories:** Vercel staff on the community forum say a Hobby team can't deploy from a private repository in a GitHub organization ([thread](https://community.vercel.com/t/unable-to-deploy-from-organizational-private-repository/16334)). The docs don't say this. This repository is public ([ADR 0003](../../docs/explanation/decisions/0003-public-repo-in-an-organization.md)).
- **Cron jobs** ([docs](https://vercel.com/docs/cron-jobs/usage-and-pricing)): on Hobby, at most once a day, fired anywhere within the scheduled hour. A more frequent schedule fails the deployment.
- **Deployment Protection** ([docs](https://vercel.com/docs/deployment-protection)): Standard Protection is on every plan and protects every deployment except the production domains. Vercel Authentication is available on Hobby. Settings → Deployment Protection.
- **Environment variables** ([docs](https://vercel.com/docs/environment-variables)): each variable is Config (stays readable) or Secret (write-only after saving). Changes apply only to new deployments.
- **Instant Rollback** ([docs](https://vercel.com/docs/instant-rollback)): Hobby can roll back only to the immediately previous production deployment. Start it from the Production Deployment tile on the project's overview, or from a deployment's ⋮ menu on the Deployments page. After a rollback, Vercel turns off auto-assignment of production domains, so new pushes to `main` don't go live. **Undo Rollback** on the same tile promotes a deployment you pick and turns auto-assignment back on.
- **Node.js versions** ([docs](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)): 26.x (the default), 24.x and 22.x. `engines.node` in `package.json` overrides the project setting, which is under Settings → Build and Deployment → Node.js Version.
- **GitHub integration** ([docs](https://vercel.com/docs/git/vercel-for-github)): every push deploys. Pushes to the production branch go to production, other branches get a preview, and the Vercel bot comments the preview link on the PR.
- **Cloudflare Workers** (for the ADR's options): Next.js runs there through the OpenNext adapter, `@opennextjs/cloudflare`, a separate project that tracks Next.js releases. Its docs list Node.js middleware as not supported yet, and cap a Worker at 3 MiB gzipped on the Free plan ([OpenNext docs](https://opennext.js.org/cloudflare)). The Workers Free plan allows 100,000 requests a day and 10 ms of CPU time per invocation ([pricing](https://developers.cloudflare.com/workers/platform/pricing/)).

## What gets built

### `docs/how-to/set-up-vercel.md`

Title: "How to set up Vercel". A short intro: Vercel builds the app from GitHub, deploys every merge to `main` to production, and gives every other branch a preview. The owner does this setup once, by hand, because an agent can't create accounts. Why Vercel: link ADR 0011.

Sections:

1. **Before you start.** You need to be the owner of the GitHub organization, and have the owner's GitHub account. Vercel Hobby is for personal, non-commercial use only.
2. **Steps.** Each step says where to click, using the dashboard's labels, with no URLs or names of our project:
   1. Sign up for Vercel Hobby with the owner's GitHub account, and turn on two-factor authentication.
   2. Install the Vercel GitHub app on the organization. Under repository access, pick only this repository.
   3. Import the repository. Vercel detects Next.js. Keep the default settings, and don't add a `vercel.json`. Importing deploys the current `main` to production.
   4. In the project's Settings → Environment Variables, add `NEXT_TELEMETRY_DISABLED` with value `1`, type Config (it isn't secret), for all environments. A change applies only to new deployments, so redeploy if you add it after the import.
   5. In Settings → Deployment Protection, pick Standard Protection with Vercel Authentication. Previews then need a Vercel login, and production stays public, because the app's login page will live there.
   6. In Settings → Build and Deployment → Node.js Version, pick 24.x, to match `engines` in `package.json`. My call: the guide says that `engines` wins if the two differ, so production runs on 24 either way, and the setting is there so the dashboard doesn't say otherwise. The upgrade to Node 26 is tracked in #35.
3. **Check it works.** Open the production URL in a private browser window: it shows the app with no login. On a pull request, open the preview link the Vercel bot comments: it asks for a Vercel login.
4. **What deploys.** Every push to `main` deploys to production, and every other branch gets a preview. Vercel's docs say only the account owner can trigger deployments on Hobby. What we've seen: the import deployed a `main` commit that carries a `Co-Authored-By` trailer, and squash-merged Dependabot PRs, authored by `dependabot[bot]`, deployed to production too. Details and commits: ADR 0011.
5. **Roll back production.** From the Production Deployment tile on the project's overview (or a deployment's ⋮ menu on the Deployments page), choose Instant Rollback, check the details, and confirm. On Hobby you can only go back to the deployment just before the current one. Then a warning, set apart as a blockquote: after a rollback, merges to `main` still build but don't go live. Fix the problem through the normal workflow, then use **Undo Rollback** on the same tile to promote the fixed deployment, which turns automatic production deploys back on.
6. **Where next.** The ADR, the development workflow, the how-to index, docs home.

### ADR 0011: Host the app on Vercel

`docs/explanation/decisions/0011-host-the-app-on-vercel.md`, from the template, `status: accepted`, `date: 2026-10-30`, `decision-makers: repository owner`.

- **Context:** the app is a Next.js app ([0009](0009-build-with-nextjs.md)) in a public repository in an organization ([0003](0003-public-repo-in-an-organization.md)). v0.1's login needs it running on a real host, with every merge to `main` deployed and every PR viewable before merging. The project has no budget, and one person runs it.
- **Decision drivers:** free for a personal project; runs Next.js as Next.js builds it, with no adapter; a preview per PR, and production updated on every merge, with no deploy pipeline to maintain; little operations work.
- **Considered options:**
  1. **Vercel** (Hobby plan)
  2. Cloudflare Workers
  3. A long-running Node server, for example `next start` on a small VPS
- **Decision outcome:** Vercel, because it builds Next.js with no config, deploys `main` and previews from the GitHub app alone, and the Hobby plan is free. Then the accepted limits, as a list:
  - Hobby is for personal, non-commercial use only. If the project ever becomes commercial, it moves to Pro.
  - Vercel's docs say only the account owner can trigger deployments on Hobby, and describe the commit-author check for private repositories ([KB guide](https://vercel.com/kb/guide/why-aren-t-commits-triggering-deployments-on-vercel)).
  - Vercel staff on the community forum say Hobby can't deploy private organization repositories ([thread](https://community.vercel.com/t/unable-to-deploy-from-organizational-private-repository/16334)). This repository is public (0003).
  - Scheduled jobs run at most once a day, within the scheduled hour.
  - Instant Rollback on Hobby goes back only to the previous production deployment.
- **Observed results** (a subsection under the outcome, "Observed on Hobby"):
  - At import, production deployed `e44796f` on `main`, which carries the `Co-authored-by: Claude …` trailer. A Hobby block on such commits had been reported on the community forum ([thread](https://community.vercel.com/t/vercel-hobby-plan-deployment-blocked-by-claude-code-ai-co-author-attribution/35972)); it didn't happen here.
  - Dependabot PRs #32 (`08c194b`) and #34 (`f1ba75b`), squash-merged with `dependabot[bot]` as the commit author, both deployed to production.
  - The preview line, once observed (see below).
- **Consequences:**
  - Good, because there's nothing to run or patch, and no config in the repo.
  - Good, because every PR gets a preview behind a Vercel login, and production updates on every merge.
  - Bad, because the Hobby limits above shape what the app can do, such as background jobs only once a day.
  - Bad, because the framework and the host come from the same company (as 0009 notes), so moving away later means checking which Vercel defaults the app relies on.
- **Confirmation:** the project settings listed in the how-to guide; no `vercel.json` in the repo; the Vercel bot's preview comment on each PR.
- **Pros and cons of the options:**
  - Cloudflare Workers: good, a free plan with no non-commercial clause that we found (my call: the ADR says only that the pricing page doesn't mention one); bad, Next.js runs only through the OpenNext adapter, a separate project that follows Next.js releases, and Node.js middleware isn't supported yet; bad, the Free plan caps a Worker at 3 MiB gzipped and 10 ms of CPU per invocation; bad, it needs adapter config and a Wrangler setup in the repo.
  - A long-running Node server: good, the full Next.js feature set with no host limits; bad, we'd run, patch and secure a server, set up TLS and a deploy pipeline, and build previews ourselves; bad, it costs money every month.
- **More information:** the how-to guide; Vercel offers Node 26, and the upgrade is tracked in #35; links to 0003 and 0009; the Hobby, Deployment Protection and Instant Rollback docs.

Add it to the "Stack and architecture" table in `docs/explanation/decisions/README.md`, with the decision column exactly the ADR title: "Host the app on Vercel".

### `docs/how-to/development-workflow.md`

The preview review is scoped to app changes (the owner's call): docs-only and workflow PRs don't need one. The same scope is used in `AGENTS.md`, the step and the flowchart.

- The flowchart's last edge becomes `H -->|"CI green, preview reviewed if the app changed"| I`.
- A new step 8, **Review the preview, if the app changed.** When a pull request changes what the app shows or does, the Vercel bot's preview link on the pull request is where the owner checks it before merging. The owner opens it (it needs the owner's Vercel login) and checks the change works as it will in production. Docs-only and workflow pull requests skip this step. Link the Vercel guide. My call: the owner does this step, because on Hobby only the account owner can log in to see a preview. An agent can't, so it doesn't claim the preview was reviewed.
- The old step 8 becomes step 9: **Squash-merge** once CI is green, the owner has reviewed the preview if the app changed, and the pull request checklist is complete … then add: merging deploys `main` to production.
- "Where next" gets a link to the Vercel guide.
- The Dependency updates section stays as it is (my call): ADR 0010 sets the bar for Dependabot PRs at green CI plus the owner's review, and this change doesn't move it.

### `AGENTS.md`

Because AGENTS.md says to update it when conventions change, the Workflow section gets a new bullet right after "Merge only after CI is green and the PR checklist is complete.", with the owner's wording: "When a PR changes what the app shows or does, the repository owner reviews its Vercel preview before merging." The "Merge only after…" bullet and everything else stay as they are.

### Indexes

- `docs/how-to/README.md`: a row for [Set up Vercel](set-up-vercel.md), "How to deploy the app to Vercel, and how to roll back".
- `docs/README.md`: the How-to guides row becomes "The development workflow, from idea to merge, and the Vercel setup".

## Recording the preview result

The issue wants the preview of this branch to show whether a commit with the `Co-Authored-By` trailer builds as a preview. The design and plan commit is pushed first (the owner's call, approved 2026-10-30), so the result goes into the ADR rather than only the PR body. Vercel builds its preview. I read the result with `gh api` (the commit's deployment status), and check that the preview URL answers with a Vercel login, not the app. The ADR, written after that, records the result as a third observation.

If the preview fails to build, or Vercel blocks it, I stop and tell the owner before writing the ADR, with the deployment status and the Vercel bot's comment, if there is one (my call). "Done when" item 2 can't be ticked then, and whether Vercel is still the right choice is the owner's call, not something to settle in an accepted ADR.

The unauthenticated request to the preview URL only shows that the preview needs a login, for "Done when" item 3. It isn't the review of the preview: the owner does that before merging, as the new workflow step says.

## Commits

My call, one logical change each:

1. `docs: design and plan the Vercel deploy` stages `superpowers/27-vercel-deploy/design.md` and `plan.md`.
2. `docs: decide to host the app on Vercel` stages the ADR and the ADR index.
3. `docs: add a guide to set up Vercel` stages the guide, `docs/how-to/README.md` and `docs/README.md`.
4. `docs: review the PR preview before merging` stages `docs/how-to/development-workflow.md` and `AGENTS.md`.

## Ticking the "Done when" items

- Items 1 and 4 (production at import, the Config variable): from the owner's report in this session, before opening the PR.
- Items 2 and 3 (the preview builds, and needs a login; production is public): from the branch's deployment status and an unauthenticated request to the preview URL, plus the owner's private-window check of production.
- Items 5 and 6 (the guide, the ADR): from the files.

The PR body says how each was checked.

## Testing

No app code changes, so no new unit tests. Instead:

- Run the five checks before each commit, as AGENTS.md requires.
- Check that every relative link in the changed docs points to a file that exists.
- Grep the guide and the ADR for `vercel.app`, the project name and the organization name: none may appear.
- The preview build of this branch is the real test of the deploy flow.

## Left to the builder

- The exact wording of the guide, the ADR and the workflow step, within what's above.
- The exact dashboard labels in the guide, kept to the ones the docs above use.
