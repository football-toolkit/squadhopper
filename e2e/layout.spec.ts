import { expect, test, type Locator, type Page } from "@playwright/test";

// The page frame's rules that broke before (see the design guide's "Page
// layout"). Keep these few: they guard layout, not every spacing value.

const pages = [
  { name: "home", path: "/" },
  { name: "404 page", path: "/does-not-exist" },
];

// endsAtHalf is written here, not worked out from PitchLayout's sizes, so the
// test doesn't copy the component's sums. Only a phone in landscape is short
// enough for the surface to grow past half the screen.
const sizes = [
  { width: 360, height: 640, endsAtHalf: true },
  { width: 390, height: 844, endsAtHalf: true },
  { width: 844, height: 390, endsAtHalf: false },
  { width: 1280, height: 800, endsAtHalf: true },
  { width: 2560, height: 1440, endsAtHalf: true },
];

const TOLERANCE = 1;

type Box = { top: number; bottom: number; left: number; right: number };

type Layout = {
  viewport: { width: number; height: number };
  scrollWidth: number;
  clientWidth: number;
  headerBottom: number;
  band: Box;
  pitch: Box;
  cardTop: number;
};

function boxOf(locator: Locator): Promise<Box> {
  return locator.evaluate((element) => {
    const { top, bottom, left, right } = element.getBoundingClientRect();
    return { top, bottom, left, right };
  });
}

async function measure(page: Page): Promise<Layout> {
  // The fonts wait before showing text (display: block), so the card's height
  // is only final once they've loaded.
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  // The pitch's lines, not the svg box: with "meet" scaling, the box can be
  // wider or taller than the drawing, which would hide a cropped pitch.
  const pitch = await page.getByTestId("pitch").evaluate((svg) => {
    const lines = svg.querySelector("g");
    if (!lines) throw new Error("The pitch has no lines");
    const { top, bottom, left, right } = lines.getBoundingClientRect();
    return { top, bottom, left, right };
  });

  return {
    viewport: page.viewportSize() ?? { width: 0, height: 0 },
    scrollWidth,
    clientWidth,
    headerBottom: (await boxOf(page.getByRole("banner"))).bottom,
    band: await boxOf(page.getByTestId("pitch-band")),
    pitch,
    cardTop: (await boxOf(page.getByRole("main").locator('[data-slot="card"]')))
      .top,
  };
}

for (const { name, path } of pages) {
  for (const { width, height, endsAtHalf } of sizes) {
    test(`${name} at ${width} × ${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(path);
      const {
        viewport,
        scrollWidth,
        clientWidth,
        headerBottom,
        band,
        pitch,
        cardTop,
      } = await measure(page);

      await test.step("no sideways scrolling", () => {
        expect
          .soft(
            scrollWidth,
            `page width ${scrollWidth} vs screen ${clientWidth}`,
          )
          .toBeLessThanOrEqual(clientWidth + TOLERANCE);
      });

      await test.step("the pitch is whole", () => {
        expect
          .soft(pitch.left, `pitch left ${pitch.left} vs screen left 0`)
          .toBeGreaterThanOrEqual(-TOLERANCE);
        expect
          .soft(
            pitch.right,
            `pitch right ${pitch.right} vs screen right ${viewport.width}`,
          )
          .toBeLessThanOrEqual(viewport.width + TOLERANCE);
        expect
          .soft(
            pitch.top,
            `pitch top ${pitch.top} vs header bottom ${headerBottom}`,
          )
          .toBeGreaterThanOrEqual(headerBottom - TOLERANCE);
        expect
          .soft(
            pitch.bottom,
            `pitch bottom ${pitch.bottom} vs surface bottom ${band.bottom}`,
          )
          .toBeLessThanOrEqual(band.bottom + TOLERANCE);
      });

      await test.step("the pitch doesn't touch the card", () => {
        expect
          .soft(
            pitch.bottom,
            `pitch bottom ${pitch.bottom} vs card top ${cardTop}`,
          )
          .toBeLessThan(cardTop - TOLERANCE);
      });

      const half = viewport.height / 2;
      if (endsAtHalf) {
        await test.step("the surface ends at half the screen", () => {
          expect
            .soft(
              Math.abs(band.bottom - half),
              `surface bottom ${band.bottom} vs half the screen ${half}`,
            )
            .toBeLessThanOrEqual(TOLERANCE);
        });
      } else {
        await test.step("the surface grows past half the screen", () => {
          expect
            .soft(
              band.bottom,
              `surface bottom ${band.bottom} vs half the screen ${half}`,
            )
            .toBeGreaterThan(half + TOLERANCE);
        });
      }
    });
  }
}
