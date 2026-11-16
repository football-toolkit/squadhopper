import type { CookieOptions } from "./types";

export function sessionCookieOptions(secure: boolean): CookieOptions {
  return { httpOnly: true, sameSite: "lax", path: "/", secure };
}
