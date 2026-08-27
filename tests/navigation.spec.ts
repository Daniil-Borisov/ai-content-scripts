import { test, expect } from "@playwright/test";

test.describe("Responsive Design", () => {
  test("should display mobile menu on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    // Mobile menu button should be visible
    const menuBtn = page.locator("button").filter({ has: page.locator("svg") }).last();
    await expect(menuBtn).toBeVisible();
  });

  test("should hide desktop nav on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    // Desktop nav should be hidden
    const desktopNav = page.locator("ul.hidden.md\\:flex");
    await expect(desktopNav).not.toBeVisible();
  });

  test("should display pricing cards in grid on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.locator("#pricing").scrollIntoViewIfNeeded();

    const cards = page.locator("#pricing .bg-card, #pricing .bg-surface");
    await expect(cards).toHaveCount(4);
  });

  test("should display platform cards in grid on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.locator("#platforms").scrollIntoViewIfNeeded();

    const cards = page.locator("#platforms .bg-card");
    await expect(cards).toHaveCount(5);
  });
});

test.describe("Navigation", () => {
  test("should navigate between pages", async ({ page }) => {
    // Start at home
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("From idea to publish-ready");

    // Go to login
    await page.locator('a:has-text("Sign in")').first().click();
    await expect(page).toHaveURL(/.*login/);

    // Go back to home
    await page.locator('a:has-text("ScriptForge")').first().click();
    await expect(page).toHaveURL("/");
  });

  test("should navigate to roadmap", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page.locator("h1")).toContainText("Implementation Roadmap");
  });

  test("should navigate to new project", async ({ page }) => {
    await page.goto("/dashboard/new");
    await expect(page.locator("h1")).toContainText("New Project");
  });

  test("should navigate to profile", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await expect(page.locator("h1")).toContainText("Creator Profile");
  });
});

test.describe("Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
  });

  test("should have alt text on images", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).toBeTruthy();
    }
  });

  test("should have proper link text", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("a");
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const text = await links.nth(i).textContent();
      const ariaLabel = await links.nth(i).getAttribute("aria-label");
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
