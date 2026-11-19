import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Locally, .env.local picks the backend (APP_ENV=local runs the mock). CI sets
// the variables itself and has no such file.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const isCI = !!process.env.CI;

// The session the setup project saves, so the other specs start logged in.
const authFile = "playwright/.auth/user.json";

// Port 3100, not Next.js's default 3000, so a running `npm run dev` is never
// reused and the tests always hit the production build.
const baseURL = "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: isCI,
  // No retries: a flaky test is fixed or gets an issue, never re-run until it
  // passes (see AGENTS.md).
  retries: 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  // The end-to-end step starts up to 3 min 41 s into the CI job, so 7 minutes
  // ends more than a minute before the job's 12-minute timeout, and a hung run
  // still uploads its report.
  globalTimeout: isCI ? 7 * 60 * 1000 : undefined,
  // Creates the test user when the tests run against Supabase.
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: authFile },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], storageState: authFile },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    // CI's Build step has already built the app, so CI only starts it.
    command: isCI
      ? "npm run start -- --port 3100"
      : "npm run build && npm run start -- --port 3100",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
