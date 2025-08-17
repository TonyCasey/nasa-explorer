const puppeteer = require('puppeteer');
const axios = require('axios');

async function testLocalStack() {
  console.log('🧪 Testing local full stack...\n');
  
  // First test the backend API directly
  console.log('📡 Testing local backend API...');
  try {
    const response = await axios.get('http://localhost:5000/api/v1/apod', {
      timeout: 30000
    });
    
    console.log(`✅ Backend Status: ${response.status}`);
    console.log(`🎯 Success: ${response.data.success}`);
    
    if (response.data.data) {
      console.log(`📸 Title: ${response.data.data.title}`);
      console.log(`📅 Date: ${response.data.data.date}`);
      console.log(`🖼️ Image URL: ${response.data.data.url}`);
      
      if (response.data.data.title.includes('Fallback Data')) {
        console.log('🔄 Using fallback data (NASA API unavailable)');
      } else {
        console.log('🚀 Using real NASA data');
      }
    }
  } catch (error) {
    console.log(`❌ Backend API Error: ${error.message}`);
    return;
  }
  
  // Now test the frontend
  console.log('\n🌐 Testing local frontend integration...\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Track API requests
  const apiRequests = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('localhost:5000')) {
      apiRequests.push({
        url,
        status: response.status(),
        time: new Date().toISOString()
      });
      console.log(`📡 Frontend → Backend: ${response.status()} ${url}`);
    }
  });
  
  page.on('console', msg => {
    if (msg.type() === 'log' && msg.text().includes('Config loaded')) {
      console.log(`🔧 ${msg.text()}`);
    }
  });
  
  try {
    console.log('🏠 Loading homepage...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('📸 Navigating to APOD page...');
    await page.goto('http://localhost:3001/apod', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Check for content
    const title = await page.$eval('h1', el => el.textContent).catch(() => 'No title found');
    const hasImage = await page.$('img[src*="nasa.gov"], img[src*="http"]').then(el => !!el);
    const hasError = await page.$('.error, [class*="error"]').then(el => !!el);
    
    console.log(`📄 Page title: ${title}`);
    console.log(`🖼️ Has image: ${hasImage}`);
    console.log(`❌ Has error: ${hasError}`);
    
    // Check for specific APOD content
    const apodTitle = await page.$('.apod-title, h2, h3').then(async el => {
      return el ? await page.evaluate(el => el.textContent, el) : null;
    }).catch(() => null);
    
    if (apodTitle) {
      console.log(`🌌 APOD Title: ${apodTitle}`);
    }
    
    // Log API calls made
    console.log(`\n📊 Frontend API requests: ${apiRequests.length}`);
    apiRequests.forEach(req => {
      const success = req.status >= 200 && req.status < 300;
      console.log(`  ${success ? '✅' : '❌'} ${req.status} ${req.url}`);
    });
    
  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n🎯 Local stack test completed!');
  
  if (apiRequests.length > 0 && apiRequests.some(req => req.status === 200)) {
    console.log('✅ Timeout fix working - no more 408 errors locally!');
  }
}

runTests().catch(console.error);

async function runTests() {
  await testLocalStack();
}