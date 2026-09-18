import { test, expect } from "@playwright/test";
import { API_URL, freshCoachToken, signInAs, getToken } from "./helpers/api";

/**
 * Creating a workout from a template.
 *
 * This flow used to preview six templates from a hardcoded array and then
 * create an empty workout carrying only the name and description — silently
 * discarding the sections and exercises the coach had just been shown, while
 * toasting "Workout created from template".
 *
 * So the assertions here deliberately check the *contents* of the created
 * workout. Asserting on the toast, or on landing in the builder, is exactly
 * what let the bug hide.
 */
test.describe("create workout from template", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the picker lists the server's templates", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/library/workouts");

    // The catalogue is global and seeded by changeset 018, so a brand-new
    // coach sees it.
    const token = await getToken(page);
    const res = await page.request.get(`${API_URL}/api/v1/library/workout-templates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const serverNames = ((await res.json()).data as { name: string }[]).map((t) => t.name);
    expect(serverNames.length).toBeGreaterThan(0);

    await page.getByRole("button", { name: "New workout" }).click();
    await page.getByText("Choose from our list of workout templates").click();

    await expect(page.getByRole("heading", { name: "Choose Workout Template" })).toBeVisible();
    // Every name comes from the API, not from a constant in the bundle.
    for (const name of serverNames) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }
  });

  test("selecting a template copies its sections and exercises into the workout", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/library/workouts");

    await page.getByRole("button", { name: "New workout" }).click();
    await page.getByText("Choose from our list of workout templates").click();
    await expect(page.getByRole("heading", { name: "Choose Workout Template" })).toBeVisible();

    // The left rail reports the counts the preview promises.
    const summary = await page.getByText(/\d+ Exercises • \d+ Sections/).first().textContent();
    const promisedExercises = Number(summary?.match(/(\d+) Exercises/)?.[1] ?? 0);
    const promisedSections = Number(summary?.match(/(\d+) Sections/)?.[1] ?? 0);
    expect(promisedExercises).toBeGreaterThan(0);
    expect(promisedSections).toBeGreaterThan(0);

    await page.getByRole("button", { name: "Select" }).click();
    await page.waitForURL("**/library/workouts/*");

    // THE ASSERTION THAT MATTERS: the created workout actually holds what the
    // preview showed. Previously this landed on an empty builder.
    const token = await getToken(page);
    const id = page.url().split("/").pop();
    const created = await page.request.get(`${API_URL}/api/v1/library/workouts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const workout = (await created.json()).data as {
      sections: { exercises: unknown[] }[];
    };

    expect(workout.sections.length).toBe(promisedSections);
    const exerciseCount = workout.sections.reduce((n, s) => n + s.exercises.length, 0);
    expect(exerciseCount).toBe(promisedExercises);
  });

  test("instantiating creates the exercises a new coach does not have yet", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    const token = await getToken(page);

    // A brand-new coach starts with an empty exercise library.
    const before = await page.request.get(`${API_URL}/api/v1/library/exercises`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const beforeCount = ((await before.json()).data as unknown[]).length;

    await page.goto("/library/workouts");
    await page.getByRole("button", { name: "New workout" }).click();
    await page.getByText("Choose from our list of workout templates").click();
    await page.getByRole("button", { name: "Select" }).click();
    await page.waitForURL("**/library/workouts/*");

    const after = await page.request.get(`${API_URL}/api/v1/library/exercises`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const afterCount = ((await after.json()).data as unknown[]).length;
    expect(afterCount).toBeGreaterThan(beforeCount);
  });
});
