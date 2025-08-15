const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Testing NASA Space Explorer...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      defaultViewport: { width: 1280, height: 800 }
    });
    
    const page = await browser.newPage();
    
    // Monitor network requests
    const apiCalls = [];
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      if (url.includes('nasa-explorer') || url.includes('api')) {
        apiCalls.push({ url, status });
      }
    });
    
    // Monitor console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    console.log('📱 Loading frontend...');
    await page.goto('https://frontend-qsyjnxvbq-tonys-projects-e30b27a9.vercel.app', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    
    // Wait for React to render
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get basic page info
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasReact: !!(window.React || document.querySelector('[data-reactroot], #root')),
        bodyText: document.body.innerText.substring(0, 500),
        errorCount: document.querySelectorAll('[class*="error"], .error').length,
        loadingCount: document.querySelectorAll('[class*="loading"], .loading').length
      };
    });
    
    console.log('📋 Page Analysis:');
    console.log(`   Title: ${pageInfo.title}`);
    console.log(`   React App: ${pageInfo.hasReact ? '✅' : '❌'}`);
    console.log(`   Error Elements: ${pageInfo.errorCount}`);
    console.log(`   Loading Elements: ${pageInfo.loadingCount}`);
    
    if (pageInfo.bodyText) {
      console.log(`   Content Preview: "${pageInfo.bodyText.substring(0, 200)}..."`);
    }
    
    console.log('\n🌐 API Calls Made:');
    if (apiCalls.length > 0) {
      apiCalls.forEach(call => {
        const statusColor = call.status < 300 ? '✅' : call.status < 400 ? '⚠️' : '❌';
        console.log(`   ${statusColor} ${call.status} - ${call.url}`);
      });
    } else {
      console.log('   No API calls detected');
    }
    
    console.log('\n🚨 Console Errors:');
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => console.log(`   ❌ ${error}`));
    } else {
      console.log('   No console errors detected ✅');
    }
    
    // Take screenshot
    console.log('\n📷 Taking screenshot...');
    await page.screenshot({ path: 'nasa-app-screenshot.png' });
    console.log('   Screenshot saved: nasa-app-screenshot.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log('\n🏁 Test completed.');
  }
})();