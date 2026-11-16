import { pickAuthBackend } from "./backend";
import { createMockAuthService } from "./mock";
import { createSupabaseAuthService } from "./supabase";
import type { AuthService, CookieJar } from "./types";

export function createAuthService(
  jar: CookieJar,
  opts: { secure: boolean },
  env: Record<string, string | undefined> = process.env,
): AuthService {
  if (pickAuthBackend(env.APP_ENV) === "mock") {
    return createMockAuthService(jar, {
      appEnv: env.APP_ENV,
      secure: opts.secure,
    });
  }
  return createSupabaseAuthService(jar, {
    url: env.SUPABASE_URL,
    publishableKey: env.SUPABASE_PUBLISHABLE_KEY,
    secure: opts.secure,
  });
}
