import { test, expect } from "@playwright/test";
import { ClientsPage } from "./pages/ClientsPage";
import {
  API_URL, freshCoachToken, signInAs, getToken, uniquePhone, uniqueName,
} from "./helpers/api";

/**
 * Adding a client with a full profile.
 *
 * The backend has accepted fourteen fields since the client module was built,
 * but the form collected three — so a coach had to add someone and then
 * immediately edit them. These specs assert the extra fields actually reach the
 * server, not just that the form renders them.
 */
test.describe("add client", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the profile step reaches the server", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    const clients = new ClientsPage(page);
    const name = uniqueName("E2E Full Client");
    const phone = uniquePhone();

    await clients.gotoNew();
    await clients.createClient({
      name, phone, goal: "WEIGHT_LOSS",
      profile: {
        dateOfBirth: "1994-03-12",
        gender: "FEMALE",
        heightCm: "165",
        weightKg: "62.5",
        dietaryPref: "VEG",
        activityLevel: "MODERATE",
        healthConditions: "PCOS, hypothyroidism",
        allergies: "Peanuts",
      },
    });

    await page.waitForURL(/\/clients\/[0-9a-f-]{36}/);

    const token = await getToken(page);
    const id = page.url().split("/").pop();
    const res = await page.request.get(`${API_URL}/api/v1/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const client = (await res.json()).data;

    expect(client.goal).toBe("WEIGHT_LOSS");
    expect(client.dateOfBirth).toBe("1994-03-12");
    expect(client.gender).toBe("FEMALE");
    expect(client.heightCm).toBe(165);
    expect(String(client.weightKg)).toContain("62.5");
    expect(client.dietaryPref).toBe("VEG");
    expect(client.activityLevel).toBe("MODERATE");
    // Comma-separated text becomes the string list the API expects.
    expect(client.healthConditions).toEqual(["PCOS", "hypothyroidism"]);
    expect(client.allergies).toEqual(["Peanuts"]);
  });

  test("the profile step is skippable", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    const clients = new ClientsPage(page);
    const name = uniqueName("E2E Quick Client");

    await clients.gotoNew();
    // No profile: a coach adding someone mid-session should not be blocked on
    // their hip measurement.
    await clients.createClient({ name, phone: uniquePhone() });

    await page.waitForURL(/\/clients\/[0-9a-f-]{36}/);
    const token = await getToken(page);
    const id = page.url().split("/").pop();
    const res = await page.request.get(`${API_URL}/api/v1/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const client = (await res.json()).data;

    expect(client.name).toBe(name);
    expect(client.heightCm).toBeFalsy();
  });

  test("essentials are validated before the profile step", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await new ClientsPage(page).gotoNew();

    await page.locator("#name").fill("No Phone");
    await page.locator("#phone").fill("12345");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Enter a valid 10-digit mobile number")).toBeVisible();
    // Still on step one — the profile fields are not reachable yet.
    await expect(page.locator("#heightCm")).toHaveCount(0);
  });
});
