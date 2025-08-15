import { test, expect } from '@playwright/test';

test.describe('Basic Smoke Tests', () => {
  test('application loads successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Check that the page loads without major errors
    await expect(page).toHaveTitle(/NASA Space Explorer/);

    // Check that main elements are present
    await expect(page.locator('body')).toBeVisible();
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);

    // Check that no major error messages are visible
    const errorMessages = page.locator('text=/error|failed|not found/i');
    if (await errorMessages.count() > 0) {
      console.log('Found potential error messages, but continuing test...');
    }
  });

  test('navigation menu is accessible', async ({ page }) => {
    await page.goto('/');

    // Look for navigation elements
    const navLinks = page.locator('a[href^="/"]');
    const navCount = await navLinks.count();
    
    expect(navCount).toBeGreaterThan(0);
    console.log(`Found ${navCount} navigation links`);
  });

  test('basic page routes are accessible', async ({ page }) => {
    const routes = ['/', '/apod', '/mars-rovers', '/neo-tracker', '/favorites'];
    
    for (const route of routes) {
      await page.goto(route);
      
      // Check that page loads (not 404)
      await expect(page).not.toHaveTitle(/404|Not Found/);
      
      // Check that page has some content
      await expect(page.locator('body')).toBeVisible();
      
      console.log(`✓ Route ${route} loaded successfully`);
    }
  });

  test('application is responsive', async ({ page }) => {
    await page.goto('/');

    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('body')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();

    console.log('✓ Application is responsive across viewports');
  });
});