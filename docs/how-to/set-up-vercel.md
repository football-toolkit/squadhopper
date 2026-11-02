# How to set up Vercel

Vercel builds the app from GitHub. Every merge to `main` deploys to production, and every other branch gets a preview. The owner does this setup once, by hand, because an agent can't create accounts. Why Vercel: [ADR 0011](../explanation/decisions/0011-host-the-app-on-vercel.md).

## Before you start

- You need to be the owner of the GitHub organization, and use the owner's GitHub account.
- Vercel Hobby is free, for personal, non-commercial use only.

## Steps

1. **Sign up.** Sign up for Vercel Hobby with the owner's GitHub account, and turn on two-factor authentication.
2. **Install the GitHub app.** Install the Vercel GitHub app on the organization. Under repository access, pick only this repository.
3. **Import the repository.** Vercel detects Next.js. Keep the default settings, and don't add a `vercel.json`. Importing deploys the current `main` to production.
4. **Add the environment variable.** Add `NEXT_TELEMETRY_DISABLED` with the value `1`, type Config (it isn't secret), for all environments. You can add it on the import screen, under Environment Variables, before the first deploy. If you add it later, in the project's Settings → Environment Variables, redeploy production, because a change only applies to new deployments.
5. **Protect the previews.** In Settings → Deployment Protection, pick Standard Protection with Vercel Authentication. Previews then need a Vercel login, and production stays public, because the app's login page will live there.
6. **Pick the Node.js version.** In Settings → Build and Deployment → Node.js Version, pick 24.x, to match `engines` in `package.json`. If the two differ, `engines` wins, so production runs on Node 24 either way. The setting just keeps the dashboard in line with it. The upgrade to Node 26 is tracked in #35.

## Check it works

- Open the production URL in a private browser window. It shows the app with no login.
- On a pull request, open the preview link the Vercel bot comments in a private browser window. It asks for a Vercel login.

## What deploys

Every push to `main` deploys to production, and every other branch gets a preview. Vercel's docs say only the account owner can trigger deployments on Hobby, and describe the commit-author check for private repositories.

What we've seen so far:

- The import deployed a `main` commit that carries a `Co-authored-by` trailer.
- Squash-merged Dependabot pull requests, authored by `dependabot[bot]`, deployed to production too.

The commits behind each result are in [ADR 0011](../explanation/decisions/0011-host-the-app-on-vercel.md).

## Roll back production

1. On the project's overview, find the Production Deployment tile and choose **Instant Rollback**. You can also use the ⋮ menu next to a deployment on the Deployments page.
2. Check the details in the dialog, and confirm.

On Hobby you can only go back to the production deployment just before the current one.

> **After a rollback, merges to `main` still build, but don't go live.** Vercel turns off automatic production deploys until you undo the rollback. Fix the problem through the normal [workflow](development-workflow.md), then click **Undo Rollback** on the Production Deployment tile and pick the fixed deployment. That promotes it and turns automatic production deploys back on.

## Where next

- 💡 Why Vercel: [ADR 0011](../explanation/decisions/0011-host-the-app-on-vercel.md)
- 🛠️ From idea to merge: [Development workflow](development-workflow.md)
- ⬆️ [How-to guides](README.md)
- 🏠 [Docs home](../README.md)
