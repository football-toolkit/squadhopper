import { load } from "cheerio";

// On the sites' pages, "row match" is an element inside the link, not the
// link itself.
export function countMatchRows(html: string): number {
  const $ = load(html);
  return $('a[href*="/match/"]').filter(
    (_, link) => $(link).find(".row.match").length > 0,
  ).length;
}
