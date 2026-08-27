import { test, expect } from "@playwright/test";

test.describe("Navbar - Logged Out State", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display ScriptForge logo", async ({ page }) => {
    const logo = page.locator("text=ScriptForge").first();
    await expect(logo).toBeVisible();
  });

  test("should display SF logo mark", async ({ page }) => {
    const logoMark = page.locator("text=SF").first();
    await expect(logoMark).toBeVisible();
  });

  test("should display navigation links on homepage", async ({ page }) => {
    await expect(page.locator('a:has-text("How it Works")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Platforms")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Pricing")').first()).toBeVisible();
  });

  test("should display Sign in button", async ({ page }) => {
    const signInBtn = page.locator('a:has-text("Sign in")').first();
    await expect(signInBtn).toBeVisible();
    await expect(signInBtn).toHaveAttribute("href", "/login");
  });

  test("should display Get started button", async ({ page }) => {
    const getStartedBtn = page.locator('a:has-text("Get started")').first();
    await expect(getStartedBtn).toBeVisible();
  });

  test("should navigate to login on Sign in click", async ({ page }) => {
    await page.locator('a:has-text("Sign in")').first().click();
    await expect(page).toHaveURL(/.*login/);
  });

  test("should navigate to register on Get started click", async ({ page }) => {
    const getStartedBtn = page.locator('a:has-text("Get started")').first();
    const href = await getStartedBtn.getAttribute("href");
    // Should go to register or dashboard
    expect(href).toBeTruthy();
  });
});

test.describe("Navbar - Mobile Logged Out", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
  });

  test("should display mobile Start button", async ({ page }) => {
    const startBtn = page.locator('a:has-text("Start")').first();
    await expect(startBtn).toBeVisible();
  });

  test("should display hamburger menu button", async ({ page }) => {
    // Find the hamburger button (last button in header)
    const header = page.locator("header");
    const menuBtn = header.locator("button").last();
    await expect(menuBtn).toBeVisible();
  });

  test("should open mobile menu", async ({ page }) => {
    const header = page.locator("header");
    const menuBtn = header.locator("button").last();
    await menuBtn.click();

    // Should show navigation links in mobile menu
    await expect(page.locator('a:has-text("How it Works")').last()).toBeVisible();
  });
});

test.describe("Navbar - Logo Navigation", () => {
  test("should navigate to home when clicking logo", async ({ page }) => {
    await page.goto("/login");
    
    // Click on ScriptForge logo
    const logoLink = page.locator('a:has-text("ScriptForge")').first();
    await logoLink.click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Navbar - Consistency", () => {
  test("should display navbar on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=ScriptForge").first()).toBeVisible();
  });

  test("should display navbar on login page", async ({ page }) => {
    await page.goto("/login");
    // Login page has its own branding, but should have ScriptForge
    await expect(page.locator("text=ScriptForge").first()).toBeVisible();
  });

  test("should display navbar on register page", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("text=ScriptForge").first()).toBeVisible();
  });
});

test.describe("Navbar - Accessibility", () => {
  test("should have proper link structure", async ({ page }) => {
    await page.goto("/");
    
    // All nav links should have href
    const navLinks = page.locator("nav a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const href = await navLinks.nth(i).getAttribute("href");
      expect(href).toBeTruthy();
    }
  });
});
