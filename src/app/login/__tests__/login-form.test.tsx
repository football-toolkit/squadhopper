import { beforeEach, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("../actions", () => ({ logIn: vi.fn() }));
vi.mock("@/components/error-toaster", () => ({
  showError: vi.fn(),
  closeError: vi.fn(),
}));
vi.mock("@/lib/navigation", () => ({ goTo: vi.fn(), reloadPage: vi.fn() }));

import { UnrecognizedActionError } from "next/dist/client/components/unrecognized-action-error";
import { LoginForm } from "../login-form";
import { logIn } from "../actions";
import { closeError, showError } from "@/components/error-toaster";
import { goTo, reloadPage } from "@/lib/navigation";
import { authMessages } from "@/lib/messages/auth";

const email = () =>
  screen.getByLabelText(authMessages.emailLabel) as HTMLInputElement;
const password = () =>
  screen.getByLabelText(authMessages.passwordLabel) as HTMLInputElement;
const type = (el: HTMLElement, value: string) =>
  fireEvent.change(el, { target: { value } });
const click = (el: HTMLElement) => fireEvent.click(el);
const button = () => screen.getByRole("button", { name: authMessages.logIn });

beforeEach(() => {
  vi.mocked(logIn).mockReset();
  vi.mocked(showError).mockReset().mockReturnValue("t1");
  vi.mocked(closeError).mockReset();
  vi.mocked(goTo).mockReset();
  vi.mocked(reloadPage).mockReset();
});

test("the form is built for browsers and password managers", () => {
  const { container } = render(<LoginForm />);
  expect(container.querySelector("form")?.noValidate).toBe(true);
  expect(email().type).toBe("email");
  expect(email().autocomplete).toBe("email");
  expect(password().type).toBe("password");
  expect(password().autocomplete).toBe("current-password");
  expect(button().textContent).toContain(authMessages.logIn);
  expect(screen.getByTestId("log-in-icon")).toBeDefined();
});

test("both empty: shows both messages, marks the fields and focuses Email", async () => {
  render(<LoginForm />);
  click(button());
  const emailMsg = screen.getByText(authMessages.emailMissing);
  const passwordMsg = screen.getByText(authMessages.passwordMissing);
  expect(email().getAttribute("aria-invalid")).toBe("true");
  expect(password().getAttribute("aria-invalid")).toBe("true");
  expect(email().getAttribute("aria-describedby")).toBe(emailMsg.id);
  expect(password().getAttribute("aria-describedby")).toBe(passwordMsg.id);
  expect(logIn).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(email());
});

test("an email without a domain shows only the invalid-email message", async () => {
  render(<LoginForm />);
  type(email(), "ana.example");
  type(password(), "secret");
  click(button());
  expect(screen.getByText(authMessages.emailInvalid)).toBeDefined();
  expect(screen.queryByText(authMessages.passwordMissing)).toBeNull();
});

test("typing in a field clears only its message", async () => {
  render(<LoginForm />);
  click(button());
  type(email(), "a");
  expect(screen.queryByText(authMessages.emailMissing)).toBeNull();
  expect(email().getAttribute("aria-invalid")).toBeNull();
  expect(screen.getByText(authMessages.passwordMissing)).toBeDefined();
  expect(password().getAttribute("aria-invalid")).toBe("true");
});

test("while pending the controls are disabled and a second click does nothing", async () => {
  // Resolved at the end: React chains async transitions, so a promise that
  // never settles would block the next test's transition.
  let settle: (result: { ok: false; code: "unavailable" }) => void = () => {};
  vi.mocked(logIn).mockReturnValue(
    new Promise((resolve) => {
      settle = resolve;
    }),
  );
  render(<LoginForm />);
  type(email(), "ana@example.com");
  type(password(), "secret");
  click(button());
  const pending = screen.getByRole("button", { name: authMessages.loggingIn });
  expect((pending as HTMLButtonElement).disabled).toBe(true);
  expect(email().disabled).toBe(true);
  expect(password().disabled).toBe(true);
  const spinner = screen.getByRole("status", { hidden: true });
  expect(spinner.getAttribute("class")).toContain("motion-reduce:animate-none");
  click(pending);
  expect(logIn).toHaveBeenCalledTimes(1);
  settle({ ok: false, code: "unavailable" });
  await waitFor(() => expect(button().hasAttribute("disabled")).toBe(false));
});

test("success goes to the home page, replacing the history entry", async () => {
  vi.mocked(logIn).mockResolvedValue({ ok: true });
  render(<LoginForm />);
  type(email(), "ana@example.com");
  type(password(), "secret");
  click(button());
  await waitFor(() =>
    expect(goTo).toHaveBeenCalledWith("/", { replace: true }),
  );
});

test("wrong credentials: popup, email kept, password cleared, controls enabled", async () => {
  vi.mocked(logIn).mockResolvedValue({
    ok: false,
    code: "invalid_credentials",
  });
  render(<LoginForm />);
  type(email(), "ana@example.com");
  type(password(), "secret");
  click(button());
  await waitFor(() =>
    expect(showError).toHaveBeenCalledWith(
      authMessages.errors.invalid_credentials,
    ),
  );
  expect(email().value).toBe("ana@example.com");
  expect(password().value).toBe("");
  await waitFor(() => expect(button().hasAttribute("disabled")).toBe(false));
  expect(email().disabled).toBe(false);
  expect(password().disabled).toBe(false);
});

test("every click closes the last popup, even when the field check stops it", async () => {
  vi.mocked(logIn).mockResolvedValue({
    ok: false,
    code: "invalid_credentials",
  });
  render(<LoginForm />);
  type(email(), "ana@example.com");
  type(password(), "secret");
  click(button());
  await waitFor(() => expect(showError).toHaveBeenCalled());
  await waitFor(() => expect(button().hasAttribute("disabled")).toBe(false));
  click(button());
  expect(closeError).toHaveBeenCalledWith("t1");
  expect(screen.getByText(authMessages.passwordMissing)).toBeDefined();
});

test("unavailable keeps both values", async () => {
  vi.mocked(logIn).mockResolvedValue({ ok: false, code: "unavailable" });
  render(<LoginForm />);
  type(email(), "ana@example.com");
  type(password(), "secret");
  click(button());
  await waitFor(() =>
    expect(showError).toHaveBeenCalledWith(authMessages.errors.unavailable),
  );
  expect(email().value).toBe("ana@example.com");
  expect(password().value).toBe("secret");
});

test("a thrown action is treated as unavailable", async () => {
  vi.mocked(logIn).mockRejectedValue(new Error("network"));
  render(<LoginForm />);
  type(email(), "ana@example.com");
  type(password(), "secret");
  click(button());
  await waitFor(() =>
    expect(showError).toHaveBeenCalledWith(authMessages.errors.unavailable),
  );
  expect(password().value).toBe("secret");
});

test("a login page from an older build reloads instead of showing a popup", async () => {
  vi.mocked(logIn).mockRejectedValue(new UnrecognizedActionError("old build"));
  render(<LoginForm />);
  type(email(), "ana@example.com");
  type(password(), "secret");
  click(button());
  await waitFor(() => expect(reloadPage).toHaveBeenCalledTimes(1));
  expect(showError).not.toHaveBeenCalled();
});

test("Enter in the password field submits once", async () => {
  vi.mocked(logIn).mockResolvedValue({ ok: true });
  render(<LoginForm />);
  type(email(), "ana@example.com");
  type(password(), "secret");
  fireEvent.submit(password().form!);
  await waitFor(() => expect(logIn).toHaveBeenCalledTimes(1));
});

test("spaces in the password reach the action unchanged", async () => {
  vi.mocked(logIn).mockResolvedValue({ ok: true });
  render(<LoginForm />);
  type(email(), " ana@example.com ");
  type(password(), "  pass word  ");
  click(button());
  await waitFor(() =>
    expect(logIn).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "  pass word  ",
    }),
  );
});
