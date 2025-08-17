const puppeteer = require('puppeteer');
const axios = require('axios');

async function testCleanRestart() {
  console.log('🧪 Testing clean restart with timeout fix...\n');
  
  // Test 1: Direct backend API
  console.log('1️⃣ Testing backend API directly...');
  const backendStart = Date.now();
  try {
    const response = await axios.get('http://localhost:5000/api/v1/apod', {
      timeout: 30000
    });
    const backendTime = Date.now() - backendStart;
    
    console.log(`   ✅ Backend: ${response.status} in ${backendTime}ms`);
    console.log(`   📊 Success: ${response.data.success}`);
    console.log(`   📸 Title: ${response.data.data?.title || 'N/A'}`);
    
    if (backendTime < 30000) {
      console.log(`   🎯 No 408 timeout - backend working correctly!`);
    }
  } catch (error) {
    console.log(`   ❌ Backend error: ${error.message}`);
    return;
  }
  
  // Test 2: Frontend integration
  console.log('\n2️⃣ Testing frontend integration...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Track API calls
  const apiCalls = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('localhost:5000')) {
      apiCalls.push({
        url,
        status: response.status(),
        time: new Date().toISOString()
      });
      console.log(`   📡 Frontend API call: ${response.status()} ${url}`);
    }
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('timeout')) {
      console.log(`   ❌ Frontend timeout error: ${msg.text()}`);
    }
  });
  
  try {
    console.log('   🌐 Loading frontend...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle0',
      timeout: 15000 
    });
    
    console.log('   📸 Navigating to APOD page...');
    await page.goto('http://localhost:3001/apod', { 
      waitUntil: 'networkidle0',
      timeout: 45000  // Give it time for API call
    });
    
    // Check if content loaded
    await page.waitForTimeout(2000);
    
    const hasTitle = await page.$('h1, h2, h3').then(el => !!el);
    const hasImage = await page.$('img[src]').then(el => !!el);
    const hasError = await page.$('.error, [class*="error"]').then(el => !!el);
    
    console.log(`   📄 Has title: ${hasTitle}`);
    console.log(`   🖼️ Has image: ${hasImage}`);
    console.log(`   ❌ Has error: ${hasError}`);
    
    // Check API calls
    console.log(`\n📊 API calls made: ${apiCalls.length}`);
    apiCalls.forEach(call => {
      const success = call.status >= 200 && call.status < 300;
      console.log(`   ${success ? '✅' : '❌'} ${call.status} - ${call.url}`);
    });
    
    if (apiCalls.length > 0 && apiCalls.every(call => call.status !== 408)) {
      console.log('\n🎉 SUCCESS: No 408 timeout errors detected!');
      console.log('✅ The timeout fix is working correctly.');
    } else if (apiCalls.some(call => call.status === 408)) {
      console.log('\n⚠️ Still getting 408 errors - needs investigation');
    } else {
      console.log('\n🤔 No API calls detected - might need more time');
    }
    
  } catch (error) {
    console.log(`   ❌ Frontend test error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  console.log('\n🏁 Clean restart test completed!');
}

testCleanRestart().catch(console.error);