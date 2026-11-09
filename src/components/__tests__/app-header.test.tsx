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
