import { expect, test } from "@playwright/test";

for (const path of ["/does-not-exist", "/a/b/c"]) {
  test(`${path} answers 404 and shows the 404 page`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: /page not found/i }),
    ).toBeVisible();
  });
}

test('"Back to home" opens the home page', async ({ page }) => {
  await page.goto("/does-not-exist");
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /all your matches/i }),
  ).toBeVisible();
});
