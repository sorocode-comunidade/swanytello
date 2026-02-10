import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    setupFiles: ["./tests/setup.ts"],
    // Run test files one at a time so DB tests (open_position, tag_analisys) don't step on each other
    fileParallelism: false,
  },
});
