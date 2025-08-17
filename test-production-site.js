const puppeteer = require('puppeteer');

async function testProductionSite() {
  console.log('🚀 Testing NASA Space Explorer Production Sites\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      // Skip Vercel messages
      if (text.includes('vercel') || text.includes('Check out our code')) {
        return;
      }
      
      consoleMessages.push({ type, text });
      
      if (type === 'error') {
        console.log(`❌ Console Error: ${text}`);
      } else if (type === 'warning') {
        console.log(`⚠️  Console Warning: ${text}`);
      }
    });

    // Capture network activity
    const apiCalls = [];
    const failedRequests = [];
    
    page.on('requestfailed', request => {
      const url = request.url();
      const failure = request.failure();
      failedRequests.push({ url, error: failure?.errorText });
      console.log(`🔴 Failed Request: ${url}`);
      if (failure) console.log(`   Error: ${failure.errorText}`);
    });
    
    page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      
      // Track API calls
      if (url.includes('nasa-server.tonycasey.dev') || 
          url.includes('api.nasa.gov') || 
          url.includes('/api/')) {
        apiCalls.push({ url, status });
        
        if (status >= 400) {
          console.log(`⛔ API Error ${status}: ${url}`);
          try {
            const text = await response.text();
            console.log(`   Response: ${text.substring(0, 200)}`);
          } catch (e) {}
        } else if (status >= 200 && status < 300) {
          console.log(`✅ API Success ${status}: ${url}`);
        }
      }
    });

    // Test the production site
    console.log('📍 Testing https://nasa.tonycasey.dev\n');
    
    const response = await page.goto('https://nasa.tonycasey.dev', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log(`   Page Status: ${response.status()}`);
    
    // Wait for React to fully render
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check page title
    const title = await page.title();
    console.log(`   Page Title: ${title}`);
    
    // Check for React app
    const hasRoot = await page.$('#root') !== null;
    console.log(`   React App Root: ${hasRoot ? '✅ Found' : '❌ Missing'}`);
    
    // Check navigation
    const hasNav = await page.$('nav') !== null;
    console.log(`   Navigation: ${hasNav ? '✅ Found' : '❌ Missing'}`);
    
    // Check for main sections
    const sections = await page.$$eval('section', sections => sections.length);
    console.log(`   Main Sections: ${sections}`);
    
    // Check for images
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt || 'no-alt',
        loaded: img.complete && img.naturalHeight !== 0,
        width: img.naturalWidth,
        height: img.naturalHeight
      }))
    );
    
    console.log(`\n🖼️  Images Analysis:`);
    console.log(`   Total Images: ${images.length}`);
    
    const nasaImages = images.filter(img => 
      img.src.includes('nasa') || 
      img.src.includes('apod') || 
      img.src.includes('mars')
    );
    
    const loadedImages = images.filter(img => img.loaded);
    const failedImages = images.filter(img => !img.loaded);
    
    console.log(`   Loaded Successfully: ${loadedImages.length}`);
    console.log(`   Failed to Load: ${failedImages.length}`);
    console.log(`   NASA/APOD Images: ${nasaImages.length}`);
    
    if (failedImages.length > 0) {
      console.log('\n   ❌ Failed Images:');
      failedImages.forEach(img => {
        console.log(`      - ${img.src.substring(0, 80)}...`);
        console.log(`        Alt: ${img.alt}`);
      });
    }
    
    if (nasaImages.length > 0) {
      console.log('\n   📸 NASA Images:');
      nasaImages.slice(0, 5).forEach(img => {
        console.log(`      ${img.loaded ? '✅' : '❌'} ${img.src.substring(0, 60)}...`);
        if (img.loaded) {
          console.log(`         Size: ${img.width}x${img.height}`);
        }
      });
    }
    
    // Check localStorage
    const localStorage = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        data[key] = window.localStorage.getItem(key);
      }
      return data;
    });
    
    if (Object.keys(localStorage).length > 0) {
      console.log('\n💾 LocalStorage:');
      Object.entries(localStorage).forEach(([key, value]) => {
        if (key.includes('favorites')) {
          console.log(`   ${key}: ${value?.substring(0, 50)}...`);
        }
      });
    }
    
    // Check for loading spinners
    const hasSpinner = await page.$('.animate-spin') !== null;
    console.log(`\n⏳ Loading Spinner: ${hasSpinner ? 'Still Loading' : 'Not Present'}`);
    
    // Check for error messages
    const errorElements = await page.$$eval('[class*="error"], [class*="Error"]', els => els.length);
    console.log(`🚨 Error Elements: ${errorElements}`);
    
    // Navigate to different pages
    console.log('\n📱 Testing Navigation:');
    
    const navLinks = [
      { text: 'APOD', expected: 'Picture of the Day' },
      { text: 'Mars Rovers', expected: 'Mars' },
      { text: 'NEO Tracker', expected: 'Near Earth Objects' }
    ];
    
    for (const link of navLinks) {
      try {
        const linkElement = await page.$(`nav a:has-text("${link.text}")`);
        if (linkElement) {
          await linkElement.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          const content = await page.content();
          console.log(`   ${link.text}: ${content.includes(link.expected) ? '✅' : '❌'}`);
        }
      } catch (e) {
        // Try alternate selector
        try {
          await page.evaluate((text) => {
            const links = Array.from(document.querySelectorAll('nav a'));
            const link = links.find(l => l.textContent.includes(text));
            if (link) link.click();
          }, link.text);
          await new Promise(resolve => setTimeout(resolve, 2000));
          const content = await page.content();
          console.log(`   ${link.text}: ${content.includes(link.expected) ? '✅' : '❌'}`);
        } catch (e2) {
          console.log(`   ${link.text}: ⚠️  Could not navigate`);
        }
      }
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'production-site-screenshot.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved as production-site-screenshot.png');
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 PRODUCTION SITE TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Site URL: https://nasa.tonycasey.dev`);
    console.log(`✅ Backend URL: https://nasa-server.tonycasey.dev`);
    console.log(`Console Errors: ${consoleMessages.filter(m => m.type === 'error').length}`);
    console.log(`Failed Requests: ${failedRequests.length}`);
    console.log(`API Calls: ${apiCalls.length}`);
    console.log(`Images Loaded: ${loadedImages.length}/${images.length}`);
    
    if (apiCalls.length > 0) {
      const successfulAPIs = apiCalls.filter(c => c.status >= 200 && c.status < 300);
      const failedAPIs = apiCalls.filter(c => c.status >= 400);
      console.log(`API Success Rate: ${successfulAPIs.length}/${apiCalls.length}`);
      
      if (failedAPIs.length > 0) {
        console.log('\n❌ Failed API Calls:');
        failedAPIs.forEach(api => {
          console.log(`   [${api.status}] ${api.url}`);
        });
      }
    }
    
    if (consoleMessages.filter(m => m.type === 'error').length > 0) {
      console.log('\n❌ Console Errors Detail:');
      consoleMessages.filter(m => m.type === 'error').forEach(msg => {
        console.log(`   - ${msg.text}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Test Completed');
  }
}

testProductionSite().catch(console.error);