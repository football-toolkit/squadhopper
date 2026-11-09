import { expect, test } from "vitest";
import { APP_NAME, APP_NAME_PARTS } from "../app-name";

test("the app name is its two parts joined", () => {
  expect(APP_NAME_PARTS).toEqual(["Squad", "Hopper"]);
  expect(APP_NAME).toBe("SquadHopper");
});
