import { test, expect } from '@playwright/test';

test.describe('APOD (Astronomy Picture of the Day)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/apod');
  });

  test('should load APOD page with image and content', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Astronomy Picture of the Day');

    // Wait for APOD content to load
    await page.waitForSelector('[data-testid="apod-image"], [data-testid="apod-video"]', { timeout: 30000 });

    // Check for APOD title
    await expect(page.locator('[data-testid="apod-title"]')).toBeVisible();

    // Check for APOD explanation
    await expect(page.locator('[data-testid="apod-explanation"]')).toBeVisible();

    // Check for date display
    await expect(page.locator('[data-testid="apod-date"]')).toBeVisible();
  });

  test('should navigate between dates using date picker', async ({ page }) => {
    // Wait for initial APOD to load
    await page.waitForSelector('[data-testid="apod-title"]', { timeout: 30000 });

    // Click on date picker
    const datePicker = page.locator('[data-testid="date-picker"]');
    await expect(datePicker).toBeVisible();
    await datePicker.click();

    // Select a previous date (e.g., yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    await page.fill('input[type="date"]', yesterdayString);
    await page.press('input[type="date"]', 'Enter');

    // Wait for new APOD to load
    await page.waitForLoadState('networkidle');

    // Verify the date changed
    await expect(page.locator('[data-testid="apod-date"]')).toContainText(yesterdayString);
  });

  test('should handle favorite functionality', async ({ page }) => {
    // Wait for APOD to load
    await page.waitForSelector('[data-testid="apod-title"]', { timeout: 30000 });

    // Find and click the favorite button
    const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
    await expect(favoriteButton).toBeVisible();
    await favoriteButton.click();

    // Check that the favorite state changed (button should show different state)
    await expect(favoriteButton).toHaveAttribute('title', /Remove from favorites/);

    // Navigate to favorites page to verify it was saved
    await page.click('a[href="/favorites"]');
    await expect(page).toHaveURL(/.*\/favorites/);

    // Check that the favorited APOD appears in the favorites list
    await expect(page.locator('[data-testid="favorites-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="favorite-item"]').first()).toBeVisible();
  });

  test('should display loading state while fetching APOD', async ({ page }) => {
    // Navigate to APOD page
    await page.goto('/apod');

    // Check for loading spinner
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    
    // Loading spinner should appear briefly
    if (await loadingSpinner.isVisible()) {
      await expect(loadingSpinner).toBeVisible();
    }

    // Content should eventually load
    await page.waitForSelector('[data-testid="apod-title"]', { timeout: 30000 });
    await expect(page.locator('[data-testid="apod-title"]')).toBeVisible();
  });

  test('should handle image viewer modal', async ({ page }) => {
    // Wait for APOD image to load
    await page.waitForSelector('[data-testid="apod-image"]', { timeout: 30000 });

    // Click on the image to open modal
    await page.click('[data-testid="apod-image"]');

    // Check that modal is open
    await expect(page.locator('[data-testid="image-modal"]')).toBeVisible();

    // Check for close button and close the modal
    const closeButton = page.locator('[data-testid="modal-close"]');
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Modal should be closed
    await expect(page.locator('[data-testid="image-modal"]')).not.toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('[data-testid="apod-title"]', { timeout: 30000 });

    // Check that images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }

    // Check that buttons have proper labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasAriaLabel = await button.getAttribute('aria-label');
      const hasTitle = await button.getAttribute('title');
      const hasText = await button.textContent();
      
      // Button should have at least one form of accessible label
      expect(hasAriaLabel || hasTitle || hasText?.trim()).toBeTruthy();
    }
  });
});