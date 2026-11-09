import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";
import { APP_NAME } from "@/lib/app-name";

test("the home page has the heading, with one place. in volt", () => {
  render(<Page />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "All your matches in one place.",
    }),
  ).toBeDefined();
  expect(screen.getByText("one place.").className).toContain("text-primary");
});

test("the home page shows the lead text", () => {
  render(<Page />);
  expect(
    screen.getByText("Every team and every tournament on one calendar."),
  ).toBeDefined();
});

test("the header shows the app name", () => {
  render(<Page />);
  expect(screen.getByRole("banner").textContent).toBe(APP_NAME);
});

test("Coming soon is gone, and the only link goes home", () => {
  render(<Page />);
  expect(screen.queryByText("Coming soon")).toBeNull();
  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(1);
  expect(links[0].getAttribute("href")).toBe("/");
});
