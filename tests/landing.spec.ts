import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the main heading", async ({ page }) => {
    const heading = page.locator("h1");
    await expect(heading).toContainText("From idea to publish-ready scripts");
  });

  test("should display the CTA button", async ({ page }) => {
    const cta = page.locator('a:has-text("Get started")').first();
    await expect(cta).toBeVisible();
  });

  test("should display platform cards", async ({ page }) => {
    await page.locator("#platforms").scrollIntoViewIfNeeded();
    const cards = page.locator("#platforms .bg-card");
    await expect(cards).toHaveCount(5);
  });

  test("should display how it works section", async ({ page }) => {
    await page.locator("#how-it-works").scrollIntoViewIfNeeded();
    const steps = page.locator("#how-it-works .border");
    await expect(steps.first()).toBeVisible();
  });

  test("should display pricing section", async ({ page }) => {
    await page.locator("#pricing").scrollIntoViewIfNeeded();
    const packs = page.locator("#pricing .bg-card, #pricing .bg-surface");
    await expect(packs).toHaveCount(4);
  });

  test("should display testimonials", async ({ page }) => {
    const testimonials = page.locator("text=Creators love it");
    await expect(testimonials).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.locator('a:has-text("Sign in")').first().click();
    await expect(page).toHaveURL(/.*login/);
  });

  test("should have working navigation links", async ({ page }) => {
    const howItWorksLink = page.locator('a:has-text("How it Works")').first();
    await howItWorksLink.click();
    await expect(page.locator("#how-it-works")).toBeVisible();
  });
});
