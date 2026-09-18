import { test, expect } from "@playwright/test";
import { ProgramsPage } from "./pages/ProgramsPage";
import { seedProgram, ensureClientName, uniqueName, freshCoachToken, signInAs } from "./helpers/api";

// Library → Programs: create / read / update / delete + assign to a client.
test.describe("Library · Programs", () => {
  test("create a program", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueName("E2E Program");

    await programs.goto();
    await programs.create(name);

    // Create transitions into the planner; the toast confirms success.
    await expect(page.getByText("Program created")).toBeVisible();
  });

  test("read a seeded program via search", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueName("E2E Read Program");

    await page.goto("/dashboard");
    await seedProgram(page, name);

    await programs.goto();
    await programs.search(name);
    await expect(programs.row(name)).toBeVisible();
  });

  test("update a program name", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const original = uniqueName("E2E Edit Program");
    const updated = `${original} UPDATED`;

    await page.goto("/dashboard");
    await seedProgram(page, original);

    await programs.goto();
    await programs.search(original);
    await programs.editName(updated);

    await expect(page.getByText("Program updated")).toBeVisible();
    await programs.search(updated);
    await expect(programs.row(updated)).toBeVisible();
  });

  test("delete a program", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueName("E2E Delete Program");

    await page.goto("/dashboard");
    await seedProgram(page, name);

    await programs.goto();
    await programs.search(name);
    await expect(programs.row(name)).toBeVisible();

    page.once("dialog", (d) => d.accept()); // confirm('Delete "..."?')
    await programs.deleteProgram();

    await expect(page.getByText("Program deleted")).toBeVisible();
    await programs.search(name);
    await expect(page.getByText(name)).toHaveCount(0);
  });

  test("assign a program to a client", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName("E2E Assign Program");

    await page.goto("/dashboard");
    await seedProgram(page, programName);
    const clientName = await ensureClientName(page, uniqueName("E2E PG Client"));

    await programs.goto();
    await programs.search(programName);
    await programs.assignToClient(clientName);

    await expect(page.getByText(/Assigned to 1 client/i)).toBeVisible();
  });

  test("assign modal shows current assignees and can unassign", async ({ page }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName("E2E Unassign Program");

    await page.goto("/dashboard");
    await seedProgram(page, programName);
    const clientName = await ensureClientName(page, uniqueName("E2E PG Unassign Client"));

    await programs.goto();
    await programs.search(programName);
    await programs.assignToClient(clientName);
    await expect(page.getByText(/Assigned to 1 client/i)).toBeVisible();

    // Reopen: the assignee is now listed, and can no longer be picked again.
    await programs.openAssign();
    await expect(programs.assignedHeader()).toHaveText("Currently assigned (1)");
    await expect(page.getByRole("button", { name: `Unassign ${clientName}` })).toBeVisible();
    await expect(programs.pickerRow(clientName)).toBeDisabled();
    await expect(programs.pickerRow(clientName)).toContainText("ASSIGNED");

    await programs.unassign(clientName);
    await expect(page.getByText("Assignment removed")).toBeVisible();
    await expect(programs.assignedHeader()).toHaveCount(0);
    await programs.closeAssign();

    // Reopen once more — the removal stuck server-side.
    await programs.openAssign();
    await expect(programs.pickerRow(clientName)).toBeEnabled();
    await expect(programs.assignedHeader()).toHaveCount(0);
  });
});

/**
 * The trial chip is rendered from two different sources: the dashboard reads
 * `/coach/dashboard/overview` (server-computed) while the Programs views use
 * `useSubscription` over `/billing/status` (client-computed). They must agree
 * — they previously disagreed by a day, because the hook rounded up where the
 * backend truncates.
 *
 * Uses a *fresh* coach on purpose: the shared E2E coach's trial expired long
 * ago, so both a floored and a rounded-up count clamp to 0 and the test would
 * pass whatever the hook did.
 */
test.describe("trial chip", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("reads the same on the dashboard and on Programs", async ({ page }) => {
    await signInAs(page, await freshCoachToken(page));
    const chip = /\d+ days left|Trial ends today/i;

    await page.goto("/dashboard");
    await expect(page.getByText(chip).first()).toBeVisible();
    const onDashboard = (await page.getByText(chip).first().textContent())?.trim();

    await new ProgramsPage(page).goto();
    await expect(page.getByText(chip).first()).toBeVisible();
    const onPrograms = (await page.getByText(chip).first().textContent())?.trim();

    // A fresh coach is mid-trial, so this is a real number, not a clamped 0.
    expect(onDashboard).toMatch(/\d+ days left/);
    expect(onPrograms).toBe(onDashboard);
  });
});
