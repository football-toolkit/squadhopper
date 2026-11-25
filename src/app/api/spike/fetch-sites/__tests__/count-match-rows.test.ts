// @vitest-environment node
import { expect, test } from "vitest";
import { countMatchRows } from "../count-match-rows";

test("counts a match link that wraps a match row", () => {
  const html = `<a href="/match/1"><div class="row match">A - B</div></a>`;
  expect(countMatchRows(html)).toBe(1);
});

test("doesn't count a match link without a match row in it", () => {
  const html = `<a href="/match/1"><div class="row">A - B</div></a>`;
  expect(countMatchRows(html)).toBe(0);
});

test("doesn't count a match row outside a match link", () => {
  const html = `<div class="row match">A - B</div>
    <a href="/team/1"><div class="row match">A - B</div></a>`;
  expect(countMatchRows(html)).toBe(0);
});

test("counts each link once on a page-shaped document", () => {
  const html = `<!doctype html><html><body>
    <a href="https://site.example.test/match/1"><div class="row match"><div class="row match">A - B</div></div></a>
    <a href="/match/2"><div class="row match">C - D</div></a>
    <a href="/match/3">Details</a>
    <div class="row match">E - F</div>
  </body></html>`;
  expect(countMatchRows(html)).toBe(2);
});
