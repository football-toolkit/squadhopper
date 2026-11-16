import { beforeEach, expect, test, vi } from "vitest";

const signIn = vi.fn();
vi.mock("@/lib/auth/next-cookie-jar", () => ({
  authServiceForRequest: async () => ({ signIn }),
}));

import { logIn } from "../actions";

beforeEach(() => {
  signIn.mockReset();
});

test("valid input signs in with the trimmed email and the untouched password", async () => {
  signIn.mockResolvedValue({ ok: true });
  const result = await logIn({
    email: "  ana@example.com ",
    password: "  pass word  ",
  });
  expect(signIn).toHaveBeenCalledWith("ana@example.com", "  pass word  ");
  expect(result).toEqual({ ok: true });
});

test("returns the service's failure code", async () => {
  signIn.mockResolvedValue({ ok: false, code: "unavailable" });
  const result = await logIn({ email: "ana@example.com", password: "x" });
  expect(result).toEqual({ ok: false, code: "unavailable" });
});

test("invalid input fails without calling the service", async () => {
  const result = await logIn({ email: "", password: "" });
  expect(result).toEqual({ ok: false, code: "invalid_credentials" });
  expect(signIn).not.toHaveBeenCalled();
});
