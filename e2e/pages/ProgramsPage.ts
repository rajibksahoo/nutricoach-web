import { Page, Locator } from "@playwright/test";

/**
 * Library → Programs (div-based grid list + CreateProgramModal + AssignProgramModal).
 * The list rows aren't a <table>, so action helpers assume the list has been
 * narrowed to a single program via search() — then the title-buttons are unique.
 */
export class ProgramsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/library/programs");
  }

  async search(query: string) {
    await this.page.getByPlaceholder("Search by keyword or name").fill(query);
  }

  /**
   * The row grid div is the deepest element containing both the program name
   * and its "More" action button (the leaf name <div> reports as hidden under
   * Playwright actionability, but the row container is reliably visible).
   */
  row(name: string): Locator {
    return this.page
      .locator("div")
      .filter({ hasText: name })
      .filter({ has: this.page.getByRole("button", { name: "More" }) })
      .last();
  }

  /** Create → navigates into the planner view; assert via the success toast. */
  async create(name: string) {
    await this.page.getByRole("button", { name: "Add New Program" }).click();
    await this.page.getByPlaceholder("Name your program").fill(name);
    await this.page.getByRole("button", { name: "Create Program" }).click();
  }

  /** Row menu (More) → Edit info → rename in the modal → Save. */
  async editName(newName: string) {
    await this.page.getByTitle("More").click();
    await this.page.getByRole("button", { name: "Edit info" }).click();
    await this.page.getByPlaceholder("Name your program").fill(newName);
    await this.page.getByRole("button", { name: "Save", exact: true }).click();
  }

  /** Row menu (More) → Delete; triggers a native confirm() the caller must accept. */
  async deleteProgram() {
    await this.page.getByTitle("More").click();
    await this.page.getByRole("button", { name: "Delete", exact: true }).click();
  }

  /** Row Assign button → pick one client → Assign. */
  async assignToClient(clientName: string) {
    await this.page.getByTitle("Assign").click();
    await this.page.getByPlaceholder("Search clients by name or goal").fill(clientName);
    await this.page.getByRole("button", { name: new RegExp(escapeRe(clientName)) }).click();
    await this.page.getByRole("button", { name: /Assign \(\d+\)/ }).click();
  }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
