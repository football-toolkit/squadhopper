import { beforeEach, expect, test, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/lib/navigation", () => ({ goTo: vi.fn(), reloadPage: vi.fn() }));

import { reloadPage } from "@/lib/navigation";
import { BfcacheReload } from "../bfcache-reload";

function pageshow(persisted: boolean) {
  const event = new Event("pageshow");
  Object.defineProperty(event, "persisted", { value: persisted });
  window.dispatchEvent(event);
}

beforeEach(() => {
  vi.mocked(reloadPage).mockReset();
});

test("reloads when the page is restored from the back/forward cache", () => {
  render(<BfcacheReload />);
  pageshow(true);
  expect(reloadPage).toHaveBeenCalledTimes(1);
});

test("does not reload on a normal page show", () => {
  render(<BfcacheReload />);
  pageshow(false);
  expect(reloadPage).not.toHaveBeenCalled();
});

test("unmounting removes the listener", () => {
  const { unmount } = render(<BfcacheReload />);
  unmount();
  pageshow(true);
  expect(reloadPage).not.toHaveBeenCalled();
});
