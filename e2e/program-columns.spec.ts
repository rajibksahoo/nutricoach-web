import { test, expect } from "@playwright/test";
import { ProgramsPage } from "./pages/ProgramsPage";
import {
  API_URL, freshCoachToken, signInAs, getToken, uniqueName,
} from "./helpers/api";

/**
 * The Tags and Equipment columns on the Programs list (P3).
 *
 * Tags are stored on the program; Equipment is derived server-side by walking
 * the program's days into their workouts and down to the exercises. Each test
 * mints its own coach so the single row on screen is unambiguously its own.
 */
test.describe("Programs list · Tags and Equipment", () => {
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

  async function put(page: import("@playwright/test").Page, path: string, data: unknown) {
    const token = await getToken(page);
    const res = await page.request.put(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      data,
    });
    if (!res.ok()) throw new Error(`PUT ${path} failed: ${res.status()} ${await res.text()}`);
    return (await res.json()).data;
  }

  test("tags typed in the create modal persist and show in the Tags column", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    const programs = new ProgramsPage(page);
    const name = uniqueName("E2E Tagged Program");

    await programs.goto();
    await page.getByRole("button", { name: "Add New Program" }).click();
    await page.getByPlaceholder("Name your program").fill(name);

    // Enter commits a chip; the second one proves the field accumulates.
    const tagField = page.getByLabel("Add a tag");
    await tagField.fill("Strength");
    await tagField.press("Enter");
    await tagField.fill("Beginner");
    await tagField.press("Enter");
    await expect(page.getByRole("button", { name: "Remove Strength" })).toBeVisible();

    await page.getByRole("button", { name: "Create Program" }).click();
    await expect(page.getByText("Program created")).toBeVisible();

    // Creating drops into the planner; go back to the list to read the column.
    await programs.goto();
    await programs.search(name);
    await expect(page.getByText("Strength, Beginner")).toBeVisible();
  });

  test("a duplicate tag is rejected rather than listed twice", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await new ProgramsPage(page).goto();

    await page.getByRole("button", { name: "Add New Program" }).click();
    const tagField = page.getByLabel("Add a tag");
    await tagField.fill("Strength");
    await tagField.press("Enter");
    await tagField.fill("strength ");
    await tagField.press("Enter");

    await expect(page.getByRole("button", { name: /^Remove /})).toHaveCount(1);
  });

  test("Equipment is derived from the exercises in the program's workouts", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    const programs = new ProgramsPage(page);
    const programName = uniqueName("E2E Equipment Program");

    await page.goto("/dashboard");

    // Build exercise → section → workout, then place the workout on day 1.
    const exercise = await post(page, "/api/v1/library/exercises", {
      name: "Bench Press", category: "strength", equipment: "Barbell",
    });
    const workout = await post(page, "/api/v1/library/workouts", {
      name: uniqueName("E2E Eq Workout"), description: null, tags: [],
    });
    // Sections are reusable, so they are created standalone then attached.
    const section = await post(page, "/api/v1/library/workout-sections", {
      name: "Main", sectionType: "MAIN", description: null,
    });
    await post(page, `/api/v1/library/workout-sections/${section.id}/exercises`, {
      exerciseId: exercise.id,
    });
    await post(page, `/api/v1/library/workouts/${workout.id}/sections`, {
      sectionId: section.id,
    });
    const program = await post(page, "/api/v1/library/programs", {
      name: programName, weeks: 1, description: null,
    });
    await put(page, `/api/v1/library/programs/${program.id}/days/1`, {
      workoutId: workout.id, notes: null,
    });

    await programs.goto();
    await programs.search(programName);

    await expect(page.getByText("Barbell")).toBeVisible();
  });

  test("a program with no workouts shows a dash in both columns", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    const programs = new ProgramsPage(page);
    const programName = uniqueName("E2E Bare Program");

    await page.goto("/dashboard");
    await post(page, "/api/v1/library/programs", {
      name: programName, weeks: 1, description: null,
    });

    await programs.goto();
    await programs.search(programName);

    // Tags, Equipment and the (still decorative) Live Sync cell each fall back
    // to a dash. Scoped to the row: the description cell is also a dash, but it
    // is line-clamped and so reports hidden.
    const row = programs.row(programName);
    await expect(row.locator("span").filter({ hasText: /^—$/ })).toHaveCount(3);
    await expect(page.getByText("Barbell")).toHaveCount(0);
  });
});
