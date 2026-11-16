---
status: accepted
date: 2026-11-16
decision-makers: repository owner
---

# 0017: Run in the EU, in Frankfurt

## Context and problem statement

The app runs on Vercel ([0011](0011-host-the-app-on-vercel.md)), and its login uses Supabase ([0016](0016-use-supabase-for-authentication.md)). The users are in Italy, and their data stays in the EU. Every sign-in goes from a Vercel function to Supabase, so the two should sit in the same place. Vercel runs functions in `iad1` (Washington, D.C.) unless told otherwise ([regions](https://vercel.com/docs/regions)), and a Supabase project's region can't be changed after it's created ([change project region](https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z)). Where should the database and the functions run?

## Decision drivers

- The users' data stays in the EU.
- The functions and the database are close, because Vercel's docs say functions should run "in the same region as your database, or as close to it as possible" ([regions](https://vercel.com/docs/regions)).
- Hobby gets a single function region ([function regions](https://vercel.com/docs/functions/configuring-functions/region)).
- The choice is reviewed and versioned, like the code.

## Considered options

1. **Frankfurt for both**: Supabase's Central EU (Frankfurt), `eu-central-1`, and Vercel's `fra1`
2. Another EU city both offer: Dublin (`eu-west-1`, `dub1`), Paris (`eu-west-3`, `cdg1`) or Stockholm (`eu-north-1`, `arn1`)
3. The database in the EU, and the functions in Vercel's default region, `iad1`

## Decision outcome

Chosen option: **"Frankfurt for both"**, because both providers offer it, it's in the EU, and of the EU cities both offer it's the nearest to Italy.

- **Supabase:** the project is in Central EU (Frankfurt), picked under "Specific regions". Supabase's "General regions" deploy to "*an* available AWS region within that broader area, which may not match a specific jurisdiction" ([regions](https://supabase.com/docs/guides/platform/regions)). The same page says: "For example, the "Europe" general region includes London and Zurich, which are not EU member states."
- **Vercel:** `vercel.json` sets `"regions": ["fra1"]`. Vercel's docs say this "overrides the Vercel Function Region in Project Settings" ([vercel.json](https://vercel.com/docs/project-configuration/vercel-json)), so the repo is the single source.

This changes one point of [0011](0011-host-the-app-on-vercel.md): its Confirmation says "No `vercel.json` in the repo". The region could be set in the dashboard instead, but a dashboard setting isn't reviewed or versioned, and someone could change it without a pull request. So the repo now has a `vercel.json`, holding only the region. Hosting on Vercel still stands, so 0011 is amended, not superseded.

### Consequences

- Good, because the users' data and the code that handles it stay in the EU.
- Good, because each sign-in is a short call between functions and database in the same city.
- Good, because the function region is in the repo, and a change to it goes through a pull request.
- Bad, because the repo now has Vercel config, which 0011 avoided.
- Bad, because Hobby gives one region, so if `fra1` is down, the app is down (automatic function failover is for Enterprise customers, per [regions](https://vercel.com/docs/regions)).
- Bad, because moving the database later means a new Supabase project and a migration.

### Confirmation

- `vercel.json` contains `"regions": ["fra1"]`.
- In Supabase, Project Settings → General shows `eu-central-1`.
- Each pull request's Vercel preview shows its functions in `fra1`.

## Pros and cons of the options

### Another EU city both offer

- Good, because the data stays in the EU, and functions and database can still sit together.
- Bad, because each is farther from Italy than Frankfurt.

### The functions in Vercel's default region

- Good, because it needs no config.
- Bad, because every sign-in makes a round trip across the Atlantic, from Washington to the database and back.
- Bad, because the code that handles the users' data runs outside the EU.

## More information

- How to set them up: [Set up Supabase](../../how-to/set-up-supabase.md) and [Set up Vercel](../../how-to/set-up-vercel.md).
- [Supabase regions](https://supabase.com/docs/guides/platform/regions), [Vercel regions](https://vercel.com/docs/regions)
- Related: [0011](0011-host-the-app-on-vercel.md), [0016](0016-use-supabase-for-authentication.md)
