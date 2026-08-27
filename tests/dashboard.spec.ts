import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe("New Project Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/new");
  });

  test("should display the page title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("New Project");
  });

  test("should display topic input", async ({ page }) => {
    const topicInput = page.locator('input[placeholder*="AI productivity"]');
    await expect(topicInput).toBeVisible();
  });

  test("should display generate button", async ({ page }) => {
    const generateBtn = page.locator('button:has-text("Generate ideas")');
    await expect(generateBtn).toBeVisible();
  });

  test("should disable generate button when topic is empty", async ({ page }) => {
    const generateBtn = page.locator('button:has-text("Generate ideas")');
    await expect(generateBtn).toBeDisabled();
  });

  test("should enable generate button when topic is entered", async ({ page }) => {
    const topicInput = page.locator('input[placeholder*="AI productivity"]');
    await topicInput.fill("AI tools");
    const generateBtn = page.locator('button:has-text("Generate ideas")');
    await expect(generateBtn).toBeEnabled();
  });

  test("should display empty state", async ({ page }) => {
    await expect(page.locator("text=Enter a topic above")).toBeVisible();
  });
});

test.describe("Creator Profile Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/profile");
  });

  test("should display the page title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Creator Profile");
  });

  test("should display niche selection", async ({ page }) => {
    await expect(page.locator("text=Your niche")).toBeVisible();
  });

  test("should display audience input", async ({ page }) => {
    const audienceInput = page.locator("textarea#audience");
    await expect(audienceInput).toBeVisible();
  });

  test("should display tone selection", async ({ page }) => {
    await expect(page.locator("text=Tone of voice")).toBeVisible();
  });

  test("should display platform selection", async ({ page }) => {
    await expect(page.locator("text=Target platforms")).toBeVisible();
  });

  test("should allow selecting a niche", async ({ page }) => {
    const nicheBtn = page.locator('button:has-text("Tech & AI")');
    await nicheBtn.click();
    await expect(nicheBtn).toHaveClass(/bg-foreground/);
  });

  test("should allow selecting a tone", async ({ page }) => {
    const toneBtn = page.locator('button:has-text("Professional")');
    await toneBtn.click();
    await expect(toneBtn).toHaveClass(/bg-foreground/);
  });

  test("should allow selecting platforms", async ({ page }) => {
    const youtubeBtn = page.locator('button:has-text("YouTube")');
    await youtubeBtn.click();
    await expect(youtubeBtn).toHaveClass(/bg-foreground/);
  });

  test("should display save button", async ({ page }) => {
    const saveBtn = page.locator('button:has-text("Save profile")');
    await expect(saveBtn).toBeVisible();
  });
});
