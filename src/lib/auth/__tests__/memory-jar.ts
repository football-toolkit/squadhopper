import type { CookieJar, CookieToSet } from "@/lib/auth/types";

export type MemoryJar = CookieJar & { written: CookieToSet[] };

// A test-only cookie jar. Like a browser, it drops cookies written with maxAge 0.
export function createMemoryJar(): MemoryJar {
  const store = new Map<string, string>();
  const written: CookieToSet[] = [];
  return {
    written,
    getAll: () => [...store].map(([name, value]) => ({ name, value })),
    setAll(cookies) {
      for (const cookie of cookies) {
        written.push(cookie);
        if (cookie.options.maxAge === 0) store.delete(cookie.name);
        else store.set(cookie.name, cookie.value);
      }
    },
  };
}
