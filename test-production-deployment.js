const puppeteer = require('puppeteer');

async function testProductionDeployment() {
  console.log('🚀 Testing Production Deployment End-to-End');
  
  let browser;
  try {
    // Test backend API directly first
    console.log('\n📡 Testing Production Backend API...');
    const backendResponse = await fetch('https://nasa-explorer-2347800d91dd.herokuapp.com/api/v1/apod');
    const backendData = await backendResponse.json();
    
    if (backendData.success && backendData.data) {
      console.log('✅ Backend API working');
      console.log(`📝 Today's APOD: "${backendData.data.title}"`);
    } else {
      console.log('❌ Backend API failed');
      return;
    }

    // Test frontend with Puppeteer
    console.log('\n🌐 Testing Production Frontend...');
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Monitor console and network
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`🖥️ PAGE ERROR:`, msg.text());
      }
    });
    
    const apiRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('api/v1')) {
        console.log(`📤 API REQUEST: ${request.method()} ${request.url()}`);
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });
    
    page.on('response', (response) => {
      if (response.url().includes('api/v1')) {
        const request = apiRequests.find(req => req.url === response.url());
        const elapsed = request ? Date.now() - request.timestamp : 'unknown';
        console.log(`📥 API RESPONSE: ${response.status()} ${response.url()} (${elapsed}ms)`);
      }
    });
    
    // Navigate to production frontend
    console.log('🔍 Loading production frontend...');
    await page.goto('https://nasa.tonycasey.dev', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    console.log('✅ Frontend loaded successfully');
    
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    // Try to find and click APOD navigation
    try {
      await page.waitForSelector('nav a, [href*="apod"], [href*="APOD"]', { timeout: 10000 });
      const apodLink = await page.$('nav a[href*="apod"], nav a[href*="APOD"], a[href*="apod"], a[href*="APOD"]');
      
      if (apodLink) {
        console.log('🔄 Navigating to APOD page...');
        await apodLink.click();
        await page.waitForTimeout(3000);
        console.log('✅ APOD page navigation successful');
      } else {
        console.log('⚠️ APOD navigation link not found, trying direct URL...');
        await page.goto('https://nasa.tonycasey.dev/apod', { 
          waitUntil: 'networkidle2',
          timeout: 30000
        });
      }
    } catch (error) {
      console.log('ℹ️ Continuing with main page test...');
    }
    
    // Check for NASA content
    await page.waitForTimeout(5000);
    
    // Look for space-related content
    const content = await page.content();
    const hasNasaContent = content.includes('NASA') || 
                          content.includes('Space') || 
                          content.includes('APOD') ||
                          content.includes('Astronomy') ||
                          content.includes('Eagle Nebula') ||
                          content.includes('Asperitas Clouds');
    
    if (hasNasaContent) {
      console.log('✅ NASA content found on page');
    } else {
      console.log('⚠️ No NASA content detected');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'production-deployment-test.png', fullPage: true });
    console.log('📸 Screenshot saved as production-deployment-test.png');
    
    // Check if API calls were made
    if (apiRequests.length > 0) {
      console.log(`✅ Frontend successfully made ${apiRequests.length} API call(s) to backend`);
    } else {
      console.log('⚠️ No API calls detected from frontend to backend');
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  console.log('\n📊 Production Deployment Test Complete!');
  console.log('🌐 Frontend: https://nasa.tonycasey.dev');
  console.log('📡 Backend: https://nasa-explorer-2347800d91dd.herokuapp.com');
  console.log('📋 Check production-deployment-test.png for visual verification');
}

// Run the test
testProductionDeployment().catch(console.error);