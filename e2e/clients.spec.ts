import { test, expect } from "@playwright/test";
import { ClientsPage } from "./pages/ClientsPage";
import { uniquePhone, ensureClientSlot } from "./helpers/api";

// Authenticated via the saved coach storageState (see playwright.config.ts).
test("coach can add a client and find it in the list", async ({ page }) => {
  const clients = new ClientsPage(page);
  const name = `E2E Client ${Date.now()}`;

  // On a shared DB the trial cap (5 clients) may already be full from prior
  // runs — free a slot so this create test can run.
  await page.goto("/dashboard");
  await ensureClientSlot(page);

  await clients.gotoNew();
  await clients.createClient({ name, phone: uniquePhone(), goal: "WEIGHT_LOSS" });

  // New-client page redirects to the client detail page on success.
  await expect(page).toHaveURL(/\/clients\/[0-9a-f-]{36}/);

  // And the client shows up in the list sidebar. Scope to the sidebar row: the
  // detail pane auto-selects a client and renders its name as a heading too, so
  // an unscoped match trips strict mode whenever that happens to be this one.
  await clients.gotoList();
  await clients.search(name);
  await expect(page.getByRole("button", { name: new RegExp(name) })).toBeVisible();
});
