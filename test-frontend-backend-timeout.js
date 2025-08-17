const puppeteer = require('puppeteer');
const axios = require('axios');

async function testFrontendBackendCommunication() {
  console.log('🚀 Starting Frontend-Backend Timeout Test');
  
  // Test backend API directly first
  console.log('\n📡 Testing Backend API directly...');
  try {
    const start = Date.now();
    const response = await axios.get('http://localhost:5000/api/v1/apod', {
      timeout: 10000 // 10 second timeout
    });
    const elapsed = Date.now() - start;
    console.log(`✅ Backend API Response: ${response.status} (${elapsed}ms)`);
    console.log(`📦 Data received:`, response.data);
  } catch (error) {
    console.log(`❌ Backend API Error:`, error.code || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server might not be running. Start with: cd backend && npm run dev');
      return;
    }
  }

  // Test frontend with Puppeteer
  console.log('\n🌐 Testing Frontend with Puppeteer...');
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false, // Show browser for debugging
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', (msg) => {
      console.log(`🖥️ PAGE LOG:`, msg.text());
    });
    
    page.on('pageerror', (error) => {
      console.log(`🖥️ PAGE ERROR:`, error.message);
    });
    
    // Monitor network requests
    const networkRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('api/v1')) {
        console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });
    
    page.on('response', (response) => {
      if (response.url().includes('api/v1')) {
        const request = networkRequests.find(req => req.url === response.url());
        const elapsed = request ? Date.now() - request.timestamp : 'unknown';
        console.log(`📥 RESPONSE: ${response.status()} ${response.url()} (${elapsed}ms)`);
      }
    });
    
    page.on('requestfailed', (request) => {
      if (request.url().includes('api/v1')) {
        console.log(`❌ REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
      }
    });
    
    console.log('🔍 Navigating to frontend...');
    const start = Date.now();
    
    try {
      await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      const elapsed = Date.now() - start;
      console.log(`✅ Frontend loaded (${elapsed}ms)`);
    } catch (error) {
      console.log(`❌ Frontend load error:`, error.message);
      if (error.message.includes('ERR_CONNECTION_REFUSED')) {
        console.log('💡 Frontend server might not be running. Start with: cd frontend && npm start');
        return;
      }
    }
    
    // Wait a bit for any initial API calls
    console.log('⏳ Waiting for initial API calls...');
    await page.waitForTimeout(3000);
    
    // Try to navigate to APOD page to trigger API call
    console.log('🔄 Navigating to APOD page...');
    try {
      await page.click('a[href*="apod"]', { timeout: 5000 });
      console.log('✅ Clicked APOD navigation');
      
      // Wait for API call to complete
      await page.waitForTimeout(5000);
      
    } catch (error) {
      console.log('⚠️ Could not find APOD navigation, trying direct URL...');
      await page.goto('http://localhost:3000/apod', { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });
    }
    
    // Check for any error messages on the page
    const errorElements = await page.$$('[class*="error"], [class*="Error"]');
    if (errorElements.length > 0) {
      console.log(`⚠️ Found ${errorElements.length} error elements on page`);
      for (const element of errorElements) {
        const text = await element.textContent();
        console.log(`❌ Error text: ${text}`);
      }
    }
    
    // Check for loading states
    const loadingElements = await page.$$('[class*="loading"], [class*="Loading"]');
    if (loadingElements.length > 0) {
      console.log(`⏳ Found ${loadingElements.length} loading elements - page might still be loading`);
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'frontend-test-screenshot.png' });
    console.log('📸 Screenshot saved as frontend-test-screenshot.png');
    
  } catch (error) {
    console.log('❌ Puppeteer test error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  console.log('\n📊 Test Summary:');
  console.log('- Check backend server is running: cd backend && npm run dev');
  console.log('- Check frontend server is running: cd frontend && npm start');
  console.log('- Check console logs above for timeout issues');
  console.log('- Check frontend-test-screenshot.png for visual state');
}

// Run the test
testFrontendBackendCommunication().catch(console.error);