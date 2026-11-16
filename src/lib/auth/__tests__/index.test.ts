import { afterEach, describe, expect, it, vi } from "vitest";
import { createAuthService } from "../index";
import { TEST_USER } from "../test-user";
import { createMemoryJar } from "./memory-jar";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createAuthService", () => {
  it("uses the mock when APP_ENV is local", async () => {
    const service = createAuthService(
      createMemoryJar(),
      { secure: false },
      { APP_ENV: "local" },
    );
    expect(await service.signIn(TEST_USER.email, TEST_USER.password)).toEqual({
      ok: true,
    });
  });

  it("refuses the mock when VERCEL_ENV is production", () => {
    expect(() =>
      createAuthService(
        createMemoryJar(),
        { secure: true },
        { APP_ENV: "preview", VERCEL_ENV: "production" },
      ),
    ).toThrow(/production/);
  });

  it.each([{ APP_ENV: "production" }, {}])(
    "uses Supabase for %j",
    async (env) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const service = createAuthService(
        createMemoryJar(),
        { secure: false },
        env,
      );
      expect(await service.signIn(TEST_USER.email, TEST_USER.password)).toEqual(
        { ok: false, code: "unavailable" },
      );
    },
  );
});
