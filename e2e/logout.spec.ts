import { expect, test, type Page } from "@playwright/test";
import { authMessages } from "../src/lib/messages/auth";
import { logIn } from "./helpers/log-in";

// Each test logs in fresh: logging out ends that session, so a shared one
// would break other tests. This also applies to browser.newContext() below.
test.use({ storageState: { cookies: [], origins: [] } });

function logOutButton(page: Page) {
  return page.getByRole("button", { name: authMessages.logOut });
}

async function expectLoginScreen(page: Page): Promise<void> {
  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("button", { name: authMessages.logIn }),
  ).toBeVisible();
}

test("the home page isn't stored by the browser", async ({ page }) => {
  await logIn(page);
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  expect(await response?.headerValue("cache-control")).toContain("no-store");
});

test("Log out shows the login screen", async ({ page }) => {
  await logIn(page);
  await logOutButton(page).click();
  await expectLoginScreen(page);
});

test("Back after logging out shows the login screen", async ({ page }) => {
  await logIn(page);
  await logOutButton(page).click();
  await expectLoginScreen(page);
  await page.goBack();
  await expectLoginScreen(page);
});

// Playwright turns the back/forward cache off, so this fires the event a
// restored page gets.
test("a page restored after logging out reloads into the login screen", async ({
  page,
  context,
}) => {
  await logIn(page);
  const other = await context.newPage();
  await other.goto("/");
  await logOutButton(other).click();
  await expectLoginScreen(other);

  await page.evaluate(() =>
    window.dispatchEvent(
      new PageTransitionEvent("pageshow", { persisted: true }),
    ),
  );
  await expectLoginScreen(page);
});

test("logging out on one device keeps the other logged in", async ({
  browser,
}) => {
  const first = await browser.newContext();
  const second = await browser.newContext();
  try {
    const firstPage = await first.newPage();
    const secondPage = await second.newPage();
    await logIn(firstPage);
    await logIn(secondPage);

    await logOutButton(firstPage).click();
    await expectLoginScreen(firstPage);

    await secondPage.reload();
    await expect(secondPage).toHaveURL("/");
    await expect(
      secondPage.getByRole("heading", { level: 1, name: /all your matches/i }),
    ).toBeVisible();
  } finally {
    await first.close();
    await second.close();
  }
});

test("the 404 page shows Log out", async ({ page }) => {
  await logIn(page);
  await page.goto("/does-not-exist");
  await expect(logOutButton(page)).toBeVisible();
});
