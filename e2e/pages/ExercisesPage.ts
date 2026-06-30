import { Page, Locator } from "@playwright/test";

/** Library → Exercises CRUD (table + AddExerciseModal). */
export class ExercisesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/library/exercises");
  }

  /** Client-side filter; narrowing to a unique name leaves a single row. */
  async search(query: string) {
    await this.page.getByPlaceholder("Search exercise name").fill(query);
  }

  row(name: string): Locator {
    return this.page.locator("tr", { hasText: name });
  }

  async create(name: string) {
    await this.page.getByRole("button", { name: "New exercise" }).click();
    await this.page.getByPlaceholder("e.g. Banded glute bridge").fill(name);
    await this.page.getByRole("button", { name: "Create exercise" }).click();
  }

  /** Clicking a row opens the edit modal pre-filled. */
  async openEdit(name: string) {
    await this.page.getByText(name, { exact: true }).click();
  }

  async rename(newName: string) {
    await this.page.getByPlaceholder("e.g. Banded glute bridge").fill(newName);
    await this.page.getByRole("button", { name: "Save changes" }).click();
  }

  /** Per-row trash button; triggers a native confirm() the caller must accept. */
  async deleteFromRow(name: string) {
    await this.row(name).getByTitle("Delete").click();
  }
}
