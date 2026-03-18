import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validFixturePath = path.join(__dirname, "fixtures", "valid-pattern.md");
const invalidFixturePath = path.join(
  __dirname,
  "fixtures",
  "invalid-pattern.md",
);

const emptyListResponse = {
  data: [],
  total: 0,
  page: 1,
  page_size: 20,
};

const importedPatternResponse = {
  id: "imported-pattern-id",
  name: "Test Pattern",
  description: "A test pattern for E2E verification",
  tags: [],
  version: "1.0.0",
  enriched: false,
  created_at: "2026-03-18T00:00:00Z",
  updated_at: "2026-03-18T00:00:00Z",
  content: "## Overview\n\nTest content.",
  agent_associations: [],
  related_patterns: [],
};

test("successful import path", async ({ page }) => {
  await page.route(/\/v1\/api\/patterns(\?.*)?$/, (route) => {
    const method = route.request().method();
    if (method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyListResponse),
      });
    }
    if (method === "POST") {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(importedPatternResponse),
      });
    }
    return route.continue();
  });

  await page.goto("/");

  await page.getByRole("button", { name: "Import Pattern" }).click();

  await expect(
    page.getByRole("heading", { name: /import pattern/i }),
  ).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles(validFixturePath);

  await expect(page.getByText(/ready to import/i)).toBeVisible();

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText(/import successful/i)).toBeVisible();
});

test("validation failure path", async ({ page }) => {
  await page.route(/\/v1\/api\/patterns(\?.*)?$/, (route) => {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(emptyListResponse),
    });
  });

  await page.goto("/");

  await page.getByRole("button", { name: "Import Pattern" }).click();

  await page.locator('input[type="file"]').setInputFiles(invalidFixturePath);

  const feedbackSection = page.locator(
    'section[aria-label="Validation feedback"]',
  );
  await expect(feedbackSection).toContainText(/overview|decorator|pattern/i);

  await expect(page.getByRole("button", { name: "Submit" })).not.toBeVisible();
});
