import { test, expect } from "@playwright/test";

test.describe("Visual Studio Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/project/test/visuals");
  });

  test("should display the page title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("AI Pre-production Studio");
  });

  test("should display all tabs", async ({ page }) => {
    await expect(page.locator('button:has-text("Thumbnails")')).toBeVisible();
    await expect(page.locator('button:has-text("Title Scoring")')).toBeVisible();
    await expect(page.locator('button:has-text("Visual Assets")')).toBeVisible();
    await expect(page.locator('button:has-text("B-Roll")')).toBeVisible();
  });

  test("should display title input", async ({ page }) => {
    const titleInput = page.locator('input[placeholder*="10 AI Tools"]');
    await expect(titleInput).toBeVisible();
  });

  test("should display topic input", async ({ page }) => {
    const topicInput = page.locator('input[placeholder*="AI productivity"]');
    await expect(topicInput).toBeVisible();
  });

  test("should switch between tabs", async ({ page }) => {
    // Click on Scoring tab
    await page.locator('button:has-text("Title Scoring")').click();
    await expect(page.locator("text=Score title")).toBeVisible();

    // Click on Visuals tab
    await page.locator('button:has-text("Visual Assets")').click();
    await expect(page.locator("text=Generate assets")).toBeVisible();

    // Click on B-Roll tab
    await page.locator('button:has-text("B-Roll")').click();
    await expect(page.locator("text=Suggest B-roll")).toBeVisible();

    // Back to Thumbnails
    await page.locator('button:has-text("Thumbnails")').click();
    await expect(page.locator("text=Generate concepts")).toBeVisible();
  });

  test("should display empty state for thumbnails", async ({ page }) => {
    await expect(page.locator("text=Enter a title and topic above")).toBeVisible();
  });

  test("should display empty state for scoring", async ({ page }) => {
    await page.locator('button:has-text("Title Scoring")').click();
    await expect(page.locator("text=Enter a title above")).toBeVisible();
  });

  test("should display empty state for visuals", async ({ page }) => {
    await page.locator('button:has-text("Visual Assets")').click();
    await expect(page.locator("text=Enter a title and topic")).toBeVisible();
  });

  test("should display empty state for broll", async ({ page }) => {
    await page.locator('button:has-text("B-Roll")').click();
    await expect(page.locator("text=Paste your script content")).toBeVisible();
  });
});
