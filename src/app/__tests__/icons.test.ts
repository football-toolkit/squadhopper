import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function readAppFile(name: string) {
  return readFileSync(join(__dirname, "..", name));
}

// A PNG's width and height sit in its first chunk (IHDR), right after the signature.
function pngSize(png: Buffer) {
  expect([...png.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

test("the Apple touch icon is a 180 × 180 PNG", () => {
  expect(pngSize(readAppFile("apple-icon.png"))).toEqual({
    width: 180,
    height: 180,
  });
});

test("the favicon is an ICO holding 16, 32 and 48 px PNG images", () => {
  const ico = readAppFile("favicon.ico");
  expect(ico.readUInt16LE(0)).toBe(0); // reserved
  expect(ico.readUInt16LE(2)).toBe(1); // type 1 is an icon

  const count = ico.readUInt16LE(4);
  const sizes = [];
  for (let i = 0; i < count; i++) {
    const entry = 6 + i * 16;
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    const { width, height } = pngSize(ico.subarray(offset, offset + length));
    expect(ico[entry]).toBe(width);
    expect(ico[entry + 1]).toBe(height);
    sizes.push(width);
  }
  expect(sizes).toEqual([16, 32, 48]);
});
