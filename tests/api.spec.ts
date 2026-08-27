import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("should return 401 for protected POST endpoints without auth", async ({
    request,
  }) => {
    const endpoints = [
      "/api/generate/ideas",
      "/api/generate/research",
      "/api/generate/script",
      "/api/generate/pack",
      "/api/generate/thumbnails",
      "/api/generate/scoring",
      "/api/generate/visuals",
      "/api/generate/broll",
      "/api/feedback",
    ];

    for (const endpoint of endpoints) {
      const response = await request.post(endpoint, {
        data: {},
      });
      expect(response.status()).toBe(401);
    }
  });

  test("should return 401 for GET protected endpoints without auth", async ({
    request,
  }) => {
    const endpoints = ["/api/credits", "/api/projects"];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(401);
    }
  });

  test("should return job status endpoint", async ({ request }) => {
    const response = await request.get("/api/jobs/status?jobId=test");
    expect(response.status()).toBe(401);
  });

  test("should return job stream endpoint", async ({ request }) => {
    const response = await request.get("/api/jobs/stream?jobId=test");
    expect(response.status()).toBe(401);
  });
});

test.describe("Checkout API", () => {
  test("should return 401 without auth", async ({ request }) => {
    const response = await request.post("/api/checkout", {
      data: { pack: "starter" },
    });
    expect(response.status()).toBe(401);
  });
});

test.describe("Credits API", () => {
  test("should return 401 for deduct without auth", async ({ request }) => {
    const response = await request.post("/api/credits/deduct", {
      data: { amount: 1 },
    });
    expect(response.status()).toBe(401);
  });
});
