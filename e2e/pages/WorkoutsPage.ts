import { Page, Locator } from "@playwright/test";

/** Library → Workouts: list table + CreateWorkoutModal + builder editor. */
export class WorkoutsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/library/workouts");
  }

  async gotoEditor(id: string) {
    await this.page.goto(`/library/workouts/${id}`);
  }

  async search(query: string) {
    await this.page.getByPlaceholder("Search workout name").fill(query);
  }

  row(name: string): Locator {
    return this.page.locator("tr", { hasText: name });
  }

  /** Create a blank workout; navigates to the builder editor on success. */
  async createBlank(name: string) {
    await this.page.getByRole("button", { name: "New workout" }).click();
    await this.page.getByText("Create your own").click(); // the "New Workout" choice card
    await this.page.getByPlaceholder("e.g. Upper-body Strength Day").fill(name);
    await this.page.getByRole("button", { name: "Create", exact: true }).click();
    await this.page.waitForURL("**/library/workouts/*");
  }

  /** On the builder editor: rename the title and blur to trigger auto-save. */
  async renameOnEditor(newName: string) {
    await this.page.getByPlaceholder("Name your workout").fill(newName);
    await this.page.getByPlaceholder("Add a description").click(); // blur -> PUT
  }

  private async openRowMenu(name: string) {
    await this.row(name).getByRole("button", { name: "Row actions" }).click();
  }

  /** Row menu → Delete; triggers a native confirm() the caller must accept. */
  async deleteFromMenu(name: string) {
    await this.openRowMenu(name);
    await this.page.getByRole("button", { name: "Delete", exact: true }).click();
  }

  /** Row menu → Assign to client → pick one client → send. */
  async assignToClient(workoutName: string, clientName: string) {
    await this.openRowMenu(workoutName);
    await this.page.getByRole("button", { name: "Assign to client" }).click();
    await this.page.getByPlaceholder("Search clients by name or goal").fill(clientName);
    await this.page.getByRole("button", { name: new RegExp(escapeRe(clientName)) }).click();
    await this.page.getByRole("button", { name: "Send to client" }).click();
  }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
