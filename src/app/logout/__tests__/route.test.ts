// @vitest-environment node
import { beforeEach, expect, test, vi } from "vitest";

const signOut = vi.fn();
vi.mock("@/lib/auth/next-cookie-jar", () => ({
  authServiceForRequest: async () => ({ signOut }),
}));

import * as route from "../route";

beforeEach(() => {
  signOut.mockReset();
  signOut.mockResolvedValue(undefined);
});

// What a browser sends for the Log out button's fetch on this site.
function logoutRequest(headers: Record<string, string> = {}): Request {
  return new Request("https://app.example.test/logout", {
    method: "POST",
    headers: {
      host: "app.example.test",
      origin: "https://app.example.test",
      "sec-fetch-site": "same-origin",
      ...headers,
    },
  });
}

test("POST signs out once and answers 204 with no content", async () => {
  const response = await route.POST(logoutRequest());
  expect(signOut).toHaveBeenCalledTimes(1);
  expect(response.status).toBe(204);
  expect(await response.text()).toBe("");
});

test("the answer is never stored", async () => {
  const response = await route.POST(logoutRequest());
  expect(response.headers.get("cache-control")).toBe("private, no-store");
});

test("a request with no Origin or Sec-Fetch-Site, as from a script, signs out", async () => {
  const request = new Request("https://app.example.test/logout", {
    method: "POST",
    headers: { host: "app.example.test" },
  });
  const response = await route.POST(request);
  expect(response.status).toBe(204);
  expect(signOut).toHaveBeenCalledTimes(1);
});

test("an Origin matching X-Forwarded-Host signs out, as behind a proxy", async () => {
  const response = await route.POST(
    logoutRequest({
      host: "internal:3000",
      "x-forwarded-host": "app.example.test",
    }),
  );
  expect(response.status).toBe(204);
});

// Another site can't log the user out by posting to /logout.
test.each([
  ["Sec-Fetch-Site is cross-site", { "sec-fetch-site": "cross-site" }],
  ["Sec-Fetch-Site is same-site", { "sec-fetch-site": "same-site" }],
  ["Sec-Fetch-Site is none", { "sec-fetch-site": "none" }],
  ["Origin is another site", { origin: "https://evil.example.test" }],
  ["Origin is another port", { origin: "https://app.example.test:8443" }],
  ["Origin is null", { origin: "null" }],
])(
  "answers 403 without signing out when %s",
  async (_name, headers: Record<string, string>) => {
    const response = await route.POST(logoutRequest(headers));
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(signOut).not.toHaveBeenCalled();
  },
);

// Next.js answers a method a route file doesn't export with 405 Method Not
// Allowed, so exporting only POST means GET /logout can't log anyone out
// (a link or a prefetch must never end the session).
test("the route only accepts POST", () => {
  expect(Object.keys(route)).toEqual(["POST"]);
});
