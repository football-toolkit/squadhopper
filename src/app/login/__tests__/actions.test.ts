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

// A Server Action is a public endpoint: anyone can post any value to it.
test.each([
  ["a number as the email", { email: 42, password: "x" }],
  ["an array as the password", { email: "ana@example.com", password: ["x"] }],
  ["no password", { email: "ana@example.com" }],
  ["no input at all", null],
])("%s fails without calling the service", async (_name, input) => {
  const result = await logIn(input as never);
  expect(result).toEqual({ ok: false, code: "invalid_credentials" });
  expect(signIn).not.toHaveBeenCalled();
});

const emailOfLength = (length: number) =>
  `${"a".repeat(length - "@example.com".length)}@example.com`;

test("an email over 254 characters fails without calling the service", async () => {
  const result = await logIn({ email: emailOfLength(255), password: "x" });
  expect(result).toEqual({ ok: false, code: "invalid_credentials" });
  expect(signIn).not.toHaveBeenCalled();
});

test("a password over 1024 characters fails without calling the service", async () => {
  const result = await logIn({
    email: "ana@example.com",
    password: "x".repeat(1025),
  });
  expect(result).toEqual({ ok: false, code: "invalid_credentials" });
  expect(signIn).not.toHaveBeenCalled();
});

test("an email of 254 and a password of 1024 characters still sign in", async () => {
  signIn.mockResolvedValue({ ok: true });
  const email = emailOfLength(254);
  const password = "x".repeat(1024);
  expect(await logIn({ email, password })).toEqual({ ok: true });
  expect(signIn).toHaveBeenCalledWith(email, password);
});
