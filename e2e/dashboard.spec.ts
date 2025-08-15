import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the dashboard with navigation and version footer', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/NASA Space Explorer/);

    // Check navigation is present
    await expect(page.locator('nav')).toBeVisible();

    // Check version footer is present
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer')).toContainText('v');

    // Check main dashboard content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to different pages via navigation', async ({ page }) => {
    // Navigate to APOD page
    await page.click('a[href="/apod"]');
    await expect(page).toHaveURL(/.*\/apod/);
    await expect(page.locator('h1')).toContainText('Astronomy Picture of the Day');

    // Navigate to Mars Rovers page
    await page.click('a[href="/mars-rovers"]');
    await expect(page).toHaveURL(/.*\/mars-rovers/);
    await expect(page.locator('h1')).toContainText('Mars Rover Photos');

    // Navigate to NEO Tracker page
    await page.click('a[href="/neo-tracker"]');
    await expect(page).toHaveURL(/.*\/neo-tracker/);
    await expect(page.locator('h1')).toContainText('Near Earth Objects');

    // Navigate back to Dashboard
    await page.click('a[href="/"]');
    await expect(page).toHaveURL(/.*\//);
  });

  test('should display data widgets on dashboard', async ({ page }) => {
    // Check for data widgets
    const widgets = page.locator('[data-testid="data-widget"]');
    await expect(widgets.first()).toBeVisible();

    // Check for metric cards
    const metrics = page.locator('[data-testid="metric-card"]');
    await expect(metrics.first()).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check navigation is still accessible (mobile hamburger menu)
    const mobileNav = page.locator('button[aria-label="Open navigation menu"]');
    if (await mobileNav.isVisible()) {
      await mobileNav.click();
      await expect(page.locator('nav')).toBeVisible();
    }

    // Check content is still visible
    await expect(page.locator('main')).toBeVisible();
  });
});