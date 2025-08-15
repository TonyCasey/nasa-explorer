const puppeteer = require('puppeteer');

async function quickTest() {
  console.log('🚀 Quick browser test - checking what\'s actually running...');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 500,
    defaultViewport: { width: 1280, height: 720 }
  });

  const page = await browser.newPage();
  
  try {
    const ports = [3000, 3001, 3002, 3005, 5000];
    
    for (const port of ports) {
      const url = `http://localhost:${port}`;
      try {
        console.log(`\n🔍 Checking port ${port}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
        
        const title = await page.title();
        console.log(`   ✅ Found: ${title}`);
        
        // Take screenshot
        await page.screenshot({ 
          path: `port-${port}-screenshot.png`, 
          fullPage: true 
        });
        console.log(`   📸 Screenshot saved: port-${port}-screenshot.png`);
        
        // Check for errors
        const errorText = await page.$eval('body', el => el.innerText).catch(() => null);
        if (errorText && errorText.includes('ERROR')) {
          console.log(`   ⚠️  Contains errors`);
        } else {
          console.log(`   ✅ Looks healthy`);
        }
        
      } catch (error) {
        console.log(`   ❌ Port ${port} not responding`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
    console.log('🔚 Browser closed');
  }
}

quickTest().catch(console.error);