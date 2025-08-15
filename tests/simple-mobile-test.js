const puppeteer = require('puppeteer');

async function simpleMobileTest() {
  console.log('🧪 Simple mobile test - checking state and rendering...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`CONSOLE: ${msg.text()}`);
  });
  
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    
    // Test desktop first
    console.log('\n🖥️  Desktop (1920x1080):');
    await page.setViewport({ width: 1920, height: 1080 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const desktopState = await page.evaluate(() => {
      return {
        windowWidth: window.innerWidth,
        hamburgerExists: !!document.querySelector('.mobile-menu-button'),
        hamburgerVisible: document.querySelector('.mobile-menu-button')?.offsetParent !== null,
        navClasses: document.querySelector('.mobile-nav')?.className || 'not found'
      };
    });
    
    console.log('Desktop state:', desktopState);
    
    // Test mobile
    console.log('\n📱 Mobile (375x667):');
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Give more time for resize handler
    
    const mobileState = await page.evaluate(() => {
      return {
        windowWidth: window.innerWidth,
        hamburgerExists: !!document.querySelector('.mobile-menu-button'),
        hamburgerVisible: document.querySelector('.mobile-menu-button')?.offsetParent !== null,
        hamburgerStyles: window.getComputedStyle(document.querySelector('.mobile-menu-button') || document.createElement('div')),
        navClasses: document.querySelector('.mobile-nav')?.className || 'not found'
      };
    });
    
    console.log('Mobile state:');
    console.log('  Window width:', mobileState.windowWidth);
    console.log('  Hamburger exists:', mobileState.hamburgerExists);
    console.log('  Hamburger visible:', mobileState.hamburgerVisible);
    console.log('  Nav classes:', mobileState.navClasses);
    
    if (mobileState.hamburgerExists) {
      // Try to trigger click with JavaScript instead of Puppeteer
      console.log('\n🖱️  Attempting JavaScript click...');
      
      const clickResult = await page.evaluate(() => {
        const button = document.querySelector('.mobile-menu-button');
        if (button) {
          console.log('🍔 Button found, attempting click via JavaScript');
          button.click();
          return 'clicked';
        }
        return 'button not found';
      });
      
      console.log('Click result:', clickResult);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const afterClickState = await page.evaluate(() => {
        const nav = document.querySelector('.mobile-nav');
        return {
          navClasses: nav?.className || 'not found',
          hasTranslateX0: nav?.classList.contains('translate-x-0') || false,
          hasTranslateXFull: nav?.classList.contains('-translate-x-full') || false
        };
      });
      
      console.log('After click nav state:', afterClickState);
    }
    
    await page.screenshot({ path: 'simple-mobile-test.png' });
    console.log('📸 Screenshot saved');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
}

simpleMobileTest().catch(console.error);