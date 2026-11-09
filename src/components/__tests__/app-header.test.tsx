import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { AppHeader } from "../app-header";
import { APP_NAME } from "@/lib/app-name";

test("the header shows the wordmark and its actions", () => {
  render(
    <AppHeader>
      <button type="button">Act</button>
    </AppHeader>,
  );
  const header = screen.getByRole("banner");
  expect(header.textContent).toContain(APP_NAME);
  expect(within(header).getByRole("button", { name: "Act" })).toBeDefined();
});

test("the wordmark links to the home page, named after the app", () => {
  render(<AppHeader />);
  const links = within(screen.getByRole("banner")).getAllByRole("link");
  expect(links).toHaveLength(1);
  const link = screen.getByRole("link", { name: `${APP_NAME} home` });
  expect(link.getAttribute("href")).toBe("/");
  expect(link.textContent).toBe(APP_NAME);
});

test("the wordmark link shows a grey focus ring, never volt", () => {
  render(<AppHeader />);
  const link = screen.getByRole("link", { name: `${APP_NAME} home` });
  expect(link.className).toContain("focus-visible:outline-ring");
  expect(link.className).not.toContain("primary");
});
