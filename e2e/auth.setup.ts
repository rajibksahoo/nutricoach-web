import { test as setup, expect } from "@playwright/test";
import path from "path";
import { API_URL } from "./helpers/api";

const authFile = path.join(__dirname, ".auth/coach.json");

// Stable coach the rest of the suite reuses. Override with E2E_COACH_PHONE.
const COACH_PHONE = process.env.E2E_COACH_PHONE ?? "9100000001";

setup("authenticate as coach", async ({ page, request }) => {
  // Use the backend's dev-only demo-login API (no OTP) so the per-phone OTP
  // rate limit (5 sends/hour) never blocks setup on repeated runs. Requires the
  // backend running with the local profile (dev mode on). The genuine OTP UI is
  // still exercised separately by auth.spec.ts.
  const res = await request.post(`${API_URL}/api/v1/auth/demo-login`, {
    data: { phone: COACH_PHONE, name: "E2E Coach" },
  });
  if (!res.ok()) {
    throw new Error(`demo-login failed: ${res.status()} ${await res.text()}`);
  }
  const { token, coachId, phone, name, subscriptionTier, subscriptionStatus } =
    (await res.json()).data;

  // Write the same localStorage keys the app's saveAuth() sets.
  await page.goto("/login");
  await page.evaluate(
    ({ token, coach }) => {
      localStorage.setItem("nc_token", token);
      localStorage.setItem("nc_coach", JSON.stringify(coach));
    },
    { token, coach: { id: coachId, phone, name, subscriptionTier, subscriptionStatus } },
  );

  // Confirm the session is live, then persist storage state for other specs.
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/.*dashboard/);
  await page.context().storageState({ path: authFile });
});
