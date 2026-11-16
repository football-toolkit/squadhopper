"use server";

import { authServiceForRequest } from "@/lib/auth/next-cookie-jar";
import type { SignInResult } from "@/lib/auth/types";
import { validateLogin } from "@/lib/auth/validate-login";

export async function logIn(input: {
  email: string;
  password: string;
}): Promise<SignInResult> {
  const checked = validateLogin(input);
  if (!checked.ok) return { ok: false, code: "invalid_credentials" };
  const service = await authServiceForRequest();
  return service.signIn(checked.email, checked.password);
}
