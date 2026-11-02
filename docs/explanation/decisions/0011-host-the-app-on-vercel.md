---
status: accepted
date: 2026-10-30
decision-makers: repository owner
---

# 0011: Host the app on Vercel

## Context and problem statement

The app is a Next.js app ([0009](0009-build-with-nextjs.md)) in a public repository in a GitHub organization ([0003](0003-public-repo-in-an-organization.md)). v0.1's login needs it running on a real host, with every merge to `main` deployed and every pull request viewable before it merges. The project has no budget, and one person runs it. Where should the app run?

## Decision drivers

- Free for a personal project.
- Runs Next.js as Next.js builds it, with no adapter.
- A preview for every pull request, and production updated on every merge, with no deploy pipeline to maintain.
- Little operations work.

## Considered options

1. **Vercel**, on the Hobby plan
2. Cloudflare Workers
3. A long-running Node server, for example `next start` on a small VPS

## Decision outcome

Chosen option: **"Vercel"**, because it builds Next.js with no config, deploys `main` and previews from its GitHub app alone, and its Hobby plan is free.

We accept these Hobby limits:

- Hobby is for personal, non-commercial use only ([Hobby plan](https://vercel.com/docs/plans/hobby)). If the project ever becomes commercial, it moves to Pro.
- Vercel's docs say only the account owner can trigger deployments on Hobby, and describe the commit-author check for private repositories ([KB guide](https://vercel.com/kb/guide/why-aren-t-commits-triggering-deployments-on-vercel)).
- Vercel staff on the community forum say Hobby can't deploy private organization repositories ([forum thread](https://community.vercel.com/t/unable-to-deploy-from-organizational-private-repository/16334)). This repository is public ([0003](0003-public-repo-in-an-organization.md)).
- Scheduled jobs run at most once a day, at some point within the scheduled hour ([cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing)).
- Instant Rollback goes back only to the previous production deployment ([Instant Rollback](https://vercel.com/docs/instant-rollback)).

### Observed on Hobby

- At import, production deployed commit `e44796f` on `main`, which carries the `Co-authored-by: Claude …` trailer. A Hobby block on such commits had been reported on the community forum ([forum thread](https://community.vercel.com/t/vercel-hobby-plan-deployment-blocked-by-claude-code-ai-co-author-attribution/35972)). It didn't happen here.
- Dependabot PRs #32 (`08c194b`) and #34 (`f1ba75b`) were squash-merged with `dependabot[bot]` as the commit author, and both deployed to production.
- The preview of PR #36 (commit `ee6f3d1`), which carries the same trailer, built successfully. Without a Vercel login, its URL redirects to Vercel's login.

### Consequences

- Good, because there's no server to run or patch, and no Vercel config in the repo.
- Good, because every pull request gets a preview behind a Vercel login, and production updates on every merge.
- Bad, because the Hobby limits above shape what the app can do, such as background jobs only once a day.
- Bad, because the framework and the host come from the same company ([0009](0009-build-with-nextjs.md)), so moving away later means checking which Vercel defaults the app relies on.

### Confirmation

- The project settings listed in the [Vercel setup guide](../../how-to/set-up-vercel.md).
- No `vercel.json` in the repo.
- The Vercel bot's preview comment on each pull request.

## Pros and cons of the options

### Cloudflare Workers

- Good, because the Workers Free plan costs nothing, and its [pricing page](https://developers.cloudflare.com/workers/platform/pricing/) doesn't mention a non-commercial clause.
- Bad, because Next.js runs there only through the [OpenNext adapter](https://opennext.js.org/cloudflare), a separate project that follows Next.js releases, and Node.js middleware isn't supported yet.
- Bad, because the Free plan caps a Worker at 3 MiB gzipped ([OpenNext docs](https://opennext.js.org/cloudflare)) and 10 ms of CPU time per invocation ([Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)).
- Bad, because it needs adapter config and a Wrangler setup in the repo.

### A long-running Node server

- Good, because it runs every Next.js feature, with no host limits.
- Bad, because we'd run, patch and secure a server, set up TLS and a deploy pipeline, and build previews ourselves.
- Bad, because it costs money every month.

## More information

- How to set it up and roll back: [Set up Vercel](../../how-to/set-up-vercel.md).
- Vercel now offers Node 26. The app stays on Node 24 for now. The upgrade is tracked in #35.
- [Deployment Protection](https://vercel.com/docs/deployment-protection)
- Related: [0003](0003-public-repo-in-an-organization.md), [0009](0009-build-with-nextjs.md)
