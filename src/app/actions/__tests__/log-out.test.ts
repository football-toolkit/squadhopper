import { beforeEach, expect, test, vi } from "vitest";

const signOut = vi.fn();
vi.mock("@/lib/auth/next-cookie-jar", () => ({
  authServiceForRequest: async () => ({ signOut }),
}));

import { logOut } from "../log-out";

beforeEach(() => {
  signOut.mockReset();
});

test("signs out once and resolves", async () => {
  signOut.mockResolvedValue(undefined);
  await expect(logOut()).resolves.toBeUndefined();
  expect(signOut).toHaveBeenCalledTimes(1);
});
