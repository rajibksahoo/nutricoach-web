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

/** A unique, human-readable name so parallel runs/re-runs never collide. */
export function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()}${Math.floor(Math.random() * 1000)}`;
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

/** POST JSON to the backend with the coach's token; returns the `data` payload. */
async function postSeed(page: Page, path: string, data: unknown) {
  const token = await getToken(page);
  const res = await page.request.post(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
  if (!res.ok()) {
    throw new Error(`POST ${path} failed: ${res.status()} ${await res.text()}`);
  }
  return (await res.json()).data;
}

/** Seed a library exercise (the minimum the backend requires). */
export function seedExercise(page: Page, name: string) {
  return postSeed(page, "/api/v1/library/exercises", { name, category: "strength" });
}

/** Seed a library workout. */
export function seedWorkout(page: Page, name: string) {
  return postSeed(page, "/api/v1/library/workouts", { name, description: null, tags: [] });
}

/** Seed a library program. */
export function seedProgram(page: Page, name: string) {
  return postSeed(page, "/api/v1/library/programs", { name, weeks: 4, description: null });
}

/** Soft-delete a client (frees a slot against the trial cap). */
export async function deleteClient(page: Page, id: string) {
  const token = await getToken(page);
  await page.request.delete(`${API_URL}/api/v1/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Free a client slot when the coach is at the trial cap (5 active clients) so a
 * test that genuinely creates a client can run on a shared DB. Removes a
 * test-created client (name starts with "E2E" or "MealPlan"), not anything real.
 */
export async function ensureClientSlot(page: Page) {
  const token = await getToken(page);
  const res = await page.request.get(`${API_URL}/api/v1/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return;
  const list = (await res.json()).data;
  if (Array.isArray(list) && list.length >= 5) {
    const victim =
      list.find((c: { name?: string }) => /^(E2E |MealPlan )/.test(c.name ?? "")) ?? list[0];
    await deleteClient(page, victim.id);
  }
}

/**
 * Return an existing client's name, or seed one if the coach has none.
 * Avoids the STARTER plan's 5-client cap (HTTP 402) when prior tests have
 * already populated clients — assign tests just need *a* client to pick.
 */
export async function ensureClientName(page: Page, preferredName: string): Promise<string> {
  const token = await getToken(page);
  const res = await page.request.get(`${API_URL}/api/v1/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok()) {
    const list = (await res.json()).data;
    if (Array.isArray(list) && list.length > 0) return list[0].name as string;
  }
  return (await seedClient(page, preferredName)).name;
}
