export const authMessages = {
  emailLabel: "Email",
  passwordLabel: "Password",
  emailPlaceholder: "you@example.com",
  passwordPlaceholder: "••••••••",
  tagline: "All your matches in one place.",
  signUpsClosed: "Sign-ups are closed.",
  logIn: "Log in",
  loggingIn: "Logging in…",
  logOut: "Log out",
  loggingOut: "Logging out…",
  close: "Close",
  emailMissing: "Enter your email",
  emailInvalid: "Enter a valid email address",
  passwordMissing: "Enter your password",
  errors: {
    invalid_credentials: "Wrong email or password.",
    unavailable: "Can't log in right now. Try again in a few minutes.",
  },
} as const;

export type AuthErrorCode = keyof typeof authMessages.errors;
