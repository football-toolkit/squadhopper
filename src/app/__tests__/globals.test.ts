import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const css = readFileSync(join(__dirname, "..", "globals.css"), "utf8");

function token(name: string) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6});`, "i"));
  if (!match) throw new Error(`--${name} is not a six-digit hex color`);
  return [1, 3, 5].map((i) => parseInt(match[1].slice(i, i + 2), 16));
}

// WCAG relative luminance of an sRGB color.
function luminance(rgb: number[]) {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: number[], b: number[]) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// `ring-ring/50` is the ring color at 50% alpha, which the browser
// composites over what's behind it.
function halfOver(color: number[], behind: number[]) {
  return color.map((c, i) => (c + behind[i]) / 2);
}

// WCAG 2.2 SC 1.4.11: a focus indicator needs at least 3:1 against the
// background next to it.
test.each(["background", "surface"])(
  "the focus ring at half strength has at least 3:1 contrast on the %s",
  (name) => {
    const behind = token(name);
    expect(
      contrast(halfOver(token("ring"), behind), behind),
    ).toBeGreaterThanOrEqual(3);
  },
);
