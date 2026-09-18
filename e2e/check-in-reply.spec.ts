import { test, expect } from "@playwright/test";
import {
  API_URL, freshCoachToken, signInAs, seedClient, getToken, uniqueName,
} from "./helpers/api";

/**
 * Replying to a check-in.
 *
 * A client can file a check-in from their portal, but `coachNotes` was only
 * settable when the *coach* created one — so a client-submitted check-in was a
 * message into a void. The portal has always rendered the reply; there was no
 * way to write one.
 */
test.describe("check-in replies", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  async function seedCheckIn(page: import("@playwright/test").Page, clientId: string) {
    const token = await getToken(page);
    const headers = { Authorization: `Bearer ${token}` };

    const plan = await page.request.post(`${API_URL}/api/v1/clients/${clientId}/meal-plans`, {
      headers, data: { name: uniqueName("E2E Plan"), description: null },
    });
    const planId = (await plan.json()).data.id;

    const res = await page.request.post(`${API_URL}/api/v1/clients/${clientId}/check-ins`, {
      headers,
      data: {
        mealPlanId: planId,
        checkInDate: new Date().toISOString().slice(0, 10),
        adherencePercent: 80,
        clientNotes: "Struggled with dinners this week",
      },
    });
    if (!res.ok()) throw new Error(`seed check-in failed: ${res.status()} ${await res.text()}`);
    return (await res.json()).data;
  }

  test("a coach can reply, and the reply persists", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
    const client = await seedClient(page, uniqueName("E2E Reply Client"));
    await seedCheckIn(page, client.id);

    await page.goto("/progress");
    await page.getByText(client.name).first().click();
    await page.getByRole("button", { name: "Check-ins" }).click();

    // What the client wrote is visible — the page used to read a `notes` field
    // the API never returns, so this never rendered.
    await expect(page.getByText("Struggled with dinners this week")).toBeVisible();

    await page.getByRole("button", { name: "Reply to this check-in" }).click();
    await page.getByLabel("Reply to this check-in").fill("Let's plan dinners on Sunday.");
    await page.getByRole("button", { name: "Save reply" }).click();

    await expect(page.getByText("Reply saved")).toBeVisible();
    await expect(page.getByText("Let's plan dinners on Sunday.")).toBeVisible();

    await page.reload();
    await page.getByText(client.name).first().click();
    await page.getByRole("button", { name: "Check-ins" }).click();
    await expect(page.getByText("Let's plan dinners on Sunday.")).toBeVisible();
  });

  test("a removed check-in leaves the history", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
    const client = await seedClient(page, uniqueName("E2E Remove Client"));
    await seedCheckIn(page, client.id);

    await page.goto("/progress");
    await page.getByText(client.name).first().click();
    await page.getByRole("button", { name: "Check-ins" }).click();
    await expect(page.getByText("Struggled with dinners this week")).toBeVisible();

    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /^Remove check-in from/ }).click();

    await expect(page.getByText("Check-in removed")).toBeVisible();
    await expect(page.getByText(/No check-ins yet/)).toBeVisible();
  });
});
