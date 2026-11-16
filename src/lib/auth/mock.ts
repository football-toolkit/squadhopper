import { sessionCookieOptions } from "./cookie-options";
import { TEST_USER, UNAVAILABLE_EMAIL } from "./test-user";
import type { AuthService, CookieJar } from "./types";

export const MOCK_SESSION_COOKIE = "mock-session";

export function createMockAuthService(
  jar: CookieJar,
  opts: { appEnv: string | undefined; secure: boolean },
): AuthService {
  if (opts.appEnv === "production") {
    throw new Error(
      "The mock auth service can't run when APP_ENV is production.",
    );
  }

  return {
    async hasSession() {
      return jar.getAll().some((cookie) => cookie.name === MOCK_SESSION_COOKIE);
    },
    async signIn(email, password) {
      const normalized = email.trim().toLowerCase();
      if (normalized === UNAVAILABLE_EMAIL) {
        return { ok: false, code: "unavailable" };
      }
      if (normalized !== TEST_USER.email || password !== TEST_USER.password) {
        return { ok: false, code: "invalid_credentials" };
      }
      jar.setAll([
        {
          name: MOCK_SESSION_COOKIE,
          value: "signed-in",
          options: sessionCookieOptions(opts.secure),
        },
      ]);
      return { ok: true };
    },
    async signOut() {
      jar.setAll([
        {
          name: MOCK_SESSION_COOKIE,
          value: "",
          options: { ...sessionCookieOptions(opts.secure), maxAge: 0 },
        },
      ]);
    },
  };
}
