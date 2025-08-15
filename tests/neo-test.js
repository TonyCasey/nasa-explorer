const puppeteer = require('puppeteer');

async function testNEOFix() {
  console.log('🧪 Testing NEO Tracker page fix...');
  
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
    if (text.includes('Error') || text.includes('error') || text.includes('400') || text.includes('NEO')) {
      console.log(`CONSOLE: ${text}`);
    }
  });

  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 10000 });
    
    console.log('☄️ Testing NEO Tracker page...');
    await page.click('a[href="/neo-tracker"]');
    await page.waitForSelector('h1, h2, .loading', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const errorMessages = consoleMessages.filter(msg => 
      msg.includes('Error') || msg.includes('error') || msg.includes('400')
    );
    
    if (errorMessages.length === 0) {
      console.log('✅ NEO Tracker loading without errors!');
    } else {
      console.log('⚠️ Some errors detected:');
      errorMessages.forEach(msg => console.log(`  ${msg}`));
    }
    
    await page.screenshot({ path: 'neo-tracker-test.png' });
    console.log('📸 Screenshot saved');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await browser.close();
  }
}

testNEOFix().catch(console.error);