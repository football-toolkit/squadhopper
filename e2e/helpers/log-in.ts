import type { Page } from "@playwright/test";
import { TEST_USER } from "../../src/lib/auth/test-user";
import { authMessages } from "../../src/lib/messages/auth";

/** Logs in as the test user through the login screen and waits for home. */
export async function logIn(page: Page): Promise<void> {
  await page.goto("/login");
  await page
    .getByLabel(authMessages.emailLabel, { exact: true })
    .fill(TEST_USER.email);
  await page
    .getByLabel(authMessages.passwordLabel, { exact: true })
    .fill(TEST_USER.password);
  await page.getByRole("button", { name: authMessages.logIn }).click();
  // Wait for home's load event, not just the URL: its scripts run before load,
  // so a click right after this (such as on Log out) reaches React.
  await page.waitForURL("/");
}
