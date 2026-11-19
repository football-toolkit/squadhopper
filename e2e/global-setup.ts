import { createClient } from "@supabase/supabase-js";
import { TEST_USER } from "../src/lib/auth/test-user";

// Against Supabase (APP_ENV=test, as in CI), creates the test user. The mock
// already has it, so other runs do nothing.
export default async function globalSetup(): Promise<void> {
  if (process.env.APP_ENV !== "test") return;

  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error(
      "Creating the test user needs SUPABASE_URL and SUPABASE_SECRET_KEY",
    );
  }

  // The test user's password is public, so never create it on a real project,
  // even if a developer's .env.local points at one.
  const { hostname } = new URL(url);
  if (hostname !== "127.0.0.1" && hostname !== "localhost") {
    throw new Error(
      `Refusing to create the test user on ${hostname}: only a local Supabase (127.0.0.1 or localhost) is allowed`,
    );
  }

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.auth.admin.createUser({
    email: TEST_USER.email,
    password: TEST_USER.password,
    email_confirm: true,
  });
  // A user left by an earlier run against the same stack is fine.
  if (
    error &&
    error.code !== "email_exists" &&
    error.code !== "user_already_exists"
  ) {
    throw new Error(
      `Creating the test user failed: ${error.message} (${error.code ?? error.status})`,
    );
  }
}
