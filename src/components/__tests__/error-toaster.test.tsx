import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { closeError, ErrorToaster, showError } from "../error-toaster";
import { authMessages } from "@/lib/messages/auth";

afterEach(() => {
  vi.useRealTimers();
});

// Base UI hides a high-priority popup from the accessibility tree until it
// receives focus, and announces its text through a separate role="alert"
// region. So the visible popup is an "alertdialog" found with hidden: true,
// and its Close button has an accessible name once the popup is focused.
const popup = () => screen.queryByRole("alertdialog", { hidden: true });
function focusPopup() {
  act(() => {
    popup()?.focus();
  });
}
const closeButton = () =>
  screen.getByRole("button", { name: authMessages.close });

function show(message: string): string {
  let id = "";
  act(() => {
    id = showError(message);
  });
  return id;
}

test("the message shows inside an alert", () => {
  render(<ErrorToaster />);
  show("Something went wrong.");
  const alert = screen.getByRole("alert");
  expect(alert.textContent).toContain("Something went wrong.");
});

test("there is a Close button", () => {
  render(<ErrorToaster />);
  show("Something went wrong.");
  focusPopup();
  expect(closeButton()).toBeTruthy();
});

test("the popup stays on screen until it is closed", () => {
  vi.useFakeTimers();
  render(<ErrorToaster />);
  show("Still here.");
  act(() => {
    vi.advanceTimersByTime(60_000);
  });
  expect(popup()?.textContent).toContain("Still here.");
});

test("clicking Close removes the popup", () => {
  render(<ErrorToaster />);
  show("Click me away.");
  focusPopup();
  fireEvent.click(closeButton());
  expect(popup()).toBeNull();
});

test("Close works from the keyboard", () => {
  render(<ErrorToaster />);
  show("Keyboard away.");
  focusPopup();
  const close = closeButton();
  act(() => close.focus());
  expect(document.activeElement).toBe(close);
  fireEvent.keyDown(close, { key: "Enter" });
  fireEvent.click(close);
  expect(popup()).toBeNull();
});

test("closeError removes the popup", () => {
  render(<ErrorToaster />);
  const id = show("Closed from code.");
  act(() => {
    closeError(id);
  });
  expect(popup()).toBeNull();
});

test("the popup has a destructive border and icon", () => {
  render(<ErrorToaster />);
  show("Red flags.");
  expect(popup()?.className).toContain("border-destructive");
  expect(
    screen.getByTestId("error-toast-icon").getAttribute("class"),
  ).toContain("text-destructive");
});
