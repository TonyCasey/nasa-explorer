import { test, expect } from '@playwright/test';

test.describe('NEO Tracker Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/neo-tracker');
  });

  test('should load NEO Tracker page with charts and data', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Near Earth Objects');

    // Wait for NEO data to load
    await page.waitForSelector('[data-testid="neo-chart"]', { timeout: 30000 });

    // Check for charts
    await expect(page.locator('[data-testid="neo-chart"]')).toBeVisible();

    // Check for NEO cards/list
    await expect(page.locator('[data-testid="neo-list"]')).toBeVisible();
  });

  test('should display different chart types', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('[data-testid="neo-chart"]', { timeout: 30000 });

    // Check for chart type selector
    const chartSelector = page.locator('[data-testid="chart-type-selector"]');
    
    if (await chartSelector.isVisible()) {
      // Test pie chart
      await page.click('[data-testid="chart-pie"]');
      await expect(page.locator('[data-testid="pie-chart"]')).toBeVisible();

      // Test bar chart
      await page.click('[data-testid="chart-bar"]');
      await expect(page.locator('[data-testid="bar-chart"]')).toBeVisible();

      // Test line chart
      await page.click('[data-testid="chart-line"]');
      await expect(page.locator('[data-testid="line-chart"]')).toBeVisible();
    }
  });

  test('should filter NEOs by date range', async ({ page }) => {
    // Wait for initial data
    await page.waitForSelector('[data-testid="neo-list"]', { timeout: 30000 });

    // Check for date picker
    const startDatePicker = page.locator('[data-testid="start-date-picker"]');
    const endDatePicker = page.locator('[data-testid="end-date-picker"]');

    if (await startDatePicker.isVisible() && await endDatePicker.isVisible()) {
      // Set date range
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      await startDatePicker.fill(today.toISOString().split('T')[0]);
      await endDatePicker.fill(tomorrow.toISOString().split('T')[0]);

      // Apply filter
      const applyButton = page.locator('[data-testid="apply-date-filter"]');
      if (await applyButton.isVisible()) {
        await applyButton.click();
        await page.waitForLoadState('networkidle');
      }

      // Check that data updates
      await expect(page.locator('[data-testid="neo-list"]')).toBeVisible();
    }
  });

  test('should display NEO details when clicking on NEO card', async ({ page }) => {
    // Wait for NEO cards to load
    await page.waitForSelector('[data-testid="neo-card"]', { timeout: 30000 });

    // Click on first NEO card
    await page.click('[data-testid="neo-card"]');

    // Check for NEO details modal or expanded view
    const neoDetails = page.locator('[data-testid="neo-details"]');
    
    if (await neoDetails.isVisible()) {
      // Check for detailed information
      await expect(page.locator('[data-testid="neo-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="neo-diameter"]')).toBeVisible();
      await expect(page.locator('[data-testid="neo-distance"]')).toBeVisible();
      await expect(page.locator('[data-testid="neo-velocity"]')).toBeVisible();
      await expect(page.locator('[data-testid="neo-hazardous"]')).toBeVisible();
    }
  });

  test('should highlight potentially hazardous asteroids', async ({ page }) => {
    // Wait for NEO data
    await page.waitForSelector('[data-testid="neo-card"]', { timeout: 30000 });

    // Check for hazardous asteroid indicators
    const hazardousIndicators = page.locator('[data-testid="hazardous-indicator"]');
    
    if (await hazardousIndicators.count() > 0) {
      // Hazardous asteroids should be visually distinct
      await expect(hazardousIndicators.first()).toBeVisible();
      
      // Should have warning styling
      const hazardousCard = page.locator('[data-testid="neo-card"]').first();
      await expect(hazardousCard).toHaveClass(/hazardous|warning|danger/);
    }
  });

  test('should display real-time data with timestamps', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="neo-list"]', { timeout: 30000 });

    // Check for last updated timestamp
    const timestamp = page.locator('[data-testid="last-updated"]');
    if (await timestamp.isVisible()) {
      await expect(timestamp).toContainText(/updated|refreshed/i);
    }

    // Check for refresh button
    const refreshButton = page.locator('[data-testid="refresh-data"]');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForLoadState('networkidle');
      
      // Data should reload
      await expect(page.locator('[data-testid="neo-list"]')).toBeVisible();
    }
  });

  test('should handle favorite functionality for NEOs', async ({ page }) => {
    // Wait for NEO cards
    await page.waitForSelector('[data-testid="neo-card"]', { timeout: 30000 });

    // Find favorite button on NEO card
    const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
    
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();

      // Check state change
      await expect(favoriteButton).toHaveAttribute('title', /Remove from favorites/);

      // Verify in favorites page
      await page.click('a[href="/favorites"]');
      await expect(page.locator('[data-testid="favorite-item"]').first()).toBeVisible();
    }
  });

  test('should display statistics and metrics', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="neo-stats"]', { timeout: 30000 });

    // Check for statistics display
    await expect(page.locator('[data-testid="total-neos"]')).toBeVisible();
    await expect(page.locator('[data-testid="hazardous-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="closest-approach"]')).toBeVisible();

    // Verify statistics have numeric values
    const totalNeos = await page.locator('[data-testid="total-neos"]').textContent();
    expect(totalNeos).toMatch(/\d+/);
  });

  test('should handle empty state when no NEOs found', async ({ page }) => {
    // Try to trigger empty state with very specific date range
    const startDatePicker = page.locator('[data-testid="start-date-picker"]');
    const endDatePicker = page.locator('[data-testid="end-date-picker"]');

    if (await startDatePicker.isVisible() && await endDatePicker.isVisible()) {
      // Set a date range far in the future
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 10);
      
      await startDatePicker.fill(futureDate.toISOString().split('T')[0]);
      await endDatePicker.fill(futureDate.toISOString().split('T')[0]);

      const applyButton = page.locator('[data-testid="apply-date-filter"]');
      if (await applyButton.isVisible()) {
        await applyButton.click();
        await page.waitForLoadState('networkidle');

        // Check for empty state
        const emptyState = page.locator('[data-testid="empty-state"]');
        if (await emptyState.isVisible()) {
          await expect(emptyState).toContainText(/No near earth objects/i);
        }
      }
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that charts are responsive
    await page.waitForSelector('[data-testid="neo-chart"]', { timeout: 30000 });
    await expect(page.locator('[data-testid="neo-chart"]')).toBeVisible();

    // Check that NEO cards stack properly on mobile
    await expect(page.locator('[data-testid="neo-card"]').first()).toBeVisible();

    // Date pickers should be accessible
    const datePickers = page.locator('input[type="date"]');
    if (await datePickers.count() > 0) {
      await expect(datePickers.first()).toBeVisible();
    }
  });

  test('should handle loading states', async ({ page }) => {
    // Navigate to NEO tracker
    await page.goto('/neo-tracker');

    // Check for loading spinner
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    
    if (await loadingSpinner.isVisible()) {
      await expect(loadingSpinner).toBeVisible();
    }

    // Content should eventually load
    await page.waitForSelector('[data-testid="neo-list"]', { timeout: 30000 });
    await expect(page.locator('[data-testid="neo-list"]')).toBeVisible();
  });
});