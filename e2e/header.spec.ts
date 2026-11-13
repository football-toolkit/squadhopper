import { expect, test } from "@playwright/test";
import { APP_NAME } from "../src/lib/app-name";

test("the wordmark opens the home page", async ({ page }) => {
  // Start away from home, so the click really navigates.
  await page.goto("/does-not-exist");
  await page.getByRole("link", { name: `${APP_NAME} home` }).click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /all your matches/i }),
  ).toBeVisible();
});
