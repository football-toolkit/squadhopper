import { afterEach, expect, test, vi } from "vitest";
import { goTo, reloadPage } from "../navigation";

function stubLocation() {
  const location = { assign: vi.fn(), replace: vi.fn(), reload: vi.fn() };
  vi.stubGlobal("location", location);
  return location;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("goTo assigns the URL by default", () => {
  const location = stubLocation();
  goTo("/login");
  expect(location.assign).toHaveBeenCalledWith("/login");
  expect(location.replace).not.toHaveBeenCalled();
});

test("goTo replaces the history entry when asked", () => {
  const location = stubLocation();
  goTo("/", { replace: true });
  expect(location.replace).toHaveBeenCalledWith("/");
  expect(location.assign).not.toHaveBeenCalled();
});

test("reloadPage reloads the page", () => {
  const location = stubLocation();
  reloadPage();
  expect(location.reload).toHaveBeenCalledOnce();
});
