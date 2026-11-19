import type { createServerClient } from "@supabase/ssr";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sessionCookieOptions } from "../cookie-options";
import { createSupabaseAuthService, mapSignInError } from "../supabase";
import { createMemoryJar } from "./memory-jar";

type Auth = {
  signInWithPassword: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  getClaims: ReturnType<typeof vi.fn>;
};

function setup(overrides: Partial<Auth> = {}) {
  const auth: Auth = {
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getClaims: vi
      .fn()
      .mockResolvedValue({ data: { claims: { sub: "x" } }, error: null }),
    ...overrides,
  };
  const createClient = vi.fn(() => ({ auth }));
  const jar = createMemoryJar();
  const service = createSupabaseAuthService(jar, {
    url: "https://example.supabase.test",
    publishableKey: "publishable",
    secure: true,
    createClient: createClient as unknown as typeof createServerClient,
  });
  return { auth, createClient, jar, service };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("mapSignInError", () => {
  it.each([
    "invalid_credentials",
    "validation_failed",
    "email_address_invalid",
  ])("maps %s to invalid_credentials", (code) => {
    expect(mapSignInError({ code })).toBe("invalid_credentials");
  });

  it.each([
    { code: "over_request_rate_limit" },
    { name: "AuthRetryableFetchError" },
    { code: "bad_json" },
    { code: "user_banned" },
    { code: "email_not_confirmed" },
    {},
  ])("maps %j to unavailable", (error) => {
    expect(mapSignInError(error)).toBe("unavailable");
  });
});

describe("createSupabaseAuthService", () => {
  it("creates the client with the url, key and session cookie options", () => {
    const { createClient } = setup();
    expect(createClient).toHaveBeenCalledTimes(1);
    const [url, key, options] = createClient.mock.calls[0] as unknown as [
      string,
      string,
      { cookieOptions: unknown },
    ];
    expect(url).toBe("https://example.supabase.test");
    expect(key).toBe("publishable");
    expect(options.cookieOptions).toEqual(sessionCookieOptions(true));
  });

  it("passes the jar's cookies and writes through to the jar", () => {
    const { createClient, jar } = setup();
    const setAllSpy = vi.spyOn(jar, "setAll");
    jar.setAll([{ name: "a", value: "1", options: {} }]);
    setAllSpy.mockClear();
    const [, , options] = createClient.mock.calls[0] as unknown as [
      string,
      string,
      {
        cookies: {
          getAll: () => unknown;
          setAll: (c: unknown, h: unknown) => void;
        };
      },
    ];
    expect(options.cookies.getAll()).toEqual([{ name: "a", value: "1" }]);
    const cookies = [
      { name: "sb", value: "v", options: { sameSite: "lax" as const } },
    ];
    const headers = { "Cache-Control": "no-store" };
    options.cookies.setAll(cookies, headers);
    expect(setAllSpy).toHaveBeenCalledWith(cookies, headers);
  });

  describe("signIn", () => {
    it("returns ok on success", async () => {
      const { auth, service } = setup();
      expect(await service.signIn("a@b.test", "pw")).toEqual({ ok: true });
      expect(auth.signInWithPassword).toHaveBeenCalledWith({
        email: "a@b.test",
        password: "pw",
      });
    });

    it("returns a code and never the error's message", async () => {
      const { service } = setup({
        signInWithPassword: vi.fn().mockResolvedValue({
          error: { code: "invalid_credentials", message: "secret text" },
        }),
      });
      const result = await service.signIn("a@b.test", "pw");
      expect(result).toEqual({ ok: false, code: "invalid_credentials" });
      expect(JSON.stringify(result)).not.toContain("message");
    });

    it("doesn't log wrong credentials", async () => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      const { service } = setup({
        signInWithPassword: vi.fn().mockResolvedValue({
          error: { code: "invalid_credentials", status: 400 },
        }),
      });
      await service.signIn("a@b.test", "pw");
      expect(log).not.toHaveBeenCalled();
    });

    it("logs an unexpected error with its code and status only", async () => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      const { service } = setup({
        signInWithPassword: vi.fn().mockResolvedValue({
          error: {
            code: "unexpected_failure",
            status: 500,
            name: "AuthApiError",
            message: "secret text about player@example.test",
          },
        }),
      });
      await service.signIn("player@example.test", "kickoff-secret");
      expect(log).toHaveBeenCalledTimes(1);
      const logged = JSON.stringify(log.mock.calls[0]);
      expect(log.mock.calls[0][1]).toEqual({
        code: "unexpected_failure",
        status: 500,
      });
      for (const text of ["player@example.test", "kickoff-secret", "secret"]) {
        expect(logged).not.toContain(text);
      }
    });

    it("logs a thrown error with its code and status only", async () => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      const thrown = Object.assign(new Error("fetch failed for a@b.test"), {
        name: "AuthRetryableFetchError",
        status: 0,
      });
      const { service } = setup({
        signInWithPassword: vi.fn().mockRejectedValue(thrown),
      });
      expect(await service.signIn("a@b.test", "pw")).toEqual({
        ok: false,
        code: "unavailable",
      });
      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][1]).toEqual({ status: 0 });
      expect(JSON.stringify(log.mock.calls[0])).not.toContain("a@b.test");
    });
  });

  describe("signOut", () => {
    it("signs out locally", async () => {
      const { auth, service } = setup();
      await service.signOut();
      expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    });

    it("resolves when sign-out returns an error", async () => {
      const { service } = setup({
        signOut: vi.fn().mockResolvedValue({ error: { message: "x" } }),
      });
      await expect(service.signOut()).resolves.toBeUndefined();
    });

    it("resolves when sign-out throws", async () => {
      const { service } = setup({
        signOut: vi.fn().mockRejectedValue(new Error("network")),
      });
      await expect(service.signOut()).resolves.toBeUndefined();
    });
  });

  describe("hasSession", () => {
    it("is true when there are claims", async () => {
      const { service } = setup();
      expect(await service.hasSession()).toBe(true);
    });

    it("is false on an error", async () => {
      const { service } = setup({
        getClaims: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: "x" } }),
      });
      expect(await service.hasSession()).toBe(false);
    });

    it("is false when data is null", async () => {
      const { service } = setup({
        getClaims: vi.fn().mockResolvedValue({ data: null, error: null }),
      });
      expect(await service.hasSession()).toBe(false);
    });

    it("is false when getClaims throws", async () => {
      const { service } = setup({
        getClaims: vi.fn().mockRejectedValue(new Error("boom")),
      });
      expect(await service.hasSession()).toBe(false);
    });
  });

  describe.each([
    ["SUPABASE_URL", undefined, "publishable"],
    ["SUPABASE_PUBLISHABLE_KEY", "https://example.supabase.test", undefined],
  ])("with %s missing", (name, url, publishableKey) => {
    // The missing-variable error is logged once per server process, so each
    // test loads a fresh copy of the module.
    async function freshCreate() {
      vi.resetModules();
      return (await import("../supabase")).createSupabaseAuthService;
    }

    it("is unavailable, names the variable and creates no client", async () => {
      const createSupabaseAuthService = await freshCreate();
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const createClient = vi.fn();
      const service = createSupabaseAuthService(createMemoryJar(), {
        url,
        publishableKey,
        secure: false,
        createClient: createClient as unknown as typeof createServerClient,
      });

      expect(await service.hasSession()).toBe(false);
      expect(await service.signIn("a@b.test", "pw")).toEqual({
        ok: false,
        code: "unavailable",
      });
      await expect(service.signOut()).resolves.toBeUndefined();
      expect(createClient).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledTimes(1);
      expect(String(error.mock.calls[0][0])).toContain(`${name} is not set`);
    });

    it("logs it once, not on every request", async () => {
      const createSupabaseAuthService = await freshCreate();
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      for (let request = 0; request < 3; request++) {
        createSupabaseAuthService(createMemoryJar(), {
          url,
          publishableKey,
          secure: false,
          createClient: vi.fn() as unknown as typeof createServerClient,
        });
      }
      expect(error).toHaveBeenCalledTimes(1);
    });
  });
});
