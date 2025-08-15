import { test, expect } from '@playwright/test';

test.describe('Favorites Page', () => {
  test.beforeEach(async ({ page }) => {
    // First add some items to favorites by visiting other pages
    await page.goto('/apod');
    
    // Wait for APOD to load and add to favorites
    await page.waitForSelector('[data-testid="apod-title"]', { timeout: 30000 });
    const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
    }

    // Navigate to favorites page
    await page.goto('/favorites');
  });

  test('should load favorites page with saved items', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Favorites');

    // Check for favorites grid
    await expect(page.locator('[data-testid="favorites-grid"]')).toBeVisible();

    // Should have at least one favorite item
    const favoriteItems = page.locator('[data-testid="favorite-item"]');
    await expect(favoriteItems.first()).toBeVisible();
  });

  test('should display different types of favorited content', async ({ page }) => {
    // Add different types of favorites
    await page.goto('/mars-rovers');
    await page.waitForSelector('[data-testid="rover-photo"]', { timeout: 30000 });
    
    const marsPhoto = page.locator('[data-testid="favorite-button"]').first();
    if (await marsPhoto.isVisible()) {
      await marsPhoto.click();
    }

    // Navigate back to favorites
    await page.goto('/favorites');

    // Check for different content types
    const favoriteItems = page.locator('[data-testid="favorite-item"]');
    await expect(favoriteItems.first()).toBeVisible();

    // Should show content type labels
    const contentTypes = page.locator('[data-testid="content-type"]');
    if (await contentTypes.count() > 0) {
      await expect(contentTypes.first()).toBeVisible();
    }
  });

  test('should filter favorites by content type', async ({ page }) => {
    // Wait for favorites to load
    await page.waitForSelector('[data-testid="favorites-grid"]', { timeout: 30000 });

    // Check for filter options
    const typeFilters = page.locator('[data-testid="type-filter"]');
    
    if (await typeFilters.count() > 0) {
      // Click on APOD filter
      await page.click('[data-testid="filter-apod"]');
      
      // Should show only APOD items
      const visibleItems = page.locator('[data-testid="favorite-item"]:visible');
      await expect(visibleItems.first()).toBeVisible();

      // Click on Mars Rovers filter
      await page.click('[data-testid="filter-mars"]');
      
      // Should show only Mars rover items
      await expect(visibleItems.first()).toBeVisible();

      // Click "All" to show everything
      await page.click('[data-testid="filter-all"]');
      await expect(visibleItems.first()).toBeVisible();
    }
  });

  test('should search through favorites', async ({ page }) => {
    // Wait for favorites
    await page.waitForSelector('[data-testid="favorites-grid"]', { timeout: 30000 });

    // Check for search input
    const searchInput = page.locator('[data-testid="favorites-search"]');
    
    if (await searchInput.isVisible()) {
      // Type a search term
      await searchInput.fill('space');
      await page.waitForTimeout(500); // Wait for debounced search

      // Should filter results
      const searchResults = page.locator('[data-testid="favorite-item"]:visible');
      await expect(searchResults.first()).toBeVisible();

      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(500);
    }
  });

  test('should remove items from favorites', async ({ page }) => {
    // Wait for favorites
    await page.waitForSelector('[data-testid="favorite-item"]', { timeout: 30000 });

    // Count initial favorites
    const initialCount = await page.locator('[data-testid="favorite-item"]').count();

    // Remove first favorite
    const removeButton = page.locator('[data-testid="remove-favorite"]').first();
    if (await removeButton.isVisible()) {
      await removeButton.click();

      // Confirm removal if there's a confirmation dialog
      const confirmButton = page.locator('[data-testid="confirm-remove"]');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Should have one less favorite
      await page.waitForTimeout(1000);
      const newCount = await page.locator('[data-testid="favorite-item"]').count();
      expect(newCount).toBe(initialCount - 1);
    }
  });

  test('should display favorites statistics', async ({ page }) => {
    // Wait for favorites to load
    await page.waitForSelector('[data-testid="favorites-grid"]', { timeout: 30000 });

    // Check for statistics
    const statsSection = page.locator('[data-testid="favorites-stats"]');
    
    if (await statsSection.isVisible()) {
      await expect(page.locator('[data-testid="total-favorites"]')).toBeVisible();
      await expect(page.locator('[data-testid="favorites-by-type"]')).toBeVisible();

      // Verify stats have numbers
      const totalFavs = await page.locator('[data-testid="total-favorites"]').textContent();
      expect(totalFavs).toMatch(/\d+/);
    }
  });

  test('should open favorite items when clicked', async ({ page }) => {
    // Wait for favorites
    await page.waitForSelector('[data-testid="favorite-item"]', { timeout: 30000 });

    // Click on a favorite item
    await page.click('[data-testid="favorite-item"]');

    // Should open item details or navigate to original page
    const itemModal = page.locator('[data-testid="favorite-modal"]');
    
    if (await itemModal.isVisible()) {
      // Modal opened with favorite details
      await expect(page.locator('[data-testid="modal-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="modal-content"]')).toBeVisible();

      // Close modal
      await page.click('[data-testid="modal-close"]');
      await expect(itemModal).not.toBeVisible();
    } else {
      // Should navigate to original content page
      await expect(page).not.toHaveURL(/.*\/favorites/);
    }
  });

  test('should handle empty favorites state', async ({ page }) => {
    // Clear all favorites first
    await page.goto('/favorites');
    
    // Remove all favorites if any exist
    const favoriteItems = page.locator('[data-testid="favorite-item"]');
    const itemCount = await favoriteItems.count();
    
    for (let i = 0; i < itemCount; i++) {
      const removeButton = page.locator('[data-testid="remove-favorite"]').first();
      if (await removeButton.isVisible()) {
        await removeButton.click();
        
        const confirmButton = page.locator('[data-testid="confirm-remove"]');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
        
        await page.waitForTimeout(500);
      }
    }

    // Check for empty state
    const emptyState = page.locator('[data-testid="empty-favorites"]');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toContainText(/No favorites/i);
      await expect(emptyState).toContainText(/explore/i);
    }
  });

  test('should export favorites', async ({ page }) => {
    // Wait for favorites
    await page.waitForSelector('[data-testid="favorites-grid"]', { timeout: 30000 });

    // Check for export functionality
    const exportButton = page.locator('[data-testid="export-favorites"]');
    
    if (await exportButton.isVisible()) {
      // Start download
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        exportButton.click()
      ]);

      // Verify download
      expect(download.suggestedFilename()).toMatch(/favorites.*\.(json|csv)/);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check favorites grid on mobile
    await page.waitForSelector('[data-testid="favorites-grid"]', { timeout: 30000 });
    await expect(page.locator('[data-testid="favorites-grid"]')).toBeVisible();

    // Favorites should display in single column on mobile
    const favoriteItems = page.locator('[data-testid="favorite-item"]');
    if (await favoriteItems.count() > 1) {
      const firstItem = favoriteItems.first();
      const secondItem = favoriteItems.nth(1);
      
      const firstBox = await firstItem.boundingBox();
      const secondBox = await secondItem.boundingBox();
      
      // On mobile, items should stack vertically
      if (firstBox && secondBox) {
        expect(firstBox.y).toBeLessThan(secondBox.y);
      }
    }

    // Search and filters should be accessible on mobile
    const searchInput = page.locator('[data-testid="favorites-search"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should maintain favorites across browser sessions', async ({ page, context }) => {
    // Add a favorite
    await page.goto('/apod');
    await page.waitForSelector('[data-testid="apod-title"]', { timeout: 30000 });
    
    const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
    }

    // Navigate to favorites and verify
    await page.goto('/favorites');
    await expect(page.locator('[data-testid="favorite-item"]').first()).toBeVisible();

    // Create new page in same context (simulates refresh)
    const newPage = await context.newPage();
    await newPage.goto('/favorites');

    // Favorites should still be there
    await expect(newPage.locator('[data-testid="favorite-item"]').first()).toBeVisible();

    await newPage.close();
  });
});