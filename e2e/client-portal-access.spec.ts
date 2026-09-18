import { test, expect } from "@playwright/test";
import {
  API_URL, freshCoachToken, signInAs, seedClient, getToken, uniquePhone, uniqueName,
} from "./helpers/api";

/**
 * A client getting into the portal — the launch blocker.
 *
 * Before this, sign-in required a `?coach=<uuid>` link and the only UI that
 * produced one was gated behind dev mode, so in production no real client could
 * reach the portal at all.
 *
 * A phone identifies exactly one coach (enforced in the database by changeset
 * 028), so the number alone is now enough.
 */
test.describe("client portal access", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("a client signs in with their phone alone, no coach link", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
    const phone = uniquePhone();
    const token = await getToken(page);
    const res = await page.request.post(`${API_URL}/api/v1/clients`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: uniqueName("E2E Portal Client"), phone },
    });
    expect(res.ok()).toBe(true);

    // Arrive cold, exactly as a client following a plain link would.
    await page.context().clearCookies();
    await page.goto("/portal/login");

    await expect(page.getByText(/Invalid portal link/)).toHaveCount(0);

    await page.getByPlaceholder("9876543210").fill(phone);
    await page.getByRole("button", { name: "Send OTP" }).click();

    await page.waitForURL("**/portal/otp**");
    // The URL carries no coach id — the server resolves it.
    expect(page.url()).not.toContain("coach=");

    const boxes = page.locator('input[type="tel"][maxlength="1"]');
    await expect(boxes).toHaveCount(6);
    for (let i = 0; i < 6; i++) await boxes.nth(i).fill("1");
    await page.getByRole("button", { name: "Verify OTP" }).click();
    await page.waitForURL("**/portal/home", { timeout: 15_000 });
    await expect(page).toHaveURL(/\/portal\/home/);
  });

  test("a link that still carries a coach id keeps working", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
    const token = await getToken(page);
    const me = await page.request.get(`${API_URL}/api/v1/coach/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const coachId = (await me.json()).data.id;
    const phone = uniquePhone();
    await page.request.post(`${API_URL}/api/v1/clients`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: uniqueName("E2E Legacy Link"), phone },
    });

    // The web portal and Android both still send coachId; that must not break.
    await page.goto(`/portal/login?coach=${coachId}&phone=${phone}`);
    await page.getByRole("button", { name: "Send OTP" }).click();
    await page.waitForURL("**/portal/otp**");
    expect(page.url()).toContain("coach=");
  });

  test("the coach can see and copy the client's portal link", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
    const client = await seedClient(page, uniqueName("E2E Access Client"));

    await page.goto(`/clients/${client.id}`);
    await page.getByText("Settings", { exact: true }).first().click();

    // This card is the whole point: it is not behind a dev flag.
    await expect(page.getByText("Client access")).toBeVisible();
    await expect(page.getByText(/\/portal\/login/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy portal link" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Send on WhatsApp/ })).toBeVisible();
  });

  test("sending the invite reports success", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
    const client = await seedClient(page, uniqueName("E2E Invite Client"));

    await page.goto(`/clients/${client.id}`);
    await page.getByText("Settings", { exact: true }).first().click();
    await page.getByRole("button", { name: /Send on WhatsApp/ }).click();

    // WatiService skips the real API locally, but the endpoint, the
    // notification log write and the coach's feedback are all real.
    await expect(page.getByText(/Sent to .* on WhatsApp/)).toBeVisible({ timeout: 15_000 });
  });
});
