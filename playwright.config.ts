import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

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
  // Below the CI job's 11-minute timeout, so a hung run still uploads its report.
  globalTimeout: isCI ? 8 * 60 * 1000 : undefined,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
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
