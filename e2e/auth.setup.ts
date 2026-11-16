import { test as setup } from "@playwright/test";
import { logIn } from "./helpers/log-in";

// Logs in once and saves the session, so the other specs start logged in.
setup("log in as the test user", async ({ page }) => {
  await logIn(page);
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
