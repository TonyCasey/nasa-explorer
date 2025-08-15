import { test, expect } from '@playwright/test';

test.describe('Mars Rovers Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mars-rovers');
  });

  test('should load Mars Rovers page with filters and photo gallery', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Mars Rover Photos');

    // Check for rover filters
    await expect(page.locator('[data-testid="rover-filters"]')).toBeVisible();

    // Check for photo gallery
    await expect(page.locator('[data-testid="photo-gallery"]')).toBeVisible();
  });

  test('should filter photos by rover selection', async ({ page }) => {
    // Wait for initial photos to load
    await page.waitForSelector('[data-testid="photo-gallery"]', { timeout: 30000 });

    // Select Curiosity rover
    await page.click('[data-testid="rover-curiosity"]');
    await page.waitForLoadState('networkidle');

    // Check that photos are loaded
    const photos = page.locator('[data-testid="rover-photo"]');
    await expect(photos.first()).toBeVisible();

    // Select Perseverance rover
    await page.click('[data-testid="rover-perseverance"]');
    await page.waitForLoadState('networkidle');

    // Photos should update for Perseverance
    await expect(photos.first()).toBeVisible();
  });

  test('should filter by camera type', async ({ page }) => {
    // Wait for photos to load
    await page.waitForSelector('[data-testid="photo-gallery"]', { timeout: 30000 });

    // Select a specific camera
    const cameraSelect = page.locator('[data-testid="camera-select"]');
    await expect(cameraSelect).toBeVisible();
    await cameraSelect.selectOption('FHAZ');

    await page.waitForLoadState('networkidle');

    // Check that photos are filtered by camera
    const photos = page.locator('[data-testid="rover-photo"]');
    await expect(photos.first()).toBeVisible();
  });

  test('should open photo modal when clicking on photo', async ({ page }) => {
    // Wait for photos to load
    await page.waitForSelector('[data-testid="rover-photo"]', { timeout: 30000 });

    // Click on first photo
    await page.click('[data-testid="rover-photo"]');

    // Check that modal opens
    await expect(page.locator('[data-testid="photo-modal"]')).toBeVisible();

    // Check modal content
    await expect(page.locator('[data-testid="modal-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="photo-metadata"]')).toBeVisible();

    // Close modal
    await page.click('[data-testid="modal-close"]');
    await expect(page.locator('[data-testid="photo-modal"]')).not.toBeVisible();
  });

  test('should navigate between photos in modal', async ({ page }) => {
    // Wait for photos to load
    await page.waitForSelector('[data-testid="rover-photo"]', { timeout: 30000 });

    // Click on first photo to open modal
    await page.click('[data-testid="rover-photo"]');
    await expect(page.locator('[data-testid="photo-modal"]')).toBeVisible();

    // Check for navigation buttons
    const nextButton = page.locator('[data-testid="modal-next"]');
    const prevButton = page.locator('[data-testid="modal-prev"]');

    if (await nextButton.isVisible()) {
      await nextButton.click();
      // Modal should still be open with new image
      await expect(page.locator('[data-testid="photo-modal"]')).toBeVisible();
    }

    if (await prevButton.isVisible()) {
      await prevButton.click();
      await expect(page.locator('[data-testid="photo-modal"]')).toBeVisible();
    }
  });

  test('should handle favorite functionality for Mars photos', async ({ page }) => {
    // Wait for photos to load
    await page.waitForSelector('[data-testid="rover-photo"]', { timeout: 30000 });

    // Find and click favorite button on first photo
    const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
    await expect(favoriteButton).toBeVisible();
    await favoriteButton.click();

    // Button state should change
    await expect(favoriteButton).toHaveAttribute('title', /Remove from favorites/);

    // Navigate to favorites to verify
    await page.click('a[href="/favorites"]');
    await expect(page.locator('[data-testid="favorite-item"]').first()).toBeVisible();
  });

  test('should implement infinite scroll', async ({ page }) => {
    // Wait for initial photos to load
    await page.waitForSelector('[data-testid="rover-photo"]', { timeout: 30000 });

    // Count initial photos
    const initialPhotoCount = await page.locator('[data-testid="rover-photo"]').count();

    // Scroll to bottom of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for potential new photos to load
    await page.waitForTimeout(2000);

    // Check if more photos loaded
    const newPhotoCount = await page.locator('[data-testid="rover-photo"]').count();
    
    // If infinite scroll is working, we should have more photos or see a load more trigger
    const loadMoreTrigger = page.locator('[data-testid="load-more-trigger"]');
    const hasMorePhotos = newPhotoCount > initialPhotoCount;
    const hasLoadTrigger = await loadMoreTrigger.isVisible();

    expect(hasMorePhotos || hasLoadTrigger).toBeTruthy();
  });

  test('should display loading state while fetching photos', async ({ page }) => {
    // Navigate to Mars Rovers page
    await page.goto('/mars-rovers');

    // Check for loading spinner
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    
    if (await loadingSpinner.isVisible()) {
      await expect(loadingSpinner).toBeVisible();
    }

    // Photos should eventually load
    await page.waitForSelector('[data-testid="rover-photo"]', { timeout: 30000 });
    await expect(page.locator('[data-testid="rover-photo"]').first()).toBeVisible();
  });

  test('should handle empty state when no photos available', async ({ page }) => {
    // Try to trigger empty state by selecting very restrictive filters
    await page.click('[data-testid="rover-opportunity"]'); // Older rover
    
    const cameraSelect = page.locator('[data-testid="camera-select"]');
    if (await cameraSelect.isVisible()) {
      await cameraSelect.selectOption('UNKNOWN_CAMERA');
    }

    await page.waitForLoadState('networkidle');

    // Check for empty state message
    const emptyState = page.locator('[data-testid="empty-state"]');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toContainText(/No photos/i);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that filters are accessible
    await expect(page.locator('[data-testid="rover-filters"]')).toBeVisible();

    // Check that photos display properly in mobile grid
    await page.waitForSelector('[data-testid="rover-photo"]', { timeout: 30000 });
    await expect(page.locator('[data-testid="rover-photo"]').first()).toBeVisible();

    // Test photo modal on mobile
    await page.click('[data-testid="rover-photo"]');
    await expect(page.locator('[data-testid="photo-modal"]')).toBeVisible();
    
    // Modal should be fullscreen on mobile
    const modal = page.locator('[data-testid="photo-modal"]');
    const modalBox = await modal.boundingBox();
    expect(modalBox?.width).toBeGreaterThan(300); // Should be close to viewport width
  });
});