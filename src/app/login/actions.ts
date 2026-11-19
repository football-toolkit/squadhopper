"use server";

import { authServiceForRequest } from "@/lib/auth/next-cookie-jar";
import type { SignInResult } from "@/lib/auth/types";
import { validateLogin } from "@/lib/auth/validate-login";

// The longest address email allows (RFC 5321), and a generous cap for
// passwords, so a huge value never reaches the login service.
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 1024;

const WRONG: SignInResult = { ok: false, code: "invalid_credentials" };

export async function logIn(input: {
  email: string;
  password: string;
}): Promise<SignInResult> {
  // A Server Action is a public endpoint, so the types above are only what
  // the login form sends: anyone can post any value. Check before trusting.
  const { email, password }: { email?: unknown; password?: unknown } =
    typeof input === "object" && input !== null ? input : {};
  if (typeof email !== "string" || typeof password !== "string") return WRONG;
  if (
    email.trim().length > MAX_EMAIL_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return WRONG;
  }

  const checked = validateLogin({ email, password });
  if (!checked.ok) return WRONG;
  const service = await authServiceForRequest();
  return service.signIn(checked.email, checked.password);
}
