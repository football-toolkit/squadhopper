import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { PitchLayout } from "../pitch-layout";

test("it shows the header when given, and the children in main", () => {
  render(
    <PitchLayout header={<p>Top</p>}>
      <p>Card</p>
    </PitchLayout>,
  );
  expect(screen.getByText("Top")).toBeDefined();
  expect(within(screen.getByRole("main")).getByText("Card")).toBeDefined();
});

test("it shows no header when none is given", () => {
  render(
    <PitchLayout>
      <p>Card</p>
    </PitchLayout>,
  );
  expect(screen.queryByRole("banner")).toBeNull();
});

test("the pitch drawing is hidden from screen readers", () => {
  const { container } = render(
    <PitchLayout>
      <p>Card</p>
    </PitchLayout>,
  );
  expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
    "true",
  );
});
