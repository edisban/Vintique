import path from "node:path";
import { defineConfig } from "vitest/config";

// Tests run against their own database, never the development one.
// The global setup (same process) reads this to reset that database.
process.env.TEST_DATABASE_URL ??= "postgresql://vintique:vintique@localhost:5433/vintique_test";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["./tests/global-setup.ts"],
    setupFiles: ["./tests/setup.ts"],
    env: { DATABASE_URL: process.env.TEST_DATABASE_URL },
    // All test files share one database, so run them one at a time
    fileParallelism: false,
  },
});
