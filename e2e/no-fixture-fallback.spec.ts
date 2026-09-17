import { test, expect } from "@playwright/test";
import { API_URL, uniquePhone } from "./helpers/api";

/**
 * Regression guard: the Clients and Inbox screens used to fall back to the
 * design's static fixtures whenever the API returned an empty list or errored.
 * That meant a brand-new coach saw five invented clients (Priya Sharma et al)
 * and an outage looked like a working, populated account.
 *
 * These names must never reach the DOM again.
 */
const INVENTED = [
  "Priya Sharma", "Arjun Reddy", "Meera Iyer", "Karthik Rao", "Sneha Gupta",
  "Barry's bootcamp", "gluten intolerance", "29 days left",
];

/** A fresh coach with a guaranteed-empty roster, via the dev-only demo login. */
async function freshCoachToken(page: import("@playwright/test").Page) {
  const res = await page.request.post(`${API_URL}/api/v1/auth/demo-login`, {
    data: { phone: uniquePhone() },
  });
  expect(res.ok(), "demo-login requires the backend local profile").toBeTruthy();
  return (await res.json()).data.token as string;
}

async function signInAs(page: import("@playwright/test").Page, token: string) {
  await page.goto("/login");
  await page.evaluate((t) => {
    localStorage.setItem("nc_token", t);
    localStorage.setItem("nc_coach", JSON.stringify({
      id: "e2e", name: "Fresh Coach", phone: "9000000000",
      subscriptionTier: "TRIAL", subscriptionStatus: "TRIAL",
    }));
  }, token);
}

test.describe("no fixture fallback", () => {
  test("a coach with an empty roster sees the empty state, not invented clients", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));

    await page.goto("/clients");
    await expect(page.getByText("No clients yet")).toBeVisible();
    for (const name of INVENTED) {
      await expect(page.getByText(name, { exact: false })).toHaveCount(0);
    }
  });

  test("an empty inbox shows the empty state, not invented threads", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));

    await page.goto("/messages");
    await expect(page.getByText("No conversations yet")).toBeVisible();
    for (const name of INVENTED) {
      await expect(page.getByText(name, { exact: false })).toHaveCount(0);
    }
  });

  test("a failing clients API shows an error state with retry, not invented clients", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.route("**/api/v1/clients", (r) => r.abort("failed"));

    await page.goto("/clients");
    await expect(page.getByText("Couldn't load your clients")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    for (const name of INVENTED) {
      await expect(page.getByText(name, { exact: false })).toHaveCount(0);
    }
  });

  test("a failing conversations API shows an error state, not invented threads", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    await page.route("**/api/v1/messages/conversations", (r) => r.abort("failed"));

    await page.goto("/messages");
    await expect(page.getByText("Couldn't load your inbox")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });
});
