import { Page } from "@playwright/test";

/** Backend base URL — mirrors the frontend's NEXT_PUBLIC_API_URL. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/**
 * A valid, unique Indian mobile number (matches the app's /^[6-9]\d{9}$/).
 * Timestamp-derived so re-runs don't collide on the backend's unique-phone rule.
 */
export function uniquePhone(): string {
  return "9" + String(Date.now()).slice(-9);
}

/** Read the coach JWT that storageState restored into localStorage. */
export async function getToken(page: Page): Promise<string | null> {
  return page.evaluate(() => localStorage.getItem("nc_token"));
}

/**
 * Seed a client directly via the API (faster than driving the UI) so a test
 * that needs an existing client is self-contained. Call after navigating to an
 * app page so the token is available in localStorage.
 */
export async function seedClient(page: Page, name: string) {
  const token = await getToken(page);
  const res = await page.request.post(`${API_URL}/api/v1/clients`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name, phone: uniquePhone() },
  });
  if (!res.ok()) {
    throw new Error(`seedClient failed: ${res.status()} ${await res.text()}`);
  }
  return (await res.json()).data;
}
