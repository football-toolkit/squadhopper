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

function renderBand() {
  const { container } = render(
    <PitchLayout>
      <p>Card</p>
    </PitchLayout>,
  );
  const box = container.querySelector("svg")?.parentElement;
  const band = box?.parentElement;
  return {
    box: box?.className.split(" ") ?? [],
    band: band?.className.split(" ") ?? [],
  };
}

test("the pitch sits in a box positioned over the band's padded area", () => {
  // Safari doesn't resolve the pitch's height: 100% inside a flex band, so the
  // pitch fills an absolutely positioned box, whose size is always definite.
  // The box's bottom gap is its top gap (16 px) plus the card's 48 px overlap.
  const { box, band } = renderBand();
  expect(band).toContain("relative");
  expect(band).not.toContain("contain-size");
  for (const c of ["absolute", "inset-x-5", "top-4", "bottom-16", "flex"]) {
    expect(box).toContain(c);
  }
  expect(box).toEqual(
    expect.arrayContaining(["items-center", "justify-center"]),
  );
});

test("the band keeps room for a pitch at least 96 px tall", () => {
  // min-h-44 = 96 px pitch + 16 px above + 64 px below.
  expect(renderBand().band).toContain("min-h-44");
});
