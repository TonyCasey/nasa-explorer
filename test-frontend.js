const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting Puppeteer test of NASA Space Explorer frontend...');
  
  const browser = await puppeteer.launch({ 
    headless: false,  // Set to true for headless mode
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  // Set up console logging from the page
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Browser Error:', msg.text());
    } else if (msg.type() === 'warn') {
      console.log('⚠️ Browser Warning:', msg.text());
    } else {
      console.log('📝 Browser Log:', msg.text());
    }
  });
  
  // Set up request/response monitoring
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    if (url.includes('nasa-explorer')) {
      console.log(`🌐 API Response: ${status} - ${url}`);
    }
  });
  
  try {
    console.log('🔍 Navigating to frontend...');
    await page.goto('https://frontend-qsyjnxvbq-tonys-projects-e30b27a9.vercel.app', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for the page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📷 Taking screenshot...');
    await page.screenshot({ path: 'frontend-screenshot.png', fullPage: true });
    
    // Check page title
    const title = await page.title();
    console.log(`📋 Page Title: "${title}"`);
    
    // Check for main elements
    const elements = await page.evaluate(() => {
      return {
        hasNavigation: !!document.querySelector('nav, .navigation, [class*="nav"]'),
        hasMainContent: !!document.querySelector('main, .main, [class*="main"]'),
        hasHeader: !!document.querySelector('header, .header, h1'),
        errorMessages: Array.from(document.querySelectorAll('[class*="error"], .error')).map(el => el.textContent),
        loadingIndicators: Array.from(document.querySelectorAll('[class*="loading"], .loading')).map(el => el.textContent),
        apiEndpoints: Array.from(document.querySelectorAll('[class*="api"], [data-api]')).length
      };
    });
    
    console.log('🔍 Page Analysis:');
    console.log(`   Navigation: ${elements.hasNavigation ? '✅' : '❌'}`);
    console.log(`   Main Content: ${elements.hasMainContent ? '✅' : '❌'}`);
    console.log(`   Header: ${elements.hasHeader ? '✅' : '❌'}`);
    console.log(`   Error Messages: ${elements.errorMessages.length > 0 ? elements.errorMessages : 'None'}`);
    console.log(`   Loading Indicators: ${elements.loadingIndicators.length > 0 ? elements.loadingIndicators : 'None'}`);
    
    // Check network requests
    console.log('🌐 Checking API connectivity...');
    
    // Wait a bit more for any async API calls
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if there are any React error boundaries or error messages
    const reactErrors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[class*="error"], .error, [role="alert"]');
      return Array.from(errorElements).map(el => ({
        text: el.textContent,
        className: el.className
      }));
    });
    
    if (reactErrors.length > 0) {
      console.log('🚨 Found error elements:');
      reactErrors.forEach(error => console.log(`   - ${error.text} (${error.className})`));
    }
    
    // Try to interact with the page
    console.log('🖱️ Testing page interactions...');
    
    // Look for navigation links or buttons
    const navLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a, button, [role="button"]');
      return Array.from(links).slice(0, 5).map(el => ({
        text: el.textContent.trim(),
        href: el.href || el.onclick || 'clickable'
      }));
    });
    
    console.log('🔗 Found interactive elements:');
    navLinks.forEach(link => {
      if (link.text) {
        console.log(`   - "${link.text}" (${link.href})`);
      }
    });
    
    console.log('✅ Frontend test completed successfully!');
    console.log('📷 Screenshot saved as: frontend-screenshot.png');
    
  } catch (error) {
    console.error('❌ Error during frontend test:', error.message);
  } finally {
    console.log('🔍 Keeping browser open for 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
    console.log('🏁 Puppeteer test completed.');
  }
})();