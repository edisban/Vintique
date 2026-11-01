import { execSync } from "node:child_process";

// Runs once before all tests: recreate the test database from the migrations.
export default function setup() {
  const url = process.env.TEST_DATABASE_URL!; // set in vitest.config.mts
  const dbName = new URL(url).pathname.slice(1);
  if (!dbName.includes("test")) {
    throw new Error(`Refusing to reset "${dbName}": the test database name must contain "test"`);
  }
  execSync("npx prisma migrate reset --force --skip-seed --skip-generate", {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "ignore",
  });
}
