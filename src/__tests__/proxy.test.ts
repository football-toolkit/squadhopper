// @vitest-environment node
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthService } from "@/lib/auth";
import { sessionCookieOptions } from "@/lib/auth/cookie-options";
import type { CookieJar } from "@/lib/auth/types";
import { config, proxy, routeFor } from "../proxy";

vi.mock("@/lib/auth");

const NO_STORE = "private, no-store";
let signedIn = false;

function fakeService(jar: CookieJar) {
  return {
    hasSession: async () => {
      jar.setAll(
        [
          {
            name: "sb-test-auth-token",
            value: "fresh",
            options: sessionCookieOptions(false),
          },
        ],
        {
          "Cache-Control":
            "private, no-cache, no-store, must-revalidate, max-age=0",
        },
      );
      return signedIn;
    },
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
}

beforeEach(() => {
  vi.mocked(createAuthService).mockReset();
  vi.mocked(createAuthService).mockImplementation((jar) => fakeService(jar));
});

describe("routeFor", () => {
  it.each([
    ["/", false, "/login"],
    ["/does-not-exist", false, "/login"],
    ["/login", false, null],
    ["/login", true, "/"],
    ["/", true, null],
    ["/does-not-exist", true, null],
  ] as const)("%s, signedIn %s -> %s", (pathname, isIn, expected) => {
    expect(routeFor({ pathname, signedIn: isIn })).toBe(expected);
  });
});

describe("config.matcher", () => {
  it.each([
    "/",
    "/login",
    "/does-not-exist",
    "/a/b/c",
    "/icon.svgx",
    "/favicon.ico/x",
    "/apple-icon.png/secret",
    "/_next/staticfoo",
    "/_next/static",
    "/_next/image/x",
    "/_next/image/",
    "/_next/imagex",
  ])("runs on %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
  });

  it.each([
    "/_next/static/chunks/app.js",
    "/_next/static/media/inter.woff2",
    "/_next/image?url=x",
    "/favicon.ico",
    "/icon.svg",
    "/apple-icon.png",
  ])("skips %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
  });
});

describe("proxy", () => {
  it("redirects a signed-out visitor on / to /login", async () => {
    signedIn = false;
    const res = await proxy(new NextRequest("http://localhost/"));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
    expect(res.headers.get("cache-control")).toBe(NO_STORE);
    expect(res.cookies.get("sb-test-auth-token")?.value).toBe("fresh");
    expect(res.cookies.get("sb-test-auth-token")?.httpOnly).toBe(true);
  });

  it("redirects a signed-in visitor on /login to /", async () => {
    signedIn = true;
    const res = await proxy(new NextRequest("http://localhost/login"));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/");
    expect(res.headers.get("cache-control")).toBe(NO_STORE);
    expect(res.cookies.get("sb-test-auth-token")?.value).toBe("fresh");
    expect(res.cookies.get("sb-test-auth-token")?.httpOnly).toBe(true);
  });

  it("lets a signed-in visitor on / through", async () => {
    signedIn = true;
    const res = await proxy(new NextRequest("http://localhost/"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(res.headers.get("cache-control")).toBe(NO_STORE);
    expect(res.cookies.get("sb-test-auth-token")?.value).toBe("fresh");
    expect(res.cookies.get("sb-test-auth-token")?.httpOnly).toBe(true);
  });

  // The page renders in the same request, so it must see the refreshed
  // session too, not the one the browser sent.
  it("passes refreshed cookies on to the request the page renders", async () => {
    signedIn = true;
    const res = await proxy(
      new NextRequest("http://localhost/", {
        headers: { cookie: "sb-test-auth-token=stale; theme=dark" },
      }),
    );
    expect(res.headers.get("x-middleware-override-headers")).toContain(
      "cookie",
    );
    const passedOn = res.headers.get("x-middleware-request-cookie") ?? "";
    expect(passedOn).toContain("sb-test-auth-token=fresh");
    expect(passedOn).not.toContain("stale");
    expect(passedOn).toContain("theme=dark");
  });

  it("asks for secure cookies only over https", async () => {
    signedIn = true;
    await proxy(new NextRequest("https://localhost/"));
    await proxy(new NextRequest("http://localhost/"));
    const calls = vi.mocked(createAuthService).mock.calls;
    expect(calls[0][1]).toEqual({ secure: true });
    expect(calls[1][1]).toEqual({ secure: false });
  });

  it("also asks for secure cookies when a proxy forwarded https", async () => {
    signedIn = true;
    await proxy(
      new NextRequest("http://localhost/", {
        headers: { "x-forwarded-proto": "https" },
      }),
    );
    const calls = vi.mocked(createAuthService).mock.calls;
    expect(calls[0][1]).toEqual({ secure: true });
  });
});
