# How to set up Supabase

Supabase stores the app's users and checks their passwords. This guide sets up the one Supabase project the login uses in production, and puts the two values the app needs into Vercel. The owner does this setup once, by hand, because an agent can't create accounts. Why Supabase: [ADR 0016](../explanation/decisions/0016-use-supabase-for-authentication.md). Why Frankfurt: [ADR 0017](../explanation/decisions/0017-run-in-the-eu-in-frankfurt.md).

## Before you start

- Use the owner's GitHub account.
- Vercel is already set up, as in [Set up Vercel](set-up-vercel.md).
- Supabase's Free plan pauses a project after a week with no activity, and allows two active projects ([pricing](https://supabase.com/pricing)). What to do about pausing is decided later.

## Steps

1. **Sign up.** Sign up for Supabase's Free plan with the owner's GitHub account, and turn on two-factor authentication.
2. **Create the project.** Create one project, with these choices on the new-project form:
   - **Region:** the region list opens on "General regions" (Americas, Europe, Asia-Pacific). Don't pick "Europe" there: it can land in London or Zurich, which are outside the EU. Scroll down the same list to "Specific regions" and pick **Central EU (Frankfurt)**. Advanced configuration has no region setting, and the region can't be changed after the project is created.
   - **Database password:** save it in the owner's password manager. It's never committed or shared.
   - **Security options:**
     - **Enable Data API:** off, because nothing uses it yet; a later Feature turns it on if it needs it. The form ticks it by default. If the project already exists, switch it off in **Integrations → Data API**.
     - **Automatically expose new tables:** off, as Supabase recommends.
     - **Enable automatic RLS:** on, so every new table gets Row Level Security, and stays closed until a policy opens it.
   - **Advanced configuration:** leave the Postgres type at **Postgres**, the default. OrioleDB is in beta, and the type can't be changed after the project is created.
3. **Set up sign-in.** In **Authentication → Sign In / Providers**:
   - Turn **Allow new users to sign up** off. v0.1 has no sign-up page, so the owner adds each user by hand, in **Authentication → Users**.
   - Inside the **Email** provider, set the minimum password length to **12**. Leave the character requirements at their default, and leave the Email provider on.
4. **Add the two values to Vercel.** In the Vercel project's Settings → Environment Variables, add these two, for the **Production** environment only. Previews and local runs use a mock login instead, picked by `APP_ENV` ([ADR 0018](../explanation/decisions/0018-pick-the-auth-service-with-app-env.md)), so they need neither value. Leave the type at the default, **Secret**.

   > **Keep the names exactly `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.** Supabase's Next.js snippet uses `NEXT_PUBLIC_` names, and Vercel warns about them. Don't add the `NEXT_PUBLIC_` prefix, and don't click **Change to Config**. Vercel's warning offers Config only "if it's safe to expose". Config doesn't rename the variable, so a `NEXT_PUBLIC_` value would still be built into the browser code. We keep both values on the server.

   | Name | Value | Where to find it |
   | --- | --- | --- |
   | `SUPABASE_URL` | `https://<project-id>.supabase.co` | the project ID is in Project Settings → General |
   | `SUPABASE_PUBLISHABLE_KEY` | the publishable key, `sb_publishable_…`, not the secret key | Project Settings → API Keys |

   Don't use the Connect dialog: it didn't match Supabase's docs. Don't use the Vercel Marketplace integration either: it copies more values than these two.

   If you add or change the values after the code that reads them is live, redeploy production, because a change only applies to new deployments.

## Previews, local runs and CI

- **Previews and local runs use the mock.** With `APP_ENV` set to `preview` or `local`, the app doesn't talk to Supabase. The test user is in `src/lib/auth/test-user.ts`, and `unavailable@example.com` shows the "Can't log in right now" popup.
- **CI runs a temporary Supabase.** The `checks` job starts one from `supabase/config.toml` and logs in against it. The file mirrors production's sign-up and password settings (sign-ups off, minimum password length 12), so CI behaves like production. It needs no setup from the owner. Why: [ADR 0019](../explanation/decisions/0019-test-login-against-a-temporary-supabase-in-ci.md).
- If you change a sign-in setting in production, change `supabase/config.toml` in the same pull request.

## Check it works

- In Supabase, Project Settings → General shows `eu-central-1`.
- In **Authentication → Sign In / Providers**, **Allow new users to sign up** is off, and the Email provider's minimum password length is 12.
- In **Integrations → Data API**, the Data API is off.
- In Vercel, Settings → Environment Variables lists `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, both Secret, for Production only, and no `NEXT_PUBLIC_` variables.
- On a deployment's page in Vercel, the deployment summary shows the functions in `fra1` ([function regions](https://vercel.com/docs/functions/configuring-functions/region)).

## Where next

- 💡 Why Supabase: [ADR 0016](../explanation/decisions/0016-use-supabase-for-authentication.md)
- 💡 Why a mock outside production: [ADR 0018](../explanation/decisions/0018-pick-the-auth-service-with-app-env.md)
- 💡 Why a temporary Supabase in CI: [ADR 0019](../explanation/decisions/0019-test-login-against-a-temporary-supabase-in-ci.md)
- 💡 Why Frankfurt: [ADR 0017](../explanation/decisions/0017-run-in-the-eu-in-frankfurt.md)
- 🛠️ Hosting and deploys: [Set up Vercel](set-up-vercel.md)
- ⬆️ [How-to guides](README.md)
- 🏠 [Docs home](../README.md)
