import { createServerClient } from "@supabase/ssr";
import type { AuthErrorCode } from "@/lib/messages/auth";
import { sessionCookieOptions } from "./cookie-options";
import type { AuthService, CookieJar, CookieOptions } from "./types";

const CREDENTIAL_CODES = new Set([
  "invalid_credentials",
  "validation_failed",
  "email_address_invalid",
]);

// Only wrong credentials are the user's to fix. Everything else, including
// rate limits and network errors, is reported as unavailable.
export function mapSignInError(error: {
  code?: string;
  name?: string;
}): AuthErrorCode {
  return error.code !== undefined && CREDENTIAL_CODES.has(error.code)
    ? "invalid_credentials"
    : "unavailable";
}

// Supabase's cookie options allow a boolean sameSite; ours don't.
function toCookieOptions(options: {
  sameSite?: boolean | "lax" | "strict" | "none";
  [key: string]: unknown;
}): CookieOptions {
  const { sameSite, ...rest } = options;
  if (sameSite === true) return { ...rest, sameSite: "strict" };
  if (sameSite === false || sameSite === undefined) return rest;
  return { ...rest, sameSite };
}

export function createSupabaseAuthService(
  jar: CookieJar,
  opts: {
    url: string | undefined;
    publishableKey: string | undefined;
    secure: boolean;
    createClient?: typeof createServerClient;
  },
): AuthService {
  const {
    url,
    publishableKey,
    secure,
    createClient = createServerClient,
  } = opts;
  const missing = !url
    ? "SUPABASE_URL"
    : !publishableKey
      ? "SUPABASE_PUBLISHABLE_KEY"
      : undefined;

  if (missing !== undefined || !url || !publishableKey) {
    console.error(`${missing} is not set, so sign-in is unavailable.`);
    return {
      async hasSession() {
        return false;
      },
      async signIn() {
        return { ok: false, code: "unavailable" };
      },
      async signOut() {},
    };
  }

  // One client per service, so one per request.
  const { auth } = createClient(url, publishableKey, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (cookiesToSet, headers) =>
        jar.setAll(
          cookiesToSet.map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
            options: toCookieOptions(cookie.options),
          })),
          headers,
        ),
    },
    cookieOptions: sessionCookieOptions(secure),
  });

  return {
    async hasSession() {
      try {
        const { data, error } = await auth.getClaims();
        return !error && data !== null && Boolean(data.claims);
      } catch {
        return false;
      }
    },
    async signIn(email, password) {
      try {
        const { error } = await auth.signInWithPassword({ email, password });
        return error
          ? { ok: false, code: mapSignInError(error) }
          : { ok: true };
      } catch {
        return { ok: false, code: "unavailable" };
      }
    },
    async signOut() {
      try {
        await auth.signOut({ scope: "local" });
      } catch {
        // The library clears the local session before the network call.
      }
    },
  };
}
