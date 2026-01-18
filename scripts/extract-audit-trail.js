const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractAuditTrail() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  console.log('Navigating to MAO system...');
  await page.goto('https://crcpp.omni.manh.com/omnifacade/#/order');

  // Wait for page to load
  await page.waitForTimeout(3000);

  // Take screenshot of initial state
  await page.screenshot({ path: 'mao-01-initial-page.png', fullPage: true });
  console.log('Screenshot saved: mao-01-initial-page.png');

  // Try to find search input and enter order ID
  console.log('Searching for order W1156251121946800...');

  // Look for search input with various possible selectors
  const searchSelectors = [
    'input[placeholder*="search" i]',
    'input[type="search"]',
    'input[placeholder*="Search" i]',
    '#search',
    '[data-testid*="search" i]',
    'input[ng-reflect-placeholder*="search" i]'
  ];

  let searchInput = null;
  for (const selector of searchSelectors) {
    try {
      searchInput = await page.$(selector);
      if (searchInput) {
        console.log(`Found search input: ${selector}`);
        break;
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  if (searchInput) {
    await searchInput.fill('W1156251121946800');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
  } else {
    console.log('Search input not found, trying alternative approach...');
    // Try clicking on order directly if visible
    await page.waitForTimeout(2000);
  }

  // Take screenshot after search
  await page.screenshot({ path: 'mao-02-after-search.png', fullPage: true });
  console.log('Screenshot saved: mao-02-after-search.png');

  // Look for the order in the results and click it
  console.log('Looking for order in results...');

  const orderLinkSelectors = [
    `a:has-text("W1156251121946800")`,
    `[data-order-id="W1156251121946800"]`,
    `td:has-text("W1156251121946800")`,
    `div:has-text("W1156251121946800")`
  ];

  let orderClicked = false;
  for (const selector of orderLinkSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        await element.click();
        orderClicked = true;
        console.log(`Clicked order using: ${selector}`);
        break;
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  if (!orderClicked) {
    console.log('Could not find order link, trying to click first row...');
    try {
      const firstRow = await page.$('table tbody tr:first-child');
      if (firstRow) {
        await firstRow.click();
        orderClicked = true;
      }
    } catch (e) {
      console.log('Could not click first row');
    }
  }

  await page.waitForTimeout(3000);

  // Take screenshot of order details
  await page.screenshot({ path: 'mao-03-order-details.png', fullPage: true });
  console.log('Screenshot saved: mao-03-order-details.png');

  // Look for Audit Trail tab
  console.log('Looking for Audit Trail tab...');

  const auditTabSelectors = [
    'button:has-text("Audit Trail")',
    'a:has-text("Audit Trail")',
    'tab:has-text("Audit Trail")',
    '[data-testid*="audit" i]',
    'button:has-text("audit")',
    'li:has-text("Audit Trail")'
  ];

  let auditTabClicked = false;
  for (const selector of auditTabSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        await element.click();
        auditTabClicked = true;
        console.log(`Clicked Audit Trail tab using: ${selector}`);
        break;
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  if (!auditTabClicked) {
    console.log('Could not find Audit Trail tab');
    await browser.close();
    return;
  }

  await page.waitForTimeout(3000);

  // Take screenshot of audit trail
  await page.screenshot({ path: 'mao-04-audit-trail-first-page.png', fullPage: true });
  console.log('Screenshot saved: mao-04-audit-trail-first-page.png');

  // Now extract all audit events from all pages
  console.log('Starting audit trail extraction...');

  const allEvents = [];
  let currentPage = 1;
  let totalPages = 22; // Based on PDF reference
  let hasNextPage = true;

  while (hasNextPage && currentPage <= totalPages) {
    console.log(`Processing page ${currentPage}...`);

    // Take screenshot of current page
    await page.screenshot({
      path: `mao-audit-page-${String(currentPage).padStart(2, '0')}.png`,
      fullPage: true
    });

    // Extract table data
    const eventsOnPage = await page.evaluate(() => {
      const events = [];
      const rows = document.querySelectorAll('table tbody tr');

      rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 7) {
          events.push({
            updatedBy: cells[0]?.innerText?.trim() || '',
            updatedOn: cells[1]?.innerText?.trim() || '',
            entityName: cells[2]?.innerText?.trim() || '',
            entityId: cells[3]?.innerText?.trim() || '',
            changedParameter: cells[4]?.innerText?.trim() || '',
            oldValue: cells[5]?.innerText?.trim() || null,
            newValue: cells[6]?.innerText?.trim() || null
          });
        }
      });

      return events;
    });

    console.log(`Found ${eventsOnPage.length} events on page ${currentPage}`);
    allEvents.push(...eventsOnPage);

    // Check if there's a next page button
    const hasNextPageButton = await page.evaluate(() => {
      const nextButtons = [
        ...document.querySelectorAll('button[aria-label*="next" i]'),
        ...document.querySelectorAll('button:has-text(">")'),
        ...document.querySelectorAll('button:has-text("Next")'),
        ...document.querySelectorAll('.pagination-next'),
        ...document.querySelectorAll('[data-testid*="next" i]')
      ];

      for (const btn of nextButtons) {
        if (!btn.disabled && !btn.classList.contains('disabled')) {
          return true;
        }
      }
      return false;
    });

    if (hasNextPageButton && currentPage < totalPages) {
      // Click next page
      try {
        await page.evaluate(() => {
          const nextButtons = [
            ...document.querySelectorAll('button[aria-label*="next" i]'),
            ...document.querySelectorAll('button:has-text(">")'),
            ...document.querySelectorAll('button:has-text("Next")'),
            ...document.querySelectorAll('.pagination-next'),
            ...document.querySelectorAll('[data-testid*="next" i]')
          ];

          for (const btn of nextButtons) {
            if (!btn.disabled && !btn.classList.contains('disabled')) {
              btn.click();
              return true;
            }
          }
          return false;
        });

        await page.waitForTimeout(2000);
        currentPage++;
      } catch (e) {
        console.log(`Error clicking next page: ${e.message}`);
        hasNextPage = false;
      }
    } else {
      hasNextPage = false;
    }
  }

  console.log(`\nExtraction complete! Total events extracted: ${allEvents.length}`);

  // Format events with proper IDs
  const formattedEvents = allEvents.map((event, index) => ({
    id: `AUDIT-W115625-${String(index + 1).padStart(3, '0')}`,
    orderId: 'W1156251121946800',
    ...event
  }));

  // Save to JSON file
  const outputPath = path.join(__dirname, 'audit-trail-439-events.json');
  fs.writeFileSync(outputPath, JSON.stringify(formattedEvents, null, 2), 'utf-8');
  console.log(`\nEvents saved to: ${outputPath}`);

  // Also save as TypeScript
  const tsPath = path.join(__dirname, 'audit-trail-439-events.ts');
  const tsContent = `// Auto-generated audit trail data for order W1156251121946800
// Total events: ${formattedEvents.length}

export const auditTrail439Events = ${JSON.stringify(formattedEvents, null, 2)};
`;
  fs.writeFileSync(tsPath, tsContent, 'utf-8');
  console.log(`TypeScript file saved to: ${tsPath}`);

  // Keep browser open for manual verification
  console.log('\nBrowser kept open for manual verification. Press Ctrl+C to close.');
  console.log(`Expected: 439 events, Extracted: ${formattedEvents.length} events`);

  // Wait for user to close
  await new Promise(() => {});
}

extractAuditTrail().catch(console.error);
