import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

// This spec validates the login flow itself, so start unauthenticated
// (ignore the saved coach storageState).
test.use({ storageState: { cookies: [], origins: [] } });

test("coach can log in via OTP", async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.requestOtp("9100000002");
  await login.enterOtp("111111");
  await login.submitOtp();
  await expect(page).toHaveURL(/.*dashboard/);
});

test("invalid OTP is rejected", async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.requestOtp("9100000002");
  await login.enterOtp("000000");
  await login.submitOtp();
  // Backend rejects with e.g. "Incorrect OTP. N attempt(s) remaining."
  await expect(page.getByText(/incorrect otp|invalid otp/i)).toBeVisible();
  await expect(page).toHaveURL(/.*otp/);
});
