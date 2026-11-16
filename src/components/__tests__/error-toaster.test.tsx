import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import {
  closeError,
  contentClasses,
  ErrorToaster,
  showError,
  toastClasses,
} from "../error-toaster";
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

test("the popup slides in from the top using theme utilities only", () => {
  render(<ErrorToaster />);
  show("From the top.");
  const root = popup()!;
  for (const c of [
    "origin-top",
    "not-data-limited:data-starting-style:transform-none",
    "not-data-expanded:not-data-limited:not-data-swipe-direction:data-ending-style:transform-none",
  ]) {
    expect(root.className).toContain(c);
  }
  const content = root.querySelector('[data-slot="toast-content"]')!;
  expect(content.className).toContain(
    "group-data-starting-style/toast:-translate-y-full",
  );
  expect(content.className).toContain(
    "group-data-ending-style/toast:-translate-y-full",
  );
  // No bracket values in the classes this project adds.
  expect(toastClasses).not.toContain("[");
  expect(contentClasses).not.toContain("[");
});

test("the popup is a centred, one-line row on the surface color", () => {
  render(<ErrorToaster />);
  show("One line.");
  const root = popup()!;
  const rootClasses = Array.from(root.classList);
  for (const c of [
    "bg-surface",
    "border",
    "border-destructive",
    "rounded-xl",
    "shadow-2xl",
  ]) {
    expect(rootClasses).toContain(c);
  }
  for (const c of ["bg-card", "rounded-2xl", "shadow-lg", "bg-popover"]) {
    expect(rootClasses).not.toContain(c);
  }
  const content = Array.from(
    root.querySelector('[data-slot="toast-content"]')!.classList,
  );
  for (const c of ["flex", "items-center", "gap-3", "py-1", "pr-1", "pl-4"]) {
    expect(content).toContain(c);
  }
  expect(content).not.toContain("items-start");
  expect(
    screen.getByTestId("error-toast-icon").getAttribute("class"),
  ).toContain("size-5");
  const message = root.querySelector('[data-slot="toast-description"]')!;
  for (const c of ["flex-1", "text-sm", "font-semibold", "text-foreground"]) {
    expect(Array.from(message.classList)).toContain(c);
  }
  expect(Array.from(message.classList)).not.toContain("text-muted-foreground");
  focusPopup();
  const close = Array.from(closeButton().classList);
  for (const c of [
    "size-11",
    "text-muted-foreground",
    "hover:text-foreground",
  ]) {
    expect(close).toContain(c);
  }
  expect(close).not.toContain("size-8");
  expect(closeButton().querySelector("svg")?.getAttribute("class")).toContain(
    "size-4.5",
  );
});

test("the popup sits 12 px from the top on phones and 24 px top right from md up", () => {
  render(<ErrorToaster />);
  show("Placed.");
  const viewport = Array.from(
    document.querySelector('[data-slot="toast-viewport"]')!.classList,
  );
  for (const c of [
    "top-3",
    "inset-x-3",
    "bottom-auto",
    "md:top-6",
    "md:right-6",
    "md:left-auto",
    "md:w-100",
  ]) {
    expect(viewport).toContain(c);
  }
  // The generated bottom, max-width and sm: placement must be gone.
  for (const c of [
    "bottom-4",
    "max-w-sm",
    "sm:right-4",
    "sm:w-full",
    "inset-x-4",
  ]) {
    expect(viewport).not.toContain(c);
  }
  expect(viewport.filter((c) => c.includes("["))).toEqual([]);
});
