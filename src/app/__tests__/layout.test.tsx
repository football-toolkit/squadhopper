import { expect, test, vi } from "vitest";
import RootLayout, { metadata } from "../layout";
import { APP_NAME } from "@/lib/app-name";

// next/font only works inside the Next.js build, so each font returns a fixed class.
vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "inter-variable" }),
  Barlow_Condensed: () => ({ variable: "barlow-variable" }),
}));

test("the page title is the app name", () => {
  expect(metadata.title).toBe(APP_NAME);
});

test("the root element is dark and carries both font variables", () => {
  const html = RootLayout({ children: null } as LayoutProps<"/">);
  const classes = html.props.className.split(" ");
  for (const c of [
    "dark",
    "scheme-dark",
    "inter-variable",
    "barlow-variable",
  ]) {
    expect(classes).toContain(c);
  }
});
