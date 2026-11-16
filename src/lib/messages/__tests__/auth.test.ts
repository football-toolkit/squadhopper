import { expect, test } from "vitest";
import { authMessages } from "@/lib/messages/auth";

test("the error messages are the agreed texts", () => {
  expect(authMessages.errors).toEqual({
    invalid_credentials: "Wrong email or password.",
    unavailable: "Can't log in right now. Try again in a few minutes.",
  });
});

test("the field messages are the agreed texts", () => {
  expect(authMessages.emailMissing).toBe("Enter your email");
  expect(authMessages.emailInvalid).toBe("Enter a valid email address");
  expect(authMessages.passwordMissing).toBe("Enter your password");
});
