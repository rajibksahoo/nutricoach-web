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

  async createClient({ name, phone, goal }: { name: string; phone: string; goal?: string }) {
    await this.page.locator("#name").fill(name);
    await this.page.locator("#phone").fill(phone);
    if (goal) await this.page.locator("#goal").selectOption(goal);
    await this.page.getByRole("button", { name: "Add Client" }).click();
  }

  /** Filter the list sidebar by name/goal. */
  async search(query: string) {
    await this.page.getByPlaceholder("Search client").fill(query);
  }
}
