import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Without Vitest globals, React Testing Library can't clean up on its own.
afterEach(() => {
  cleanup();
});
