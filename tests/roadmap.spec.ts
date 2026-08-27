import { test, expect } from "@playwright/test";

test.describe("Roadmap Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/roadmap");
  });

  test("should display the page title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Implementation Roadmap");
  });

  test("should display overall progress", async ({ page }) => {
    await expect(page.locator("text=Overall Progress")).toBeVisible();
  });

  test("should display tech stack", async ({ page }) => {
    await page.locator("text=Tech Stack").scrollIntoViewIfNeeded();
    await expect(page.locator("text=Tech Stack")).toBeVisible();
  });

  test("should display all phases", async ({ page }) => {
    await expect(page.locator("text=Foundation")).toBeVisible();
    await expect(page.locator("text=Core Engine")).toBeVisible();
  });

  test("should display completed phases with 100%", async ({ page }) => {
    const percentText = page.locator("text=100%").first();
    await expect(percentText).toBeVisible();
  });

  test("should expand and collapse phases", async ({ page }) => {
    // Click on Foundation phase to collapse
    const foundationHeader = page.locator("text=Foundation").first();
    await foundationHeader.click();

    // Tasks should be hidden
    const task = page.locator("text=Инициализация Next.js проекта");
    await expect(task).not.toBeVisible();

    // Click again to expand
    await foundationHeader.click();
    await expect(task).toBeVisible();
  });

  test("should expand tasks to show details", async ({ page }) => {
    // Click on a task to expand
    const task = page.locator("text=Инициализация Next.js проекта");
    await task.click();

    // Should show description
    await expect(page.locator("text=App Router, TypeScript")).toBeVisible();
  });

  test("should display risk register", async ({ page }) => {
    await page.locator("text=Risk Register").scrollIntoViewIfNeeded();
    await expect(page.locator("text=Risk Register")).toBeVisible();
  });

  test("should display success metrics", async ({ page }) => {
    await page.locator("text=Success Metrics").scrollIntoViewIfNeeded();
    await expect(page.locator("text=Success Metrics")).toBeVisible();
  });

  test("should navigate to dashboard", async ({ page }) => {
    const dashboardLink = page.locator('a:has-text("Dashboard")');
    await dashboardLink.click();
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
