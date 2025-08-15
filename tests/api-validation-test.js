const puppeteer = require('puppeteer');

async function testAPIEndpoints() {
  console.log('🧪 Testing API endpoints through frontend...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Track console messages for API errors
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    if (text.includes('Error') || text.includes('error') || text.includes('429') || text.includes('404')) {
      console.log(`🚨 CONSOLE ERROR: ${text}`);
    }
  });
  
  // Track network requests
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push(`${request.method()} ${request.url()} - ${request.failure().errorText}`);
  });
  
  page.on('response', response => {
    if (!response.ok()) {
      console.log(`❌ Failed request: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('📱 Loading frontend...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 10000 });
    
    console.log('🏠 Testing Dashboard...');
    await page.waitForSelector('h1', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🌌 Testing APOD page...');
    await page.click('a[href="/apod"]');
    await page.waitForSelector('h1, h2, .loading', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🔴 Testing Mars Rovers page...');
    await page.click('a[href="/mars-rovers"]');
    await page.waitForSelector('h1, h2, .loading', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('☄️ Testing NEO Tracker page...');
    await page.click('a[href="/neo-tracker"]');
    await page.waitForSelector('h1, h2, .loading', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n📊 Test Summary:');
    console.log(`Console messages: ${consoleMessages.length}`);
    console.log(`Failed requests: ${failedRequests.length}`);
    
    if (failedRequests.length > 0) {
      console.log('\n❌ Failed requests:');
      failedRequests.forEach(req => console.log(`  ${req}`));
    }
    
    const errorMessages = consoleMessages.filter(msg => 
      msg.includes('Error') || msg.includes('error') || msg.includes('429') || msg.includes('404')
    );
    
    if (errorMessages.length > 0) {
      console.log('\n🚨 Error messages:');
      errorMessages.forEach(msg => console.log(`  ${msg}`));
    }
    
    if (failedRequests.length === 0 && errorMessages.length === 0) {
      console.log('✅ All API endpoints working correctly!');
    } else {
      console.log('⚠️ Some issues detected - see details above');
    }
    
    await page.screenshot({ path: 'api-test-final.png' });
    console.log('📸 Final screenshot saved');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await browser.close();
  }
}

testAPIEndpoints().catch(console.error);