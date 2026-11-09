import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { Wordmark } from "../wordmark";
import { APP_NAME } from "@/lib/app-name";

test("the wordmark spells the app name, as a paragraph by default", () => {
  const { container } = render(<Wordmark />);
  expect(container.firstElementChild?.tagName).toBe("P");
  expect(container.textContent).toBe(APP_NAME);
});

test("only the second part is volt", () => {
  render(<Wordmark />);
  expect(screen.getByText("Hopper").className).toContain("text-primary");
  // getByText matches the outer element, whose own text is the first part.
  expect(screen.getByText("Squad").className).not.toContain("text-primary");
});

test("the element can be changed", () => {
  render(<Wordmark as="h1" />);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(APP_NAME);
});
