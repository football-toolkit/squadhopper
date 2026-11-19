import { Component, type ReactNode } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/lib/navigation", () => ({ goTo: vi.fn(), reloadPage: vi.fn() }));
vi.mock("@/components/error-toaster", () => ({
  showError: vi.fn(),
  closeError: vi.fn(),
}));

import { closeError, showError } from "@/components/error-toaster";
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

// Logging out is a POST to the /logout route, so stub the browser's fetch.
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(goTo).mockReset();
  vi.mocked(showError).mockReset();
  vi.mocked(showError).mockReturnValue("popup-1");
  vi.mocked(closeError).mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const loggedOut = () => new Response(null, { status: 204 });

test("it is an outline button with the Log out icon", () => {
  render(<LogoutButton />);
  const button = screen.getByRole("button", { name: authMessages.logOut });
  expect(button.className).toContain("border-border");
  expect(screen.getByTestId("log-out-icon")).toBeDefined();
});

test("while pending it is disabled, shows the spinner, and ignores a second click", async () => {
  let finish: () => void = () => {};
  fetchMock.mockReturnValue(
    new Promise<Response>((resolve) => {
      finish = () => resolve(loggedOut());
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
  expect(fetchMock).toHaveBeenCalledTimes(1);
  // Let the transition end, so it can't affect the tests after this one.
  await act(async () => finish());
});

test("it logs out with a POST to /logout, then goes to /login, keeping the pending state", async () => {
  fetchMock.mockResolvedValue(loggedOut());
  render(<LogoutButton />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: authMessages.logOut }));
  });
  expect(fetchMock).toHaveBeenCalledWith("/logout", { method: "POST" });
  expect(goTo).toHaveBeenCalledWith("/login");
  expect(
    screen
      .getByRole("button", { name: authMessages.loggingOut })
      .hasAttribute("disabled"),
  ).toBe(true);
});

async function clickLogOut() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: authMessages.logOut }));
  });
}

// When the app can't be reached, the session is still there: going to /login
// would only bounce the user back, so the popup says to try again.
test.each([
  ["the request fails", () => fetchMock.mockRejectedValue(new TypeError("x"))],
  [
    "the server answers 500",
    () => fetchMock.mockResolvedValue(new Response(null, { status: 500 })),
  ],
  [
    "the server answers 403",
    () => fetchMock.mockResolvedValue(new Response(null, { status: 403 })),
  ],
])(
  "when %s it shows the popup, stays on the page and unlocks the button",
  async (_name, arrange) => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onError = vi.fn();
    window.addEventListener("error", onError);
    try {
      arrange();
      render(
        <Boundary>
          <LogoutButton />
        </Boundary>,
      );
      await clickLogOut();
      expect(showError).toHaveBeenCalledWith(authMessages.logOutFailed);
      expect(goTo).not.toHaveBeenCalled();
      const button = screen.getByRole("button", { name: authMessages.logOut });
      expect(button.hasAttribute("disabled")).toBe(false);
      expect(screen.queryByText("boundary fallback")).toBeNull();
      expect(onError).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener("error", onError);
      consoleError.mockRestore();
    }
  },
);

test("clicking Log out again closes the last popup", async () => {
  fetchMock.mockRejectedValueOnce(new TypeError("x"));
  render(<LogoutButton />);
  await clickLogOut();
  expect(closeError).not.toHaveBeenCalled();

  fetchMock.mockResolvedValueOnce(loggedOut());
  await clickLogOut();
  expect(closeError).toHaveBeenCalledWith("popup-1");
  expect(goTo).toHaveBeenCalledWith("/login");
});
