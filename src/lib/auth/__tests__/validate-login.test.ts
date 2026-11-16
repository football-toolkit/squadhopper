import { expect, test } from "vitest";
import { validateLogin } from "@/lib/auth/validate-login";

test("an empty email and password are both missing", () => {
  expect(validateLogin({ email: "", password: "" })).toEqual({
    ok: false,
    errors: { email: "emailMissing", password: "passwordMissing" },
  });
});

test("an email of only spaces is missing", () => {
  const result = validateLogin({ email: "   ", password: "x" });
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.errors.email).toBe("emailMissing");
});

test("an email without @ is invalid and the password is fine", () => {
  const result = validateLogin({ email: "ana.example", password: "x" });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors.email).toBe("emailInvalid");
    expect(result.errors.password).toBeUndefined();
  }
});

test("an empty password is the only error", () => {
  expect(validateLogin({ email: "player@example.com", password: "" })).toEqual({
    ok: false,
    errors: { password: "passwordMissing" },
  });
});

test("the email is trimmed and the password is kept as typed", () => {
  expect(
    validateLogin({
      email: "  player@example.com ",
      password: "  pass word  ",
    }),
  ).toEqual({
    ok: true,
    email: "player@example.com",
    password: "  pass word  ",
  });
});
