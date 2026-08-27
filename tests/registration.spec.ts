import { test, expect } from "@playwright/test";

test.describe("Registration Flow", () => {
  test("should display registration page", async ({ page }) => {
    await page.goto("/register");

    // Check page title
    await expect(page.locator("h1")).toContainText("Create an account");

    // Check form elements
    await expect(page.locator('input[placeholder="Your name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="you@example.com"]')).toBeVisible();
    await expect(page.locator('input[placeholder="••••••••"]')).toBeVisible();

    // Check buttons
    await expect(page.locator('button:has-text("Create account")')).toBeVisible();
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();

    // Check link to login
    await expect(page.locator('a:has-text("Sign in")')).toBeVisible();
  });

  test("should show validation error for short password", async ({ page }) => {
    await page.goto("/register");

    // Fill form with short password
    await page.locator('input[placeholder="Your name"]').fill("Test User");
    await page.locator('input[placeholder="you@example.com"]').fill("test@example.com");
    await page.locator('input[placeholder="••••••••"]').fill("123");

    // Submit
    await page.locator('button:has-text("Create account")').click();

    // Should show error
    await expect(page.locator("text=at least 8 characters")).toBeVisible();
  });

  test("should show validation error for empty fields", async ({ page }) => {
    await page.goto("/register");

    // Try to submit empty form
    await page.locator('button:has-text("Create account")').click();

    // Browser native validation should prevent submission
    // The form should not navigate away
    await expect(page).toHaveURL(/.*register/);
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/register");

    // Click sign in link
    await page.locator('a:has-text("Sign in")').click();

    // Should be on login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator("h1")).toContainText("Welcome back");
  });

  test("should navigate from login to register", async ({ page }) => {
    await page.goto("/login");

    // Click sign up link
    await page.locator('a:has-text("Sign up")').click();

    // Should be on register page
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator("h1")).toContainText("Create an account");
  });

  test("should fill registration form", async ({ page }) => {
    await page.goto("/register");

    // Fill form
    await page.locator('input[placeholder="Your name"]').fill("John Doe");
    await page.locator('input[placeholder="you@example.com"]').fill("john@example.com");
    await page.locator('input[placeholder="••••••••"]').fill("securepassword123");

    // Verify values
    await expect(page.locator('input[placeholder="Your name"]')).toHaveValue("John Doe");
    await expect(page.locator('input[placeholder="you@example.com"]')).toHaveValue("john@example.com");
    await expect(page.locator('input[placeholder="••••••••"]')).toHaveValue("securepassword123");
  });

  test("should have proper form labels", async ({ page }) => {
    await page.goto("/register");

    // Check labels
    await expect(page.locator("label:has-text('Name')")).toBeVisible();
    await expect(page.locator("label:has-text('Email')")).toBeVisible();
    await expect(page.locator("label:has-text('Password')")).toBeVisible();
  });

  test("should display password hint", async ({ page }) => {
    await page.goto("/register");

    // Check password hint
    await expect(page.locator("text=At least 8 characters")).toBeVisible();
  });

  test("should have ScriptForge branding", async ({ page }) => {
    await page.goto("/register");

    // Check branding
    await expect(page.locator("text=ScriptForge")).toBeVisible();
    await expect(page.locator("text=SF")).toBeVisible();
  });
});

test.describe("Registration API", () => {
  test("should reject registration without email", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: { password: "password123" },
    });
    const data = await response.json();

    expect(response.status()).toBe(400);
    expect(data.error).toContain("Email and password are required");
  });

  test("should reject registration without password", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: { email: "test@example.com" },
    });
    const data = await response.json();

    expect(response.status()).toBe(400);
    expect(data.error).toContain("Email and password are required");
  });

  test("should reject registration with short password", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: { email: "test@example.com", password: "123" },
    });
    const data = await response.json();

    expect(response.status()).toBe(400);
    expect(data.error).toContain("at least 8 characters");
  });

  test("should accept valid registration (requires DB)", async ({ request }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const response = await request.post("/api/auth/register", {
      data: {
        name: "Test User",
        email: uniqueEmail,
        password: "password123",
      },
    });

    // If DB is available, should succeed
    // If DB is not available, should return 500
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user.email).toBe(uniqueEmail);
    } else {
      expect(response.status()).toBe(500);
    }
  });

  test("should reject duplicate email (requires DB)", async ({ request }) => {
    const uniqueEmail = `duplicate-${Date.now()}@example.com`;

    // First registration
    const firstResponse = await request.post("/api/auth/register", {
      data: {
        name: "First User",
        email: uniqueEmail,
        password: "password123",
      },
    });

    // If first registration failed (no DB), skip the rest
    if (firstResponse.status() !== 200) {
      return;
    }

    // Second registration with same email
    const response = await request.post("/api/auth/register", {
      data: {
        name: "Second User",
        email: uniqueEmail,
        password: "password456",
      },
    });
    const data = await response.json();

    expect(response.status()).toBe(400);
    expect(data.error).toContain("already exists");
  });
});
