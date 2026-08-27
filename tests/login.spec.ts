import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login form", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Welcome back");
  });

  test("should display Google sign-in button", async ({ page }) => {
    const googleBtn = page.locator('button:has-text("Continue with Google")');
    await expect(googleBtn).toBeVisible();
  });

  test("should display email input", async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test("should display password input", async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test("should display sign-in button", async ({ page }) => {
    const signInBtn = page.locator('button:has-text("Sign in")');
    await expect(signInBtn).toBeVisible();
  });

  test("should display sign-up link", async ({ page }) => {
    const signUpLink = page.locator('a:has-text("Sign up")');
    await expect(signUpLink).toBeVisible();
  });

  test("should navigate back to home", async ({ page }) => {
    await page.locator('a:has-text("ScriptForge")').first().click();
    await expect(page).toHaveURL("/");
  });
});
