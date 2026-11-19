import { expect, test } from "vitest";
import { isSecureRequest } from "@/lib/auth/is-secure-request";

test("a request is secure when the proxy says it came over https", () => {
  const headers = new Headers({ "x-forwarded-proto": "https" });
  expect(isSecureRequest(headers)).toBe(true);
});

test("a request is secure when its URL is https", () => {
  expect(isSecureRequest(new Headers(), new URL("https://localhost/"))).toBe(
    true,
  );
});

test("a plain http request is not secure", () => {
  expect(isSecureRequest(new Headers(), new URL("http://localhost/"))).toBe(
    false,
  );
  expect(isSecureRequest(new Headers())).toBe(false);
});

test("an http forwarded protocol is not secure", () => {
  const headers = new Headers({ "x-forwarded-proto": "http" });
  expect(isSecureRequest(headers, new URL("http://localhost/"))).toBe(false);
});
