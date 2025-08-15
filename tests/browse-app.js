const puppeteer = require('puppeteer');

async function browseApp() {
  console.log('🚀 Starting Puppeteer browser test...');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    slowMo: 1000,    // Slow down by 1s for demonstration
    defaultViewport: { width: 1280, height: 720 }
  });

  const page = await browser.newPage();
  
  try {
    // Test different possible ports where the app might be running
    const possiblePorts = [3000, 3001, 3002, 3005];
    let appUrl = null;
    
    console.log('🔍 Looking for running frontend app...');
    
    for (const port of possiblePorts) {
      const url = `http://localhost:${port}`;
      try {
        console.log(`   Trying port ${port}...`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 5000 });
        console.log(`✅ Found app running on port ${port}`);
        appUrl = url;
        break;
      } catch (error) {
        console.log(`   Port ${port} not responding`);
      }
    }

    if (!appUrl) {
      console.log('❌ No frontend app found running. Please start the frontend first.');
      await browser.close();
      return;
    }

    console.log(`📱 Testing NASA Space Explorer at ${appUrl}`);
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take a screenshot of the main page
    await page.screenshot({ 
      path: 'homepage-screenshot.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved: homepage-screenshot.png');

    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Check for navigation elements
    const navItems = await page.$$eval('[data-testid="nav-item"], .nav-item, nav a, header a', 
      elements => elements.map(el => el.textContent?.trim()).filter(text => text)
    );
    
    if (navItems.length > 0) {
      console.log('🧭 Navigation items found:');
      navItems.forEach(item => console.log(`   - ${item}`));
    }

    // Test navigation to different pages
    const pages = [
      { name: 'Dashboard', selectors: ['[href="/"]', 'a[href="/dashboard"]', 'text=Dashboard'] },
      { name: 'APOD', selectors: ['[href="/apod"]', 'a[href="/apod"]', 'text=APOD'] },
      { name: 'Mars Rovers', selectors: ['[href="/mars-rovers"]', 'a[href="/mars-rovers"]', 'text=Mars'] },
      { name: 'NEO Tracker', selectors: ['[href="/neo"]', 'a[href="/neo-tracker"]', 'text=NEO'] }
    ];

    for (const pageTest of pages) {
      console.log(`\n🔍 Testing ${pageTest.name} page...`);
      
      let found = false;
      for (const selector of pageTest.selectors) {
        try {
          if (selector.startsWith('text=')) {
            // Simple text-based navigation
            const text = selector.replace('text=', '');
            await page.evaluate((text) => {
              const links = Array.from(document.querySelectorAll('a'));
              const link = links.find(l => l.textContent?.toLowerCase().includes(text.toLowerCase()));
              if (link) link.click();
            }, text);
          } else {
            const element = await page.$(selector);
            if (element) {
              await element.click();
              found = true;
              break;
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      // Wait for navigation or content change
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Take screenshot of each page
      const screenshotName = `${pageTest.name.toLowerCase().replace(/\s+/g, '-')}-screenshot.png`;
      await page.screenshot({ 
        path: screenshotName, 
        fullPage: true 
      });
      console.log(`   📸 Screenshot saved: ${screenshotName}`);
      
      // Check for any error messages
      const errors = await page.$$eval('.error, [class*="error"], .alert-danger', 
        elements => elements.map(el => el.textContent?.trim()).filter(text => text)
      );
      
      if (errors.length > 0) {
        console.log('   ❌ Errors found:');
        errors.forEach(error => console.log(`      - ${error}`));
      } else {
        console.log(`   ✅ ${pageTest.name} page loaded successfully`);
      }
    }

    // Test for loading states and error handling
    console.log('\n🔄 Testing loading states and error handling...');
    
    const loadingElements = await page.$$('.loading, [class*="loading"], [class*="spinner"]');
    if (loadingElements.length > 0) {
      console.log(`   Found ${loadingElements.length} loading indicators`);
    }

    // Check browser console for errors
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(`Console Error: ${msg.text()}`);
      }
    });

    // Wait a bit more to catch any console errors
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (consoleLogs.length > 0) {
      console.log('\n⚠️  Console errors detected:');
      consoleLogs.forEach(log => console.log(`   ${log}`));
    } else {
      console.log('\n✅ No console errors detected');
    }

    console.log('\n🎉 Browser test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: 'error-screenshot.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot saved: error-screenshot.png');
  } finally {
    await browser.close();
    console.log('🔚 Browser closed');
  }
}

// Run the test
if (require.main === module) {
  browseApp().catch(console.error);
}

module.exports = browseApp;