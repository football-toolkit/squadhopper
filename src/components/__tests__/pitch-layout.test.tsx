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

function classesOf(element: Element | null | undefined) {
  return element?.getAttribute("class")?.split(" ") ?? [];
}

function renderBand() {
  const { container } = render(
    <PitchLayout>
      <p>Card</p>
    </PitchLayout>,
  );
  const pitch = container.querySelector("svg");
  const box = pitch?.parentElement;
  const area = box?.parentElement;
  const band = area?.parentElement;
  return {
    pitch: classesOf(pitch),
    box: classesOf(box),
    area: classesOf(area),
    band: classesOf(band),
    bandChildren: Array.from(band?.children ?? []).map(classesOf),
    surface: classesOf(band?.parentElement),
  };
}

test("the pitch sits in a box positioned over the pitch area", () => {
  // Safari doesn't resolve the pitch's height: 100% inside a flex band, so the
  // pitch fills an absolutely positioned box, whose size is always definite.
  const { box, area, band } = renderBand();
  expect(area).toContain("relative");
  expect(band).not.toContain("contain-size");
  for (const c of ["absolute", "inset-x-5", "inset-y-0", "flex"]) {
    expect(box).toContain(c);
  }
  expect(box).toEqual(
    expect.arrayContaining(["items-center", "justify-center"]),
  );
  expect(box).not.toContain("top-4");
  expect(box).not.toContain("bottom-16");
});

test("the pitch is at most 960 px wide", () => {
  const { pitch } = renderBand();
  for (const c of ["block", "size-full", "max-w-240"]) {
    expect(pitch).toContain(c);
  }
  expect(pitch).not.toContain("max-h-57");
  expect(pitch).not.toContain("max-w-92");
});

test("the band splits its height between two equal spaces and the pitch area", () => {
  // Grow 1 : 8 : 1, so the pitch area takes about 80% of the free height and
  // the space above the pitch equals the space between it and the card. The
  // last 48 px sit under the card.
  const { band, bandChildren } = renderBand();
  for (const c of [
    "flex",
    "flex-1",
    "flex-col",
    "border-b",
    "border-divider",
  ]) {
    expect(band).toContain(c);
  }
  expect(bandChildren).toHaveLength(4);
  const [above, area, below, overlap] = bandChildren;
  expect(above).toEqual(expect.arrayContaining(["min-h-4", "grow"]));
  expect(area).toEqual(
    expect.arrayContaining(["relative", "min-h-24", "grow-8"]),
  );
  expect(below).toEqual(expect.arrayContaining(["min-h-4", "grow"]));
  expect(overlap).toEqual(expect.arrayContaining(["h-12", "shrink-0"]));
});

test("the band keeps room for a pitch at least 96 px tall", () => {
  // min-h-44 = 16 px above + 96 px pitch + 16 px below + 48 px overlap.
  const { band, area } = renderBand();
  expect(band).toContain("min-h-44");
  expect(area).toContain("min-h-24");
});

test.skip("the surface is at least half the screen, and grows when the band needs it", () => {
  // Safari doesn't let min-h-min beat a fixed height, so the surface has only a
  // minimum: h-[50svh] would keep it at half while the band overflowed below it.
  const { surface } = renderBand();
  expect(surface).toContain("min-h-[50svh]");
  expect(surface).not.toContain("h-[50svh]");
  expect(surface).not.toContain("min-h-min");
});

test("the band and the pitch have test ids for the end-to-end tests", () => {
  render(
    <PitchLayout>
      <p>Card</p>
    </PitchLayout>,
  );
  expect(classesOf(screen.getByTestId("pitch-band"))).toContain("bg-surface");
  expect(screen.getByTestId("pitch").tagName.toLowerCase()).toBe("svg");
});
