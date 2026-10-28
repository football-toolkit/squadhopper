import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";

test("the home page only says Coming soon", () => {
  render(<Page />);
  expect(screen.getByText("Coming soon")).toBeDefined();
  expect(screen.queryByRole("heading")).toBeNull();
  expect(screen.queryByRole("link")).toBeNull();
  expect(screen.queryByRole("img")).toBeNull();
});
