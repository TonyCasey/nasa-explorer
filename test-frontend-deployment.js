const puppeteer = require('puppeteer');

async function testFrontendDeployment() {
  console.log('🚀 Starting frontend deployment test...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });
      
      // Color code console output
      if (type === 'error') {
        console.log(`❌ [ERROR]: ${text}`);
      } else if (type === 'warning') {
        console.log(`⚠️  [WARN]: ${text}`);
      } else if (type === 'info') {
        console.log(`ℹ️  [INFO]: ${text}`);
      } else {
        console.log(`📝 [${type.toUpperCase()}]: ${text}`);
      }
    });

    // Capture network errors
    const networkErrors = [];
    page.on('requestfailed', request => {
      const failure = {
        url: request.url(),
        method: request.method(),
        errorText: request.failure()?.errorText
      };
      networkErrors.push(failure);
      console.log(`\n🔴 Network Error: ${request.method()} ${request.url()}`);
      console.log(`   Error: ${failure.errorText}`);
    });

    // Capture successful API calls
    const apiCalls = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('api') || url.includes('nasa')) {
        const status = response.status();
        apiCalls.push({ url, status });
        
        if (status >= 400) {
          console.log(`\n⛔ API Error: ${status} - ${url}`);
        } else if (status >= 200 && status < 300) {
          console.log(`\n✅ API Success: ${status} - ${url}`);
        }
      }
    });

    // Test the Vercel deployment
    const frontendUrl = 'https://frontend-f64eio70y-tonys-projects-e30b27a9.vercel.app';
    console.log(`\n📍 Testing frontend at: ${frontendUrl}\n`);
    
    await page.goto(frontendUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait a bit for any async operations
    await page.waitForTimeout(5000);

    // Get page title
    const title = await page.title();
    console.log(`\n📄 Page Title: ${title}`);

    // Check for specific elements
    console.log('\n🔍 Checking for key elements...');
    
    // Check if main app container exists
    const appExists = await page.$('#root') !== null;
    console.log(`   App Root: ${appExists ? '✅ Found' : '❌ Missing'}`);

    // Check for navigation
    const navExists = await page.$('nav') !== null;
    console.log(`   Navigation: ${navExists ? '✅ Found' : '❌ Missing'}`);

    // Check for images
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        loaded: img.complete && img.naturalHeight !== 0
      }))
    );
    
    console.log(`\n🖼️  Images found: ${images.length}`);
    images.forEach(img => {
      console.log(`   ${img.loaded ? '✅' : '❌'} ${img.src.substring(0, 80)}...`);
      if (!img.loaded) {
        console.log(`      Alt text: ${img.alt || 'No alt text'}`);
      }
    });

    // Check localStorage for any stored data
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    
    if (Object.keys(localStorageData).length > 0) {
      console.log('\n💾 LocalStorage Data:');
      Object.entries(localStorageData).forEach(([key, value]) => {
        console.log(`   ${key}: ${value?.substring(0, 50)}...`);
      });
    }

    // Take a screenshot
    await page.screenshot({ 
      path: 'frontend-deployment-test.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved as frontend-deployment-test.png');

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Console Errors: ${consoleMessages.filter(m => m.type === 'error').length}`);
    console.log(`Console Warnings: ${consoleMessages.filter(m => m.type === 'warning').length}`);
    console.log(`Network Errors: ${networkErrors.length}`);
    console.log(`API Calls: ${apiCalls.length}`);
    console.log(`Images: ${images.length} (Loaded: ${images.filter(i => i.loaded).length})`);
    
    // Print all console errors for debugging
    const errors = consoleMessages.filter(m => m.type === 'error');
    if (errors.length > 0) {
      console.log('\n🔴 All Console Errors:');
      errors.forEach(err => console.log(`   - ${err.text}`));
    }

    // Print all network errors
    if (networkErrors.length > 0) {
      console.log('\n🔴 All Network Errors:');
      networkErrors.forEach(err => {
        console.log(`   - ${err.method} ${err.url}`);
        console.log(`     Error: ${err.errorText}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await browser.close();
    console.log('\n✅ Test completed');
  }
}

testFrontendDeployment().catch(console.error);