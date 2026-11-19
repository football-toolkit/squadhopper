import { expect, test, type Locator, type Page } from "@playwright/test";

// The page frame's rules that broke before (see the design guide's "Page
// layout"). Keep these few: they guard layout, not every spacing value.

type PageUnderTest = { name: string; path: string; hasHeader: boolean };

// Seen logged in, with the saved session.
const pages: PageUnderTest[] = [
  { name: "home", path: "/", hasHeader: true },
  { name: "404 page", path: "/does-not-exist", hasHeader: true },
];

// Seen logged out. It has no header.
const loginPage: PageUnderTest = {
  name: "login screen",
  path: "/login",
  hasHeader: false,
};

// endsAtHalf is written here, not worked out from PitchLayout's sizes, so the
// test doesn't copy the component's sums. Only a phone in landscape is short
// enough for the surface to grow past half the screen, and only with a header:
// without one, the band still fits in half the screen.
const sizes = [
  { width: 360, height: 640, endsAtHalf: true, endsAtHalfWithoutHeader: true },
  { width: 390, height: 844, endsAtHalf: true, endsAtHalfWithoutHeader: true },
  { width: 844, height: 390, endsAtHalf: false, endsAtHalfWithoutHeader: true },
  { width: 1280, height: 800, endsAtHalf: true, endsAtHalfWithoutHeader: true },
  {
    width: 2560,
    height: 1440,
    endsAtHalf: true,
    endsAtHalfWithoutHeader: true,
  },
];

const TOLERANCE = 1;

type Box = { top: number; bottom: number; left: number; right: number };

type Layout = {
  viewport: { width: number; height: number };
  scrollWidth: number;
  clientWidth: number;
  // Null on a page without a header.
  headerBottom: number | null;
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

async function measure(page: Page, hasHeader: boolean): Promise<Layout> {
  // Measure only once the fonts have loaded, so text can't still change size,
  // and with it the page's width, after the measurements are taken.
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
    headerBottom: hasHeader
      ? (await boxOf(page.getByRole("banner"))).bottom
      : null,
    band: await boxOf(page.getByTestId("pitch-band")),
    pitch,
    cardTop: (await boxOf(page.getByRole("main").locator('[data-slot="card"]')))
      .top,
  };
}

function testLayout({ name, path, hasHeader }: PageUnderTest) {
  for (const size of sizes) {
    const { width, height } = size;
    const endsAtHalf = hasHeader
      ? size.endsAtHalf
      : size.endsAtHalfWithoutHeader;
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
      } = await measure(page, hasHeader);
      // Without a header, the pitch must still start inside the surface.
      const pitchTopLimit = headerBottom ?? band.top;
      const pitchTopLimitName =
        headerBottom === null ? "surface top" : "header bottom";

      await test.step("no sideways scrolling", () => {
        expect
          .soft(
            scrollWidth,
            `no sideways scrolling: page width ${scrollWidth} vs screen ${clientWidth}`,
          )
          .toBeLessThanOrEqual(clientWidth + TOLERANCE);
      });

      await test.step("the pitch is whole", () => {
        expect
          .soft(
            pitch.left,
            `the pitch is whole: pitch left ${pitch.left} vs screen left 0`,
          )
          .toBeGreaterThanOrEqual(-TOLERANCE);
        expect
          .soft(
            pitch.right,
            `the pitch is whole: pitch right ${pitch.right} vs page width ${clientWidth}`,
          )
          .toBeLessThanOrEqual(clientWidth + TOLERANCE);
        expect
          .soft(
            pitch.top,
            `the pitch is whole: pitch top ${pitch.top} vs ${pitchTopLimitName} ${pitchTopLimit}`,
          )
          .toBeGreaterThanOrEqual(pitchTopLimit - TOLERANCE);
        expect
          .soft(
            pitch.bottom,
            `the pitch is whole: pitch bottom ${pitch.bottom} vs surface bottom ${band.bottom}`,
          )
          .toBeLessThanOrEqual(band.bottom + TOLERANCE);
      });

      await test.step("the pitch doesn't touch the card", () => {
        expect
          .soft(
            pitch.bottom,
            `the pitch doesn't touch the card: pitch bottom ${pitch.bottom} vs card top ${cardTop}`,
          )
          .toBeLessThan(cardTop - TOLERANCE);
      });

      const half = viewport.height / 2;
      if (endsAtHalf) {
        await test.step("the surface ends at half the screen", () => {
          expect
            .soft(
              Math.abs(band.bottom - half),
              `the surface ends at half the screen: surface bottom ${band.bottom} vs half the screen ${half}`,
            )
            .toBeLessThanOrEqual(TOLERANCE);
        });
      } else {
        await test.step("the surface grows past half the screen", () => {
          expect
            .soft(
              band.bottom,
              `the surface grows past half the screen: surface bottom ${band.bottom} vs half the screen ${half}`,
            )
            .toBeGreaterThan(half + TOLERANCE);
        });
      }
    });
  }
}

for (const entry of pages) testLayout(entry);

test.describe("logged out", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  testLayout(loginPage);
});
