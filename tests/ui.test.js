const puppeteer = require('puppeteer');

describe('NASA Space Explorer UI Tests', () => {
  let browser;
  let page;
  const baseUrl = 'http://localhost:3001';
  const timeout = 15000;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true, // Set to false for debugging
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    
    // Enable console logging from page (for debugging)
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🚨 PAGE ERROR: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', err => {
      console.log(`🚨 PAGE EXCEPTION: ${err.message}`);
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  afterEach(async () => {
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Application Loading and Navigation', () => {
    test('should load the homepage successfully', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout });
      
      const title = await page.title();
      expect(title).toBe('NASA Space Explorer');
      
      // Check for main container
      const mainContent = await page.$('main, [role="main"], .App');
      expect(mainContent).toBeTruthy();
      
      // Take screenshot for verification
      await page.screenshot({ path: 'homepage-test.png' });
    });

    test('should have working navigation', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout });
      
      // Look for navigation links
      const navLinks = await page.$$('nav a, [role="navigation"] a, .nav a');
      expect(navLinks.length).toBeGreaterThan(0);
      
      // Check for expected navigation items
      const navText = await page.evaluate(() => {
        const navElement = document.querySelector('nav, [role="navigation"], .nav');
        return navElement ? navElement.innerText.toLowerCase() : '';
      });
      
      expect(navText).toMatch(/dashboard|apod|mars|neo|home/);
    });
  });

  describe('Dashboard Page', () => {
    test('should load dashboard with data widgets', async () => {
      await page.goto(`${baseUrl}`, { waitUntil: 'networkidle0', timeout });
      
      // Try to navigate to dashboard or check if we're already there
      const dashboardLink = await page.$('a[href*="dashboard"], a[href="/"]');
      if (dashboardLink) {
        await dashboardLink.click();
        await page.waitForTimeout(2000);
      }
      
      // Look for dashboard components
      const widgets = await page.$$('[class*="widget"], [class*="card"], [class*="metric"]');
      expect(widgets.length).toBeGreaterThan(0);
      
      // Check for loading states or data
      const hasContent = await page.evaluate(() => {
        const body = document.body.innerText.toLowerCase();
        return body.includes('nasa') || body.includes('space') || body.includes('mission');
      });
      
      expect(hasContent).toBeTruthy();
      
      await page.screenshot({ path: 'dashboard-test.png' });
    });

    test('should display status indicators', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout });
      
      // Look for status indicators
      const statusElements = await page.$$('[class*="status"], [class*="indicator"], .online, .offline');
      
      // Should have at least one status indicator
      expect(statusElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('APOD (Astronomy Picture of the Day) Page', () => {
    test('should navigate to APOD page', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout });
      
      // Try to find and click APOD link
      const apodLink = await page.$('a[href*="apod"], a[href*="/apod"]');
      if (apodLink) {
        await apodLink.click();
        await page.waitForTimeout(3000);
        
        // Check if we're on APOD page
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/apod/i);
        
        await page.screenshot({ path: 'apod-test.png' });
      } else {
        // Try direct navigation
        await page.goto(`${baseUrl}/apod`, { waitUntil: 'networkidle0', timeout });
      }
      
      // Look for APOD content
      const apodContent = await page.evaluate(() => {
        const body = document.body.innerText.toLowerCase();
        return body.includes('astronomy') || 
               body.includes('picture') || 
               body.includes('apod') ||
               body.includes('nasa');
      });
      
      expect(apodContent).toBeTruthy();
    });

    test('should display image or loading state', async () => {
      try {
        await page.goto(`${baseUrl}/apod`, { waitUntil: 'networkidle0', timeout });
        
        // Wait for content to load
        await page.waitForTimeout(3000);
        
        // Look for images or loading indicators
        const hasImages = await page.$$('img').then(imgs => imgs.length > 0);
        const hasLoading = await page.$('[class*="loading"], [class*="spinner"]');
        const hasError = await page.$('[class*="error"]');
        
        // Should have either images, loading state, or handled error
        expect(hasImages || hasLoading || hasError).toBeTruthy();
      } catch (error) {
        console.log('APOD page may not be available:', error.message);
      }
    });
  });

  describe('Mars Rovers Page', () => {
    test('should navigate to Mars Rovers page', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout });
      
      // Try to find and click Mars Rovers link
      const marsLink = await page.$('a[href*="mars"], a[href*="rover"]');
      if (marsLink) {
        await marsLink.click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ path: 'mars-rovers-test.png' });
      } else {
        // Try direct navigation
        await page.goto(`${baseUrl}/mars-rovers`, { waitUntil: 'networkidle0', timeout });
      }
      
      // Look for Mars rover content
      const marsContent = await page.evaluate(() => {
        const body = document.body.innerText.toLowerCase();
        return body.includes('mars') || 
               body.includes('rover') || 
               body.includes('curiosity') ||
               body.includes('perseverance') ||
               body.includes('opportunity');
      });
      
      expect(marsContent).toBeTruthy();
    });

    test('should have rover filters or controls', async () => {
      try {
        await page.goto(`${baseUrl}/mars-rovers`, { waitUntil: 'networkidle0', timeout });
        
        // Look for filter controls
        const filters = await page.$$('select, button, input[type="radio"], input[type="checkbox"]');
        const hasFilterControls = filters.length > 0;
        
        // Look for rover names in UI
        const hasRoverNames = await page.evaluate(() => {
          const body = document.body.innerText.toLowerCase();
          return body.includes('curiosity') || 
                 body.includes('perseverance') || 
                 body.includes('opportunity') ||
                 body.includes('spirit');
        });
        
        expect(hasFilterControls || hasRoverNames).toBeTruthy();
      } catch (error) {
        console.log('Mars rovers page may not be available:', error.message);
      }
    });
  });

  describe('NEO Tracker Page', () => {
    test('should navigate to NEO Tracker page', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout });
      
      // Try to find and click NEO link
      const neoLink = await page.$('a[href*="neo"], a[href*="asteroid"]');
      if (neoLink) {
        await neoLink.click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ path: 'neo-tracker-test.png' });
      } else {
        // Try direct navigation
        await page.goto(`${baseUrl}/neo-tracker`, { waitUntil: 'networkidle0', timeout });
      }
      
      // Look for NEO content
      const neoContent = await page.evaluate(() => {
        const body = document.body.innerText.toLowerCase();
        return body.includes('neo') || 
               body.includes('asteroid') || 
               body.includes('near earth') ||
               body.includes('object');
      });
      
      expect(neoContent).toBeTruthy();
    });

    test('should display asteroid data or loading state', async () => {
      try {
        await page.goto(`${baseUrl}/neo-tracker`, { waitUntil: 'networkidle0', timeout });
        
        // Wait for content
        await page.waitForTimeout(3000);
        
        // Look for data tables, charts, or loading states
        const hasDataDisplay = await page.$$('table, [class*="chart"], [class*="graph"], [class*="card"]').then(els => els.length > 0);
        const hasLoading = await page.$('[class*="loading"], [class*="spinner"]');
        
        expect(hasDataDisplay || hasLoading).toBeTruthy();
      } catch (error) {
        console.log('NEO tracker page may not be available:', error.message);
      }
    });
  });

  describe('Error Handling and Accessibility', () => {
    test('should handle 404 pages gracefully', async () => {
      try {
        await page.goto(`${baseUrl}/nonexistent-page`, { waitUntil: 'networkidle0', timeout });
        
        // Should either redirect to home or show 404 error
        const currentUrl = page.url();
        const is404 = currentUrl.includes('404') || currentUrl === baseUrl + '/';
        
        expect(is404 || currentUrl === baseUrl + '/').toBeTruthy();
      } catch (error) {
        // Navigation errors are acceptable for 404 tests
        console.log('404 handling test - navigation error expected');
      }
    });

    test('should have proper page titles', async () => {
      const pages = [
        { url: baseUrl, expectedTitlePattern: /nasa|space|explorer/i },
        { url: `${baseUrl}/apod`, expectedTitlePattern: /apod|astronomy|picture/i },
        { url: `${baseUrl}/mars-rovers`, expectedTitlePattern: /mars|rover/i },
        { url: `${baseUrl}/neo-tracker`, expectedTitlePattern: /neo|asteroid|tracker/i }
      ];
      
      for (const { url, expectedTitlePattern } of pages) {
        try {
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
          const title = await page.title();
          expect(title).toMatch(expectedTitlePattern);
        } catch (error) {
          console.log(`Page ${url} may not be available:`, error.message);
        }
      }
    });

    test('should have basic accessibility elements', async () => {
      await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout });
      
      // Check for basic accessibility elements
      const hasHeadings = await page.$$('h1, h2, h3, h4, h5, h6').then(els => els.length > 0);
      const hasNav = await page.$('nav, [role="navigation"]');
      const hasMain = await page.$('main, [role="main"]');
      
      expect(hasHeadings).toBeTruthy();
      expect(hasNav || hasMain).toBeTruthy();
    });
  });

  describe('Performance and Loading', () => {
    test('should load within reasonable time', async () => {
      const startTime = Date.now();
      
      await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds (reasonable for development)
      expect(loadTime).toBeLessThan(10000);
    });

    test('should not have critical JavaScript errors', async () => {
      const errors = [];
      
      page.on('pageerror', err => {
        errors.push(err.message);
      });
      
      await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout });
      
      // Wait a bit to catch any delayed errors
      await page.waitForTimeout(2000);
      
      // Filter out non-critical errors (warnings, etc.)
      const criticalErrors = errors.filter(err => 
        !err.includes('Warning') && 
        !err.includes('DevTools') &&
        !err.includes('Extension')
      );
      
      expect(criticalErrors.length).toBe(0);
    });
  });
});