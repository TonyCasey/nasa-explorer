const puppeteer = require('puppeteer');

async function debugConsoleErrors() {
  console.log('🔍 Launching Puppeteer to inspect console errors...');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Collect all console messages
  const consoleMessages = [];
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    const message = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      timestamp: new Date().toISOString()
    };
    
    consoleMessages.push(message);
    
    if (msg.type() === 'error') {
      errors.push(message);
      console.log(`🚨 CONSOLE ERROR: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      warnings.push(message);
      console.log(`⚠️  CONSOLE WARNING: ${msg.text()}`);
    } else if (msg.type() === 'log') {
      console.log(`ℹ️  CONSOLE LOG: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    console.log(`💥 PAGE ERROR: ${err.message}`);
    console.log(`   Stack: ${err.stack}`);
    errors.push({
      type: 'pageerror',
      text: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  page.on('requestfailed', req => {
    console.log(`❌ FAILED REQUEST: ${req.method()} ${req.url()}`);
    console.log(`   Error: ${req.failure()?.errorText}`);
  });
  
  try {
    console.log('🌐 Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle0', 
      timeout: 15000 
    });
    
    console.log('✅ Page loaded, waiting for JavaScript execution...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n📊 CONSOLE SUMMARY:');
    console.log(`   Total messages: ${consoleMessages.length}`);
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 DETAILED ERRORS:');
      errors.forEach((error, index) => {
        console.log(`\n   Error ${index + 1}:`);
        console.log(`   Type: ${error.type}`);
        console.log(`   Message: ${error.text}`);
        if (error.location) {
          console.log(`   Location: ${error.location.url}:${error.location.lineNumber}`);
        }
        if (error.stack) {
          console.log(`   Stack: ${error.stack.substring(0, 200)}...`);
        }
      });
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  DETAILED WARNINGS:');
      warnings.forEach((warning, index) => {
        console.log(`\n   Warning ${index + 1}:`);
        console.log(`   Message: ${warning.text}`);
        if (warning.location) {
          console.log(`   Location: ${warning.location.url}:${warning.location.lineNumber}`);
        }
      });
    }
    
    // Take screenshot for visual inspection
    await page.screenshot({ 
      path: 'console-debug-screenshot.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved: console-debug-screenshot.png');
    
    // Test different routes to see if errors persist
    const routes = ['/apod', '/mars-rovers', '/neo-tracker'];
    
    for (const route of routes) {
      console.log(`\n🔗 Testing route: ${route}`);
      const routeErrors = [];
      
      page.removeAllListeners('console');
      page.on('console', msg => {
        if (msg.type() === 'error') {
          routeErrors.push(msg.text());
          console.log(`   🚨 ${msg.text()}`);
        }
      });
      
      await page.goto(`http://localhost:3001${route}`, { 
        waitUntil: 'networkidle0', 
        timeout: 10000 
      }).catch(() => {
        console.log(`   ⚠️  Failed to navigate to ${route}`);
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`   Errors on ${route}: ${routeErrors.length}`);
    }
    
  } catch (error) {
    console.error('❌ Debug session failed:', error.message);
  } finally {
    console.log('\n🔚 Closing browser...');
    await browser.close();
  }
}

debugConsoleErrors().catch(console.error);