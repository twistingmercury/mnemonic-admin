import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
    passWithNoTests: true,
    exclude: ["**/node_modules/**", "**/dist/**", "tests/e2e/**"],
  },
});
