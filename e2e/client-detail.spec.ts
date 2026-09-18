import { test, expect } from "@playwright/test";
import { freshCoachToken, signInAs, seedClient, uniqueName } from "./helpers/api";

/**
 * There used to be two client UIs: the two-pane ClientsScreen at /clients and
 * a separate 604-line detail page at /clients/{id} that nothing navigated to
 * from the list. /clients/{id} now deep-links into the one screen, and the
 * profile editor lives in its Settings tab.
 *
 * Each test uses its own fresh coach: the shared coach's roster is mutated by
 * other specs (`ensureClientSlot` deletes rows), which would race this.
 */
test.describe("client detail", () => {
  test("/clients/{id} deep-links into the two-pane screen with that client selected", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    const first = await seedClient(page, uniqueName("Alpha Client"));
    const target = await seedClient(page, uniqueName("Target Client"));

    await page.goto(`/clients/${target.id}`);

    // The detail header shows the deep-linked client, not merely the first row.
    await expect(page.getByRole("heading", { name: target.name })).toBeVisible();
    await expect(page.getByRole("heading", { name: first.name })).toHaveCount(0);
    // And the surrounding two-pane chrome is present.
    await expect(page.getByText("All Clients")).toBeVisible();
    await expect(page.getByText("Overview", { exact: true })).toBeVisible();
  });

  test("the Settings tab holds the real profile editor, not a placeholder", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    const client = await seedClient(page, uniqueName("Settings Client"));

    await page.goto(`/clients/${client.id}`);
    await page.getByText("Settings", { exact: true }).first().click();

    // Scope to the detail pane: the app sidebar also has a "Profile" link, so
    // an unscoped match either trips strict mode or passes on the wrong node
    // before the Settings panel has rendered.
    const pane = page.getByRole("main");
    await expect(pane.getByText("Profile", { exact: true })).toBeVisible();
    await expect(page.getByText("Delete client")).toBeVisible();
    await expect(page.getByText("coming soon")).toHaveCount(0);

    // Edit mode swaps in the form.
    await page.getByRole("button", { name: /^Edit$/ }).first().click();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });

  test("the retired duplicate routes are gone", async ({ page }) => {
    for (const route of ["/workout-builder", "/library/fitness", "/library/fitness/workouts"]) {
      const res = await page.goto(route);
      expect(res?.status(), `${route} should 404`).toBe(404);
    }
  });
});
