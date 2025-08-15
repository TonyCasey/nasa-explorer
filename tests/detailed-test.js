const puppeteer = require('puppeteer');

async function detailedTest() {
  console.log('🔍 Detailed localhost test...');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    slowMo: 1000,
    defaultViewport: { width: 1280, height: 720 }
  });

  const page = await browser.newPage();
  
  // Enable console logging from page
  page.on('console', msg => {
    console.log(`🖥️  PAGE LOG [${msg.type()}]:`, msg.text());
  });
  
  page.on('pageerror', err => {
    console.log(`🚨 PAGE ERROR:`, err.message);
  });
  
  page.on('requestfailed', req => {
    console.log(`❌ FAILED REQUEST:`, req.url(), req.failure()?.errorText);
  });
  
  try {
    const ports = [3000, 3001];
    
    for (const port of ports) {
      const url = `http://localhost:${port}`;
      console.log(`\n🌐 Testing ${url}...`);
      
      try {
        // Try to navigate
        console.log(`   📡 Navigating to ${url}...`);
        await page.goto(url, { 
          waitUntil: 'networkidle0', 
          timeout: 15000 
        });
        
        console.log(`   ✅ Navigation successful`);
        
        // Get page info
        const title = await page.title();
        const url_actual = page.url();
        console.log(`   📄 Title: "${title}"`);
        console.log(`   🔗 URL: ${url_actual}`);
        
        // Check if page loaded content
        const bodyText = await page.$eval('body', el => el.innerText.substring(0, 200));
        console.log(`   📝 Body text (first 200 chars): "${bodyText}"`);
        
        // Check for error indicators
        const hasError = await page.$('.error, [class*="error"], .alert-danger, [class*="compiled"]');
        if (hasError) {
          const errorText = await hasError.evaluate(el => el.innerText);
          console.log(`   ⚠️  Error detected: ${errorText.substring(0, 100)}...`);
        }
        
        // Take screenshot
        const screenshotName = `detailed-port-${port}-${Date.now()}.png`;
        await page.screenshot({ 
          path: screenshotName, 
          fullPage: true 
        });
        console.log(`   📸 Screenshot: ${screenshotName}`);
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`   ❌ Failed to load ${url}:`, error.message);
        
        // Still take a screenshot of the error
        try {
          const errorScreenshot = `error-port-${port}-${Date.now()}.png`;
          await page.screenshot({ path: errorScreenshot });
          console.log(`   📸 Error screenshot: ${errorScreenshot}`);
        } catch (screenshotError) {
          console.log(`   📸 Could not take error screenshot:`, screenshotError.message);
        }
      }
    }
    
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
    console.log('🔚 Browser closed');
  }
}

detailedTest().catch(console.error);