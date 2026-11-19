// An invented, public test user. It is not a real account.
export const TEST_USER = {
  email: "player@example.com",
  password: "kickoff-at-eight",
} as const;

// Signing in with this email makes the mock report the backend as unavailable.
export const UNAVAILABLE_EMAIL = "unavailable@example.com";
