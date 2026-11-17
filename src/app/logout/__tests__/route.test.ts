import { beforeEach, expect, test, vi } from "vitest";

const signOut = vi.fn();
vi.mock("@/lib/auth/next-cookie-jar", () => ({
  authServiceForRequest: async () => ({ signOut }),
}));

import * as route from "../route";

beforeEach(() => {
  signOut.mockReset();
});

test("POST signs out once and answers 204 with no content", async () => {
  signOut.mockResolvedValue(undefined);
  const response = await route.POST();
  expect(signOut).toHaveBeenCalledTimes(1);
  expect(response.status).toBe(204);
  expect(await response.text()).toBe("");
});

test("the answer is never stored", async () => {
  signOut.mockResolvedValue(undefined);
  const response = await route.POST();
  expect(response.headers.get("cache-control")).toBe("private, no-store");
});

// Next.js answers a method a route file doesn't export with 405 Method Not
// Allowed, so exporting only POST means GET /logout can't log anyone out
// (a link or a prefetch must never end the session).
test("the route only accepts POST", () => {
  expect(Object.keys(route)).toEqual(["POST"]);
});
