import { authServiceForRequest } from "@/lib/auth/next-cookie-jar";

// Logging out is a POST to this route, not a Server Action. A Server Action
// posts to the page's own address, and on Vercel the prerendered 404 page
// most likely answers a POST to an unknown address with static HTML, so the
// action never ran from the 404 page. This route exists at one fixed address.
//
// Only POST is exported: Next.js answers any other method with 405, so a
// link, a typed address or a prefetch can't end the session.

const NO_STORE = { "Cache-Control": "private, no-store" };

// Another site must not log the user out by posting here. Browsers say where
// a request comes from in Sec-Fetch-Site and Origin; like Next.js's own check
// for Server Actions, Origin must match X-Forwarded-Host, or else Host.
function isCrossSite(headers: Headers): boolean {
  const fetchSite = headers.get("sec-fetch-site");
  if (fetchSite !== null && fetchSite !== "same-origin") return true;

  const origin = headers.get("origin");
  if (origin === null) return false;
  const host =
    headers.get("x-forwarded-host")?.split(",")[0].trim() ??
    headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    // Origin "null" (or anything unparsable) is never this site.
    return true;
  }
}

export async function POST(request: Request): Promise<Response> {
  if (isCrossSite(request.headers)) {
    return new Response(null, { status: 403, headers: NO_STORE });
  }
  const service = await authServiceForRequest();
  // signOut uses the local scope: it clears this device's session cookies
  // (written onto this response) even when the login service can't be
  // reached.
  await service.signOut();
  return new Response(null, { status: 204, headers: NO_STORE });
}
