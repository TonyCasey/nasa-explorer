const puppeteer = require('puppeteer');

async function debugMobileNav() {
  console.log('🔍 Debugging mobile navigation...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 100
  });

  const page = await browser.newPage();
  
  // Capture console logs and errors
  page.on('console', msg => {
    console.log(`🖥️  CONSOLE [${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`🚨 PAGE ERROR: ${err.message}`);
  });
  
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n📱 Mobile view set (375x667)');
    
    // Check if hamburger button exists
    const hamburgerButton = await page.$('.mobile-menu-button');
    console.log(`🍔 Hamburger button found: ${hamburgerButton !== null}`);
    
    if (hamburgerButton) {
      // Check button properties
      const buttonVisible = await page.evaluate(() => {
        const btn = document.querySelector('.mobile-menu-button');
        if (!btn) return false;
        
        const style = window.getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();
        
        return {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          position: rect.x + ', ' + rect.y,
          size: rect.width + 'x' + rect.height,
          clickable: btn.offsetParent !== null
        };
      });
      
      console.log('🍔 Button properties:', buttonVisible);
      
      // Check initial nav state
      const initialNavState = await page.evaluate(() => {
        const nav = document.querySelector('.mobile-nav');
        if (!nav) return 'not found';
        
        return {
          classes: nav.className,
          hidden: nav.classList.contains('-translate-x-full'),
          visible: nav.classList.contains('translate-x-0')
        };
      });
      
      console.log('📱 Initial nav state:', initialNavState);
      
      // Try clicking the hamburger
      console.log('\n🖱️  Clicking hamburger button...');
      await hamburgerButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check nav state after click
      const afterClickNavState = await page.evaluate(() => {
        const nav = document.querySelector('.mobile-nav');
        if (!nav) return 'not found';
        
        return {
          classes: nav.className,
          hidden: nav.classList.contains('-translate-x-full'),
          visible: nav.classList.contains('translate-x-0')
        };
      });
      
      console.log('📱 Nav state after click:', afterClickNavState);
      
      // Check for overlay
      const overlayExists = await page.$('div.fixed.inset-0.bg-black\\/50') !== null;
      console.log(`🌫️  Overlay visible: ${overlayExists}`);
      
      // Take screenshot
      await page.screenshot({ path: 'mobile-debug-screenshot.png', fullPage: true });
      console.log('📸 Screenshot saved: mobile-debug-screenshot.png');
    }
    
    // Check React state
    const reactState = await page.evaluate(() => {
      // Try to access React component state if possible
      const root = document.querySelector('#root');
      return root ? 'React root found' : 'React root not found';
    });
    
    console.log('⚛️  React state:', reactState);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    console.log('\n⏳ Keeping browser open for 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
}

debugMobileNav().catch(console.error);