import { expect, test } from "vitest";
import { pickAuthBackend } from "@/lib/auth/backend";

test.each([
  ["local", "mock"],
  ["preview", "mock"],
  ["test", "supabase"],
  ["production", "supabase"],
  [undefined, "supabase"],
  ["", "supabase"],
  ["staging", "supabase"],
  ["LOCAL", "supabase"],
])("APP_ENV %j picks %s", (appEnv, expected) => {
  expect(pickAuthBackend(appEnv)).toBe(expected);
});
