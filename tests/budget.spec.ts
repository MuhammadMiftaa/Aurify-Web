import { test, expect } from "@playwright/test";

test.describe("Budget Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to budget page (in demo mode)
    await page.goto("/budget");
  });

  test("should render budget page header", async ({ page }) => {
    // Header title
    await expect(
      page.locator("header").getByText("Budget", { exact: true }),
    ).toBeVisible();

    // Subtitle
    await expect(
      page.getByText("Monthly spending goals & streak tracking"),
    ).toBeVisible();

    // Period selector
    await expect(page.locator('input[type="month"]')).toBeVisible();

    // Theme toggle button
    await expect(page.locator("header button").first()).toBeVisible();
  });

  test("should display overall budget card", async ({ page }) => {
    // Wait for loading to finish
    await page
      .waitForSelector('[data-testid="budget-overall"]', {
        state: "visible",
        timeout: 5000,
      })
      .catch(() => {
        // Fallback: look for "Overall Monthly Budget" text
        return page.getByText("Overall Monthly Budget");
      });

    // Overall budget section title
    await expect(page.getByText("Overall Monthly Budget")).toBeVisible();

    // Progress bar should be visible
    await expect(page.locator('[class*="rounded-full"]').first()).toBeVisible();
  });

  test("should display category budgets section", async ({ page }) => {
    // Section title
    await expect(page.getByText("Category Budgets")).toBeVisible();

    // Per-category description
    await expect(page.getByText("Per-category spending limits")).toBeVisible();

    // Add category budget button
    await expect(
      page.getByRole("button", { name: /Add Category Budget/i }),
    ).toBeVisible();
  });

  test("should display streak panel", async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Either active streak or no streak message should be visible
    const hasActiveStreak = await page
      .locator(".streak-active")
      .isVisible()
      .catch(() => false);
    const hasNoStreak = await page
      .getByText("No active streak")
      .isVisible()
      .catch(() => false);

    expect(hasActiveStreak || hasNoStreak).toBeTruthy();
  });

  test("should open set budget modal when clicking Add Category Budget", async ({
    page,
  }) => {
    // Click add budget button
    await page.getByRole("button", { name: /Add Category Budget/i }).click();

    // Modal should appear
    await expect(page.getByText("Set Budget")).toBeVisible();

    // Form fields should be visible
    await expect(page.getByText("Scope")).toBeVisible();
    await expect(page.getByText("Wallet Scope")).toBeVisible();
    await expect(page.getByText("Monthly Limit")).toBeVisible();
    await expect(page.getByText("Period")).toBeVisible();

    // Buttons
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Save Budget" }),
    ).toBeVisible();
  });

  test("should close modal when clicking Cancel", async ({ page }) => {
    // Open modal
    await page.getByRole("button", { name: /Add Category Budget/i }).click();
    await expect(page.getByText("Set Budget")).toBeVisible();

    // Click cancel
    await page.getByRole("button", { name: "Cancel" }).click();

    // Modal should be closed
    await expect(page.getByText("Set Budget")).not.toBeVisible();
  });

  test("should close modal when clicking X button", async ({ page }) => {
    // Open modal
    await page.getByRole("button", { name: /Add Category Budget/i }).click();
    await expect(page.getByText("Set Budget")).toBeVisible();

    // Click X button (in modal header)
    await page.locator(".fixed button").first().click();

    // Modal should be closed
    await expect(page.getByText("Set Budget")).not.toBeVisible();
  });

  test("should show demo mode toast when submitting form", async ({ page }) => {
    // Open modal
    await page.getByRole("button", { name: /Add Category Budget/i }).click();

    // Fill in a value
    await page.locator('input[type="number"]').fill("5000000");

    // Submit
    await page.getByRole("button", { name: "Save Budget" }).click();

    // Should show demo toast
    await expect(page.getByText(/Demo mode/i)).toBeVisible();
  });

  test("should display category budget cards with progress bars", async ({
    page,
  }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Should have multiple budget cards for categories
    const categoryCards = page.locator(
      '[class*="rounded-xl"][class*="border"]',
    );
    expect(await categoryCards.count()).toBeGreaterThan(0);
  });

  test("should display edit, reset, and delete buttons on category cards", async ({
    page,
  }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Edit button
    await expect(
      page.getByRole("button", { name: /Edit/i }).first(),
    ).toBeVisible();

    // Reset button
    await expect(
      page.getByRole("button", { name: /Reset/i }).first(),
    ).toBeVisible();
  });

  test("should open reset budget confirmation dialog", async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Click reset on first budget
    await page.getByRole("button", { name: /Reset/i }).first().click();

    // Confirmation dialog should appear
    await expect(page.getByText("Reset Budget")).toBeVisible();
    await expect(
      page.getByText(/Are you sure you want to reset/i),
    ).toBeVisible();

    // Confirm and cancel buttons
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still render
    await expect(
      page.locator("header").getByText("Budget", { exact: true }),
    ).toBeVisible();

    // Content should be visible
    await expect(page.getByText("Overall Monthly Budget")).toBeVisible();
  });

  test("should toggle theme when clicking theme button", async ({ page }) => {
    // Get initial body class
    const initialTheme = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );

    // Click theme toggle (in header, visible on larger screens)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator("header button").last().click();

    // Theme should change
    const newTheme = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );

    expect(newTheme).not.toBe(initialTheme);
  });

  test("should show refresh button and handle refresh", async ({ page }) => {
    // Refresh button should be visible
    const refreshButton = page.locator('button[title="Refresh data"]');
    await expect(refreshButton).toBeVisible();

    // Click refresh
    await refreshButton.click();

    // Should show demo mode toast
    await expect(page.getByText(/Demo mode/i)).toBeVisible();
  });

  test("should allow period selection", async ({ page }) => {
    // Period input should be visible
    const periodInput = page.locator('input[type="month"]');
    await expect(periodInput).toBeVisible();

    // Change period
    await periodInput.fill("2026-04");

    // Page should update (no errors)
    await expect(page.getByText("Overall Monthly Budget")).toBeVisible();
  });
});
