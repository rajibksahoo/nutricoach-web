import { test, expect } from "@playwright/test";
import { API_URL, freshCoachToken, signInAs, uniquePhone } from "./helpers/api";

/**
 * Phase 4 coverage: the revenue path.
 *  - a new coach gets a setup flow instead of an empty dashboard
 *  - the policy pages Razorpay merchant onboarding requires exist
 *  - billing refuses to create a subscription it cannot collect payment for
 */

test.describe("coach onboarding", () => {
  test("a new coach can complete setup and it persists", async ({ page }) => {
    const token = await freshCoachToken(page);
    await signInAs(page, token);

    await page.goto("/onboarding");

    // Step 1 — identity
    await expect(page.getByRole("heading", { name: "Welcome to NutriCoach" })).toBeVisible();
    await page.getByPlaceholder("Priya Menon").fill("E2E Coach");
    await page.getByPlaceholder("you@example.in").fill("e2e@example.in");
    await page.getByRole("button", { name: /Continue/ }).click();

    // Step 2 — practice, with GSTIN validation
    await expect(page.getByRole("heading", { name: "Your practice" })).toBeVisible();
    await page.getByPlaceholder("Menon Nutrition Studio").fill("E2E Studio");
    await page.getByPlaceholder("29ABCDE1234F1Z5").fill("NOTAGSTIN123456");
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.getByText(/valid 15-character GSTIN/)).toBeVisible();

    await page.getByPlaceholder("29ABCDE1234F1Z5").fill("29ABCDE1234F1Z5");
    await page.getByRole("button", { name: /Continue/ }).click();

    // Step 3 — first client
    await expect(page.getByRole("heading", { name: "Add your first client" })).toBeVisible();
    await page.getByPlaceholder("Arjun Reddy").fill("E2E First Client");
    await page.getByPlaceholder("9876543210").fill(uniquePhone());
    await page.getByRole("button", { name: /Add client/ }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    // The profile fields really landed on the coach record.
    const me = await page.request.get(`${API_URL}/api/v1/coach/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const coach = (await me.json()).data;
    expect(coach.name).toBe("E2E Coach");
    expect(coach.businessName).toBe("E2E Studio");
    expect(coach.gstin).toBe("29ABCDE1234F1Z5");

    // And so did the client.
    const clients = await page.request.get(`${API_URL}/api/v1/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const names = ((await clients.json()).data as { name: string }[]).map((c) => c.name);
    expect(names).toContain("E2E First Client");
  });

  test("every step is skippable", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/onboarding");

    await page.getByRole("button", { name: "Skip" }).click();
    await expect(page.getByRole("heading", { name: "Your practice" })).toBeVisible();

    await page.getByRole("button", { name: "Skip" }).click();
    await expect(page.getByRole("heading", { name: "Add your first client" })).toBeVisible();

    await page.getByRole("button", { name: /I'll do this later/ }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("legal pages", () => {
  const PAGES = [
    { path: "/terms", heading: "Terms of Service" },
    { path: "/privacy", heading: "Privacy Policy" },
    { path: "/refund", heading: "Refund & Cancellation Policy" },
    { path: "/contact", heading: "Contact Us" },
    { path: "/pricing", heading: "Pricing" },
  ];

  for (const { path, heading } of PAGES) {
    test(`${path} is publicly reachable`, async ({ page }) => {
      // No auth state: Razorpay's reviewers must be able to open these.
      await page.context().clearCookies();
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    });
  }

  test("the landing footer links to all five", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.locator("footer a").evaluateAll((as) =>
      as.map((a) => a.getAttribute("href")),
    );
    for (const { path } of PAGES) expect(hrefs).toContain(path);
  });

  test("pricing shows the same prices as the landing page", async ({ page }) => {
    await page.goto("/pricing");
    for (const price of ["₹999", "₹2,499", "₹4,999"]) {
      await expect(page.getByText(price, { exact: false }).first()).toBeVisible();
    }
  });
});

test.describe("billing", () => {
  test("shows real trial state and refuses checkout when Razorpay is unconfigured", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/billing");

    await expect(page.getByText("TRIAL")).toBeVisible();
    await expect(page.getByText("Plus 18% GST, billed monthly").first()).toBeVisible();

    // The local/dev environment has no publishable key. Clicking must fail
    // loudly *before* a subscription is created, not silently.
    await page.getByRole("button", { name: "Subscribe" }).first().click();
    await expect(page.getByText(/aren't configured|could not load|couldn't load/i)).toBeVisible();
  });
});
