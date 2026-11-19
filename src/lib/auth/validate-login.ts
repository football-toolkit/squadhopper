export type LoginFieldErrors = {
  email?: "emailMissing" | "emailInvalid";
  password?: "passwordMissing";
};

type LoginResult =
  | { ok: true; email: string; password: string }
  | { ok: false; errors: LoginFieldErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(input: {
  email: string;
  password: string;
}): LoginResult {
  const email = input.email.trim();
  const errors: LoginFieldErrors = {};

  if (email === "") errors.email = "emailMissing";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "emailInvalid";

  if (input.password === "") errors.password = "passwordMissing";

  if (errors.email || errors.password) return { ok: false, errors };
  return { ok: true, email, password: input.password };
}
