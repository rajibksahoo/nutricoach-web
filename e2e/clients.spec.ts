import { test, expect } from "@playwright/test";
import { ClientsPage } from "./pages/ClientsPage";
import { uniquePhone } from "./helpers/api";

// Authenticated via the saved coach storageState (see playwright.config.ts).
test("coach can add a client and find it in the list", async ({ page }) => {
  const clients = new ClientsPage(page);
  const name = `E2E Client ${Date.now()}`;

  await clients.gotoNew();
  await clients.createClient({ name, phone: uniquePhone(), goal: "WEIGHT_LOSS" });

  // New-client page redirects to the client detail page on success.
  await expect(page).toHaveURL(/\/clients\/[0-9a-f-]{36}/);

  // And the client shows up in the list sidebar.
  await clients.gotoList();
  await clients.search(name);
  await expect(page.getByText(name)).toBeVisible();
});
