import { Page, Locator } from "@playwright/test";

/** Coach dashboard: attention strip + action queue + side panels. */
export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/dashboard");
    // The whole screen renders off one request; wait for the queue card.
    await this.queueCard.waitFor();
  }

  get heading(): Locator {
    return this.page.getByRole("heading", { level: 1 });
  }

  get queueCard(): Locator {
    return this.page.getByText("Needs your attention", { exact: true });
  }

  /** One attention tile, addressed by its label ("Unanswered", "No plan", …). */
  tile(label: string): Locator {
    return this.page.locator("button", { hasText: label }).first();
  }

  async clickTile(label: string) {
    await this.tile(label).click();
  }

  /** Rows currently listed in the action queue. */
  get queueRows(): Locator {
    return this.page.locator("li a", { hasText: /Reply|Nudge|Renew|Create plan|Onboard/ });
  }

  get clearFilter(): Locator {
    return this.page.getByRole("button", { name: "Clear filter" });
  }

  panel(title: string): Locator {
    return this.page.getByText(title, { exact: true });
  }
}
