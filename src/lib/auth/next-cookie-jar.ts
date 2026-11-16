import { cookies, headers } from "next/headers";
import { createAuthService } from "@/lib/auth";
import { isSecureRequest } from "@/lib/auth/is-secure-request";
import type { AuthService, CookieJar } from "@/lib/auth/types";

// Builds the auth service for the current request, with its cookies. A Server
// Action can't set response headers, so the jar ignores the headers argument;
// the proxy already sends no-store.
export async function authServiceForRequest(): Promise<AuthService> {
  const cookieStore = await cookies();
  const secure = isSecureRequest(await headers());
  const jar: CookieJar = {
    getAll: () =>
      cookieStore.getAll().map(({ name, value }) => ({ name, value })),
    setAll: (toSet) => {
      for (const { name, value, options } of toSet) {
        cookieStore.set(name, value, options);
      }
    },
  };
  return createAuthService(jar, { secure });
}
