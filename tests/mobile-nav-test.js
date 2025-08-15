const puppeteer = require('puppeteer');

async function testMobileNavigation() {
  console.log('📱 Testing mobile navigation functionality...');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    console.log('🌐 Loading application...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Test Desktop View
    console.log('\n🖥️  Testing Desktop View (1920x1080)...');
    await page.setViewport({ width: 1920, height: 1080 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const desktopNavVisible = await page.$('.mobile-nav:not(.fixed)') !== null;
    const hamburgerVisible = await page.$('.mobile-menu-button') !== null;
    
    console.log(`   ✅ Desktop nav visible: ${desktopNavVisible}`);
    console.log(`   ✅ Hamburger hidden: ${!hamburgerVisible}`);
    
    await page.screenshot({ 
      path: 'desktop-nav-test.png',
      fullPage: false 
    });
    
    // Test Tablet View
    console.log('\n📱 Testing Tablet View (768x1024)...');
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const tabletHamburgerVisible = await page.$('.mobile-menu-button') !== null;
    const tabletNavHidden = await page.evaluate(() => {
      const nav = document.querySelector('.mobile-nav');
      return nav && nav.classList.contains('-translate-x-full');
    });
    
    console.log(`   ✅ Tablet hamburger visible: ${tabletHamburgerVisible}`);
    console.log(`   ✅ Tablet nav hidden: ${tabletNavHidden}`);
    
    await page.screenshot({ 
      path: 'tablet-nav-closed-test.png',
      fullPage: false 
    });
    
    // Test Mobile Menu Open
    if (tabletHamburgerVisible) {
      console.log('\n🔘 Testing mobile menu open...');
      await page.click('.mobile-menu-button');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const navOpen = await page.evaluate(() => {
        const nav = document.querySelector('.mobile-nav');
        return nav && nav.classList.contains('translate-x-0');
      });
      
      const overlayVisible = await page.$('div.fixed.inset-0.bg-black\\/50') !== null;
      
      console.log(`   ✅ Nav slides in: ${navOpen}`);
      console.log(`   ✅ Overlay visible: ${overlayVisible}`);
      
      await page.screenshot({ 
        path: 'tablet-nav-open-test.png',
        fullPage: false 
      });
      
      // Test clicking a nav link
      console.log('\n🔗 Testing navigation link click...');
      await page.click('a[href="/apod"]');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentUrl = page.url();
      const menuClosedAfterClick = await page.evaluate(() => {
        const nav = document.querySelector('.mobile-nav');
        return nav && nav.classList.contains('-translate-x-full');
      });
      
      console.log(`   ✅ Navigated to: ${currentUrl}`);
      console.log(`   ✅ Menu closed after navigation: ${menuClosedAfterClick}`);
    }
    
    // Test Mobile View
    console.log('\n📱 Testing Mobile View (375x667)...');
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mobileHamburgerVisible = await page.$('.mobile-menu-button') !== null;
    console.log(`   ✅ Mobile hamburger visible: ${mobileHamburgerVisible}`);
    
    await page.screenshot({ 
      path: 'mobile-nav-test.png',
      fullPage: false 
    });
    
    // Test hamburger animation
    if (mobileHamburgerVisible) {
      console.log('\n🍔 Testing hamburger animation...');
      await page.click('.mobile-menu-button');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await page.screenshot({ 
        path: 'mobile-nav-hamburger-open.png',
        fullPage: false 
      });
      
      // Close menu by clicking overlay
      const overlay = await page.$('div.fixed.inset-0.bg-black\\/50');
      if (overlay) {
        console.log('   🔘 Testing overlay click to close...');
        await overlay.click();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const menuClosedByOverlay = await page.evaluate(() => {
          const nav = document.querySelector('.mobile-nav');
          return nav && nav.classList.contains('-translate-x-full');
        });
        
        console.log(`   ✅ Menu closed by overlay: ${menuClosedByOverlay}`);
      }
    }
    
    console.log('\n✅ Mobile navigation tests completed!');
    console.log('\nScreenshots saved:');
    console.log('  - desktop-nav-test.png');
    console.log('  - tablet-nav-closed-test.png'); 
    console.log('  - tablet-nav-open-test.png');
    console.log('  - mobile-nav-test.png');
    console.log('  - mobile-nav-hamburger-open.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    console.log('\n🔚 Closing browser...');
    await browser.close();
  }
}

testMobileNavigation().catch(console.error);