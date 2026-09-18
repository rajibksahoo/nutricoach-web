import { Page } from "@playwright/test";

/** Coach "Clients" workflow: add a client and find it in the list. */
export class ClientsPage {
  constructor(private page: Page) {}

  async gotoNew() {
    await this.page.goto("/clients/new");
  }

  async gotoList() {
    await this.page.goto("/clients");
  }

  /**
   * Add a client. The form is two steps — essentials, then an optional profile
   * — so pass `profile` to fill step two, or omit it to skip straight through.
   */
  async createClient({ name, phone, goal, profile }: {
    name: string;
    phone: string;
    goal?: string;
    profile?: Partial<Record<
      "dateOfBirth" | "gender" | "heightCm" | "weightKg" | "dietaryPref"
      | "activityLevel" | "healthConditions" | "allergies", string>>;
  }) {
    await this.page.locator("#name").fill(name);
    await this.page.locator("#phone").fill(phone);
    if (goal) await this.page.locator("#goal").selectOption(goal);
    await this.page.getByRole("button", { name: "Continue" }).click();

    if (!profile) {
      await this.page.getByRole("button", { name: /Skip and add/ }).click();
      return;
    }

    for (const [field, value] of Object.entries(profile)) {
      if (!value) continue;
      const el = this.page.locator(`#${field}`);
      if (["gender", "dietaryPref", "activityLevel"].includes(field)) {
        await el.selectOption(value);
      } else {
        await el.fill(value);
      }
    }
    await this.page.getByRole("button", { name: "Add Client" }).click();
  }

  /** Filter the list sidebar by name/goal. */
  async search(query: string) {
    await this.page.getByPlaceholder("Search client").fill(query);
  }
}
