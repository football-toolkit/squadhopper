---
status: accepted
date: 2026-11-16
decision-makers: repository owner
---

# 0016: Use Supabase for authentication

## Context and problem statement

v0.1 has a login. It needs users and passwords in production, on Vercel Hobby ([0011](0011-host-the-app-on-vercel.md)). The project has no budget, and one person runs it. v0.1 has no sign-up page, so the owner adds each user by hand. What should store the users and check their passwords?

## Decision drivers

- Free.
- The users' data stays in the EU ([0017](0017-run-in-the-eu-in-frankfurt.md)).
- Little operations work: no password hashing, user storage or rate limiting to build and maintain.
- A dashboard where the owner can add users.
- The app's keys can stay on the server.

## Considered options

1. **Supabase Auth**, on the Free plan
2. Auth.js with our own database
3. Clerk

## Decision outcome

Chosen option: **"Supabase Auth"**, because it stores the users and checks their passwords for us, its Free plan costs nothing, it runs in Frankfurt, and its dashboard lets the owner add users.

### Project settings

The owner set up one project, as the [setup guide](../../how-to/set-up-supabase.md) describes. Each setting, and why:

- **Region Central EU (Frankfurt)**, picked under "Specific regions". Why: [0017](0017-run-in-the-eu-in-frankfurt.md).
- **Allow new users to sign up: off.** v0.1 has no sign-up page, so the owner adds users in the dashboard. With it off, "only existing users can sign in" ([general configuration](https://supabase.com/docs/guides/auth/general-configuration)).
- **Minimum password length: 12.** Leaked password protection isn't on the Free plan (see the accepted limits below), so length is the password check we have.
- **Enable Data API: off**, because nothing uses it yet; a later Feature turns it on if it needs it. Signing in goes to Supabase Auth, a separate service. With the Data API off, "none of the auto-generated REST endpoints respond, regardless of grants or RLS" ([Data API](https://supabase.com/docs/guides/database/data-api)).
- **Automatically expose new tables: off**, as Supabase recommends on the form. New tables in the `public` schema then need an explicit opt-in before the Data API can see them. It became the default for new projects from May 30, 2026 ([changelog](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)).
- **Enable automatic RLS: on.** RLS is Row Level Security, Postgres's per-row access rules. Supabase's docs don't describe this checkbox. Supabase's [security retro blog post](https://supabase.com/blog/supabase-security-2025-retro) describes enforcing RLS automatically on new tables with Postgres event triggers, and a one-click setup in the dashboard. A table with RLS on and no policies gives the publishable key no rows ([Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)), so a new table stays closed until a policy opens it.
- **Postgres type: Postgres**, the default. "OrioleDB is in public beta", and "you can't add OrioleDB to an existing project or remove it later" ([OrioleDB](https://supabase.com/docs/guides/database/orioledb)).
- **Only the publishable key** (`sb_publishable_…`), never the secret key. The publishable key "only reaches what Row Level Security allows" ([API keys](https://supabase.com/docs/guides/api/api-keys)).
- **Two Vercel variables, `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, for Production only.** Neither has the `NEXT_PUBLIC_` prefix, so neither is built into the browser code, and both stay on the server. Previews and local runs use a mock. No Vercel Marketplace integration, because it copies more values than these two.

We accept these limits:

- **Pausing.** "Free projects are paused after 1 week of inactivity" ([pricing](https://supabase.com/pricing)). A paused project can be restored for up to a year ([free project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)). What to do about it is decided later, not here.
- **Rate limits see Vercel's address.** Sign-ins are limited per IP address, 30 requests per 5 minutes by default. Our server calls Supabase, so Supabase sees Vercel's address, not the visitor's. Passing the visitor's address with the `Sb-Forwarded-For` header needs a secret key: the [rate limits page](https://supabase.com/docs/guides/auth/rate-limits) says "Publishable API keys and legacy `anon`/`service_role` API keys are not supported." The app has only the publishable key, so many visitors share one limit.
- **No leaked password protection.** "Leaked password protection is available on the Pro Plan and above" ([password security](https://supabase.com/docs/guides/auth/password-security)).

### Consequences

- Good, because we don't store passwords or write password hashing, rate limiting or user admin.
- Good, because the owner adds and removes users in Supabase's dashboard.
- Good, because the users' data stays in Frankfurt.
- Bad, because the limits above shape the login: pausing, a shared rate limit, and no leaked password check.
- Bad, because the users live in Supabase, so moving away later means moving the users out of it.

### Confirmation

- The settings listed in [Set up Supabase](../../how-to/set-up-supabase.md), checked in the Supabase dashboard.
- Vercel lists exactly `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, for Production only.

## Pros and cons of the options

### Auth.js with our own database

- Good, because it's open source, and the users stay in a database we choose.
- Bad, because for passwords we write the hashing, the user lookup and the rate limiting ourselves. Its docs say the Credentials provider "does not persist data in the database", and that we provide "the necessary logic, eg. to encrypt passwords, add rate-limiting" ([Credentials provider](https://authjs.dev/getting-started/authentication/credentials)).
- Bad, because its docs recommend "a more modern and secure authentication mechanism" than passwords (same page).
- Bad, because we'd still need a database and a way to add users, which means picking and running a second service.
- Neutral: "The Auth.js project is now part of Better Auth" (same page).

### Clerk

- Good, because it's managed, and its free plan covers 50,000 monthly retained users per app ([pricing](https://clerk.com/pricing)).
- Bad, because the data stays in the US: "Clerk does not offer regional data residency or region selection", and "Data is hosted on US infrastructure" ([security](https://clerk.com/security)).
- Bad, because the free plan keeps Clerk's branding ([pricing](https://clerk.com/pricing)).

## More information

- How to set it up: [Set up Supabase](../../how-to/set-up-supabase.md).
- Related: [0011](0011-host-the-app-on-vercel.md), [0017](0017-run-in-the-eu-in-frankfurt.md)
