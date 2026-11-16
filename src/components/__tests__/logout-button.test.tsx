import { Component, type ReactNode } from "react";
import { beforeEach, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/app/actions/log-out", () => ({ logOut: vi.fn() }));
vi.mock("@/lib/navigation", () => ({ goTo: vi.fn(), reloadPage: vi.fn() }));

import { logOut } from "@/app/actions/log-out";
import { authMessages } from "@/lib/messages/auth";
import { goTo } from "@/lib/navigation";
import { LogoutButton } from "../logout-button";

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <p>boundary fallback</p> : this.props.children;
  }
}

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
  let finish: () => void = () => {};
  vi.mocked(logOut).mockReturnValue(
    new Promise<void>((resolve) => {
      finish = resolve;
    }),
  );
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
  // Let the transition end, so it can't affect the tests after this one.
  await act(async () => finish());
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

test("after logOut rejects it goes to /login without raising an error", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  const onError = vi.fn();
  window.addEventListener("error", onError);
  vi.mocked(logOut).mockRejectedValue(new Error("boom"));
  render(
    <Boundary>
      <LogoutButton />
    </Boundary>,
  );
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: authMessages.logOut }));
  });
  expect(goTo).toHaveBeenCalledWith("/login");
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(screen.queryByText("boundary fallback")).toBeNull();
  window.removeEventListener("error", onError);
  expect(onError).not.toHaveBeenCalled();
  expect(consoleError).not.toHaveBeenCalled();
  consoleError.mockRestore();
});
