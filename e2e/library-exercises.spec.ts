import { test, expect } from "@playwright/test";
import { ExercisesPage } from "./pages/ExercisesPage";
import { seedExercise, uniqueName } from "./helpers/api";

// Library → Exercises: full CRUD. Authenticated via saved coach storageState.
test.describe("Library · Exercises", () => {
  test("create an exercise", async ({ page }) => {
    const exercises = new ExercisesPage(page);
    const name = uniqueName("E2E Exercise");

    await exercises.goto();
    await exercises.create(name);

    await expect(page.getByText("Exercise created")).toBeVisible();
    await exercises.search(name);
    await expect(exercises.row(name)).toBeVisible();
  });

  test("read a seeded exercise via search", async ({ page }) => {
    const exercises = new ExercisesPage(page);
    const name = uniqueName("E2E Read Exercise");

    await page.goto("/dashboard");
    await seedExercise(page, name);

    await exercises.goto();
    await exercises.search(name);
    await expect(exercises.row(name)).toBeVisible();
  });

  test("update an exercise name", async ({ page }) => {
    const exercises = new ExercisesPage(page);
    const original = uniqueName("E2E Edit Exercise");
    const updated = `${original} UPDATED`;

    await page.goto("/dashboard");
    await seedExercise(page, original);

    await exercises.goto();
    await exercises.search(original);
    await exercises.openEdit(original);
    await exercises.rename(updated);

    await expect(page.getByText("Exercise updated")).toBeVisible();
    await exercises.search(updated);
    await expect(exercises.row(updated)).toBeVisible();
  });

  test("delete an exercise", async ({ page }) => {
    const exercises = new ExercisesPage(page);
    const name = uniqueName("E2E Delete Exercise");

    await page.goto("/dashboard");
    await seedExercise(page, name);

    await exercises.goto();
    await exercises.search(name);
    await expect(exercises.row(name)).toBeVisible();

    page.once("dialog", (d) => d.accept()); // confirm("Delete this exercise?")
    await exercises.deleteFromRow(name);

    await expect(page.getByText("Exercise deleted")).toBeVisible();
    await exercises.search(name);
    await expect(exercises.row(name)).toHaveCount(0);
  });
});
