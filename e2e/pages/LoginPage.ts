import { Page } from "@playwright/test";

/**
 * Coach login flow: `/login` (enter phone → send OTP) then `/otp`
 * (enter 6-digit code → verify → redirect to `/dashboard`).
 */
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  /** Fill the phone field and request an OTP; waits for the /otp screen. */
  async requestOtp(phone: string) {
    await this.page.locator("#phone").fill(phone);
    await this.page.getByRole("button", { name: "Send OTP" }).click();
    await this.page.waitForURL("**/otp**");
  }

  /** Type the code into the 6 single-digit boxes (focus auto-advances). */
  async enterOtp(code: string) {
    const boxes = this.page.locator('form input[type="tel"]');
    await boxes.first().click();
    await this.page.keyboard.type(code);
  }

  async submitOtp() {
    await this.page.getByRole("button", { name: "Verify OTP" }).click();
  }

  /** Full happy-path login. Defaults to the dev-mode bypass OTP. */
  async login(phone: string, code = "111111") {
    await this.goto();
    await this.requestOtp(phone);
    await this.enterOtp(code);
    await this.submitOtp();
    await this.page.waitForURL("**/dashboard");
  }
}
