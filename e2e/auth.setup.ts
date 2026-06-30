import { test as setup, expect } from "@playwright/test";
import path from "path";
import { LoginPage } from "./pages/LoginPage";

const authFile = path.join(__dirname, ".auth/coach.json");

// Stable coach the rest of the suite reuses. Override with E2E_COACH_PHONE.
const COACH_PHONE = process.env.E2E_COACH_PHONE ?? "9100000001";

setup("authenticate as coach", async ({ page }) => {
  const login = new LoginPage(page);
  await login.login(COACH_PHONE);
  await expect(page).toHaveURL(/.*dashboard/);

  // Persist cookies + localStorage (nc_token, nc_coach) for the chromium project.
  await page.context().storageState({ path: authFile });
});
