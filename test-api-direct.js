const axios = require('axios');
const puppeteer = require('puppeteer');

async function testDirectAPI() {
  console.log('🧪 Testing backend API directly...\n');
  
  try {
    console.log('📡 Testing APOD endpoint...');
    const response = await axios.get('https://nasa-server.tonycasey.dev/api/v1/apod', {
      timeout: 30000
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Response time: ${response.headers['x-response-time'] || 'N/A'}`);
    console.log(`🎯 Success: ${response.data.success}`);
    
    if (response.data.data) {
      console.log(`📸 Title: ${response.data.data.title}`);
      console.log(`📅 Date: ${response.data.data.date}`);
      console.log(`🖼️ Has Image: ${!!response.data.data.url}`);
    }
    
    return true;
  } catch (error) {
    if (error.response?.status === 408) {
      console.log('❌ Still getting 408 timeout error');
      console.log(`📊 Error details: ${error.response.data || error.message}`);
    } else {
      console.log(`❌ API Error: ${error.response?.status || 'Network Error'}`);
      console.log(`📊 Message: ${error.message}`);
    }
    return false;
  }
}

async function testFrontendWithAPI() {
  console.log('\n🌐 Testing frontend integration...\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Track network requests
  const apiRequests = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('nasa-server.tonycasey.dev')) {
      apiRequests.push({
        url,
        status: response.status(),
        time: new Date().toISOString()
      });
      console.log(`📡 ${response.status()} ${url}`);
    }
  });
  
  try {
    console.log('🌐 Loading APOD page...');
    await page.goto('https://nasa.tonycasey.dev/apod', { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });
    
    // Wait for content to load
    await page.waitForTimeout(5000);
    
    // Check for content
    const title = await page.$eval('h1', el => el.textContent).catch(() => 'No title found');
    const hasImage = await page.$('img').then(el => !!el);
    const hasError = await page.$('.error, [class*="error"]').then(el => !!el);
    
    console.log(`📄 Page title: ${title}`);
    console.log(`🖼️ Has image: ${hasImage}`);
    console.log(`❌ Has error: ${hasError}`);
    
    // Log API calls made
    console.log(`\n📊 API requests made: ${apiRequests.length}`);
    apiRequests.forEach(req => {
      console.log(`  ${req.status} ${req.url}`);
    });
    
  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
  } finally {
    await browser.close();
  }
}

async function runTests() {
  console.log('🚀 Starting comprehensive API timeout test...\n');
  
  const apiWorking = await testDirectAPI();
  
  if (apiWorking) {
    await testFrontendWithAPI();
    console.log('\n✅ Timeout fix appears to be working!');
  } else {
    console.log('\n❌ API still has timeout issues');
  }
}

runTests().catch(console.error);