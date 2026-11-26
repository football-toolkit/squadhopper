import { setTimeout as sleep } from "node:timers/promises";
import { connection } from "next/server";
import { APP_NAME } from "@/lib/app-name";
import { countMatchRows } from "./count-match-rows";

// A temporary test for #72, never merged: can a Vercel function download the
// tournament sites' pages? The response and the logs never show an address.

const TIMEOUT_MS = 10_000;
const PAUSE_MS = 1_000;
const NO_STORE = { "Cache-Control": "private, no-store" };

const HONEST_HEADERS = {
  "User-Agent": `${APP_NAME} (personal schedule sync)`,
};

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/159.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-GB,en;q=0.9",
};

type FailureStatus = "timeout" | "redirect loop" | "network error";

type FetchSummary = {
  status: number | FailureStatus;
  ms: number;
  bytes: number | null;
  redirected: boolean | null;
  matchRows: number | null;
};

// The error can name the address, so only its kind is reported.
function failureStatus(error: unknown): FailureStatus {
  if (!(error instanceof Error)) return "network error";
  if (error.name === "TimeoutError") return "timeout";
  // Node's fetch gives up after 20 redirects. A challenge page can loop.
  const cause = error.cause;
  return cause instanceof Error && cause.message === "redirect count exceeded"
    ? "redirect loop"
    : "network error";
}

async function fetchSummary(
  url: string,
  headers: HeadersInit,
): Promise<FetchSummary> {
  const start = performance.now();
  const elapsed = () => Math.round(performance.now() - start);

  let response: Response;
  let body: ArrayBuffer;
  let ms: number;
  try {
    response = await fetch(url, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    body = await response.arrayBuffer();
    ms = elapsed();
  } catch (error) {
    return {
      status: failureStatus(error),
      ms: elapsed(),
      bytes: null,
      redirected: null,
      matchRows: null,
    };
  }

  return {
    status: response.status,
    ms,
    bytes: body.byteLength,
    redirected: response.redirected,
    matchRows: countMatchRows(new TextDecoder().decode(body)),
  };
}

export async function GET(): Promise<Response> {
  // Without this, Next.js could run the route once, at build time.
  await connection();

  const urls = (process.env.SPIKE_TEAM_URLS ?? "")
    // Also on whitespace: fetch drops a line break inside an address, so two
    // addresses pasted on two lines would become one.
    .split(/[\s,]+/)
    .filter((url) => url !== "");
  if (urls.length === 0) {
    return Response.json(
      { error: "SPIKE_TEAM_URLS is not set" },
      { status: 500, headers: NO_STORE },
    );
  }

  const ranAt = new Date().toISOString();
  const pages = [];
  for (const [index, url] of urls.entries()) {
    if (index > 0) await sleep(PAUSE_MS);
    const honest = await fetchSummary(url, HONEST_HEADERS);
    await sleep(PAUSE_MS);
    const browser = await fetchSummary(url, BROWSER_HEADERS);
    pages.push({ page: index + 1, honest, browser });
  }

  return Response.json(
    { region: process.env.VERCEL_REGION ?? null, ranAt, pages },
    { headers: NO_STORE },
  );
}
