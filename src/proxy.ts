import { NextResponse, type NextRequest } from "next/server";
import { createAuthService } from "@/lib/auth";
import { isSecureRequest } from "@/lib/auth/is-secure-request";
import type { CookieToSet } from "@/lib/auth/types";

export function routeFor(input: {
  pathname: string;
  signedIn: boolean;
}): "/login" | "/" | null {
  const onLogin = input.pathname === "/login";
  if (!input.signedIn && !onLogin) return "/login";
  if (input.signedIn && onLogin) return "/";
  return null;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const written: CookieToSet[] = [];
  let extraHeaders: Record<string, string> = {};

  const auth = createAuthService(
    {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies, headers) => {
        for (const { name, value } of cookies) {
          request.cookies.set(name, value);
        }
        written.push(...cookies);
        extraHeaders = { ...extraHeaders, ...headers };
      },
    },
    { secure: isSecureRequest(request.headers, request.nextUrl) },
  );

  const signedIn = await auth.hasSession();
  const target = routeFor({ pathname: request.nextUrl.pathname, signedIn });

  const response = target
    ? NextResponse.redirect(new URL(target, request.url))
    : NextResponse.next({ request });

  for (const { name, value, options } of written) {
    response.cookies.set(name, value, options);
  }
  for (const [key, value] of Object.entries(extraHeaders)) {
    response.headers.set(key, value);
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

// Skips only Next.js's own files: everything under /_next/static/, the exact
// /_next/image optimizer, and the three icons. Any other address, such as
// /_next/image/x, goes through the gate.
export const config = {
  matcher: [
    "/((?!_next/static/|_next/image$|(?:favicon\\.ico|icon\\.svg|apple-icon\\.png)$).*)",
  ],
};
