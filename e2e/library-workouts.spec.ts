import { test, expect } from "@playwright/test";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { seedWorkout, ensureClientName, uniqueName } from "./helpers/api";

// Library → Workouts: create / read / update / delete + assign to a client.
test.describe("Library · Workouts", () => {
  test("create a workout", async ({ page }) => {
    const workouts = new WorkoutsPage(page);
    const name = uniqueName("E2E Workout");

    await workouts.goto();
    await workouts.createBlank(name); // lands on the builder editor

    await expect(page).toHaveURL(/\/library\/workouts\/[0-9a-f-]{36}/);
    await expect(page.getByPlaceholder("Name your workout")).toHaveValue(name);
  });

  test("read a seeded workout via search", async ({ page }) => {
    const workouts = new WorkoutsPage(page);
    const name = uniqueName("E2E Read Workout");

    await page.goto("/dashboard");
    await seedWorkout(page, name);

    await workouts.goto();
    await workouts.search(name);
    await expect(workouts.row(name)).toBeVisible();
  });

  test("update a workout name from the editor", async ({ page }) => {
    const workouts = new WorkoutsPage(page);
    const original = uniqueName("E2E Edit Workout");
    const updated = `${original} UPDATED`;

    await page.goto("/dashboard");
    const w = await seedWorkout(page, original);

    await workouts.gotoEditor(w.id);
    await workouts.renameOnEditor(updated);
    await expect(page.getByText("Saved")).toBeVisible(); // auto-save toast

    await workouts.goto();
    await workouts.search(updated);
    await expect(workouts.row(updated)).toBeVisible();
  });

  test("delete a workout", async ({ page }) => {
    const workouts = new WorkoutsPage(page);
    const name = uniqueName("E2E Delete Workout");

    await page.goto("/dashboard");
    await seedWorkout(page, name);

    await workouts.goto();
    await workouts.search(name);
    await expect(workouts.row(name)).toBeVisible();

    page.once("dialog", (d) => d.accept()); // confirm("Delete this workout?")
    await workouts.deleteFromMenu(name);

    await expect(page.getByText(/deleted/i)).toBeVisible();
    await workouts.search(name);
    await expect(workouts.row(name)).toHaveCount(0);
  });

  test("assign a workout to a client", async ({ page }) => {
    const workouts = new WorkoutsPage(page);
    const workoutName = uniqueName("E2E Assign Workout");

    await page.goto("/dashboard");
    await seedWorkout(page, workoutName);
    const clientName = await ensureClientName(page, uniqueName("E2E WO Client"));

    await workouts.goto();
    await workouts.search(workoutName);
    await workouts.assignToClient(workoutName, clientName);

    await expect(page.getByText(/Assigned .* to 1 client/i)).toBeVisible();
  });
});
