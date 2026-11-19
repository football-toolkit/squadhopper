import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../actions", () => ({ logIn: vi.fn() }));
vi.mock("@/components/error-toaster", () => ({
  showError: vi.fn(),
  closeError: vi.fn(),
}));
vi.mock("@/lib/navigation", () => ({ goTo: vi.fn(), reloadPage: vi.fn() }));

import Page, { metadata } from "../page";
import { APP_NAME } from "@/lib/app-name";
import { authMessages } from "@/lib/messages/auth";

test("shows the wordmark, tagline, sign-ups note, fields and button", () => {
  render(<Page />);
  expect(
    screen.getByText(
      (_, el) => el?.tagName === "P" && el.textContent === APP_NAME,
    ),
  ).toBeDefined();
  expect(screen.getByText(authMessages.tagline)).toBeDefined();
  expect(screen.getByText(authMessages.signUpsClosed)).toBeDefined();
  expect(screen.getByLabelText(authMessages.emailLabel)).toBeDefined();
  expect(screen.getByLabelText(authMessages.passwordLabel)).toBeDefined();
  expect(
    screen.getByRole("button", { name: authMessages.logIn }),
  ).toBeDefined();
});

test("has no header and no sign-up or reset links", () => {
  render(<Page />);
  expect(screen.queryByRole("banner")).toBeNull();
  expect(
    screen.queryByRole("link", { name: /sign up|forgot|reset/i }),
  ).toBeNull();
});

test("the title names the screen and the app", () => {
  expect(metadata.title).toBe(`Log in · ${APP_NAME}`);
});
