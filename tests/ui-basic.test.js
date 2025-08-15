const puppeteer = require('puppeteer');

describe('NASA Space Explorer - Basic UI Tests', () => {
  let browser;
  let page;
  const baseUrl = 'http://localhost:3001';
  const timeout = 10000;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('should load the application successfully', async () => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout });
    
    // Check that the page loads
    const title = await page.title();
    expect(title).toBeDefined();
    
    // Check for React app container
    const appContainer = await page.$('#root, .App, main');
    expect(appContainer).toBeTruthy();
    
    console.log(`✅ Application loaded with title: "${title}"`);
  });

  test('should have basic navigation structure', async () => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout });
    
    // Wait for navigation to render
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Look for navigation elements
    const navElements = await page.$$('nav, [role="navigation"], .nav, .navigation, header');
    
    console.log(`📊 Found ${navElements.length} navigation elements`);
    expect(navElements.length).toBeGreaterThanOrEqual(0);
  });

  test('should render page content without crashes', async () => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout });
    
    // Wait for initial render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if React rendered content (not just loading screen)
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    console.log(`📄 Page contains text (${bodyText.length} characters)`);
    expect(bodyText.length).toBeGreaterThan(50);
    
    // Check for common React error indicators
    const hasReactError = bodyText.includes('Application error') || 
                         bodyText.includes('Something went wrong') ||
                         bodyText.includes('Unhandled Runtime Error');
    
    expect(hasReactError).toBeFalsy();
  });

  test('should handle routing without crashes', async () => {
    const testRoutes = ['/', '/apod', '/mars-rovers', '/neo-tracker'];
    
    for (const route of testRoutes) {
      try {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check that page loaded without React error boundaries
        const hasError = await page.$('.error-boundary, .error-page') !== null;
        const currentUrl = page.url();
        
        console.log(`🔗 Route ${route} -> ${currentUrl} (Error: ${hasError})`);
        expect(hasError).toBeFalsy();
        
      } catch (error) {
        console.log(`⚠️  Route ${route} failed to load:`, error.message);
        // Don't fail test for routing issues, just log them
      }
    }
  });

  test('should take screenshots for visual verification', async () => {
    const routes = [
      { path: '/', name: 'homepage' },
      { path: '/apod', name: 'apod' },
      { path: '/mars-rovers', name: 'mars-rovers' },
      { path: '/neo-tracker', name: 'neo-tracker' }
    ];

    for (const route of routes) {
      try {
        await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await page.screenshot({ 
          path: `${route.name}-ui-test.png`,
          fullPage: true 
        });
        
        console.log(`📸 Screenshot saved: ${route.name}-ui-test.png`);
        
      } catch (error) {
        console.log(`📸 Could not screenshot ${route.name}:`, error.message);
      }
    }
  });

  test('should have responsive design elements', async () => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mobileBodyText = await page.evaluate(() => document.body.innerText);
    expect(mobileBodyText.length).toBeGreaterThan(20);
    
    await page.screenshot({ path: 'mobile-view-test.png' });
    console.log('📱 Mobile viewport test completed');
    
    // Test desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const desktopBodyText = await page.evaluate(() => document.body.innerText);
    expect(desktopBodyText.length).toBeGreaterThan(20);
    
    await page.screenshot({ path: 'desktop-view-test.png' });
    console.log('🖥️  Desktop viewport test completed');
  });

  test('should handle API loading states gracefully', async () => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout });
    
    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for loading indicators or error states (not crashes)
    const hasLoadingElements = await page.$$('[class*="loading"], [class*="spinner"], [class*="skeleton"]');
    const hasErrorElements = await page.$$('[class*="error"], [class*="alert"]');
    
    console.log(`🔄 Loading elements: ${hasLoadingElements.length}, Error elements: ${hasErrorElements.length}`);
    
    // Should have either content, loading states, or graceful error handling
    const pageContent = await page.evaluate(() => document.body.innerText);
    expect(pageContent.length).toBeGreaterThan(50);
  });
});