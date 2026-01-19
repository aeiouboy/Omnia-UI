const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractAuditTrail() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  console.log('Navigating to MAO system...');
  await page.goto('https://crcpp.omni.manh.com/omnifacade/#/order', {
    waitUntil: 'networkidle'
  });

  // Wait for page to load
  await page.waitForTimeout(3000);

  // Take screenshot of login page
  await page.screenshot({ path: 'mao-01-login-page.png', fullPage: true });
  console.log('Screenshot saved: mao-01-login-page.png');

  // Check if we're on the login page
  const isLoginPage = await page.evaluate(() => {
    return document.body.innerText.includes('Welcome') ||
           document.body.innerText.includes('LOG IN') ||
           document.querySelector('input[type="password"]') !== null;
  });

  if (isLoginPage) {
    console.log('Login page detected. Please log in manually.');
    console.log('Waiting for login to complete...');

    // Wait for user to log in manually (check for login success)
    let loggedIn = false;
    let attempts = 0;
    const maxAttempts = 120; // Wait up to 2 minutes

    while (!loggedIn && attempts < maxAttempts) {
      await page.waitForTimeout(1000);
      attempts++;

      loggedIn = await page.evaluate(() => {
        // Check if we're no longer on login page
        const hasLogoutButton = document.body.innerText.includes('Logout') ||
                               document.body.innerText.includes('Sign out');
        const hasOrderContent = document.body.innerText.includes('Order') ||
                               document.querySelector('[class*="order"]') !== null;
        const noPasswordInput = !document.querySelector('input[type="password"]');

        return (hasLogoutButton || hasOrderContent) && noPasswordInput;
      });

      if (attempts % 10 === 0) {
        console.log(`Still waiting for login... (${attempts}s)`);
      }
    }

    if (loggedIn) {
      console.log('Login successful!');
    } else {
      console.log('Login timeout. Please check if you are logged in.');
    }
  }

  await page.waitForTimeout(2000);

  // Take screenshot after login
  await page.screenshot({ path: 'mao-02-after-login.png', fullPage: true });
  console.log('Screenshot saved: mao-02-after-login.png');

  // Now search for the order
  console.log('Searching for order W1156251121946800...');

  // Try multiple search strategies
  const searchStrategies = [
    // Strategy 1: Direct URL navigation
    async () => {
      console.log('Trying direct URL navigation...');
      await page.goto('https://crcpp.omni.manh.com/omnifacade/#/order/W1156251121946800');
      await page.waitForTimeout(3000);
      return true;
    },

    // Strategy 2: Search input
    async () => {
      console.log('Trying search input...');

      // Look for search input with various selectors
      const selectors = [
        'input[placeholder*="Search" i]',
        'input[type="search"]',
        'input[ng-reflect-placeholder*="search" i]',
        '#search-input',
        '[data-testid*="search" i]',
        'input[name*="search" i]'
      ];

      for (const selector of selectors) {
        try {
          const input = await page.$(selector);
          if (input) {
            console.log(`Found search input: ${selector}`);
            await input.click();
            await input.fill('W1156251121946800');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(2000);
            return true;
          }
        } catch (e) {
          continue;
        }
      }
      return false;
    },

    // Strategy 3: Click on order in list
    async () => {
      console.log('Trying to find order in list...');

      // Wait for list to load
      await page.waitForTimeout(2000);

      // Try to find order link
      const orderSelectors = [
        `a:has-text("W1156251121946800")`,
        `[data-order-id="W1156251121946800"]`,
        `td:has-text("W1156251121946800")`,
        `div:has-text("W1156251121946800")`,
        `*=[text="W1156251121946800"]`
      ];

      for (const selector of orderSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            console.log(`Found order: ${selector}`);
            await element.click();
            await page.waitForTimeout(2000);
            return true;
          }
        } catch (e) {
          continue;
        }
      }

      return false;
    }
  ];

  let orderFound = false;
  for (const strategy of searchStrategies) {
    try {
      const result = await strategy();
      if (result) {
        // Check if order page loaded
        const orderPageLoaded = await page.evaluate(() => {
          return document.body.innerText.includes('W1156251121946800') ||
                 document.body.innerText.includes('Order Details') ||
                 document.body.innerText.includes('Audit Trail');
        });

        if (orderPageLoaded) {
          orderFound = true;
          console.log('Order page loaded successfully!');
          break;
        }
      }
    } catch (e) {
      console.log(`Strategy failed: ${e.message}`);
      continue;
    }
  }

  if (!orderFound) {
    console.log('Could not find order. Please navigate manually.');
    console.log('Press Ctrl+C when you have navigated to the order audit trail.');
    await new Promise(() => {}); // Wait indefinitely
  }

  // Take screenshot of order details
  await page.screenshot({ path: 'mao-03-order-details.png', fullPage: true });
  console.log('Screenshot saved: mao-03-order-details.png');

  // Look for Audit Trail tab
  console.log('Looking for Audit Trail tab...');

  const auditTabFound = await page.evaluate(() => {
    const tabSelectors = [
      'button:has-text("Audit Trail")',
      'a:has-text("Audit Trail")',
      'tab:has-text("Audit Trail")',
      '[data-testid*="audit" i]',
      'li:has-text("Audit Trail")',
      '[role="tab"]:has-text("Audit")'
    ];

    for (const selector of tabSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        element.click();
        return true;
      }
    }
    return false;
  });

  if (!auditTabFound) {
    console.log('Could not find Audit Trail tab automatically');
    console.log('Please click on the Audit Trail tab manually.');
    console.log('Press Ctrl+C when ready to extract data.');
    await new Promise(() => {});
  }

  await page.waitForTimeout(3000);

  // Take screenshot of audit trail first page
  await page.screenshot({ path: 'mao-04-audit-trail-first-page.png', fullPage: true });
  console.log('Screenshot saved: mao-04-audit-trail-first-page.png');

  // Check pagination info
  const paginationInfo = await page.evaluate(() => {
    // Look for pagination text like "1-20 of 439" or "page 1 of 22"
    const paginationSelectors = [
      '.pagination-info',
      '[data-testid*="pagination" i]',
      '.page-info',
      'span:has-text("of")',
      'div:has-text("page")'
    ];

    let info = null;
    for (const selector of paginationSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        info = element.innerText;
        break;
      }
    }

    // Also check for table row count
    const tableRows = document.querySelectorAll('table tbody tr');
    const rowCount = tableRows.length;

    return { info, rowCount };
  });

  console.log(`Pagination info: ${JSON.stringify(paginationInfo)}`);

  // Extract all events from all pages
  console.log('Starting audit trail extraction...');
  const allEvents = [];
  let currentPage = 1;
  let maxPages = 25; // Safety limit
  let hasNextPage = true;

  while (hasNextPage && currentPage <= maxPages) {
    console.log(`\n=== Processing page ${currentPage} ===`);

    // Take screenshot of current page
    await page.screenshot({
      path: `mao-audit-page-${String(currentPage).padStart(2, '0')}.png`,
      fullPage: true
    });
    console.log(`Screenshot saved: mao-audit-page-${String(currentPage).padStart(2, '0')}.png`);

    // Wait a bit for any dynamic content
    await page.waitForTimeout(1000);

    // Extract table data
    const eventsOnPage = await page.evaluate(() => {
      const events = [];

      // Try different table selectors
      const tableSelectors = [
        'table',
        '[role="table"]',
        '.table',
        '[data-testid*="table" i]'
      ];

      let table = null;
      for (const selector of tableSelectors) {
        table = document.querySelector(selector);
        if (table) break;
      }

      if (!table) {
        console.log('No table found');
        return events;
      }

      // Get all rows
      const rows = table.querySelectorAll('tbody tr, tr');

      rows.forEach((row, index) => {
        // Skip header row
        const headers = row.querySelectorAll('th');
        if (headers.length > 0) return;

        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
          events.push({
            updatedBy: cells[0]?.innerText?.trim() || '',
            updatedOn: cells[1]?.innerText?.trim() || '',
            entityName: cells[2]?.innerText?.trim() || '',
            entityId: cells[3]?.innerText?.trim() || '',
            changedParameter: cells[4]?.innerText?.trim() || '',
            oldValue: cells[5]?.innerText?.trim() || null,
            newValue: cells[6]?.innerText?.trim() || null,
            _rowIndex: index + 1,
            _cellCount: cells.length
          });
        }
      });

      return events;
    });

    console.log(`Extracted ${eventsOnPage.length} events from page ${currentPage}`);

    if (eventsOnPage.length === 0) {
      console.log('No events found on this page. Stopping extraction.');
      break;
    }

    // Log first few events for verification
    eventsOnPage.slice(0, 3).forEach((event, idx) => {
      console.log(`  Event ${idx + 1}: ${event.updatedBy} | ${event.updatedOn} | ${event.changedParameter}`);
    });

    allEvents.push(...eventsOnPage);

    // Check if there's a next page button
    const canGoNext = await page.evaluate(() => {
      const nextButtonSelectors = [
        'button[aria-label*="next" i]',
        'button:has-text(">")',
        'button:has-text("Next")',
        'button:has-text("»")',
        '.pagination-next:not(.disabled)',
        '[data-testid*="next" i]',
        'li.next:not(.disabled) button',
        'a[rel="next"]'
      ];

      for (const selector of nextButtonSelectors) {
        const btn = document.querySelector(selector);
        if (btn && !btn.disabled && !btn.classList.contains('disabled')) {
          // Try clicking it
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (canGoNext) {
      console.log('Clicked next page button');
      await page.waitForTimeout(2000);
      currentPage++;
    } else {
      console.log('No more pages available');
      hasNextPage = false;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Extraction complete!`);
  console.log(`Total pages processed: ${currentPage}`);
  console.log(`Total events extracted: ${allEvents.length}`);
  console.log(`Expected events: 439`);
  console.log(`${'='.repeat(50)}\n`);

  // Format events with proper IDs
  const formattedEvents = allEvents.map((event, index) => ({
    id: `AUDIT-W115625-${String(index + 1).padStart(3, '0')}`,
    orderId: 'W1156251121946800',
    updatedBy: event.updatedBy,
    updatedOn: event.updatedOn,
    entityName: event.entityName,
    entityId: event.entityId,
    changedParameter: event.changedParameter,
    oldValue: event.oldValue,
    newValue: event.newValue
  }));

  // Save to JSON file
  const outputPath = path.join(__dirname, 'audit-trail-439-events.json');
  fs.writeFileSync(outputPath, JSON.stringify(formattedEvents, null, 2), 'utf-8');
  console.log(`\n✅ Events saved to: ${outputPath}`);

  // Also save as TypeScript
  const tsPath = path.join(__dirname, 'audit-trail-439-events.ts');
  const tsContent = `// Auto-generated audit trail data for order W1156251121946800
// Total events: ${formattedEvents.length}
// Generated: ${new Date().toISOString()}

export const auditTrail439Events = ${JSON.stringify(formattedEvents, null, 2)};
`;
  fs.writeFileSync(tsPath, tsContent, 'utf-8');
  console.log(`✅ TypeScript file saved to: ${tsPath}`);

  // Save summary
  const summaryPath = path.join(__dirname, 'audit-trail-summary.txt');
  const summary = `
Audit Trail Extraction Summary
================================
Order ID: W1156251121946800
Expected Events: 439
Extracted Events: ${formattedEvents.length}
Pages Processed: ${currentPage}
Date: ${new Date().toISOString()}

Status: ${formattedEvents.length === 439 ? '✅ COMPLETE' : '⚠️ INCOMPLETE'}
`;
  fs.writeFileSync(summaryPath, summary, 'utf-8');
  console.log(`✅ Summary saved to: ${summaryPath}`);

  console.log('\nBrowser kept open for manual verification.');
  console.log('Press Ctrl+C to close browser and exit.\n');

  // Wait for user to close
  await new Promise(() => {});

  await browser.close();
}

extractAuditTrail().catch(console.error);
