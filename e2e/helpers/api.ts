import { Page } from "@playwright/test";

/** Backend base URL — mirrors the frontend's NEXT_PUBLIC_API_URL. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/**
 * A valid, unique Indian mobile number (matches the app's /^[6-9]\d{9}$/).
 *
 * Timestamp *plus* randomness: a pure millisecond timestamp collides when
 * parallel workers mint a coach in the same millisecond, and two concurrent
 * demo-logins for one phone race on the unique-phone constraint. That surfaced
 * as an occasional "demo-login failed: 500" once the suite grew past ~60 tests.
 */
export function uniquePhone(): string {
  const stamp = String(Date.now()).slice(-6);
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return "9" + stamp + rand;
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
export async function ensureClient(
  page: Page,
  preferredName: string,
): Promise<{ id: string; name: string }> {
  const token = await getToken(page);
  const res = await page.request.get(`${API_URL}/api/v1/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok()) {
    const list = (await res.json()).data;
    if (Array.isArray(list) && list.length > 0) {
      return { id: list[0].id as string, name: list[0].name as string };
    }
  }
  const seeded = await seedClient(page, preferredName);
  return { id: seeded.id as string, name: seeded.name as string };
}

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

/**
 * Mint a brand-new coach with an empty roster via the dev-only demo login.
 * Use this for any spec that must not be perturbed by the shared coach's
 * 5-client trial cap or by `ensureClientSlot` deleting rows underneath it.
 */
export async function freshCoachToken(page: Page): Promise<string> {
  const res = await page.request.post(`${API_URL}/api/v1/auth/demo-login`, {
    data: { phone: uniquePhone() },
  });
  if (!res.ok()) {
    throw new Error(`demo-login failed (needs the backend local profile): ${res.status()}`);
  }
  return (await res.json()).data.token as string;
}

/** Put a coach token into localStorage so the client-side guards let us in. */
export async function signInAs(page: Page, token: string) {
  await page.goto("/login");
  await page.evaluate((t) => {
    localStorage.setItem("nc_token", t);
    localStorage.setItem("nc_coach", JSON.stringify({
      id: "e2e", name: "Fresh Coach", phone: "9000000000",
      subscriptionTier: "TRIAL", subscriptionStatus: "TRIAL",
    }));
  }, token);
}
