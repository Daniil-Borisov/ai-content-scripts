import { test, expect } from "@playwright/test";

test.describe("Dashboard - Auth", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe("Dashboard - New Project Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/new");
  });

  test("should display page title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("New Project");
  });

  test("should display topic input", async ({ page }) => {
    const input = page.locator('input[placeholder*="AI productivity"]');
    await expect(input).toBeVisible();
  });

  test("should display generate button", async ({ page }) => {
    const btn = page.locator('button:has-text("Generate ideas")');
    await expect(btn).toBeVisible();
  });

  test("should disable generate button when empty", async ({ page }) => {
    const btn = page.locator('button:has-text("Generate ideas")');
    await expect(btn).toBeDisabled();
  });

  test("should enable generate button with input", async ({ page }) => {
    const input = page.locator('input[placeholder*="AI productivity"]');
    await input.fill("AI tools");
    
    const btn = page.locator('button:has-text("Generate ideas")');
    await expect(btn).toBeEnabled();
  });

  test("should display empty state", async ({ page }) => {
    await expect(page.locator("text=Enter a topic above")).toBeVisible();
  });

  test("should have ScriptForge branding", async ({ page }) => {
    await expect(page.locator("text=ScriptForge").first()).toBeVisible();
  });
});

test.describe("Dashboard - Profile Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/profile");
  });

  test("should display page title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Creator Profile");
  });

  test("should display niche selection", async ({ page }) => {
    await expect(page.locator("text=Your niche")).toBeVisible();
  });

  test("should display audience input", async ({ page }) => {
    const input = page.locator("textarea#audience");
    await expect(input).toBeVisible();
  });

  test("should display tone selection", async ({ page }) => {
    await expect(page.locator("text=Tone of voice")).toBeVisible();
  });

  test("should display platform selection", async ({ page }) => {
    await expect(page.locator("text=Target platforms")).toBeVisible();
  });

  test("should allow selecting niche", async ({ page }) => {
    const btn = page.locator('button:has-text("Tech & AI")');
    await btn.click();
    await expect(btn).toHaveClass(/bg-foreground/);
  });

  test("should allow selecting tone", async ({ page }) => {
    const btn = page.locator('button:has-text("Professional")');
    await btn.click();
    await expect(btn).toHaveClass(/bg-foreground/);
  });

  test("should allow selecting platform", async ({ page }) => {
    const btn = page.locator('button:has-text("YouTube")');
    await btn.click();
    await expect(btn).toHaveClass(/bg-foreground/);
  });

  test("should display save button", async ({ page }) => {
    await expect(page.locator('button:has-text("Save profile")')).toBeVisible();
  });
});

test.describe("Dashboard - Projects Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/projects");
  });

  test("should display page title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Projects");
  });

  test("should display new project button", async ({ page }) => {
    await expect(page.locator('a:has-text("New project")')).toBeVisible();
  });

  test("should display empty state", async ({ page }) => {
    await expect(page.locator("text=No projects yet")).toBeVisible();
  });

  test("should navigate to new project", async ({ page }) => {
    await page.locator('a:has-text("New project")').click();
    await expect(page).toHaveURL(/.*dashboard\/new/);
  });
});

test.describe("Dashboard - Navigation Between Pages", () => {
  test("should navigate between dashboard pages", async ({ page }) => {
    await page.goto("/dashboard/new");
    await expect(page.locator("h1")).toContainText("New Project");

    await page.goto("/dashboard/profile");
    await expect(page.locator("h1")).toContainText("Creator Profile");

    await page.goto("/dashboard/projects");
    await expect(page.locator("h1")).toContainText("Projects");
  });
});
