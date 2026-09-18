import { test, expect } from "@playwright/test";
import { ProgramsPage } from "./pages/ProgramsPage";
import {
  API_URL, freshCoachToken, signInAs, getToken, uniqueName,
} from "./helpers/api";

/**
 * P5: per-day notes, the Filter/Tags toolbar, and coach-owned program templates.
 *
 * Each test mints its own coach so the Programs list holds only its own rows and
 * the filter assertions are exact.
 */
test.describe("Programs · P5", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  async function post(page: import("@playwright/test").Page, path: string, data: unknown) {
    const token = await getToken(page);
    const res = await page.request.post(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` }, data,
    });
    if (!res.ok()) throw new Error(`POST ${path} failed: ${res.status()} ${await res.text()}`);
    return (await res.json()).data;
  }

  async function put(page: import("@playwright/test").Page, path: string, data: unknown) {
    const token = await getToken(page);
    const res = await page.request.put(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` }, data,
    });
    if (!res.ok()) throw new Error(`PUT ${path} failed: ${res.status()} ${await res.text()}`);
    return (await res.json()).data;
  }

  async function freshCoach(page: import("@playwright/test").Page) {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
  }

  /** A program with one workout placed on day 1. */
  async function seedProgramWithDay(
    page: import("@playwright/test").Page, name: string, extra: Record<string, unknown> = {},
  ) {
    const workout = await post(page, "/api/v1/library/workouts", {
      name: uniqueName("E2E W"), description: null, tags: [],
    });
    const program = await post(page, "/api/v1/library/programs", {
      name, weeks: 1, description: null, ...extra,
    });
    await put(page, `/api/v1/library/programs/${program.id}/days/1`, {
      workoutId: workout.id, notes: null,
    });
    return program;
  }

  test("a per-day note saves and survives a reload", async ({ page }) => {
    await freshCoach(page);
    const program = await seedProgramWithDay(page, uniqueName("E2E Notes Program"));

    await page.goto(`/library/programs/${program.id}/calendar`);

    await page.getByRole("button", { name: "More options" }).first().click();
    await page.getByRole("menuitem", { name: /Add note/ }).click();

    const dialog = page.getByRole("dialog", { name: /Note for day 1/ });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Note text").fill("Keep RPE 7");
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Note saved")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Has a note").first()).toBeVisible();
    // The menu now offers editing rather than adding.
    await page.getByRole("button", { name: "More options" }).first().click();
    await expect(page.getByRole("menuitem", { name: /Edit note/ })).toBeVisible();
  });

  test("moving a workout keeps its note", async ({ page }) => {
    await freshCoach(page);
    const program = await seedProgramWithDay(page, uniqueName("E2E Note Move"));
    // Set the note through the API so the test exercises the move, not the editor.
    const full = await (await page.request.get(
      `${API_URL}/api/v1/library/programs/${program.id}`,
      { headers: { Authorization: `Bearer ${await getToken(page)}` } })).json();
    const day1 = full.data.days.find((d: { dayNumber: number }) => d.dayNumber === 1);
    await put(page, `/api/v1/library/programs/${program.id}/days/1`, {
      workoutId: day1.workoutId, notes: "Survives the move",
    });

    await page.goto(`/library/programs/${program.id}/calendar`);
    await expect(page.getByLabel("Has a note").first()).toBeVisible();

    // setProgramDay replaces the row, so a move that forgot to resend notes
    // would silently drop this.
    await put(page, `/api/v1/library/programs/${program.id}/days/3`, {
      workoutId: day1.workoutId, notes: "Survives the move",
    });
    await page.reload();
    await expect(page.getByLabel("Has a note")).toHaveCount(2);
  });

  test("Filter narrows the list by modality", async ({ page }) => {
    await freshCoach(page);
    const strength = uniqueName("E2E Strength Prog");
    const cardio = uniqueName("E2E Cardio Prog");
    await post(page, "/api/v1/library/programs", {
      name: strength, weeks: 1, description: null, modality: "Strength & Hypertrophy",
    });
    await post(page, "/api/v1/library/programs", {
      name: cardio, weeks: 1, description: null, modality: "HIIT",
    });

    await new ProgramsPage(page).goto();
    await expect(page.getByText(strength)).toBeVisible();
    await expect(page.getByText(cardio)).toBeVisible();

    await page.getByRole("button", { name: /^Filter/ }).click();
    await page.getByRole("checkbox", { name: "HIIT" }).click();

    await expect(page.getByText(cardio)).toBeVisible();
    await expect(page.getByText(strength)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Filter (1)" })).toBeVisible();
  });

  test("Tags narrows the list by tag", async ({ page }) => {
    await freshCoach(page);
    const tagged = uniqueName("E2E Tagged Prog");
    const untagged = uniqueName("E2E Untagged Prog");
    await post(page, "/api/v1/library/programs", {
      name: tagged, weeks: 1, description: null, tags: ["Beginner"],
    });
    await post(page, "/api/v1/library/programs", {
      name: untagged, weeks: 1, description: null, tags: [],
    });

    await new ProgramsPage(page).goto();
    await page.getByRole("button", { name: /^Tags/ }).click();
    await page.getByRole("checkbox", { name: "Beginner" }).click();

    await expect(page.getByText(tagged)).toBeVisible();
    await expect(page.getByText(untagged)).toHaveCount(0);
  });

  test("a program saved as a template leaves the list and can start a new one", async ({ page }) => {
    await freshCoach(page);
    const templateName = uniqueName("E2E Template Prog");
    await seedProgramWithDay(page, templateName);

    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(page.getByText(templateName)).toBeVisible();

    await page.getByRole("button", { name: "More" }).first().click();
    await page.getByText("Save as template").click();
    await expect(page.getByText("Saved as template")).toBeVisible();

    // Templates live behind the picker, not in the library list.
    await expect(page.getByText(templateName)).toHaveCount(0);

    await page.getByRole("button", { name: "Explore Templates" }).click();
    const dialog = page.getByRole("dialog", { name: "Start from a template" });
    await expect(dialog).toBeVisible();
    await dialog.getByText(templateName).click();

    await dialog.getByLabel("New program name").fill("Arjun — Block 1");
    await dialog.getByRole("button", { name: "Create program" }).click();

    await expect(page.getByText("Program created from template")).toBeVisible();
    // Instantiating drops into the planner for the new program.
    await expect(page).toHaveURL(/\/library\/programs\/[0-9a-f-]+\/calendar/);
  });

  test("the templates picker explains itself when there are none", async ({ page }) => {
    await freshCoach(page);
    await new ProgramsPage(page).goto();

    await page.getByRole("button", { name: "Explore Templates" }).click();
    const dialog = page.getByRole("dialog", { name: "Start from a template" });
    await expect(dialog.getByText("No templates yet")).toBeVisible();
    await expect(dialog.getByText(/Save as template/)).toBeVisible();
  });
});
