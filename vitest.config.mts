import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      // Next.js points "server-only" at this empty module when it builds
      // server code, and the package isn't installed. Tests run that code too.
      "server-only": "next/dist/compiled/server-only/empty.js",
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Playwright runs the end-to-end specs in e2e/, not Vitest.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
