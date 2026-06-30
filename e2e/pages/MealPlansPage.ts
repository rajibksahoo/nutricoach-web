import { Page } from "@playwright/test";

/** Coach "Meal Plans" workflow: create a plan for the selected client. */
export class MealPlansPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/meal-plans");
  }

  /** Open the inline "New Plan" form, name the plan, and create it. */
  async newPlan(name: string) {
    await this.page.getByRole("button", { name: "New Plan" }).click();
    // Placeholder is "e.g. Weight Loss — Week 1" — match a stable substring.
    await this.page.getByPlaceholder("Weight Loss").fill(name);
    await this.page.getByRole("button", { name: "Create" }).click();
  }
}
