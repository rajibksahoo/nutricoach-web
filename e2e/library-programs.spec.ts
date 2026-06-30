import { test, expect } from "@playwright/test";
import { ProgramsPage } from "./pages/ProgramsPage";
import { seedProgram, ensureClientName, uniqueName } from "./helpers/api";

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
});
