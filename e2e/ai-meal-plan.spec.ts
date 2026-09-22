import { test, expect } from "@playwright/test";
import {
  API_URL, freshCoachToken, signInAs, seedClient, getToken, uniqueName,
} from "./helpers/api";

/**
 * AI meal-plan generation, driven through the coach UI.
 *
 * The local backend runs with an `openai.api-key` starting with "local-", so
 * this exercises the real job → poll → persist → render path against a stub
 * response without spending tokens.
 *
 * Generation used to save only the plan name and drop the days, so the coach
 * was promised a 7-day plan and landed on an empty one. Every assertion below
 * is about the plan having contents; asserting the success toast alone is what
 * let that ship.
 */
test.describe("AI meal plan generation", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("generating produces a plan with days, meals and items", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
    const client = await seedClient(page, uniqueName("E2E AI Client"));

    await page.goto("/meal-plans");
    await page.getByText(client.name).first().click();

    await page.getByRole("button", { name: /AI Generate/i }).click();
    await page.getByRole("button", { name: /Generate Meal Plan/i }).click();

    // The toast reports what was produced rather than a bare success.
    await expect(page.getByText(/Generated \d+ days?, \d+ meals?/)).toBeVisible({ timeout: 30_000 });

    // Landing in the builder is not enough — it has to hold the generated plan.
    await page.waitForURL("**/meal-plans/*");
    const token = await getToken(page);
    const planId = page.url().split("/").pop();
    const res = await page.request.get(`${API_URL}/api/v1/meal-plans/${planId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const plan = (await res.json()).data as {
      aiGenerated: boolean;
      days: { meals: { items: unknown[] }[]; totalCalories: number }[];
    };

    expect(plan.aiGenerated).toBe(true);
    expect(plan.days.length).toBeGreaterThan(0);
    const items = plan.days.flatMap((d) => d.meals.flatMap((m) => m.items));
    expect(items.length).toBeGreaterThan(0);
    // Day totals are recalculated from the persisted items.
    expect(plan.days.every((d) => d.totalCalories > 0)).toBe(true);
  });

  test("items the food library does not hold are flagged for the coach", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
    const client = await seedClient(page, uniqueName("E2E AI Flag Client"));

    await page.goto("/meal-plans");
    await page.getByText(client.name).first().click();
    await page.getByRole("button", { name: /AI Generate/i }).click();
    await page.getByRole("button", { name: /Generate Meal Plan/i }).click();
    await page.waitForURL("**/meal-plans/*", { timeout: 30_000 });

    // The stub names foods outside the curated list on purpose; those carry the
    // model's own macros, so the coach is told which numbers to check.
    await expect(page.getByText("unverified").first()).toBeVisible({ timeout: 15_000 });
  });

  /**
   * The paid-tier gate. A Starter coach cannot be minted through the UI —
   * billing state only moves via Razorpay — so this stubs the 402 that
   * `SubscriptionGate.requireAiMealPlans` returns and checks the modal turns
   * into an upgrade prompt instead of a red error. The rule itself is pinned
   * server-side in `AiJobIntegrationTest`.
   */
  test("a 402 turns the modal into an upgrade prompt", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
    const client = await seedClient(page, uniqueName("E2E AI Locked"));

    await page.route("**/api/v1/ai/meal-plans/generate", (route) =>
      route.fulfill({
        status: 402,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "AI meal plan generation is available on the Professional plan and above.",
        }),
      }),
    );

    await page.goto("/meal-plans");
    await page.getByText(client.name).first().click();
    await page.getByRole("button", { name: /AI Generate/i }).click();
    await page.getByRole("button", { name: /Generate Meal Plan/i }).click();

    await expect(page.getByText(/part of the\s+Professional\s+plan/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Upgrade to Professional/i })).toBeVisible();
  });
});
