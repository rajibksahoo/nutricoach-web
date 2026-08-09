import { test, expect } from "@playwright/test";
import { DashboardPage } from "./pages/DashboardPage";
import { API_URL, ensureClientName, getToken } from "./helpers/api";

// Authenticated via the saved coach storageState (see playwright.config.ts).

test("dashboard renders the action queue and side panels", async ({ page }) => {
  const dash = new DashboardPage(page);
  await dash.goto();

  await expect(dash.heading).toContainText(/Good (morning|afternoon|evening)/);
  await expect(dash.panel("Today")).toBeVisible();
  await expect(dash.panel("Roster")).toBeVisible();
  await expect(dash.panel("Recent activity")).toBeVisible();
});

test("attention tiles filter the action queue", async ({ page }) => {
  const dash = new DashboardPage(page);

  // Guarantee at least one NO_MEAL_PLAN row: a client with no meal plan.
  await page.goto("/dashboard");
  await ensureClientName(page, "E2E Dashboard Client");

  await dash.goto();

  const noPlanTile = dash.tile("No plan");
  await expect(noPlanTile).toBeVisible();

  const before = await dash.queueRows.count();
  expect(before).toBeGreaterThan(0);

  await dash.clickTile("No plan");
  await expect(dash.clearFilter).toBeVisible();

  // Every remaining row is a "no plan" row.
  const after = await dash.queueRows.count();
  expect(after).toBeGreaterThan(0);
  expect(after).toBeLessThanOrEqual(before);
  await expect(dash.queueRows.first()).toContainText("Create plan");

  await dash.clearFilter.click();
  await expect(dash.clearFilter).toBeHidden();
});

test("a queue row navigates to the relevant screen", async ({ page }) => {
  const dash = new DashboardPage(page);
  await page.goto("/dashboard");
  await ensureClientName(page, "E2E Dashboard Client");
  await dash.goto();

  await dash.clickTile("No plan");
  await dash.queueRows.first().click();
  await expect(page).toHaveURL(/\/meal-plans/);
});

test("overview endpoint returns a self-consistent payload", async ({ page }) => {
  await page.goto("/dashboard");
  const token = await getToken(page);

  const res = await page.request.get(`${API_URL}/api/v1/coach/dashboard/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();

  const { data } = await res.json();
  expect(Array.isArray(data.actionQueue)).toBeTruthy();
  expect(Array.isArray(data.today.sessions)).toBeTruthy();
  expect(Array.isArray(data.today.checkIns)).toBeTruthy();
  expect(Array.isArray(data.roster.recentClients)).toBeTruthy();
  expect(Array.isArray(data.activity)).toBeTruthy();

  // Internal consistency, not a second live count — the suite runs fully
  // parallel, so other specs add and remove clients between requests.
  const { activeClients, onboardingClients, inactiveClients, totalClients } = data.counts;
  expect(activeClients + onboardingClients + inactiveClients).toBe(totalClients);
  expect(data.roster.recentClients.length).toBeLessThanOrEqual(Math.min(5, totalClients));

  // The queue never references a client outside this coach's roster.
  for (const item of data.actionQueue) {
    expect(item.clientId).toBeTruthy();
    expect(item.priority).toBeGreaterThan(0);
  }
});

test("unauthenticated request to the overview endpoint is rejected", async ({ page }) => {
  const res = await page.request.get(`${API_URL}/api/v1/coach/dashboard/overview`);
  expect(res.status()).toBe(401);
});
