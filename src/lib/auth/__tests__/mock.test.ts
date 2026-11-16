import { expect, test } from "vitest";
import { sessionCookieOptions } from "@/lib/auth/cookie-options";
import { createMockAuthService, MOCK_SESSION_COOKIE } from "@/lib/auth/mock";
import { TEST_USER, UNAVAILABLE_EMAIL } from "@/lib/auth/test-user";
import { createMemoryJar } from "./memory-jar";

function setup() {
  const jar = createMemoryJar();
  const auth = createMockAuthService(jar, { appEnv: "local", secure: false });
  return { jar, auth };
}

test("the test user signs in and gets a session cookie", async () => {
  const { jar, auth } = setup();
  expect(await auth.hasSession()).toBe(false);
  expect(await auth.signIn(TEST_USER.email, TEST_USER.password)).toEqual({
    ok: true,
  });
  expect(jar.written).toEqual([
    {
      name: MOCK_SESSION_COOKIE,
      value: expect.any(String),
      options: sessionCookieOptions(false),
    },
  ]);
  expect(await auth.hasSession()).toBe(true);
});

test("the email is matched ignoring case and surrounding spaces", async () => {
  const { auth } = setup();
  expect(await auth.signIn(" PLAYER@Example.com ", TEST_USER.password)).toEqual(
    { ok: true },
  );
});

test("a wrong password is invalid credentials", async () => {
  const { jar, auth } = setup();
  expect(await auth.signIn(TEST_USER.email, "wrong-password-1")).toEqual({
    ok: false,
    code: "invalid_credentials",
  });
  expect(await auth.hasSession()).toBe(false);
  expect(jar.written).toEqual([]);
});

test("the password is compared exactly", async () => {
  const { auth } = setup();
  expect(
    await auth.signIn(TEST_USER.email, TEST_USER.password.toUpperCase()),
  ).toEqual({ ok: false, code: "invalid_credentials" });
});

test("an unknown email is invalid credentials", async () => {
  const { auth } = setup();
  expect(await auth.signIn("nobody@example.com", TEST_USER.password)).toEqual({
    ok: false,
    code: "invalid_credentials",
  });
});

test("the unavailable email is unavailable with any password", async () => {
  const { auth } = setup();
  expect(await auth.signIn(UNAVAILABLE_EMAIL, "anything")).toEqual({
    ok: false,
    code: "unavailable",
  });
  expect(await auth.hasSession()).toBe(false);
});

test("signing out expires the session cookie", async () => {
  const { jar, auth } = setup();
  await auth.signIn(TEST_USER.email, TEST_USER.password);
  await auth.signOut();
  expect(jar.written.at(-1)).toEqual({
    name: MOCK_SESSION_COOKIE,
    value: "",
    options: { ...sessionCookieOptions(false), maxAge: 0 },
  });
  expect(await auth.hasSession()).toBe(false);
});

test("the mock refuses to run in production", () => {
  expect(() =>
    createMockAuthService(createMemoryJar(), {
      appEnv: "production",
      secure: true,
    }),
  ).toThrow(/production/);
});

test("the test user's password is at least 12 characters", () => {
  expect(TEST_USER.password.length).toBeGreaterThanOrEqual(12);
});
