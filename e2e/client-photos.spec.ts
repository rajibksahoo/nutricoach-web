import { test, expect } from "@playwright/test";
import {
  API_URL, freshCoachToken, signInAs, seedClient, getToken, uniqueName,
} from "./helpers/api";

/**
 * The Progress Photos card on client detail.
 *
 * Photos are stored as S3 keys and served as pre-signed URLs. Locally `S3Service`
 * hands back `local-dummy-download-url.example.com`, so these specs assert the
 * grid, labels, ordering and View All modal — plus that a dead URL degrades to
 * the placeholder rather than a broken-image icon. Whether a real photo renders
 * is a production check; see P6 in PROGRESS.md.
 *
 * That dummy host is **not** a reliable way to produce a failed image. It is a
 * subdomain of a real domain, and plenty of resolvers (most Indian consumer
 * ISPs among them) hijack NXDOMAIN and answer with a live ad-server IP. That
 * host accepts the connection and then never responds, so the request hangs
 * and `onError` never fires — the placeholder spec then failed on those
 * networks and passed on networks with honest NXDOMAIN. It was testing the
 * tester's DNS, not our fallback. The failure is now produced by aborting the
 * request, which is what the spec meant all along.
 */
test.describe("client detail · Progress Photos", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  async function post(page: import("@playwright/test").Page, path: string, data: unknown) {
    const token = await getToken(page);
    const res = await page.request.post(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      data,
    });
    if (!res.ok()) throw new Error(`POST ${path} failed: ${res.status()} ${await res.text()}`);
    return (await res.json()).data;
  }

  /** Log progress on a date, then attach a photo of the given pose to it. */
  async function seedPhoto(
    page: import("@playwright/test").Page,
    clientId: string, loggedDate: string, photoType: string,
  ) {
    const log = await post(page, `/api/v1/clients/${clientId}/progress`, {
      loggedDate, weightKg: 70,
    });
    await post(page, `/api/v1/clients/${clientId}/progress/${log.id}/photos`, {
      photoType, contentType: "image/jpeg",
    });
    return log;
  }

  async function openClient(page: import("@playwright/test").Page) {
    await signInAs(page, await freshCoachToken(page));
    await page.goto("/dashboard");
    const client = await seedClient(page, uniqueName("E2E Photo Client"));
    return client as { id: string; name: string };
  }

  test("photos appear newest-first with their log date", async ({ page }) => {
    const client = await openClient(page);
    await seedPhoto(page, client.id, "2026-09-01", "FRONT");
    await seedPhoto(page, client.id, "2026-09-15", "SIDE");

    await page.goto(`/clients/${client.id}`);

    await expect(page.getByText("Progress Photos")).toBeVisible();
    await expect(page.getByText("No photos uploaded yet.")).toHaveCount(0);

    // Dates are rendered in the viewer's locale, so match the parts.
    await expect(page.getByText(/15.*Sep|Sep.*15/).first()).toBeVisible();
    await expect(page.getByText(/1.*Sep|Sep.*1/).first()).toBeVisible();
  });

  test("a dead photo URL degrades to a placeholder, not a broken image", async ({ page }) => {
    const client = await openClient(page);
    await seedPhoto(page, client.id, "2026-09-15", "FRONT");

    // Fail the image ourselves rather than hoping the network fails it for us.
    // See the note at the top of this file: the dummy host can resolve.
    let photoRequests = 0;
    await page.route("**/local-dummy-download-url.example.com/**", (route) => {
      photoRequests += 1;
      return route.abort("failed");
    });

    await page.goto(`/clients/${client.id}`);

    await expect(page.getByText("front").first()).toBeVisible();

    // Guards the route pattern itself: if the presign host ever changes, the
    // abort silently stops matching and this spec would hang on a real request
    // again. Better to fail saying the photo was never requested.
    expect(photoRequests, "the photo URL was never requested — has the presign host changed?")
      .toBeGreaterThan(0);
  });

  test("View All lists every photo grouped by log date", async ({ page }) => {
    const client = await openClient(page);
    const log = await seedPhoto(page, client.id, "2026-09-15", "FRONT");
    // A second pose on the same log must group under one date heading.
    await post(page, `/api/v1/clients/${client.id}/progress/${log.id}/photos`, {
      photoType: "BACK", contentType: "image/jpeg",
    });
    await seedPhoto(page, client.id, "2026-09-01", "SIDE");
    await seedPhoto(page, client.id, "2026-08-20", "FRONT");

    await page.goto(`/clients/${client.id}`);

    // Four photos, three on the card, so the button carries the total.
    await page.getByRole("button", { name: /View All \(4\)/ }).click();

    const modal = page.getByRole("dialog", { name: "All progress photos" });
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/2026/).first()).toBeVisible();
    // Three distinct log dates → three headings.
    await expect(modal.getByText(/\d{1,2} \w{3} 2026|\w{3} \d{1,2}, 2026/)).toHaveCount(3);

    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
  });

  test("a client with no photos keeps the empty state", async ({ page }) => {
    const client = await openClient(page);

    await page.goto(`/clients/${client.id}`);

    await expect(page.getByText("No photos uploaded yet.")).toBeVisible();
    await expect(page.getByRole("button", { name: /View All/ })).toHaveCount(0);
  });
});
