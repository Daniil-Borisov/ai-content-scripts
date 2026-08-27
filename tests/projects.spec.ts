import { test, expect } from "@playwright/test";

test.describe("Projects Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/projects");
  });

  test("should display the page title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Projects");
  });

  test("should display new project button", async ({ page }) => {
    const newBtn = page.locator('a:has-text("New project")');
    await expect(newBtn).toBeVisible();
  });

  test("should display empty state when no projects", async ({ page }) => {
    await expect(page.locator("text=No projects yet")).toBeVisible();
  });

  test("should have working new project link", async ({ page }) => {
    const newBtn = page.locator('a:has-text("New project")');
    await newBtn.click();
    await expect(page).toHaveURL(/.*dashboard\/new/);
  });
});

test.describe("Content Pack Page", () => {
  test("should display platform selection", async ({ page }) => {
    await page.goto("/dashboard/project/test/pack");
    await expect(page.locator("h1")).toContainText("Content Pack");
  });

  test("should display all platform options", async ({ page }) => {
    await page.goto("/dashboard/project/test/pack");
    await expect(page.locator("text=YouTube")).toBeVisible();
    await expect(page.locator("text=TikTok")).toBeVisible();
    await expect(page.locator("text=Reels")).toBeVisible();
    await expect(page.locator("text=Shorts")).toBeVisible();
    await expect(page.locator("text=Instagram")).toBeVisible();
    await expect(page.locator("text=LinkedIn")).toBeVisible();
    await expect(page.locator("text=X / Threads")).toBeVisible();
  });

  test("should allow selecting platforms", async ({ page }) => {
    await page.goto("/dashboard/project/test/pack");
    const youtubeBtn = page.locator('button:has-text("YouTube")');
    await youtubeBtn.click();
    await expect(youtubeBtn).toHaveClass(/bg-foreground/);
  });

  test("should show generate button with count", async ({ page }) => {
    await page.goto("/dashboard/project/test/pack");
    const youtubeBtn = page.locator('button:has-text("YouTube")');
    await youtubeBtn.click();
    const generateBtn = page.locator('button:has-text("Generate 1 script")');
    await expect(generateBtn).toBeVisible();
  });
});
