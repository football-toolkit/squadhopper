import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";

test("the home page says Coming soon", () => {
  render(<Page />);
  expect(screen.getByText("Coming soon")).toBeDefined();
});

test("the home page shows nothing else", () => {
  render(<Page />);
  expect(document.body.textContent).toBe("Coming soon");
  expect(screen.queryByRole("heading")).toBeNull();
  expect(screen.queryByRole("link")).toBeNull();
  expect(screen.queryByRole("img")).toBeNull();
});
