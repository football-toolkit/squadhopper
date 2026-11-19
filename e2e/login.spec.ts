import { expect, test, type Page } from "@playwright/test";
import { TEST_USER } from "../src/lib/auth/test-user";
import { authMessages } from "../src/lib/messages/auth";
import { logIn } from "./helpers/log-in";

// These tests start logged out.
test.use({ storageState: { cookies: [], origins: [] } });

function emailField(page: Page) {
  return page.getByLabel(authMessages.emailLabel, { exact: true });
}

function passwordField(page: Page) {
  return page.getByLabel(authMessages.passwordLabel, { exact: true });
}

function logInButton(page: Page) {
  return page.getByRole("button", { name: authMessages.logIn });
}

function homeHeading(page: Page) {
  return page.getByRole("heading", { level: 1, name: /all your matches/i });
}

for (const path of ["/", "/does-not-exist"]) {
  test(`a visitor at ${path} sees the login screen`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL("/login");
    await expect(logInButton(page)).toBeVisible();
  });
}

test("the login screen isn't stored by the browser", async ({ page }) => {
  const response = await page.goto("/login");
  expect(response).not.toBeNull();
  expect(await response?.headerValue("cache-control")).toContain("no-store");
});

test("empty fields show both messages", async ({ page }) => {
  await page.goto("/login");
  await logInButton(page).click();
  await expect(page.getByText(authMessages.emailMissing)).toBeVisible();
  await expect(page.getByText(authMessages.passwordMissing)).toBeVisible();
});

test("a wrong password shows a popup that stays until closed", async ({
  page,
}) => {
  // Before the page loads, so its timers run on Playwright's clock.
  await page.clock.install();
  await page.goto("/login");
  await emailField(page).fill(TEST_USER.email);
  await passwordField(page).fill(`${TEST_USER.password}-wrong`);
  await logInButton(page).click();

  // The visible popup is the alertdialog. The alert is a hidden copy of the
  // text for screen readers, and the popup stays aria-hidden until focused.
  const popup = page.getByRole("alertdialog", { includeHidden: true });
  await expect(popup).toContainText(authMessages.errors.invalid_credentials);
  await expect(popup).toBeVisible();

  // Base UI's default would close it after 5 seconds. A closing popup is
  // still visible while it slides out, so also check it hasn't started to
  // close: Base UI marks a closing popup with data-ending-style.
  await page.clock.fastForward(60_000);
  await expect(popup).not.toHaveAttribute("data-ending-style");
  await expect(popup).toBeVisible();

  await expect(emailField(page)).toHaveValue(TEST_USER.email);
  await expect(passwordField(page)).toHaveValue("");

  await popup
    .getByRole("button", { name: authMessages.close, includeHidden: true })
    .click();
  await expect(popup).toBeHidden();
});

test("the popup's Close button works with the keyboard", async ({ page }) => {
  await page.goto("/login");
  await emailField(page).fill(TEST_USER.email);
  await passwordField(page).fill(`${TEST_USER.password}-wrong`);
  await logInButton(page).click();

  const popup = page.getByRole("alertdialog", { includeHidden: true });
  await expect(popup).toContainText(authMessages.errors.invalid_credentials);

  // Tab from the page until focus lands on Close inside the popup. The popup
  // can come before or after the form in the tab order, so allow a few presses.
  const close = popup.getByRole("button", {
    name: authMessages.close,
    includeHidden: true,
  });
  for (let presses = 0; presses < 10; presses++) {
    if (await close.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(close).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(popup).toBeHidden();
});

test("correct details open the home page", async ({ page }) => {
  await logIn(page);
  await expect(page).toHaveURL("/");
  await expect(homeHeading(page)).toBeVisible();
});

test("Enter in the password field logs in", async ({ page }) => {
  await page.goto("/login");
  await emailField(page).fill(TEST_USER.email);
  await passwordField(page).fill(TEST_USER.password);
  await passwordField(page).press("Enter");
  await expect(page).toHaveURL("/");
  await expect(homeHeading(page)).toBeVisible();
});

test("a logged-in user at /login lands on the home page", async ({ page }) => {
  await logIn(page);
  await page.goto("/login");
  await expect(page).toHaveURL("/");
  await expect(homeHeading(page)).toBeVisible();
});
