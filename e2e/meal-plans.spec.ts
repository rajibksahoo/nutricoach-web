import { test, expect } from "@playwright/test";
import { MealPlansPage } from "./pages/MealPlansPage";
import { seedClient } from "./helpers/api";

// Authenticated via the saved coach storageState. Demonstrates the
// reuse-auth pattern plus API seeding for a test's preconditions.
test("coach can create a meal plan for a client", async ({ page }) => {
  // Meal Plans needs at least one client — seed one via the API.
  await page.goto("/dashboard");
  await seedClient(page, `MealPlan Client ${Date.now()}`);

  const meals = new MealPlansPage(page);
  await meals.goto();

  // A client is auto-selected, revealing the plan actions.
  await expect(page.getByRole("button", { name: "New Plan" })).toBeVisible();

  const planName = `E2E Plan ${Date.now()}`;
  await meals.newPlan(planName);

  await expect(page.getByText(planName)).toBeVisible();
});
