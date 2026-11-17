import { authServiceForRequest } from "@/lib/auth/next-cookie-jar";

// Logging out is a POST to this route, not a Server Action. A Server Action
// posts to the page's own address, and on Vercel the prerendered 404 page
// most likely answers a POST to an unknown address with static HTML, so the
// action never ran from the 404 page. This route exists at one fixed address.
//
// Only POST is exported: Next.js answers any other method with 405, so a
// link, a typed address or a prefetch can't end the session.
export async function POST(): Promise<Response> {
  const service = await authServiceForRequest();
  // signOut uses the local scope: it clears this device's session cookies
  // (written onto this response) even when the login service can't be
  // reached.
  await service.signOut();
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "private, no-store" },
  });
}
