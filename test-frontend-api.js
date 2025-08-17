const puppeteer = require('puppeteer');

async function testFrontendAPI() {
  console.log('🚀 Testing frontend deployment and API connections...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      // Skip Vercel-specific messages
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

    // Capture API calls
    const apiCalls = [];
    page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      
      // Track NASA API and backend API calls
      if (url.includes('nasa-explorer') || url.includes('api.nasa.gov') || url.includes('localhost:5000') || url.includes('heroku')) {
        apiCalls.push({ url, status });
        
        if (status >= 400) {
          console.log(`\n⛔ API Error ${status}: ${url}`);
          try {
            const text = await response.text();
            console.log(`   Response: ${text.substring(0, 200)}`);
          } catch (e) {}
        } else if (status >= 200 && status < 300) {
          console.log(`\n✅ API Success ${status}: ${url}`);
        }
      }
    });

    // Test localhost first (if running)
    console.log('📍 Testing local frontend (if running)...');
    try {
      await page.goto('http://localhost:3000', { 
        waitUntil: 'domcontentloaded',
        timeout: 5000 
      });
      console.log('✅ Local frontend is running\n');
      
      // Wait for potential API calls
      await page.waitForTimeout(3000);
      
      // Check for images
      const localImages = await page.$$eval('img', imgs => 
        imgs.map(img => ({
          src: img.src,
          loaded: img.complete && img.naturalHeight !== 0,
          error: img.naturalHeight === 0
        }))
      );
      
      console.log(`🖼️  Local Images: ${localImages.length}`);
      localImages.forEach(img => {
        if (img.src.includes('nasa') || img.src.includes('apod')) {
          console.log(`   ${img.loaded ? '✅' : '❌'} ${img.src.substring(0, 80)}...`);
        }
      });
      
    } catch (localError) {
      console.log('⚠️  Local frontend not running, testing production...\n');
    }

    // Test production frontend
    const productionUrls = [
      'https://frontend-f64eio70y-tonys-projects-e30b27a9.vercel.app',
      'https://nasa-space-explorer-frontend.vercel.app'
    ];
    
    for (const url of productionUrls) {
      console.log(`\n📍 Testing: ${url}`);
      
      try {
        const response = await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000 
        });
        
        const status = response.status();
        console.log(`   Status: ${status}`);
        
        if (status === 200) {
          // Wait for React to render
          await page.waitForTimeout(5000);
          
          // Check for main content
          const hasApp = await page.$('#root') !== null;
          console.log(`   React App: ${hasApp ? '✅ Loaded' : '❌ Not found'}`);
          
          // Check environment variables
          const envVars = await page.evaluate(() => {
            return {
              apiUrl: window.REACT_APP_API_URL || 'not set',
              nasaApiKey: window.REACT_APP_NASA_API_KEY ? 'set' : 'not set'
            };
          });
          
          console.log(`   Environment Variables:`);
          console.log(`     - API URL: ${envVars.apiUrl}`);
          console.log(`     - NASA API Key: ${envVars.nasaApiKey}`);
          
          // Check for images
          const images = await page.$$eval('img', imgs => 
            imgs.map(img => ({
              src: img.src,
              loaded: img.complete && img.naturalHeight !== 0
            }))
          );
          
          const nasaImages = images.filter(img => 
            img.src.includes('nasa') || 
            img.src.includes('apod') || 
            img.src.includes('mars')
          );
          
          if (nasaImages.length > 0) {
            console.log(`   NASA Images: ${nasaImages.length}`);
            nasaImages.forEach(img => {
              console.log(`     ${img.loaded ? '✅' : '❌'} ${img.src.substring(0, 60)}...`);
            });
          } else {
            console.log(`   ❌ No NASA images found`);
          }
          
          // Take screenshot
          await page.screenshot({ 
            path: `frontend-${Date.now()}.png`,
            fullPage: false 
          });
          console.log(`   📸 Screenshot saved`);
          
          break; // If successful, don't test other URLs
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // Test backend API directly
    console.log('\n📍 Testing Backend API directly...');
    
    const backendUrl = 'https://nasa-explorer-2347800d91dd.herokuapp.com';
    
    // Test root endpoint
    await page.goto(`${backendUrl}/`, { waitUntil: 'domcontentloaded' });
    const backendResponse = await page.content();
    console.log(`   Backend root: ${backendResponse.includes('NASA Space Explorer Backend') ? '✅ Working' : '❌ Error'}`);
    
    // Test API endpoints
    const endpoints = ['/api/v1/test', '/api/v1/apod', '/health'];
    for (const endpoint of endpoints) {
      try {
        const response = await page.goto(`${backendUrl}${endpoint}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        console.log(`   ${endpoint}: ${response.status() === 200 ? '✅' : '❌'} Status ${response.status()}`);
      } catch (e) {
        console.log(`   ${endpoint}: ❌ Error - ${e.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Console Errors: ${consoleMessages.filter(m => m.type === 'error').length}`);
    console.log(`API Calls Made: ${apiCalls.length}`);
    
    if (apiCalls.length > 0) {
      console.log('\n📡 API Calls:');
      apiCalls.forEach(call => {
        console.log(`   ${call.status >= 400 ? '❌' : '✅'} [${call.status}] ${call.url}`);
      });
    }
    
    if (consoleMessages.filter(m => m.type === 'error').length > 0) {
      console.log('\n❌ Console Errors:');
      consoleMessages.filter(m => m.type === 'error').forEach(msg => {
        console.log(`   - ${msg.text}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await browser.close();
    console.log('\n✅ Test completed');
  }
}

testFrontendAPI().catch(console.error);