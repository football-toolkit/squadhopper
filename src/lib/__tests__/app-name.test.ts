import { expect, test } from "vitest";
import { APP_NAME, APP_NAME_PARTS } from "../app-name";

// The name itself is written only in app-name.ts (see AGENTS.md), so the tests
// check its shape, not its spelling.
test("the app name is its two parts joined", () => {
  expect(APP_NAME_PARTS).toHaveLength(2);
  for (const part of APP_NAME_PARTS) expect(part).not.toBe("");
  expect(APP_NAME).toBe(APP_NAME_PARTS.join(""));
});
