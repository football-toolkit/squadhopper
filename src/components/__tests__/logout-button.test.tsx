import { beforeEach, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/app/actions/log-out", () => ({ logOut: vi.fn() }));
vi.mock("@/lib/navigation", () => ({ goTo: vi.fn(), reloadPage: vi.fn() }));

import { logOut } from "@/app/actions/log-out";
import { authMessages } from "@/lib/messages/auth";
import { goTo } from "@/lib/navigation";
import { LogoutButton } from "../logout-button";

beforeEach(() => {
  vi.mocked(logOut).mockReset();
  vi.mocked(goTo).mockReset();
});

test("it is an outline button with the Log out icon", () => {
  render(<LogoutButton />);
  const button = screen.getByRole("button", { name: authMessages.logOut });
  expect(button.className).toContain("border-border");
  expect(screen.getByTestId("log-out-icon")).toBeDefined();
});

test("while pending it is disabled, shows the spinner, and ignores a second click", async () => {
  vi.mocked(logOut).mockReturnValue(new Promise(() => {}));
  render(<LogoutButton />);
  fireEvent.click(screen.getByRole("button", { name: authMessages.logOut }));
  const button = await screen.findByRole("button", {
    name: authMessages.loggingOut,
  });
  expect(button.hasAttribute("disabled")).toBe(true);
  expect(
    screen.getByRole("status", { hidden: true }).getAttribute("class"),
  ).toContain("motion-reduce:animate-none");
  fireEvent.click(button);
  expect(logOut).toHaveBeenCalledTimes(1);
});

test("after logOut resolves it goes to /login, keeping the pending state", async () => {
  vi.mocked(logOut).mockResolvedValue(undefined);
  render(<LogoutButton />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: authMessages.logOut }));
  });
  expect(goTo).toHaveBeenCalledWith("/login");
  expect(
    screen
      .getByRole("button", { name: authMessages.loggingOut })
      .hasAttribute("disabled"),
  ).toBe(true);
});

test("after logOut rejects it also goes to /login", async () => {
  vi.mocked(logOut).mockRejectedValue(new Error("boom"));
  render(<LogoutButton />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: authMessages.logOut }));
  });
  expect(goTo).toHaveBeenCalledWith("/login");
});
