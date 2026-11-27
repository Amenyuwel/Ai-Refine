import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors "@/*" -> "./app/*" in jsconfig.json
    alias: { "@": path.resolve(import.meta.dirname, "app") },
  },
  test: {
    environment: "node",
    // *.test.mjs files in tests/unit use node:test and run outside Vitest
    include: ["tests/unit/**/*.test.js"],
  },
});
