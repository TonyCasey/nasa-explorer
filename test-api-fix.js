const puppeteer = require('puppeteer');

async function testApiFix() {
  console.log('🧪 Testing API URL fix...\n');
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Monitor network requests
  const requests = [];
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('nasa')) {
      requests.push(url);
      console.log(`📡 Request: ${url}`);
    }
  });
  
  try {
    await page.goto('https://nasa.tonycasey.dev', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log(`\n📊 Total API requests: ${requests.length}`);
    
    // Check if any requests have the malformed URL
    const malformedRequests = requests.filter(url => url.includes('REACT_APP_API_URL'));
    const correctRequests = requests.filter(url => url.includes('nasa-server.tonycasey.dev') && !url.includes('REACT_APP_API_URL'));
    
    console.log(`❌ Malformed requests: ${malformedRequests.length}`);
    console.log(`✅ Correct requests: ${correctRequests.length}`);
    
    if (malformedRequests.length > 0) {
      console.log('\n❌ Malformed URLs found:');
      malformedRequests.forEach(url => console.log(`   ${url}`));
    }
    
    if (correctRequests.length > 0) {
      console.log('\n✅ Correct URLs found:');
      correctRequests.forEach(url => console.log(`   ${url}`));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testApiFix().catch(console.error);