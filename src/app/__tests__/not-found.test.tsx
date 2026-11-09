import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound, { metadata } from "../not-found";
import { APP_NAME } from "@/lib/app-name";

test("the 404 page has the heading, with 404 in volt", () => {
  render(<NotFound />);
  expect(
    screen.getByRole("heading", { level: 1, name: "404 Page not found." }),
  ).toBeDefined();
  expect(screen.getByText("404").className).toContain("text-primary");
});

test("the 404 page shows the lead text", () => {
  render(<NotFound />);
  expect(
    screen.getByText("This page doesn't exist or has moved."),
  ).toBeDefined();
});

test("Back to home is one link to /, styled as the main button", () => {
  render(<NotFound />);
  const links = screen.getAllByRole("link", { name: "Back to home" });
  expect(links).toHaveLength(1);
  expect(links[0].getAttribute("href")).toBe("/");
  expect(links[0].className).toContain("bg-primary");
  expect(links[0].className).toContain("text-primary-foreground");
  expect(links[0].className).toContain("h-12");
  expect(links[0].className).toContain("text-xl");
  expect(links[0].className).not.toMatch(/(^|\s)(h-8|text-sm)(\s|$)/);
  expect(links[0].className).not.toMatch(/(ring|outline)-primary/);
  expect(screen.queryAllByRole("button")).toHaveLength(0);
});

test("the header shows the app name", () => {
  render(<NotFound />);
  expect(screen.getByRole("banner").textContent).toBe(APP_NAME);
});

test("the 404 page has its own title, built from the app name", () => {
  expect(metadata.title).toBe(`Page not found · ${APP_NAME}`);
});
