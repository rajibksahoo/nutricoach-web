import { test, expect } from "@playwright/test";
import {
  API_URL, freshCoachToken, signInAs, seedClient, seedProgram, seedWorkout,
  getToken, uniqueName,
} from "./helpers/api";

/**
 * The coach-side Training tab on client detail.
 *
 * A coach can attach training three ways — assign a program, assign a workout,
 * or schedule a workout for a date. The tab used to show only the dated
 * schedules, so a coach who assigned a program saw "nothing assigned" while the
 * client's own portal listed the workouts. These specs pin all three sources.
 *
 * Each test mints its own coach so the roster and assignment lists are
 * deterministic rather than whatever the shared E2E coach accumulated.
 */
test.describe("client detail · Training tab", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  async function post(page: import("@playwright/test").Page, path: string, data: unknown) {
    const token = await getToken(page);
    const res = await page.request.post(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      data,
    });
    if (!res.ok()) throw new Error(`POST ${path} failed: ${res.status()} ${await res.text()}`);
    return (await res.json()).data;
  }

  /** Sign in as a brand-new coach and return a client of theirs. */
  async function freshCoachWithClient(page: import("@playwright/test").Page) {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
    const client = await seedClient(page, uniqueName("E2E Training Client"));
    return client as { id: string; name: string };
  }

  async function openTrainingTab(page: import("@playwright/test").Page, clientId: string) {
    await page.goto(`/clients/${clientId}`);
    await page.getByRole("button", { name: "Training", exact: true }).click();
  }

  test("an assigned program appears and can be unassigned", async ({ page }) => {
    const client = await freshCoachWithClient(page);
    const programName = uniqueName("E2E Training Program");
    const program = await seedProgram(page, programName);
    await post(page, `/api/v1/library/programs/${program.id}/assignments`, {
      clientIds: [client.id],
      startDate: "2026-09-12",
    });

    await openTrainingTab(page, client.id);

    await expect(page.getByText("Assigned programs")).toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
    // Name, start date and length all come from the server in one call. The
    // date is rendered in the viewer's locale, so match its parts, not an order.
    await expect(page.getByText(/Starts .*Sep.*12.*2026 · 4 weeks/)).toBeVisible();

    await page.getByRole("button", { name: `Unassign ${programName}` }).click();
    await expect(page.getByText("Program unassigned")).toBeVisible();
    await expect(page.getByText(programName)).toHaveCount(0);

    // It really persisted, rather than only vanishing optimistically.
    await page.reload();
    await page.getByRole("button", { name: "Training", exact: true }).click();
    await expect(page.getByText(programName)).toHaveCount(0);
  });

  test("an assigned workout appears alongside programs", async ({ page }) => {
    const client = await freshCoachWithClient(page);
    const workoutName = uniqueName("E2E Training Workout");
    const workout = await seedWorkout(page, workoutName);
    await post(page, `/api/v1/library/workouts/${workout.id}/assignments`, {
      clientIds: [client.id],
    });

    await openTrainingTab(page, client.id);

    await expect(page.getByText("Assigned workouts")).toBeVisible();
    await expect(page.getByText(workoutName)).toBeVisible();
  });

  test("a scheduled workout shows its name, not a placeholder", async ({ page }) => {
    const client = await freshCoachWithClient(page);
    const workoutName = uniqueName("E2E Scheduled Workout");
    const workout = await seedWorkout(page, workoutName);
    await post(page, `/api/v1/library/workouts/${workout.id}/schedules`, {
      clientId: client.id,
      date: "2026-12-01",
    });

    await openTrainingTab(page, client.id);

    await expect(page.getByText("Scheduled workouts")).toBeVisible();
    // Previously resolved from a session-long cache of every workout; now
    // the schedule row carries workoutName straight from the API.
    await expect(page.getByText(workoutName)).toBeVisible();
    await expect(page.getByText("Workout", { exact: true })).toHaveCount(0);
  });

  test("a client with nothing assigned shows the empty state", async ({ page }) => {
    const client = await freshCoachWithClient(page);

    await openTrainingTab(page, client.id);

    await expect(page.getByText("Nothing assigned yet")).toBeVisible();
    await expect(page.getByText("Assigned programs")).toHaveCount(0);
    await expect(page.getByText("Scheduled workouts")).toHaveCount(0);
  });
});
