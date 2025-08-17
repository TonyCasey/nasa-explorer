const puppeteer = require('puppeteer');

async function testProductionAPI() {
  console.log('🧪 Testing production API timeout fix...\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Enable request/response logging
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('nasa-server.tonycasey.dev')) {
      console.log(`📡 API Response: ${response.status()} ${url}`);
      
      if (response.status() === 408) {
        console.log('❌ Still getting 408 timeout errors');
      } else if (response.status() === 200) {
        console.log('✅ API request successful');
      }
    }
  });
  
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔍 Console Error:', msg.text());
    }
  });
  
  try {
    console.log('🌐 Loading production site...');
    await page.goto('https://nasa.tonycasey.dev', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    console.log('📸 Navigating to APOD page...');
    await page.goto('https://nasa.tonycasey.dev/apod', { 
      waitUntil: 'networkidle2',
      timeout: 45000 
    });
    
    // Check if APOD loaded successfully
    const apodImage = await page.$('[data-testid="apod-image"]');
    const errorMessage = await page.$('.error-message');
    
    if (apodImage) {
      console.log('✅ APOD loaded successfully - timeout fix working!');
      
      // Get the image src to verify it's a real NASA image
      const imageSrc = await page.evaluate(img => img.src, apodImage);
      console.log(`🖼️ Image URL: ${imageSrc}`);
      
    } else if (errorMessage) {
      const errorText = await page.evaluate(el => el.textContent, errorMessage);
      console.log(`❌ Error on page: ${errorText}`);
    } else {
      console.log('⚠️ No image or error found - page may still be loading');
    }
    
    // Wait a bit more and test Mars Rovers page
    console.log('\n🔴 Testing Mars Rovers page...');
    await page.goto('https://nasa.tonycasey.dev/mars-rovers', { 
      waitUntil: 'networkidle2',
      timeout: 45000 
    });
    
    const roverPhotos = await page.$$('.rover-photo');
    const marsError = await page.$('.error-message');
    
    if (roverPhotos.length > 0) {
      console.log(`✅ Mars Rovers loaded ${roverPhotos.length} photos`);
    } else if (marsError) {
      const errorText = await page.evaluate(el => el.textContent, marsError);
      console.log(`❌ Mars Rovers error: ${errorText}`);
    }
    
    console.log('\n🎯 Production API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testProductionAPI().catch(console.error);