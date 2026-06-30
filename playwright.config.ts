import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Tests run against a real Next.js dev server (auto-started below)
 * talking to the real local Spring Boot backend. Auth uses the dev-mode OTP
 * bypass (`111111`) — see e2e/README or CLAUDE.md for prerequisites.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "html" : [["list"], ["html", { open: "never" }]],
  timeout: 60_000,

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    // Logs in once and saves the coach's auth state for reuse.
    { name: "setup", testMatch: /auth\.setup\.ts/ },

    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/coach.json",
      },
      dependencies: ["setup"],
    },
  ],

  // Auto-start the frontend with dev mode on. Reuses a running dev server
  // locally so you don't have to stop yours.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
      NEXT_PUBLIC_DEV_MODE: "true",
    },
  },
});
