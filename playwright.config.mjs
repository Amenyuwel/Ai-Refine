import { defineConfig, devices } from "@playwright/test";

// Build+start instead of dev: a second `next dev` in one directory is refused while another runs
const PORT = 6969;
// Separate from `.next`: rebuilding `.next` under a running server makes its
// chunks 500, so in-flight navigations fail (ChunkLoadError) and tests flake
const DIST_DIR = ".next-e2e";
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    env: { NEXT_DIST_DIR: DIST_DIR },
    // Never test against a server this run did not build: a leftover dev
    // server or another run's server may serve other code or stop mid-run
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
