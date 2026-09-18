import { test, expect } from "@playwright/test";
import {
  API_URL, freshCoachToken, signInAs, seedClient, getToken, uniqueName,
} from "./helpers/api";

/**
 * The client-detail cards that were visual slots with no data: Training,
 * Updates and Notes — plus the Limitations date, which used to show the
 * client's join date as though it were when the injury was recorded.
 */
test.describe("client detail · cards", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  async function post(page: import("@playwright/test").Page, path: string, data: unknown) {
    const token = await getToken(page);
    const res = await page.request.post(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` }, data,
    });
    if (!res.ok()) throw new Error(`POST ${path} failed: ${res.status()} ${await res.text()}`);
    return (await res.json()).data;
  }

  async function freshClient(page: import("@playwright/test").Page, name?: string) {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
    return await seedClient(page, name ?? uniqueName("E2E Card Client")) as
      { id: string; name: string };
  }

  test("Notes can be added, edited and deleted", async ({ page }) => {
    const client = await freshClient(page);
    await page.goto(`/clients/${client.id}`);

    await expect(page.getByText("No notes yet.")).toBeVisible();

    await page.getByRole("button", { name: "Add note" }).click();
    await page.getByLabel("Note text").fill("Prefers morning sessions");
    await page.getByRole("button", { name: "Save note" }).click();

    await expect(page.getByText("Note added")).toBeVisible();
    await expect(page.getByText("Prefers morning sessions")).toBeVisible();
    await expect(page.getByText("No notes yet.")).toHaveCount(0);

    await page.getByRole("button", { name: /^Edit note from/ }).click();
    await page.getByLabel("Note text").fill("Prefers evenings now");
    await page.getByRole("button", { name: "Save note" }).click();
    await expect(page.getByText("Note updated")).toBeVisible();
    await expect(page.getByText("Prefers evenings now")).toBeVisible();

    // It really persisted, rather than only living in component state.
    await page.reload();
    await expect(page.getByText("Prefers evenings now")).toBeVisible();

    await page.getByRole("button", { name: /^Delete note from/ }).click();
    await expect(page.getByText("Note deleted")).toBeVisible();
    await expect(page.getByText("No notes yet.")).toBeVisible();
  });

  test("Updates lists real activity and can be filtered", async ({ page }) => {
    const client = await freshClient(page);
    await post(page, `/api/v1/clients/${client.id}/progress`, {
      loggedDate: "2026-09-15", weightKg: 72.5,
    });

    await page.goto(`/clients/${client.id}`);

    // Joining is always an event, so the feed is never empty for a real client.
    await expect(page.getByText(/Joined as/)).toBeVisible();
    // numeric(5,2) would render "72.50" without formatting.
    await expect(page.getByText("Logged weight 72.5 kg")).toBeVisible();

    await page.getByRole("button", { name: "Filter updates" }).click();
    await page.getByRole("menuitem", { name: "Progress" }).click();

    await expect(page.getByText("Logged weight 72.5 kg")).toBeVisible();
    await expect(page.getByText(/Joined as/)).toHaveCount(0);

    await page.getByRole("button", { name: "Filter updates" }).click();
    await page.getByRole("menuitem", { name: "Messages" }).click();
    await expect(page.getByText("No messages yet.")).toBeVisible();
  });

  test("Training shows planned counts from an assigned program", async ({ page }) => {
    const client = await freshClient(page);
    const workout = await post(page, "/api/v1/library/workouts", {
      name: uniqueName("E2E Stat Workout"), description: null, tags: [],
    });
    const program = await post(page, "/api/v1/library/programs", {
      name: uniqueName("E2E Stat Program"), weeks: 1, description: null,
    });
    const token = await getToken(page);
    for (const day of [1, 2]) {
      const res = await page.request.put(
        `${API_URL}/api/v1/library/programs/${program.id}/days/${day}`,
        { headers: { Authorization: `Bearer ${token}` }, data: { workoutId: workout.id, notes: null } });
      if (!res.ok()) throw new Error(`day ${day} failed: ${res.status()}`);
    }
    // Starts today, so days 1 and 2 fall inside the next-week window.
    const today = new Date().toISOString().slice(0, 10);
    await post(page, `/api/v1/library/programs/${program.id}/assignments`, {
      clientIds: [client.id], startDate: today,
    });

    await page.goto(`/clients/${client.id}`);

    await expect(page.getByText("NEXT WEEK")).toBeVisible();
    // Day 1 is today (last-7 window), day 2 is tomorrow (next-week window).
    await expect(page.getByText("Nothing planned")).toHaveCount(0);
  });

  test("Training reads honestly for a client with nothing tracked", async ({ page }) => {
    const client = await freshClient(page);
    await page.goto(`/clients/${client.id}`);

    await expect(page.getByText("LAST 7 DAYS")).toBeVisible();
    await expect(page.getByText("Nothing planned").first()).toBeVisible();
    await expect(page.getByText("none completed yet")).toBeVisible();
  });

  test("Limitations show no invented date", async ({ page }) => {
    const client = await freshClient(page);
    const token = await getToken(page);
    const res = await page.request.put(`${API_URL}/api/v1/clients/${client.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { healthConditions: ["Shoulder impingement"] },
    });
    if (!res.ok()) throw new Error(`update failed: ${res.status()} ${await res.text()}`);

    await page.goto(`/clients/${client.id}`);

    await expect(page.getByText("Shoulder impingement")).toBeVisible();
    // The join date used to be rendered beneath it as if it were the date the
    // injury was recorded. It is not stored, so nothing should appear.
    const card = page.getByText("Limitations / Injuries").locator("xpath=ancestor::div[1]/..");
    await expect(card.getByText(/Joined/)).toHaveCount(0);
  });
});
