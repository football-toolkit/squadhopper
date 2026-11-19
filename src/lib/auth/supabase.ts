import "server-only";
import { createServerClient } from "@supabase/ssr";
import { sessionCookieOptions } from "./cookie-options";
import type {
  AuthErrorCode,
  AuthService,
  CookieJar,
  CookieOptions,
} from "./types";

const CREDENTIAL_CODES = new Set([
  "invalid_credentials",
  "validation_failed",
  "email_address_invalid",
]);

// Only wrong credentials are the user's to fix. Everything else, including
// rate limits and network errors, is reported as unavailable.
export function mapSignInError(error: { code?: string }): AuthErrorCode {
  return error.code !== undefined && CREDENTIAL_CODES.has(error.code)
    ? "invalid_credentials"
    : "unavailable";
}

// Logs only the error's code and status: never its message, which can
// repeat what the user typed, and never the email or password.
function logUnexpectedSignInError(error: unknown): void {
  const { code, status } =
    typeof error === "object" && error !== null
      ? (error as { code?: unknown; status?: unknown })
      : {};
  console.error("Sign-in failed unexpectedly.", {
    ...(typeof code === "string" ? { code } : {}),
    ...(typeof status === "number" ? { status } : {}),
  });
}

// A missing variable is logged once per server process, not on every request.
const reportedMissing = new Set<string>();

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
  if (!url || !publishableKey) {
    const name = !url ? "SUPABASE_URL" : "SUPABASE_PUBLISHABLE_KEY";
    if (!reportedMissing.has(name)) {
      reportedMissing.add(name);
      console.error(`${name} is not set, so sign-in is unavailable.`);
    }
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
        if (!error) return { ok: true };
        const code = mapSignInError(error);
        if (code === "unavailable") logUnexpectedSignInError(error);
        return { ok: false, code };
      } catch (error) {
        logUnexpectedSignInError(error);
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
