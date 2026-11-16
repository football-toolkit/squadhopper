# Design: set up Supabase

Issue: #62 (Task). Branch and change key: `62-supabase-setup`.

## Intent

The login Feature needs a real auth service in production. The owner has already set up the one Supabase project by hand. This change pins the app's functions to Frankfurt, next to the database, and records the setup so anyone can repeat it. It also records why Supabase, why Frankfurt, and which limits we accept. With that done, the login Feature only adds code.

## Goals

Issue #62's "Done when" list:

- [ ] One Supabase project exists in Frankfurt (`eu-central-1`), with sign-ups off, a 12-character minimum password and the Data API off
- [ ] `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are set in Vercel for Production only, without `NEXT_PUBLIC_`
- [ ] The PR's Vercel preview shows its functions in `fra1`
- [ ] `docs/how-to/set-up-supabase.md` covers every setup step, and the Vercel how-to no longer forbids `vercel.json`
- [ ] Both ADRs are accepted and in the index

## Non-goals

- No app code reads Supabase yet. No `AuthService` port, no Supabase or mock implementation, no `APP_ENV`, and no Supabase client package (all the login Feature).
- No temporary Supabase in CI (the login Feature).
- No decision about free-project pausing. The ADR records it as an accepted limit, and it gets decided later.
- No change to ADR 0011 beyond the one "Amended by" line.

## Anti-goals

- No hard-coded project URL, project ID, key, project name or team name in the docs. The guide says where to click, not what the owner's project is called.
- No personal data and no screenshots.
- Sources stay separate. What Supabase's or Vercel's docs say, what a Supabase blog post says, and what the owner saw in the dashboard are each credited to their source. The guide doesn't guess how the dashboard works inside, for example what "Change to Config" does.

## Approaches

The issue settles the how. There's one sensible way: docs plus a `vercel.json`. The alternatives the issue considered are:

- **Function region in the dashboard** (Settings → Functions) instead of `vercel.json`. Rejected by the issue: a dashboard setting isn't reviewed or versioned. Vercel's docs say `vercel.json` overrides the dashboard setting, so the repo is the single source.
- **Supersede ADR 0011** so `vercel.json` is allowed. Rejected by the owner: hosting on Vercel still stands. Instead, 0011 gets one "Amended by" line and the new ADR explains the change.
- **`vercel.ts`** instead of `vercel.json`. Vercel's docs offer it as an alternative, but it runs code at build time for a single static value. Not worth it.

## The owner's setup (done by hand, recorded as done)

1. Supabase Free plan, signed up with the owner's GitHub account, two-factor authentication on.
2. One project:
   - Region: the dropdown opens on "General regions" (Americas, Europe, Asia-Pacific), where "Europe" can land in London or Zurich. The owner scrolled to "Specific regions" and picked **Central EU (Frankfurt)**. Project Settings → General shows `eu-central-1`. Advanced configuration has no region setting.
   - Database password saved in the owner's password manager.
   - Security options on the form: **Enable Data API** ticked at creation, then switched off under Integrations → Data API. **Automatically expose new tables** unticked (Supabase recommends it). **Enable automatic RLS** ticked.
   - Advanced configuration: Postgres type left at **Postgres** (the default).
3. Authentication: **Allow new users to sign up** off, minimum password length **12**.
4. Vercel, Production only: `SUPABASE_URL` (`https://<project-id>.supabase.co`, with the project ID from Project Settings → General) and `SUPABASE_PUBLISHABLE_KEY` (from Project Settings → API Keys). The Connect dialog didn't match Supabase's docs, so the guide doesn't use it.

## Changes

### `vercel.json` (new)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "regions": ["fra1"]
}
```

The `$schema` line is my call: it's what Vercel's docs show, and it gives editor checks. `vercel.json` is added to the `format` and `format:check` scripts in `package.json`, like the other config files. AGENTS.md already says "the config files", so it doesn't change.

### `docs/how-to/set-up-supabase.md` (new)

Same shape as `set-up-vercel.md`:

- **Intro:** what this sets up, that the owner does it once by hand, and links to both ADRs.
- **Before you start:** the owner's GitHub account. The Free plan, with its limits (pausing after a week with no activity, two active projects).
- **Steps:**
  1. Sign up and turn on two-factor authentication.
  2. Create the project:
     - the region under "Specific regions", and why
     - the password goes in the password manager
     - the three security options, each with its reason:
       - Data API off, because nothing uses it yet; a later Feature turns it on if it needs it. Where to switch it off if the project already exists: Integrations → Data API.
       - Auto-expose off, as Supabase recommends.
       - Automatic RLS on.
     - Postgres type left at "Postgres": OrioleDB is in beta, and the type can't be changed after creation
  3. Authentication settings: sign-ups off (the owner adds users in the dashboard), minimum password length 12. How to add a user.
  4. Vercel environment variables:
     - where each value comes from
     - Production only
     - no Marketplace integration
     - a warning box: keep the names exactly `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Supabase's Next.js snippet uses `NEXT_PUBLIC_` names, and Vercel warns about them. Don't add the `NEXT_PUBLIC_` prefix, and don't click **Change to Config**. In the owner's words, written as Vercel's warning puts it: Config keeps the `NEXT_PUBLIC_` name, so the value would still be built into the browser code, and we keep both values on the server.
     - if the values are added or changed after the code that reads them is live, redeploy production, because a change only applies to new deployments. This time the merge deploys anyway.
- **Check it works:**
  - Project Settings → General shows `eu-central-1`
  - the auth settings show sign-ups off and 12
  - Integrations → Data API shows it off
  - Vercel lists exactly the two variables, Production only
  - a deployment's functions show `fra1`
- **Where next:** links in the same style as the Vercel guide.

### `docs/how-to/set-up-vercel.md`

Step 3: replace "and don't add a `vercel.json`" with a sentence saying the repo's `vercel.json` runs the functions in Frankfurt (`fra1`), linking the Frankfurt ADR. Add the Supabase guide to "Where next".

### `docs/how-to/README.md`

Add a row for "Set up Supabase".

### ADR 0016: Use Supabase for authentication

- **Context:** v0.1's login needs users and passwords in production, with no budget and one person running it, on Vercel Hobby.
- **Drivers:** free; data in the EU; little operations work; keys can stay on the server; users added by hand.
- **Options:** Supabase Auth; Auth.js with our own database; Clerk.
- **Outcome:** Supabase Auth. The project settings and why each was chosen:
  - sign-ups off
  - minimum password length 12
  - Data API off ("off, because nothing uses it yet; a later Feature turns it on if it needs it")
  - auto-expose off
  - automatic RLS on, citing the [Supabase security blog post](https://supabase.com/blog/supabase-security-2025-retro), since the docs don't cover the checkbox
  - Postgres, not OrioleDB
  - only the publishable key, under names without `NEXT_PUBLIC_`, in Production only
- **Accepted limits:**
  - Free projects pause after a week with no activity ([pausing](https://supabase.com/docs/guides/platform/free-project-pausing)). What to do about it is decided later.
  - Sign-in rate limits are per address, and calls from our server show Vercel's address. Passing the visitor's address needs a secret key. The [rate limits page](https://supabase.com/docs/guides/auth/rate-limits) says of forwarding: "Publishable API keys and legacy `anon`/`service_role` API keys are not supported." The app has only the publishable key.
  - My call, to add: leaked password protection is Pro-only ([password security](https://supabase.com/docs/guides/auth/password-security)).
- **Confirmation:** the settings in the Supabase guide; the two variables in Vercel.
- **Pros and cons** of Auth.js and Clerk, each point with a current source checked while writing.

### ADR 0017: Run in the EU, in Frankfurt

- **Context:** the users are in Italy, and their data stays in the EU. Every login call goes from a Vercel function to Supabase, so the two should sit together.
- **Drivers:** data in the EU; short distance between functions and database; Hobby allows one function region.
- **Options:**
  - Frankfurt for both (Supabase `eu-central-1`, Vercel `fra1`)
  - another EU region that both offer (checked against both region lists while writing)
  - Vercel's default function region with the database in the EU
- **Outcome:** Frankfurt. It changes ADR 0011's "No `vercel.json` in the repo" point: the region is set in `vercel.json`, so it's reviewed and versioned, and it overrides the dashboard setting.
- **Confirmation:** `vercel.json`; Project Settings → General shows `eu-central-1`; the preview's functions show `fra1`.

### ADR 0011

One line under the title, linked to 0017: ``Amended by [0017](0017-run-in-the-eu-in-frankfurt.md): adds `vercel.json` for the function region.`` Nothing else changes. Putting it under the title, where readers see it first, is my call.

### ADR index

Add 0016 and 0017 under "Stack and architecture".

## Verification

- `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm run build` pass.
- After the push (with the owner's OK), the owner checks that the PR's Vercel preview shows its functions in `fra1`. The PR body records how each "Done when" item was checked.

## Left to the builder

- The exact wording of the guide and the ADRs, and the pros and cons of the rejected options, each with a current source.
- The exact dashboard paths the owner confirmed (see the open question in the conversation).
