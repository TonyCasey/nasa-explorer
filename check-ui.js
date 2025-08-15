const puppeteer = require('puppeteer');
const fs = require('fs');

async function checkUI() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    devtools: true,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Comprehensive error collection
  const errors = {
    consoleErrors: [],
    networkErrors: [],
    jsErrors: [],
    cssErrors: [],
    accessibilityIssues: [],
    performanceIssues: [],
    uiIssues: []
  };

  // Listen for console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.consoleErrors.push({
        type: 'Console Error',
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
    if (msg.type() === 'warning') {
      errors.consoleErrors.push({
        type: 'Console Warning',
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Listen for unhandled exceptions
  page.on('pageerror', (error) => {
    errors.jsErrors.push({
      type: 'JavaScript Error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  // Listen for failed network requests
  page.on('requestfailed', (request) => {
    errors.networkErrors.push({
      type: 'Request Failed',
      url: request.url(),
      failure: request.failure().errorText,
      timestamp: new Date().toISOString()
    });
  });

  // Listen for responses with error status
  page.on('response', (response) => {
    if (response.status() >= 400) {
      errors.networkErrors.push({
        type: 'HTTP Error',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  try {
    console.log('🌐 Navigating to http://localhost:3000...');
    const response = await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    
    if (!response || !response.ok()) {
      throw new Error(`Failed to load application: ${response?.status()} ${response?.statusText()}`);
    }
    
    console.log('✅ Application loaded successfully');
    
    // Wait for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Fix webpack-dev-server overlay interference
    await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        if (iframe.id === 'webpack-dev-server-client-overlay' || 
            iframe.src === 'about:blank' ||
            window.getComputedStyle(iframe).zIndex > 1000000) {
          iframe.style.pointerEvents = 'none';
          console.log('Disabled pointer events for interfering iframe:', iframe.id || iframe.src);
        }
      });
    });
    
    // Take screenshot
    await page.screenshot({ path: 'ui-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as ui-screenshot.png');
    
    // Get page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Run comprehensive checks
    await checkUIElements(page, errors);
    await checkAccessibility(page, errors);
    await checkPerformance(page, errors);
    await testUserInteractions(page, errors);
    await testRoutes(page, errors);
    
    // Generate and display report
    const report = generateReport(errors, title);
    fs.writeFileSync('ui-check-report.json', JSON.stringify(report, null, 2));
    
    displayResults(report);
    console.log('📋 Detailed report saved to ui-check-report.json');
    
  } catch (error) {
    console.error('❌ Error checking UI:', error.message);
    errors.jsErrors.push({
      type: 'Critical Error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Still generate report even on error
    const report = generateReport(errors, 'Error State');
    fs.writeFileSync('ui-check-report.json', JSON.stringify(report, null, 2));
    displayResults(report);
  } finally {
    await browser.close();
  }
}

async function checkUIElements(page, errors) {
  console.log('🔍 Checking UI elements...');
  
  try {
    // Check for visible error messages
    const errorElements = await page.$$eval(
      '[class*="error"], .error, [data-testid*="error"], [role="alert"]', 
      elements => elements.map(el => ({
        text: el.textContent.trim(),
        className: el.className,
        visible: window.getComputedStyle(el).display !== 'none'
      })).filter(el => el.text.length > 0 && el.visible)
    ).catch(() => []);

    if (errorElements.length > 0) {
      errors.uiIssues.push({
        type: 'Visible Error Messages',
        count: errorElements.length,
        errors: errorElements,
        timestamp: new Date().toISOString()
      });
    }

    // Check for loading states that might be stuck
    const loadingElements = await page.$$eval(
      '[class*="loading"], .loading, [data-testid*="loading"], .spinner', 
      elements => elements.map(el => ({
        text: el.textContent.trim(),
        className: el.className,
        visible: window.getComputedStyle(el).display !== 'none'
      })).filter(el => el.visible)
    ).catch(() => []);

    if (loadingElements.length > 0) {
      errors.uiIssues.push({
        type: 'Stuck Loading States',
        count: loadingElements.length,
        elements: loadingElements,
        timestamp: new Date().toISOString()
      });
    }

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.complete || img.naturalHeight === 0).map(img => ({
        src: img.src,
        alt: img.alt || 'No alt text',
        className: img.className
      }));
    });

    if (brokenImages.length > 0) {
      errors.uiIssues.push({
        type: 'Broken Images',
        count: brokenImages.length,
        images: brokenImages,
        timestamp: new Date().toISOString()
      });
    }

    // Check for layout issues
    const layoutIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for horizontal scroll
      if (document.body.scrollWidth > window.innerWidth) {
        issues.push('Horizontal scroll detected');
      }

      // Check for elements positioned outside viewport
      const elements = document.querySelectorAll('*');
      let offScreenElements = 0;
      for (let i = 0; i < Math.min(elements.length, 50); i++) {
        const rect = elements[i].getBoundingClientRect();
        if (rect.right < 0 || rect.left > window.innerWidth) {
          offScreenElements++;
        }
      }
      
      if (offScreenElements > 5) {
        issues.push(`${offScreenElements} elements positioned outside viewport`);
      }

      return issues;
    });

    if (layoutIssues.length > 0) {
      errors.cssErrors.push({
        type: 'Layout Issues',
        issues: layoutIssues,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.log('Error checking UI elements:', error.message);
  }
}

async function checkAccessibility(page, errors) {
  console.log('♿ Checking accessibility...');
  
  try {
    const accessibilityIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for missing alt text on images
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        issues.push(`${imagesWithoutAlt.length} images missing alt text`);
      }

      // Check for empty alt text
      const imagesWithEmptyAlt = document.querySelectorAll('img[alt=""]');
      if (imagesWithEmptyAlt.length > 0) {
        issues.push(`${imagesWithEmptyAlt.length} images with empty alt text`);
      }

      // Check for missing form labels
      const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
      let unlabeledInputs = 0;
      inputs.forEach(input => {
        const hasLabel = document.querySelector(`label[for="${input.id}"]`) ||
                         input.getAttribute('aria-label') ||
                         input.getAttribute('aria-labelledby') ||
                         input.closest('label');
        if (!hasLabel) unlabeledInputs++;
      });
      
      if (unlabeledInputs > 0) {
        issues.push(`${unlabeledInputs} form inputs missing labels`);
      }

      // Check for missing heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) {
        issues.push('No heading elements found');
      }

      // Check for buttons without accessible names
      const buttonsWithoutNames = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      let unnamedButtons = 0;
      buttonsWithoutNames.forEach(button => {
        if (!button.textContent.trim() && !button.querySelector('img[alt]')) {
          unnamedButtons++;
        }
      });
      
      if (unnamedButtons > 0) {
        issues.push(`${unnamedButtons} buttons without accessible names`);
      }

      // Check for low contrast (basic check)
      const elements = document.querySelectorAll('*');
      let lowContrastElements = 0;
      for (let i = 0; i < Math.min(elements.length, 100); i++) {
        const style = window.getComputedStyle(elements[i]);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        // Basic contrast check (simplified)
        if (color === 'rgb(128, 128, 128)' || color === '#808080') {
          lowContrastElements++;
        }
      }
      
      if (lowContrastElements > 5) {
        issues.push(`${lowContrastElements} potentially low contrast elements`);
      }

      return issues;
    });

    if (accessibilityIssues.length > 0) {
      errors.accessibilityIssues.push({
        type: 'Accessibility Issues',
        issues: accessibilityIssues,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.log('Error checking accessibility:', error.message);
  }
}

async function checkPerformance(page, errors) {
  console.log('⚡ Checking performance...');
  
  try {
    const metrics = await page.metrics();
    
    // Check for performance issues
    if (metrics.JSHeapUsedSize > 50 * 1024 * 1024) { // 50MB
      errors.performanceIssues.push({
        type: 'High Memory Usage',
        value: `${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB`,
        threshold: '50MB',
        timestamp: new Date().toISOString()
      });
    }

    if (metrics.TaskDuration > 1000) { // 1 second
      errors.performanceIssues.push({
        type: 'Long Task Duration',
        value: `${metrics.TaskDuration}ms`,
        threshold: '1000ms',
        timestamp: new Date().toISOString()
      });
    }

    // Check for large resources
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      return resources.map(resource => ({
        name: resource.name,
        size: resource.transferSize || 0,
        type: resource.initiatorType
      })).filter(r => r.size > 1024 * 1024); // > 1MB
    });

    if (resourceSizes.length > 0) {
      errors.performanceIssues.push({
        type: 'Large Resources',
        count: resourceSizes.length,
        resources: resourceSizes,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.log('Error checking performance:', error.message);
  }
}

async function testUserInteractions(page, errors) {
  console.log('👆 Testing user interactions...');
  
  try {
    // Test navigation links
    const navLinks = await page.$$('nav a, [data-testid*="nav"] a');
    for (const link of navLinks.slice(0, 5)) { // Test first 5 links
      try {
        const href = await link.evaluate(el => el.getAttribute('href'));
        const text = await link.evaluate(el => el.textContent.trim());
        
        if (href && href.startsWith('/')) {
          console.log(`  Testing navigation link: ${text} (${href})`);
          await link.click();
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait longer for React Router
          await page.waitForFunction(() => !document.querySelector('.loading, [data-testid*="loading"]'), { timeout: 5000 }).catch(() => {});
          
          // Check if navigation worked
          const currentUrl = page.url();
          const expectedPath = href === '/' ? '/' : href;
          const currentPath = new URL(currentUrl).pathname;
          
          if (currentPath !== expectedPath) {
            errors.uiIssues.push({
              type: 'Navigation Issue',
              link: text,
              href: href,
              expected: expectedPath,
              actual: currentPath,
              message: `Navigation link did not work as expected. Expected: ${expectedPath}, Got: ${currentPath}`,
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (navError) {
        errors.uiIssues.push({
          type: 'Navigation Error',
          message: `Failed to test navigation link: ${navError.message}`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Test buttons
    const buttons = await page.$$('button:not([disabled])');
    for (const button of buttons.slice(0, 3)) { // Test first 3 buttons
      try {
        const text = await button.evaluate(el => el.textContent.trim());
        const isVisible = await button.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
        
        if (isVisible && text) {
          console.log(`  Testing button: ${text}`);
          await button.click();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (buttonError) {
        // Don't treat this as a critical error, just log it
        console.log(`    Button interaction issue: ${buttonError.message}`);
      }
    }

  } catch (error) {
    console.log('Error testing interactions:', error.message);
  }
}

async function testRoutes(page, errors) {
  console.log('🧭 Testing application routes...');
  
  const routes = [
    { path: '/', name: 'Dashboard' },
    { path: '/apod', name: 'APOD' },
    { path: '/mars-rovers', name: 'Mars Rovers' },
    { path: '/neo-tracker', name: 'NEO Tracker' },
    { path: '/favorites', name: 'Favorites' }
  ];

  for (const route of routes) {
    try {
      console.log(`  Testing route: ${route.name} (${route.path})`);
      
      await page.goto(`http://localhost:3000${route.path}`, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });

      // Check if page loaded successfully
      const content = await page.content();
      
      if (content.includes('Error') || content.includes('404') || content.includes('Page not found')) {
        errors.uiIssues.push({
          type: 'Route Error',
          route: route.path,
          message: `Route ${route.path} shows error page`,
          timestamp: new Date().toISOString()
        });
      }

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if route has meaningful content
      const hasContent = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        return bodyText && bodyText.trim().length > 100;
      });

      if (!hasContent) {
        errors.uiIssues.push({
          type: 'Route Content Issue',
          route: route.path,
          message: `Route ${route.path} lacks meaningful content`,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      errors.uiIssues.push({
        type: 'Route Navigation Error',
        route: route.path,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

function generateReport(errors, title) {
  const totalErrors = Object.values(errors).reduce((sum, errorArray) => sum + errorArray.length, 0);
  
  return {
    summary: {
      timestamp: new Date().toISOString(),
      title: title || 'Unknown',
      totalErrors,
      categories: {
        consoleErrors: errors.consoleErrors.length,
        networkErrors: errors.networkErrors.length,
        jsErrors: errors.jsErrors.length,
        cssErrors: errors.cssErrors.length,
        accessibilityIssues: errors.accessibilityIssues.length,
        performanceIssues: errors.performanceIssues.length,
        uiIssues: errors.uiIssues.length
      }
    },
    details: errors
  };
}

function displayResults(report) {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 COMPREHENSIVE UI ERROR DETECTION RESULTS');
  console.log('='.repeat(60));
  console.log(`📅 Timestamp: ${report.summary.timestamp}`);
  console.log(`📄 Page Title: ${report.summary.title}`);
  console.log(`🔢 Total Issues Found: ${report.summary.totalErrors}`);
  console.log('');
  
  const categories = report.summary.categories;
  const categoryIcons = {
    consoleErrors: '🖥️',
    networkErrors: '🌐',
    jsErrors: '⚠️',
    cssErrors: '🎨',
    accessibilityIssues: '♿',
    performanceIssues: '⚡',
    uiIssues: '🔍'
  };
  
  Object.entries(categories).forEach(([category, count]) => {
    const icon = count > 0 ? '❌' : '✅';
    const categoryIcon = categoryIcons[category] || '📋';
    const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${icon} ${categoryIcon} ${categoryName}: ${count}`);
  });
  
  if (report.summary.totalErrors === 0) {
    console.log('\n🎉 Excellent! No UI errors detected. Your application is working well!');
  } else {
    console.log('\n🔍 Issues detected. Check ui-check-report.json for detailed information.');
    console.log('📸 Screenshot available at ui-screenshot.png');
    
    // Show top issues
    if (report.details.jsErrors.length > 0) {
      console.log('\n⚠️  Critical JavaScript Errors:');
      report.details.jsErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.message}`);
      });
    }
    
    if (report.details.networkErrors.length > 0) {
      console.log('\n🌐 Network Issues:');
      report.details.networkErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.type}: ${error.url} (${error.status || error.failure})`);
      });
    }
  }
  
  console.log('='.repeat(60));
}

checkUI();